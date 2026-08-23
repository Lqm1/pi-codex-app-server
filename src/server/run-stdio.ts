import { randomUUID } from "node:crypto";

import type { AppServerConfig } from "../config/app-server-config.js";
import { appServerLogger } from "../logging/app-server-logger.js";
import { JsonRpcConnection } from "../protocol/json-rpc-connection.js";
import { StdioTransport } from "../transports/stdio-transport.js";
import { createAppServer } from "./create-app-server.js";

export const runStdioAppServer = async (
  config: AppServerConfig
): Promise<void> => {
  const appServer = await createAppServer(config);
  const stdioTransport = new StdioTransport();
  const connection = new JsonRpcConnection({
    clientId: `stdio-${randomUUID()}`,
    logger: appServerLogger,
    transport: stdioTransport,
  });
  appServer.register(connection);

  const shutdown = (): void => {
    connection.close();
  };
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
  try {
    await connection.run();
  } finally {
    appServer.close();
  }
};
