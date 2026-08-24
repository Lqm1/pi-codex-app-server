import { describe, expect, it, vi } from "vitest";

import { createCodexServerExperience } from "../src/extension/codex-server-experience.js";
import type {
  CodexServerContext,
  CodexServerControl,
} from "../src/extension/codex-server-experience.js";
import type { DaemonStatus } from "../src/extension/daemon-controller.js";

const runningStatus = {
  endpoint: {
    pid: 4242,
    startedAt: "2026-08-24T00:00:00.000Z",
    transport: "websocket",
    url: "ws://127.0.0.1:4242/",
  },
  state: "running",
} satisfies DaemonStatus;

const createContext = () => {
  const notify = vi.fn<CodexServerContext["notify"]>();
  const setStatus = vi.fn<CodexServerContext["setStatus"]>();
  const setWidget = vi.fn<CodexServerContext["setWidget"]>();
  return {
    context: {
      hasUi: true,
      notify,
      sessionId: "pi-session-1",
      setStatus,
      setWidget,
    } satisfies CodexServerContext,
    notify,
    setStatus,
    setWidget,
  };
};

const createControl = (): CodexServerControl => ({
  pair: vi.fn<CodexServerControl["pair"]>().mockResolvedValue({
    expiresAt: "2026-08-24T00:10:00.000Z",
    manualPairingCode: "ABCD-EFGH",
    pairingCode: "opaque-pairing-payload",
  }),
  start: vi.fn<CodexServerControl["start"]>().mockResolvedValue(runningStatus),
  status: vi
    .fn<CodexServerControl["status"]>()
    .mockResolvedValue(runningStatus),
  stop: vi
    .fn<CodexServerControl["stop"]>()
    .mockResolvedValue({ state: "stopped" }),
});

const createQrRenderer = () => vi.fn<(payload: string) => Promise<string>>();

describe("Codex Server extension experience", () => {
  it("offers every subcommand as argument completions", () => {
    const experience = createCodexServerExperience({
      autoStart: true,
      control: createControl(),
      paths: {
        endpoint: "C:/pi/codex-app-server/endpoint.json",
        logs: "C:/pi/codex-app-server/logs",
      },
      remoteControlEnabled: true,
      renderQrCode: createQrRenderer(),
    });

    expect(experience.getArgumentCompletions("st")).toStrictEqual([
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
    ]);
  });

  it("starts the daemon on Pi session startup and displays footer status", async () => {
    const control = createControl();
    const { context, setStatus } = createContext();
    const experience = createCodexServerExperience({
      autoStart: true,
      control,
      paths: { endpoint: "endpoint.json", logs: "logs" },
      remoteControlEnabled: true,
      renderQrCode: createQrRenderer(),
    });

    await experience.handleSessionStart(context);

    expect(control.start).toHaveBeenCalledOnce();
    expect(setStatus).toHaveBeenCalledWith(
      "codex-server",
      "Codex server: running · ws://127.0.0.1:4242/"
    );
  });

  it("shows detailed daemon status", async () => {
    const { context, notify } = createContext();
    const experience = createCodexServerExperience({
      autoStart: true,
      control: createControl(),
      paths: { endpoint: "endpoint.json", logs: "logs" },
      remoteControlEnabled: true,
      renderQrCode: createQrRenderer(),
    });

    await experience.handleCommand("status", context);

    expect(notify).toHaveBeenCalledWith(
      expect.stringContaining(
        "Codex App Server: running\nPID: 4242\nWebSocket: ws://127.0.0.1:4242/"
      ),
      "info"
    );
    expect(notify).toHaveBeenCalledWith(
      expect.stringContaining("Current Pi session: pi-session-1"),
      "info"
    );
  });

  it("shows QR and manual pairing options together", async () => {
    const { context, setWidget } = createContext();
    const renderQrCode = createQrRenderer().mockResolvedValue(
      "QR-LINE-1\nQR-LINE-2"
    );
    const experience = createCodexServerExperience({
      autoStart: true,
      control: createControl(),
      paths: { endpoint: "endpoint.json", logs: "logs" },
      remoteControlEnabled: true,
      renderQrCode,
    });

    await experience.handleCommand("pair", context);

    expect(renderQrCode).toHaveBeenCalledWith("opaque-pairing-payload");
    expect(setWidget).toHaveBeenCalledWith("codex-server-pairing", [
      "Scan with ChatGPT to pair:",
      "QR-LINE-1",
      "QR-LINE-2",
      "Manual code: ABCD-EFGH",
      "Expires: 2026-08-24T00:10:00.000Z",
    ]);
  });
});
