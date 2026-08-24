import { mkdir } from "node:fs/promises";
import { hostname } from "node:os";
import path from "node:path";

import { getAgentDir } from "@earendil-works/pi-coding-agent";
import { z } from "zod";

const DEFAULT_LISTEN_URL = "ws://127.0.0.1:0";
const appServerEnvironmentSchema = z.object({
  PI_CODEX_APP_SERVER_AUTOSTART: z.enum(["0", "1"]).optional(),
  PI_CODEX_APP_SERVER_HOME: z.string().trim().min(1).optional(),
  PI_CODEX_APP_SERVER_HOST_NAME: z.string().trim().min(1).optional(),
  PI_CODEX_APP_SERVER_LISTEN: z.string().trim().min(1).optional(),
  PI_CODEX_REMOTE_BASE_URL: z.url().optional(),
  PI_CODEX_REMOTE_CONTROL: z.enum(["0", "1"]).optional(),
});
const webSocketListenUrlSchema = z
  .url()
  .transform((value) => new URL(value))
  .refine((url) => url.protocol === "ws:" || url.protocol === "wss:", {
    message: "must use the ws or wss protocol",
  });

export interface AppServerPaths {
  readonly database: string;
  readonly endpoint: string;
  readonly home: string;
  readonly logs: string;
}

export interface AppServerConfig {
  readonly autoStart: boolean;
  readonly hostName: string;
  readonly listenUrl: URL;
  readonly paths: AppServerPaths;
  readonly piAgentDir: string;
  readonly remoteControl: {
    readonly baseUrl: URL;
    readonly enabled: boolean;
  };
}

const resolveAppServerHome = (configured?: string): string =>
  configured
    ? path.resolve(configured)
    : path.join(getAgentDir(), "codex-app-server");

export const loadConfig = (): AppServerConfig => {
  const environment = appServerEnvironmentSchema.parse(process.env);
  const home = resolveAppServerHome(environment.PI_CODEX_APP_SERVER_HOME);
  return {
    autoStart: environment.PI_CODEX_APP_SERVER_AUTOSTART !== "0",
    hostName: environment.PI_CODEX_APP_SERVER_HOST_NAME ?? hostname(),
    listenUrl: webSocketListenUrlSchema.parse(
      environment.PI_CODEX_APP_SERVER_LISTEN ?? DEFAULT_LISTEN_URL
    ),
    paths: {
      database: path.join(home, "state.sqlite"),
      endpoint: path.join(home, "endpoint.json"),
      home,
      logs: path.join(home, "logs"),
    },
    piAgentDir: getAgentDir(),
    remoteControl: {
      baseUrl: new URL(
        environment.PI_CODEX_REMOTE_BASE_URL ??
          "https://chatgpt.com/backend-api/"
      ),
      enabled: environment.PI_CODEX_REMOTE_CONTROL !== "0",
    },
  };
};

export const ensureAppServerDirectories = async (
  config: AppServerConfig
): Promise<void> => {
  await Promise.all([
    mkdir(config.paths.home, { recursive: true }),
    mkdir(config.paths.logs, { recursive: true }),
  ]);
};
