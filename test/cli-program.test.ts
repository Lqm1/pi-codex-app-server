import { describe, expect, it } from "vitest";

import { createCliProgram } from "../src/cli/cli-program.js";

const createActions = (events: string[]) => ({
  pair: () => {
    events.push("pair");
    return Promise.resolve();
  },
  runAppServer: () => {
    events.push("app-server");
    return Promise.resolve();
  },
  runDaemon: () => {
    events.push("daemon");
    return Promise.resolve();
  },
});

describe("pi-codex-app-server CLI", () => {
  it("runs the daemon command", async () => {
    const events: string[] = [];
    const program = createCliProgram(createActions(events));

    await program.parseAsync(["daemon"], { from: "user" });

    expect(events).toStrictEqual(["daemon"]);
  });

  it("runs the app server when no command is supplied", async () => {
    const events: string[] = [];
    const program = createCliProgram(createActions(events));

    await program.parseAsync([], { from: "user" });

    expect(events).toStrictEqual(["app-server"]);
  });

  it("runs the pairing command", async () => {
    const events: string[] = [];
    const program = createCliProgram(createActions(events));

    await program.parseAsync(["pair"], { from: "user" });

    expect(events).toStrictEqual(["pair"]);
  });

  it("shows help through the help subcommand", async () => {
    const program = createCliProgram(createActions([]));
    let output = "";
    program.configureOutput({
      writeOut: (text) => {
        output += text;
      },
    });
    program.exitOverride();

    await expect(
      program.parseAsync(["help"], { from: "user" })
    ).rejects.toMatchObject({ code: "commander.help" });
    expect(output).toContain("Usage: pi-codex-app-server");
  });
});
