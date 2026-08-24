import type {
  ExtensionAPI,
  ExtensionContext,
} from "@earendil-works/pi-coding-agent";
import QRCode from "qrcode";

import { loadConfig } from "../config/app-server-config.js";
import type { CodexServerContext } from "./codex-server-experience.js";
import { createCodexServerExperience } from "./codex-server-experience.js";
import { AppDaemonController } from "./daemon-controller.js";

const toCodexServerContext = (
  context: ExtensionContext
): CodexServerContext => ({
  hasUi: context.hasUI,
  notify: (message, level) => {
    context.ui.notify(message, level);
  },
  sessionId: context.sessionManager.getSessionId(),
  setStatus: (key, text) => {
    context.ui.setStatus(key, text);
  },
  setWidget: (key, lines) => {
    context.ui.setWidget(key, lines);
  },
});

export default function piCodexAppServerExtension(pi: ExtensionAPI): void {
  const config = loadConfig();
  const experience = createCodexServerExperience({
    autoStart: config.autoStart,
    control: new AppDaemonController(config),
    paths: config.paths,
    remoteControlEnabled: config.remoteControl.enabled,
    renderQrCode: async (payload) =>
      await QRCode.toString(payload, { margin: 1 }),
  });

  pi.registerCommand("codex-server", {
    description: "Control the shared Codex App Server daemon",
    getArgumentCompletions: experience.getArgumentCompletions,
    handler: async (args, context) => {
      await experience.handleCommand(args, toCodexServerContext(context));
    },
  });
  pi.on("session_start", async (_event, context) => {
    await experience.handleSessionStart(toCodexServerContext(context));
  });
  pi.on("session_shutdown", (_event, context) => {
    context.ui.setStatus("codex-server", undefined);
    context.ui.setWidget("codex-server-pairing", undefined);
  });
}
