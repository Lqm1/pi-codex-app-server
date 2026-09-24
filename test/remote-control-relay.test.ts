/* oxlint-disable anti-slop/no-module-mocking -- Enrollment and auth are external I/O boundaries; this test exercises the real WebSocket relay against a local server. */

import { once } from "node:events";

import { getLogger } from "@logtape/logtape";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WebSocket, WebSocketServer } from "ws";
import { z } from "zod";

import type { AppServerConfig } from "../src/config/app-server-config.js";
import type { JsonRpcConnection } from "../src/protocol/json-rpc-connection.js";
import type {
  getOrCreateInstallationId,
  loadOrEnroll,
} from "../src/remote/enrollment.js";
import { RemoteControlRelay } from "../src/remote/relay.js";
import type { loadRemoteControlAuth } from "../src/remote/remote-control-auth.js";
import { AppServer } from "../src/server/app-server.js";
import type { JsonValue } from "../vendor/openai-codex-app-server-protocol/typescript/serde_json/JsonValue.js";

type GetOrCreateInstallationId = typeof getOrCreateInstallationId;
type LoadOrEnroll = typeof loadOrEnroll;
type LoadRemoteControlAuth = typeof loadRemoteControlAuth;

const remoteMocks = vi.hoisted(() => ({
  getOrCreateInstallationId: vi.fn<GetOrCreateInstallationId>(
    () => "00000000-0000-4000-8000-000000000001"
  ),
  loadOrEnroll: vi.fn<LoadOrEnroll>(),
  loadRemoteControlAuth: vi.fn<LoadRemoteControlAuth>(() =>
    Promise.resolve({
      accessToken: "test-access-token",
      accountId: "test-account",
    })
  ),
}));

vi.mock(import("../src/remote/enrollment.js"), () => ({
  getOrCreateInstallationId: remoteMocks.getOrCreateInstallationId,
  loadOrEnroll: remoteMocks.loadOrEnroll,
}));

vi.mock(import("../src/remote/remote-control-auth.js"), () => ({
  loadRemoteControlAuth: remoteMocks.loadRemoteControlAuth,
}));

const logger = getLogger(["test", "remote-control-relay"]);
const relays: RemoteControlRelay[] = [];
const servers: WebSocketServer[] = [];

const addressSchema = z
  .object({ port: z.number().int().positive() })
  .passthrough();
const socketSchema = z.custom<WebSocket>(
  (value) => value instanceof WebSocket,
  "Expected a WebSocket"
);
const serverEnvelopeSchema = z
  .object({
    client_id: z.string(),
    seq_id: z.number().int().nonnegative(),
    status: z.enum(["active", "unknown"]).optional(),
    stream_id: z.string(),
    type: z.enum(["pong", "server_message", "server_message_chunk"]),
  })
  .passthrough();

const nextJsonMessage = async (
  socket: WebSocket,
  timeoutMs = 1000
): Promise<z.infer<typeof serverEnvelopeSchema>> => {
  const [data] = await once(socket, "message", {
    signal: AbortSignal.timeout(timeoutMs),
  });
  return serverEnvelopeSchema.parse(JSON.parse(String(data)));
};

const expectNoJsonMessage = async (
  socket: WebSocket,
  timeoutMs = 100
): Promise<void> => {
  await expect(
    once(socket, "message", { signal: AbortSignal.timeout(timeoutMs) })
  ).rejects.toThrow(/aborted/iu);
};

const sendEnvelope = (socket: WebSocket, envelope: JsonValue): void => {
  socket.send(JSON.stringify(envelope));
};

const makeTestServer = (): AppServer => {
  const appServer: AppServer = Object.create(AppServer.prototype);
  Object.defineProperties(appServer, {
    database: { value: {} },
    modelRuntime: { value: {} },
    register: {
      value: (connection: JsonRpcConnection): void => {
        connection.registerRequest("initialize", () => ({
          codexHome: "/tmp",
          platformFamily: "unix",
          platformOs: "linux",
          userAgent: "relay-test",
        }));
        connection.registerRequest("thread/list", () => ({
          backwardsCursor: null,
          data: [],
          nextCursor: null,
        }));
      },
    },
  });
  return appServer;
};

