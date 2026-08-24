import { z } from "zod";

import type { PairingResult } from "../remote/pairing.js";
import type { DaemonStatus } from "./daemon-controller.js";

const commandSchema = z.enum(["pair", "start", "status", "stop"]);
const STATUS_KEY = "codex-server";
const commandCompletions = [
  {
    description: "Pair ChatGPT using QR or manual code",
    label: "pair",
    value: "pair",
  },
  {
    description: "Start the background daemon",
    label: "start",
    value: "start",
  },
  {
    description: "Stop the background daemon",
    label: "stop",
    value: "stop",
  },
  {
    description: "Show daemon and session details",
    label: "status",
    value: "status",
  },
] as const;

export interface CodexServerContext {
  readonly hasUi: boolean;
  readonly notify: (message: string, level: "info" | "warning") => void;
  readonly sessionId: string;
  readonly showPairing: (presentation: PairingPresentation) => Promise<void>;
  readonly setStatus: (key: string, text: string | undefined) => void;
}

export interface PairingPresentation {
  readonly compactLines: readonly string[];
  readonly fullLines: readonly string[];
}

export interface CodexServerControl {
  readonly pair: () => Promise<
    Pick<PairingResult, "expiresAt" | "manualPairingCode" | "pairingCode">
  >;
  readonly start: () => Promise<DaemonStatus>;
  readonly status: () => Promise<DaemonStatus>;
  readonly stop: () => Promise<DaemonStatus>;
}

interface ExperienceOptions {
  readonly autoStart: boolean;
  readonly control: CodexServerControl;
  readonly paths: {
    readonly endpoint: string;
    readonly logs: string;
  };
  readonly remoteControlEnabled: boolean;
  readonly renderQrCode: (payload: string) => Promise<string>;
}

const footerText = (status: DaemonStatus): string =>
  status.state === "running"
    ? `Codex server: running · ${status.endpoint.url}`
    : "Codex server: stopped";

const formatStatus = (
  status: DaemonStatus,
  context: CodexServerContext,
  options: ExperienceOptions
): string => {
  const commonLines = [
    `Autostart: ${options.autoStart ? "enabled" : "disabled"}`,
    `Remote Control: ${options.remoteControlEnabled ? "enabled" : "disabled"}`,
    `Current Pi session: ${context.sessionId}`,
    `Endpoint file: ${options.paths.endpoint}`,
    `Logs: ${options.paths.logs}`,
  ];
  if (status.state === "stopped") {
    return ["Codex App Server: stopped", ...commonLines].join("\n");
  }
  return [
    "Codex App Server: running",
    `PID: ${status.endpoint.pid}`,
    `WebSocket: ${status.endpoint.url}`,
    `Started: ${status.endpoint.startedAt ?? "unknown"}`,
    ...commonLines,
  ].join("\n");
};

const runStatusCommand = async (
  command: "start" | "status" | "stop",
  control: CodexServerControl
): Promise<DaemonStatus> => {
  if (command === "start") {
    return await control.start();
  }
  if (command === "stop") {
    return await control.stop();
  }
  return await control.status();
};

export const createCodexServerExperience = (options: ExperienceOptions) => {
  const refreshFooter = async (context: CodexServerContext): Promise<void> => {
    context.setStatus(STATUS_KEY, footerText(await options.control.status()));
  };

  const handleCommand = async (
    rawArguments: string,
    context: CodexServerContext
  ): Promise<void> => {
    const parsedCommand = commandSchema.safeParse(
      rawArguments.trim() || "status"
    );
    if (!parsedCommand.success) {
      context.notify(
        "Usage: /codex-server <start|stop|status|pair>",
        "warning"
      );
      return;
    }
    try {
      if (parsedCommand.data === "pair") {
        const pairing = await options.control.pair();
        const manualCode = pairing.manualPairingCode ?? pairing.pairingCode;
        if (context.hasUi) {
          const qrCode = await options.renderQrCode(pairing.pairingCode);
          await context.showPairing({
            compactLines: [
              "Terminal is too small to display the QR code.",
              `Manual code: ${manualCode}`,
              `Expires: ${pairing.expiresAt}`,
              "Press Enter or Esc to close",
            ],
            fullLines: [
              "Scan with ChatGPT to pair:",
              ...qrCode.trimEnd().split("\n"),
              `Manual code: ${manualCode}`,
              `Expires: ${pairing.expiresAt}`,
              "Press Enter or Esc to close",
            ],
          });
        } else {
          context.notify(
            `ChatGPT Remote pairing code: ${manualCode}\nExpires: ${pairing.expiresAt}`,
            "info"
          );
        }
        return;
      }
      const status = await runStatusCommand(
        parsedCommand.data,
        options.control
      );
      context.setStatus(STATUS_KEY, footerText(status));
      context.notify(formatStatus(status, context, options), "info");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      context.notify(`Codex App Server command failed: ${message}`, "warning");
      await refreshFooter(context);
    }
  };

  return {
    getArgumentCompletions: (prefix: string) =>
      commandCompletions.filter(({ value }) => value.startsWith(prefix.trim())),
    handleCommand,
    handleSessionStart: async (context: CodexServerContext): Promise<void> => {
      try {
        const status = options.autoStart
          ? await options.control.start()
          : await options.control.status();
        context.setStatus(STATUS_KEY, footerText(status));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown startup error";
        context.setStatus(STATUS_KEY, "Codex server: startup failed");
        context.notify(
          `Codex App Server did not start automatically: ${message}`,
          "warning"
        );
      }
    },
  };
};
