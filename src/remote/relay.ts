import { Buffer } from "node:buffer";
import { randomUUID } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";

import type { Logger } from "@logtape/logtape";
import { WebSocket } from "ws";
import { z } from "zod";

import type { JsonValue } from "../../vendor/openai-codex-app-server-protocol/typescript/serde_json/JsonValue.js";
import type { AppServerConfig } from "../config/app-server-config.js";
import { JsonRpcConnection } from "../protocol/json-rpc-connection.js";
import type { AppServer } from "../server/app-server.js";
import { WebSocketTransport } from "../transports/websocket-transport.js";
import { RemoteClientTransport } from "./client-transport.js";
import { getOrCreateInstallationId, loadOrEnroll } from "./enrollment.js";
import type { RemoteControlEnrollment } from "./enrollment.js";
import { loadRemoteControlAuth } from "./remote-control-auth.js";
import { resolveRemoteControlEndpoints } from "./remote-control-endpoints.js";

const PROTOCOL_VERSION = "3";
const MAX_SEGMENT_BYTES = 150 * 1024;
const TARGET_SEGMENT_BYTES = 100 * 1024;
const MAX_MESSAGE_BYTES = 100 * 1024 * 1024;
const INITIAL_RECONNECT_DELAY_MS = 1000;
const MAX_RECONNECT_DELAY_MS = 30_000;
const RELAY_PING_INTERVAL_MS = 10_000;
const RELAY_PONG_TIMEOUT_MS = 60_000;

const envelopeBase = z.object({
  client_id: z.string().min(1),
  cursor: z.string().optional(),
  seq_id: z.number().int().nonnegative().optional(),
  stream_id: z.string().min(1).optional(),
});

const clientEnvelopeSchema = z.discriminatedUnion("type", [
  envelopeBase.extend({ message: z.json(), type: z.literal("client_message") }),
  envelopeBase.extend({
    message_chunk_base64: z.string(),
    message_size_bytes: z.number().int().positive().max(MAX_MESSAGE_BYTES),
    segment_count: z.number().int().positive().max(1024),
    segment_id: z.number().int().nonnegative(),
    type: z.literal("client_message_chunk"),
  }),
  envelopeBase.extend({
    segment_id: z.number().int().optional(),
    type: z.literal("ack"),
  }),
  envelopeBase.extend({ type: z.literal("ping") }),
  envelopeBase.extend({ type: z.literal("client_closed") }),
]);

const rpcMessageSchema = z.object({ method: z.string() }).passthrough();

type ClientEnvelope = z.infer<typeof clientEnvelopeSchema>;
type ClientMessageEnvelope = Extract<
  ClientEnvelope,
  { type: "client_message" }
>;
type ClientChunkEnvelope = Extract<
  ClientEnvelope,
  { type: "client_message_chunk" }
>;

interface ChunkAssembly {
  readonly chunks: (string | undefined)[];
  readonly messageSizeBytes: number;
}

interface BufferedServerEnvelope {
  readonly envelope: JsonValue;
  readonly segmentId?: number;
  readonly seqId: number;
}

const streamKey = (clientId: string, streamId: string): string =>
  `${clientId}\u0000${streamId}`;

const messageMethod = (message: JsonValue): string | undefined => {
  const parsed = rpcMessageSchema.safeParse(message);
  return parsed.success ? parsed.data.method : undefined;
};

export class RemoteControlRelay {
  readonly #assemblies = new Map<string, ChunkAssembly>();
  readonly #clients = new Map<string, RemoteClientTransport>();
  readonly #config: AppServerConfig;
  readonly #lastInboundSequence = new Map<string, number>();
  readonly #logger: Logger;
  readonly #nextSequence = new Map<string, number>();
  readonly #outboundBuffer = new Map<string, BufferedServerEnvelope[]>();
  readonly #server: AppServer;
  readonly #stopController = new AbortController();
  readonly #tasks = new Set<Promise<void>>();
  #relayTransport?: WebSocketTransport;
  #stopped = false;
  #subscribeCursor?: string;

  constructor(options: {
    readonly config: AppServerConfig;
    readonly logger: Logger;
    readonly server: AppServer;
  }) {
    this.#config = options.config;
    this.#logger = options.logger;
    this.#server = options.server;
  }

  close(): void {
    this.#stopped = true;
    this.#stopController.abort();
    this.#relayTransport?.close();
    for (const client of this.#clients.values()) {
      client.close();
    }
    this.#clients.clear();
    this.#assemblies.clear();
    this.#lastInboundSequence.clear();
    this.#nextSequence.clear();
    this.#outboundBuffer.clear();
  }

