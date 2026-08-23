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

const streamKey = (clientId: string, streamId: string): string =>
  `${clientId}\u0000${streamId}`;

export class RemoteControlRelay {
  readonly #assemblies = new Map<string, ChunkAssembly>();
  readonly #clients = new Map<string, RemoteClientTransport>();
  readonly #config: AppServerConfig;
  readonly #logger: Logger;
  readonly #nextSequence = new Map<string, number>();
  readonly #server: AppServer;
  readonly #stopController = new AbortController();
  readonly #tasks = new Set<Promise<void>>();
  #relayTransport?: WebSocketTransport;
  #stopped = false;

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
    let nextDelay = reconnectDelay;
    try {
      await this.#runConnection();
      nextDelay = INITIAL_RECONNECT_DELAY_MS;
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
    try {
      await delay(nextDelay, undefined, {
        signal: this.#stopController.signal,
      });
    } catch (error) {
      if (!this.#stopped) {
        throw error;
      }
      return;
    }
    await this.#runWithReconnect(
      Math.min(nextDelay * 2, MAX_RECONNECT_DELAY_MS)
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
    const socket = new WebSocket(enrollment.websocketUrl, {
      headers: {
        Authorization: `Bearer ${enrollment.remoteControlToken}`,
        "x-codex-installation-id": getOrCreateInstallationId(
          this.#server.database
        ),
        "x-codex-name": Buffer.from(enrollment.serverName).toString("base64"),
        "x-codex-protocol-version": PROTOCOL_VERSION,
        "x-codex-server-id": enrollment.serverId,
      },
    });
    socket.on("error", (error) => this.#logger.error(error));
    return socket;
  }

  async #receive(wireMessage: string): Promise<void> {
    const envelope = clientEnvelopeSchema.parse(JSON.parse(wireMessage));
    if (envelope.type === "client_message") {
      await this.#receiveClientMessage(envelope);
    } else if (envelope.type === "client_message_chunk") {
      const message = this.#receiveChunk(envelope);
      if (message) {
        await this.#receiveClientMessage(message);
      }
    } else if (envelope.type === "client_closed") {
      this.#closeClient(envelope.client_id, envelope.stream_id);
    } else if (envelope.type === "ping") {
      await this.#sendEnvelope({
        client_id: envelope.client_id,
        seq_id: envelope.seq_id ?? 0,
        status: "active",
        stream_id: envelope.stream_id ?? randomUUID(),
        type: "pong",
      });
    }
  }

  async #receiveClientMessage(envelope: ClientMessageEnvelope): Promise<void> {
    const streamId = envelope.stream_id ?? randomUUID();
    const key = streamKey(envelope.client_id, streamId);
    let client = this.#clients.get(key);
    if (!client) {
      client = new RemoteClientTransport((message) =>
        this.#sendServerMessage(envelope.client_id, streamId, message)
      );
      this.#clients.set(key, client);
      const task = this.#runClient(envelope.client_id, streamId, client);
      this.#tasks.add(task);
    }
    client.push(JSON.stringify(envelope.message));
    if (envelope.seq_id !== undefined) {
      await this.#sendEnvelope({
        client_id: envelope.client_id,
        seq_id: envelope.seq_id,
        stream_id: streamId,
        type: "ack",
      });
    }
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
    }
  }

  #closeClient(clientId: string, streamId?: string): void {
    if (streamId) {
      const key = streamKey(clientId, streamId);
      this.#clients.get(key)?.close();
      this.#clients.delete(key);
      return;
    }
    for (const [key, client] of this.#clients) {
      if (key.startsWith(`${clientId}\u0000`)) {
        client.close();
        this.#clients.delete(key);
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
    const encoded = JSON.stringify(envelope);
    if (Buffer.byteLength(encoded) <= MAX_SEGMENT_BYTES) {
      await this.#sendEnvelope(envelope);
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
    await Promise.all(
      chunks.map((chunk, segmentId) =>
        this.#sendEnvelope({
          client_id: clientId,
          message_chunk_base64: chunk,
          message_size_bytes: bytes.byteLength,
          segment_count: chunks.length,
          segment_id: segmentId,
          seq_id: sequence,
          stream_id: streamId,
          type: "server_message_chunk",
        })
      )
    );
  }

  async #sendEnvelope(envelope: JsonValue): Promise<void> {
    const relayTransport = this.#relayTransport;
    if (!relayTransport) {
      throw new Error("Remote Control WebSocket is not connected");
    }
    await relayTransport.send(JSON.stringify(envelope));
  }
}
