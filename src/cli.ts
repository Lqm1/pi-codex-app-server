import { dispose } from "@logtape/logtape";

import {
  ensureAppServerDirectories,
  loadConfig,
} from "./config/app-server-config.js";
import { configureAppServerLogging } from "./logging/app-server-logger.js";
import { startRemoteControlPairing } from "./remote/pairing.js";
import { runDaemon } from "./server/run-daemon.js";
import { runStdioAppServer } from "./server/run-stdio.js";

const HELP = `pi-codex-app-server

Usage:
  pi-codex-app-server app-server    Run Codex App Server over stdio
  pi-codex-app-server daemon        Run shared Codex App Server over WebSocket
  pi-codex-app-server pair          Create a ChatGPT Remote pairing code
  pi-codex-app-server --help        Show this help
`;

const main = async (): Promise<void> => {
  const [command = "app-server"] = process.argv.slice(2);
  if (command === "--help" || command === "-h" || command === "help") {
    process.stdout.write(HELP);
    return;
  }
  if (command !== "app-server" && command !== "daemon" && command !== "pair") {
    process.stderr.write(`Unknown command: ${command}\n\n${HELP}`);
    process.exitCode = 2;
    return;
  }
  await configureAppServerLogging();
  const config = loadConfig();
  await ensureAppServerDirectories(config);
  if (command === "pair") {
    const pairing = await startRemoteControlPairing(config);
    process.stdout.write(
      `${pairing.manualPairingCode ?? pairing.pairingCode}\nExpires: ${pairing.expiresAt}\n`
    );
    return;
  }
  await (command === "daemon" ? runDaemon(config) : runStdioAppServer(config));
};

try {
  await main();
} catch (error) {
  const message =
    error instanceof Error ? (error.stack ?? error.message) : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
} finally {
  await dispose();
}