  async run(): Promise<void> {
    if (!this.#config.remoteControl.enabled) {
      return;
    }
    try {
      await this.#runWithReconnect(INITIAL_RECONNECT_DELAY_MS);
    } finally {
      this.close();
      await Promise.allSettled(this.#tasks);
    }
  }

  async #runWithReconnect(reconnectDelay: number): Promise<void> {
    if (this.#stopped) {
      return;
    }

    let cleanClose = false;
    try {
      await this.#runConnection();
      cleanClose = true;
    } catch (error) {
      const failure =
        error instanceof Error
          ? error
          : new Error("Remote Control relay failed");
      this.#logger.warn(failure, { reconnectDelay });
    }

    if (this.#stopped) {
      return;
    }

    const waitDelay = cleanClose ? 3000 : reconnectDelay;
    try {
      await delay(waitDelay, undefined, {
        signal: this.#stopController.signal,
      });
    } catch (error) {
      if (!this.#stopped) {
        throw error;
      }
      return;
    }

    await this.#runWithReconnect(
      cleanClose
        ? INITIAL_RECONNECT_DELAY_MS
        : Math.min(reconnectDelay * 2, MAX_RECONNECT_DELAY_MS)
    );
  }

  async #runConnection(): Promise<void> {
    const remoteEndpoints = resolveRemoteControlEndpoints(
      this.#config.remoteControl.baseUrl
    );
    const remoteAuth = await loadRemoteControlAuth(this.#server.modelRuntime);
    const enrollment = await loadOrEnroll({
      auth: remoteAuth,
      config: this.#config,
      database: this.#server.database,
      endpoints: remoteEndpoints,
    });
    const relayTransport = new WebSocketTransport(this.#connect(enrollment));
    this.#relayTransport = relayTransport;

    try {
      await relayTransport.waitUntilOpen(30_000);
      await this.#replayOutboundBuffer(relayTransport);
      for await (const wireMessage of relayTransport.read()) {
        await this.#receive(wireMessage);
      }
    } finally {
      relayTransport.close();
      if (this.#relayTransport === relayTransport) {
        this.#relayTransport = undefined;
      }
    }
  }

  #connect(enrollment: RemoteControlEnrollment): WebSocket {
    const headers = {
      Authorization: `Bearer ${enrollment.remoteControlToken}`,
      "x-codex-installation-id": getOrCreateInstallationId(
        this.#server.database
      ),
      "x-codex-name": Buffer.from(enrollment.serverName).toString("base64"),
      "x-codex-protocol-version": PROTOCOL_VERSION,
      "x-codex-server-id": enrollment.serverId,
    };
    if (this.#subscribeCursor) {
      Object.assign(headers, {
        "x-codex-subscribe-cursor": this.#subscribeCursor,
      });
    }

    const socket = new WebSocket(enrollment.websocketUrl, { headers });
    let lastPongAt = Date.now();
    const healthTimer = setInterval(() => {
      if (socket.readyState !== WebSocket.OPEN) {
        return;
      }
      if (Date.now() - lastPongAt > RELAY_PONG_TIMEOUT_MS) {
        this.#logger.warn("Remote Control WebSocket pong timeout");
        socket.terminate();
        return;
      }
      socket.ping();
    }, RELAY_PING_INTERVAL_MS);
    healthTimer.unref?.();

    socket.on("pong", () => {
      lastPongAt = Date.now();
    });
    socket.once("close", () => clearInterval(healthTimer));
    socket.on("error", (error) => this.#logger.error(error));
    return socket;
  }

  async #receive(wireMessage: string): Promise<void> {
    const envelope = clientEnvelopeSchema.parse(JSON.parse(wireMessage));
    if (envelope.cursor) {
      this.#subscribeCursor = envelope.cursor;
    }

    if (envelope.type === "client_message") {
      this.#receiveClientMessage(envelope);
      return;
    }

    if (envelope.type === "client_message_chunk") {
      const message = this.#receiveChunk(envelope);
      if (message) {
        this.#receiveClientMessage(message);
      }
      return;
    }

    if (envelope.type === "client_closed") {
      this.#closeClient(envelope.client_id, envelope.stream_id);
      return;
    }

    if (
      envelope.type === "ack" &&
      envelope.stream_id &&
      envelope.seq_id !== undefined
    ) {
      this.#ackOutbound(
        envelope.client_id,
        envelope.stream_id,
        envelope.seq_id,
        envelope.segment_id
      );
      return;
    }

    if (envelope.type === "ping") {
      const streamId = envelope.stream_id ?? randomUUID();
      const status = this.#clients.has(streamKey(envelope.client_id, streamId))
        ? "active"
        : "unknown";
      await this.#sendPong(envelope.client_id, streamId, status);
    }
  }

  async #sendPong(
    clientId: string,
    streamId: string,
    status: "active" | "unknown"
  ): Promise<void> {
    const key = streamKey(clientId, streamId);
    const sequence = this.#nextSequence.get(key) ?? 1;
    this.#nextSequence.set(key, sequence + 1);
    const envelope = {
      client_id: clientId,
      seq_id: sequence,
      status,
      stream_id: streamId,
      type: "pong",
    };
    this.#bufferOutbound(key, envelope, sequence);
    await this.#trySendBufferedEnvelope(envelope);
  }

  #receiveClientMessage(envelope: ClientMessageEnvelope): void {
    const streamId = envelope.stream_id ?? randomUUID();
    const key = streamKey(envelope.client_id, streamId);
    const method = messageMethod(envelope.message);
    const isInitialize = method === "initialize";
    let client = this.#clients.get(key);

    if (
      this.#isDuplicateClientMessage(
        key,
        isInitialize,
        envelope.seq_id,
        client !== undefined
      )
    ) {
      this.#logger.info("Dropped duplicate remote message", {
        seq_id: envelope.seq_id,
      });
      return;
    }

    if (client?.closed) {
      this.#cleanupStream(envelope.client_id, streamId, client);
      client = undefined;
    }

    if (isInitialize && client) {
      this.#cleanupStream(envelope.client_id, streamId, client);
      client = undefined;
    }

    if (!client && !isInitialize) {
      this.#logger.info("Dropped remote message for unknown stream", {
        method,
      });
      return;
    }

    if (!client) {
      client = new RemoteClientTransport((message) =>
        this.#sendServerMessage(envelope.client_id, streamId, message)
      );
      this.#clients.set(key, client);
      const task = this.#runClient(envelope.client_id, streamId, client);
      this.#tasks.add(task);
      void this.#removeTaskWhenSettled(task);
    }

    client.push(JSON.stringify(envelope.message));
    if (envelope.seq_id !== undefined) {
      this.#lastInboundSequence.set(key, envelope.seq_id);
    }
  }

  #isDuplicateClientMessage(
    key: string,
    isInitialize: boolean,
    sequence: number | undefined,
    hasClient: boolean
  ): boolean {
    return (
      sequence !== undefined &&
      !isInitialize &&
      hasClient &&
      (this.#lastInboundSequence.get(key) ?? -1) >= sequence
    );
  }

  #receiveChunk(
    envelope: ClientChunkEnvelope
  ): ClientMessageEnvelope | undefined {
    const streamId = envelope.stream_id ?? randomUUID();
    const sequence = envelope.seq_id ?? 0;
    const key = `${streamKey(envelope.client_id, streamId)}\u0000${sequence}`;
    const assembly = this.#assemblies.get(key) ?? {
      chunks: Array.from({ length: envelope.segment_count }),
      messageSizeBytes: envelope.message_size_bytes,
    };

    if (
      assembly.chunks.length !== envelope.segment_count ||
      assembly.messageSizeBytes !== envelope.message_size_bytes ||
      envelope.segment_id >= envelope.segment_count
    ) {
      this.#assemblies.delete(key);
      return undefined;
    }

    assembly.chunks[envelope.segment_id] = envelope.message_chunk_base64;
    this.#assemblies.set(key, assembly);
    if (assembly.chunks.some((chunk) => chunk === undefined)) {
      return undefined;
    }

    this.#assemblies.delete(key);
    const bytes = Buffer.concat(
      assembly.chunks.map((chunk) => Buffer.from(chunk ?? "", "base64"))
    );
    if (bytes.byteLength !== assembly.messageSizeBytes) {
      return undefined;
    }

    return {
      client_id: envelope.client_id,
      message: z.json().parse(JSON.parse(bytes.toString("utf-8"))),
      seq_id: envelope.seq_id,
      stream_id: streamId,
      type: "client_message",
    };
  }

  async #runClient(
    clientId: string,
    streamId: string,
    transport: RemoteClientTransport
  ): Promise<void> {
    const connection = new JsonRpcConnection({
      clientId: `remote-${clientId}-${streamId}`,
      logger: this.#logger,
      transport,
    });
    this.#server.register(connection);

    try {
      await connection.run();
    } catch (error) {
      const failure =
        error instanceof Error ? error : new Error("Remote client failed");
      this.#logger.warn(failure, { clientId, streamId });
    } finally {
      this.#cleanupStream(clientId, streamId, transport);
    }
  }

  async #removeTaskWhenSettled(task: Promise<void>): Promise<void> {
    try {
      await task;
    } finally {
      this.#tasks.delete(task);
    }
  }

  #cleanupStream(
    clientId: string,
    streamId: string,
    expected?: RemoteClientTransport
  ): void {
    const key = streamKey(clientId, streamId);
    const current = this.#clients.get(key);
    if (expected && current !== expected) {
      return;
    }

    current?.close();
    this.#clients.delete(key);
    this.#lastInboundSequence.delete(key);

    const assemblyPrefix = `${key}\u0000`;
    for (const assemblyKey of this.#assemblies.keys()) {
      if (assemblyKey.startsWith(assemblyPrefix)) {
        this.#assemblies.delete(assemblyKey);
      }
    }
  }

  #closeClient(clientId: string, streamId?: string): void {
    if (streamId) {
      this.#cleanupStream(clientId, streamId);
      return;
    }

    for (const key of this.#clients.keys()) {
      if (key.startsWith(`${clientId}\u0000`)) {
        const streamIdFromKey = key.slice(clientId.length + 1);
        this.#cleanupStream(clientId, streamIdFromKey);
      }
    }
  }

  async #sendServerMessage(
    clientId: string,
    streamId: string,
    message: string
  ): Promise<void> {
    const key = streamKey(clientId, streamId);
    const sequence = this.#nextSequence.get(key) ?? 1;
    this.#nextSequence.set(key, sequence + 1);

    const parsedMessage = z.json().parse(JSON.parse(message));
    const envelope = {
      client_id: clientId,
      message: parsedMessage,
      seq_id: sequence,
      stream_id: streamId,
      type: "server_message",
    };

    if (Buffer.byteLength(JSON.stringify(envelope)) <= MAX_SEGMENT_BYTES) {
      this.#bufferOutbound(key, envelope, sequence);
      await this.#trySendBufferedEnvelope(envelope);
      return;
    }

    const bytes = Buffer.from(message);
    if (bytes.byteLength > MAX_MESSAGE_BYTES) {
      throw new Error("Remote Control message exceeds the 100 MiB limit");
    }

    const chunks: string[] = [];
    for (
      let offset = 0;
      offset < bytes.byteLength;
      offset += TARGET_SEGMENT_BYTES
    ) {
      chunks.push(
        bytes.subarray(offset, offset + TARGET_SEGMENT_BYTES).toString("base64")
      );
    }

    for (let segmentId = 0; segmentId < chunks.length; segmentId += 1) {
      const chunkEnvelope = {
        client_id: clientId,
        message_chunk_base64: chunks[segmentId],
        message_size_bytes: bytes.byteLength,
        segment_count: chunks.length,
        segment_id: segmentId,
        seq_id: sequence,
        stream_id: streamId,
        type: "server_message_chunk",
      };
      this.#bufferOutbound(key, chunkEnvelope, sequence, segmentId);
      // eslint-disable-next-line no-await-in-loop -- Chunks must preserve order and WebSocket backpressure.
      await this.#trySendBufferedEnvelope(chunkEnvelope);
    }
  }

  #bufferOutbound(
    key: string,
    envelope: JsonValue,
    seqId: number,
    segmentId?: number
  ): void {
    const buffered = this.#outboundBuffer.get(key) ?? [];
    buffered.push({ envelope, segmentId, seqId });
    this.#outboundBuffer.set(key, buffered);
    if (buffered.length === 512 || buffered.length % 1024 === 0) {
      this.#logger.warn("Remote Control unacked outbound buffer is growing", {
        pending: buffered.length,
      });
    }
  }

  #ackOutbound(
    clientId: string,
    streamId: string,
    ackedSeqId: number,
    ackedSegmentId?: number
  ): void {
    const key = streamKey(clientId, streamId);
    const buffered = this.#outboundBuffer.get(key);
    if (!buffered) {
      return;
    }

    const maxSegment = ackedSegmentId ?? Number.MAX_SAFE_INTEGER;
    const remaining = buffered.filter(
      (item) =>
        item.seqId > ackedSeqId ||
        (item.seqId === ackedSeqId && (item.segmentId ?? 0) > maxSegment)
    );

    if (remaining.length === 0) {
      this.#outboundBuffer.delete(key);
    } else {
      this.#outboundBuffer.set(key, remaining);
    }
  }

  async #trySendBufferedEnvelope(envelope: JsonValue): Promise<void> {
    try {
      await this.#sendEnvelope(envelope);
    } catch {
      // Keep the envelope buffered so the reconnect path can replay it.
    }
  }

  async #replayOutboundBuffer(
    relayTransport: WebSocketTransport
  ): Promise<void> {
    const pending = [...this.#outboundBuffer.values()].flat();
    if (pending.length > 0) {
      this.#logger.info("Replaying unacked Remote Control envelopes", {
        pending: pending.length,
      });
    }

    for (const item of pending) {
      // eslint-disable-next-line no-await-in-loop -- Replay must preserve original server sequence order.
      await relayTransport.send(JSON.stringify(item.envelope));
    }
  }

  async #sendEnvelope(envelope: JsonValue): Promise<void> {
    const relayTransport = this.#relayTransport;
    if (!relayTransport) {
      throw new Error("Remote Control WebSocket is not connected");
    }
    await relayTransport.send(JSON.stringify(envelope));
  }
}
