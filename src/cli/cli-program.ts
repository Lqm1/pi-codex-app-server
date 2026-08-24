import { Command } from "commander";

export interface CliActions {
  readonly pair: () => Promise<void>;
  readonly runAppServer: () => Promise<void>;
  readonly runDaemon: () => Promise<void>;
}

export const createCliProgram = (actions: CliActions): Command => {
  const program = new Command()
    .name("pi-codex-app-server")
    .description(
      "Expose Pi Coding Agent through Codex App Server and ChatGPT Remote"
    )
    .action(actions.runAppServer);

  program
    .command("app-server")
    .description("Run Codex App Server over stdio")
    .action(actions.runAppServer);

  program
    .command("daemon")
    .description("Run the shared Codex App Server over WebSocket")
    .action(actions.runDaemon);

  program
    .command("pair")
    .description("Create a ChatGPT Remote pairing code")
    .action(actions.pair);

  program.helpCommand(true);

  return program;
};