const makeConfig = (): AppServerConfig => ({
  autoStart: true,
  hostName: "test-host",
  listenUrl: new URL("ws://127.0.0.1:0"),
  paths: {
    database: "/tmp/pi-codex-test/state.sqlite",
    endpoint: "/tmp/pi-codex-test/endpoint.json",
    home: "/tmp/pi-codex-test",
    logs: "/tmp/pi-codex-test/logs",
  },
  piAgentDir: "/tmp/pi-agent",
  remoteControl: {
    baseUrl: new URL("http://127.0.0.1:3000/backend-api/"),
    enabled: true,
  },
});

describe("Remote Control relay lifecycle", () => {
  afterEach(async () => {
    for (const relay of relays.splice(0)) {
      relay.close();
    }
    await Promise.all(
      servers.splice(0).map(async (server) => {
        const closed = once(server, "close");
        server.close();
        await closed;
      })
    );
    vi.clearAllMocks();
  });

  it("requires initialize for a stream and keeps server sequence continuity across reinitialize", async () => {
    const server = new WebSocketServer({ host: "127.0.0.1", port: 0 });
    servers.push(server);
    await once(server, "listening");
    const address = addressSchema.parse(server.address());

    remoteMocks.loadOrEnroll.mockResolvedValue({
      accountId: "test-account",
      appServerVersion: "0.149.0",
      environmentId: "test-environment",
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
      remoteControlToken: "test-token",
      serverId: "test-server",
      serverName: "test-host",
      websocketUrl: `ws://127.0.0.1:${address.port}/`,
    });

    const relay = new RemoteControlRelay({
      config: makeConfig(),
      logger,
      server: makeTestServer(),
    });
    relays.push(relay);

    const connectionPromise = once(server, "connection");
    const runPromise = relay.run();
    const [connection] = await connectionPromise;
    const socket = socketSchema.parse(connection);

    sendEnvelope(socket, {
      client_id: "client-1",
      seq_id: 99,
      stream_id: "stream-1",
      type: "ping",
    });
    await expect(nextJsonMessage(socket)).resolves.toMatchObject({
      client_id: "client-1",
      seq_id: 1,
      status: "unknown",
      stream_id: "stream-1",
      type: "pong",
    });
    sendEnvelope(socket, {
      client_id: "client-1",
      seq_id: 1,
      stream_id: "stream-1",
      type: "ack",
    });

    sendEnvelope(socket, {
      client_id: "client-1",
      message: { id: 1, method: "thread/list", params: {} },
      seq_id: 1,
      stream_id: "stream-1",
      type: "client_message",
    });
    await expectNoJsonMessage(socket);

    sendEnvelope(socket, {
      client_id: "client-1",
      message: {
        id: 2,
        method: "initialize",
        params: {
          capabilities: null,
          clientInfo: { name: "test", title: null, version: "1" },
        },
      },
      seq_id: 2,
      stream_id: "stream-1",
      type: "client_message",
    });
    await expect(nextJsonMessage(socket)).resolves.toMatchObject({
      client_id: "client-1",
      seq_id: 2,
      stream_id: "stream-1",
      type: "server_message",
    });
    sendEnvelope(socket, {
      client_id: "client-1",
      seq_id: 2,
      stream_id: "stream-1",
      type: "ack",
    });

    sendEnvelope(socket, {
      client_id: "client-1",
      message: { id: 3, method: "thread/list", params: {} },
      seq_id: 3,
      stream_id: "stream-1",
      type: "client_message",
    });
    await expect(nextJsonMessage(socket)).resolves.toMatchObject({
      client_id: "client-1",
      seq_id: 3,
      stream_id: "stream-1",
      type: "server_message",
    });
    sendEnvelope(socket, {
      client_id: "client-1",
      seq_id: 3,
      stream_id: "stream-1",
      type: "ack",
    });

    sendEnvelope(socket, {
      client_id: "client-1",
      message: {
        id: 4,
        method: "initialize",
        params: {
          capabilities: null,
          clientInfo: { name: "test", title: null, version: "1" },
        },
      },
      seq_id: 4,
      stream_id: "stream-1",
      type: "client_message",
    });
    await expect(nextJsonMessage(socket)).resolves.toMatchObject({
      client_id: "client-1",
      seq_id: 4,
      stream_id: "stream-1",
      type: "server_message",
    });

    relay.close();
    await runPromise;
  });
});
