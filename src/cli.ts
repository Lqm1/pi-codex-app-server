import { dispose } from "@logtape/logtape";

import { createCliProgram } from "./cli/cli-program.js";
import {
  ensureAppServerDirectories,
  loadConfig,
} from "./config/app-server-config.js";
import type { AppServerConfig } from "./config/app-server-config.js";
import { configureAppServerLogging } from "./logging/app-server-logger.js";
import { startRemoteControlPairing } from "./remote/pairing.js";
import { runDaemon } from "./server/run-daemon.js";
import { runStdioAppServer } from "./server/run-stdio.js";

const runWithConfig = async (
  action: (config: AppServerConfig) => Promise<void>
): Promise<void> => {
  await configureAppServerLogging();
  const config = loadConfig();
  await ensureAppServerDirectories(config);
  await action(config);
};

const program = createCliProgram({
  pair: async () => {
    await runWithConfig(async (config) => {
      const pairing = await startRemoteControlPairing(config);
      process.stdout.write(
        `${pairing.manualPairingCode ?? pairing.pairingCode}\nExpires: ${pairing.expiresAt}\n`
      );
    });
  },
  runAppServer: async () => {
    await runWithConfig(runStdioAppServer);
  },
  runDaemon: async () => {
    await runWithConfig(runDaemon);
  },
});

try {
  await program.parseAsync(process.argv);
} catch (error) {
  const message =
    error instanceof Error ? (error.stack ?? error.message) : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
} finally {
  await dispose();
}
