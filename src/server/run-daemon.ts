import { randomUUID } from "node:crypto";
import { once } from "node:events";
import { writeFile } from "node:fs/promises";

import type { Logger } from "@logtape/logtape";
import type { WebSocket } from "ws";
import { WebSocketServer } from "ws";
import { z } from "zod";

import type { AppServerConfig } from "../config/app-server-config.js";
import { appServerLogger } from "../logging/app-server-logger.js";
import { JsonRpcConnection } from "../protocol/json-rpc-connection.js";
import { RemoteControlRelay } from "../remote/relay.js";
import { WebSocketTransport } from "../transports/websocket-transport.js";
import type { AppServer } from "./app-server.js";
import { createAppServer } from "./create-app-server.js";

const portSchema = z.coerce.number().int().min(0).max(65_535);
const addressInfoSchema = z.object({
  address: z.string(),
  family: z.string(),
  port: z.number().int(),
});
type AddressInfo = z.infer<typeof addressInfoSchema>;

const daemonEndpointUrl = (
  configuredUrl: URL,
  addressInfo: AddressInfo
): string => {
  const host = configuredUrl.hostname.includes(":")
    ? `[${configuredUrl.hostname}]`
    : configuredUrl.hostname;
  return `ws://${host}:${addressInfo.port}${configuredUrl.pathname}`;
};

const handleSocket = async (
  socket: WebSocket,
  appServer: AppServer,
  logger: Logger
): Promise<void> => {
  const connection = new JsonRpcConnection({
    clientId: `websocket-${randomUUID()}`,
    logger,
    transport: new WebSocketTransport(socket),
  });
  appServer.register(connection);
  try {
    await connection.run();
  } catch (error) {
    const failure =
      error instanceof Error ? error : new Error("WebSocket connection failed");
    logger.warn(failure);
  }
};

export const runDaemon = async (config: AppServerConfig): Promise<void> => {
  if (config.listenUrl.protocol !== "ws:") {
    throw new Error(
      "Direct daemon listening supports ws://. Terminate TLS in a local proxy for wss://."
    );
  }
  const appServer = await createAppServer(config);
  const remoteControlRelay = new RemoteControlRelay({
    config,
    logger: appServerLogger,
    server: appServer,
  });
  const remoteControlTask = remoteControlRelay.run();
  const webSocketServer = new WebSocketServer({
    host: config.listenUrl.hostname,
    path:
      config.listenUrl.pathname === "/" ? undefined : config.listenUrl.pathname,
    port: portSchema.parse(config.listenUrl.port || "0"),
  });
  const clientTasks = new Set<Promise<void>>();
  webSocketServer.on("connection", (socket) => {
    clientTasks.add(handleSocket(socket, appServer, appServerLogger));
  });
  try {
    await once(webSocketServer, "listening");
    const addressInfo = addressInfoSchema.safeParse(webSocketServer.address());
    if (!addressInfo.success) {
      throw new Error("WebSocket daemon did not expose a TCP address");
    }
    const endpointUrl = daemonEndpointUrl(config.listenUrl, addressInfo.data);
    await writeFile(
      config.paths.endpoint,
      `${JSON.stringify({ pid: process.pid, transport: "websocket", url: endpointUrl })}\n`,
      { mode: 0o600 }
    );
    process.stdout.write(`${endpointUrl}\n`);
    const stopDaemon = (): void => {
      remoteControlRelay.close();
      for (const client of webSocketServer.clients) {
        client.close(1001, "Daemon shutting down");
      }
      webSocketServer.close();
    };
    process.once("SIGINT", stopDaemon);
    process.once("SIGTERM", stopDaemon);
    await once(webSocketServer, "close");
    await Promise.allSettled(clientTasks);
  } finally {
    remoteControlRelay.close();
    await remoteControlTask;
    appServer.close();
  }
};
