import { spawn } from "node:child_process";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { z } from "zod";

import { loadConfig } from "../config/app-server-config.js";
import { startRemoteControlPairing } from "../remote/pairing.js";
import type { DaemonEndpoint } from "./daemon-readiness.js";
import { waitForDaemonEndpoint } from "./daemon-readiness.js";

const commandSchema = z.enum(["pair", "start", "status"]);
const DAEMON_START_TIMEOUT_MS = 10_000;
const endpointSchema = z.object({
  pid: z.number().int().positive(),
  transport: z.literal("websocket"),
  url: z.url(),
});

const processExists = (pid: number): boolean => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};

const readEndpoint = async (): Promise<DaemonEndpoint | undefined> => {
  try {
    const contents = await readFile(loadConfig().paths.endpoint, "utf-8");
    const endpoint = endpointSchema.parse(JSON.parse(contents));
    return processExists(endpoint.pid) ? endpoint : undefined;
  } catch {
    return undefined;
  }
};

interface DaemonLaunch {
  readonly failure: Promise<Error>;
  readonly pid: number;
}

const waitForChildFailure = async (
  child: ReturnType<typeof spawn>
): Promise<Error> => {
  try {
    await once(child, "exit");
    return new Error("Codex App Server exited before readiness");
  } catch (error) {
    return error instanceof Error
      ? error
      : new Error("Codex App Server failed before readiness");
  }
};

const startDaemon = (): DaemonLaunch => {
  const cliPath = fileURLToPath(new URL("../cli.js", import.meta.url));
  const child = spawn(process.execPath, [cliPath, "daemon"], {
    detached: true,
    stdio: "ignore",
    windowsHide: true,
  });
  if (!child.pid) {
    throw new Error("Codex App Server process did not receive a PID");
  }
  const failure = waitForChildFailure(child);
  child.unref();
  return { failure, pid: child.pid };
};

type DaemonStartOutcome =
  | { readonly endpoint: DaemonEndpoint; readonly type: "ready" }
  | { readonly error: Error; readonly type: "failed" };

const waitForStartedDaemon = async (
  launch: DaemonLaunch
): Promise<DaemonEndpoint> => {
  const readiness = waitForDaemonEndpoint({
    expectedPid: launch.pid,
    readEndpoint,
    timeoutMs: DAEMON_START_TIMEOUT_MS,
  });
  const outcome = await Promise.race<DaemonStartOutcome>([
    readiness.then((endpoint) => ({ endpoint, type: "ready" })),
    launch.failure.then((error) => ({ error, type: "failed" })),
  ]);
  if (outcome.type === "failed") {
    throw outcome.error;
  }
  return outcome.endpoint;
};

export default function piCodexAppServerExtension(pi: ExtensionAPI): void {
  pi.registerCommand("codex-server", {
    description: "Start or inspect the shared Codex App Server daemon",
    handler: async (args, context) => {
      const parsedCommand = commandSchema.safeParse(args.trim() || "status");
      const command = parsedCommand.success ? parsedCommand.data : "status";
      if (command === "pair") {
        const pairing = await startRemoteControlPairing(loadConfig());
        context.ui.notify(
          `ChatGPT Remote pairing code: ${pairing.manualPairingCode ?? pairing.pairingCode}\nExpires: ${pairing.expiresAt}`,
          "info"
        );
        return;
      }
      let endpoint = await readEndpoint();
      if (command === "start" && !endpoint) {
        try {
          endpoint = await waitForStartedDaemon(startDaemon());
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown startup error";
          context.ui.notify(
            `Codex App Server did not start: ${message}. Run pi-codex-app-server daemon to inspect the error.`,
            "warning"
          );
          return;
        }
      }
      if (!endpoint) {
        context.ui.notify(
          command === "start"
            ? "Codex App Server did not start. Run pi-codex-app-server daemon to inspect the error."
            : "Codex App Server is not running. Use /codex-server start.",
          "warning"
        );
        return;
      }
      context.ui.notify(
        `Codex App Server: ${endpoint.url}\nCurrent Pi thread: ${context.sessionManager.getSessionId()}`,
        "info"
      );
    },
  });
}
