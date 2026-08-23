import { arch, platform, release } from "node:os";

export const CODEX_APP_SERVER_COMPATIBILITY_VERSION = "0.149.0";

const CODEX_USER_AGENT_PRODUCT = "codex_cli_rs";
const INVALID_USER_AGENT_TOKEN_CHARACTER = /[^A-Za-z0-9._/-]/gu;

type ProcessEnvironment = Readonly<Record<string, string | undefined>>;

const nonBlank = (value: string | undefined): string | undefined =>
  value?.trim() ? value : undefined;

const formatProductToken = (
  name: string,
  version: string | undefined
): string => (version ? `${name}/${version}` : name);

const sanitizeUserAgentToken = (value: string): string =>
  value.replace(INVALID_USER_AGENT_TOKEN_CHARACTER, "_");

const terminalUserAgentToken = (environment: ProcessEnvironment): string => {
  const termProgram = nonBlank(environment.TERM_PROGRAM);
  if (termProgram) {
    return sanitizeUserAgentToken(
      formatProductToken(
        termProgram,
        nonBlank(environment.TERM_PROGRAM_VERSION)
      )
    );
  }
  if (environment.WEZTERM_VERSION !== undefined) {
    return formatProductToken("WezTerm", nonBlank(environment.WEZTERM_VERSION));
  }
  if (
    environment.ITERM_SESSION_ID !== undefined ||
    environment.ITERM_PROFILE !== undefined ||
    environment.ITERM_PROFILE_NAME !== undefined
  ) {
    return "iTerm.app";
  }
  if (environment.TERM_SESSION_ID !== undefined) {
    return "Apple_Terminal";
  }
  if (
    environment.KITTY_WINDOW_ID !== undefined ||
    environment.TERM?.includes("kitty")
  ) {
    return "kitty";
  }
  if (
    environment.ALACRITTY_SOCKET !== undefined ||
    environment.TERM === "alacritty"
  ) {
    return "Alacritty";
  }
  if (environment.KONSOLE_VERSION !== undefined) {
    return formatProductToken("Konsole", nonBlank(environment.KONSOLE_VERSION));
  }
  if (environment.GNOME_TERMINAL_SCREEN !== undefined) {
    return "gnome-terminal";
  }
  if (environment.VTE_VERSION !== undefined) {
    return formatProductToken("VTE", nonBlank(environment.VTE_VERSION));
  }
  if (environment.WT_SESSION !== undefined) {
    return "WindowsTerminal";
  }
  return sanitizeUserAgentToken(nonBlank(environment.TERM) ?? "unknown");
};

const codexArchitectureName = (architecture: string): string => {
  if (architecture === "x64") {
    return "x86_64";
  }
  if (architecture === "arm64") {
    return "aarch64";
  }
  if (architecture === "ia32") {
    return "x86";
  }
  return architecture;
};

const codexOperatingSystemName = (currentPlatform: NodeJS.Platform): string => {
  if (currentPlatform === "win32") {
    return "Windows";
  }
  if (currentPlatform === "darwin") {
    return "Mac OS";
  }
  return `${currentPlatform.charAt(0).toUpperCase()}${currentPlatform.slice(1)}`;
};

interface UserAgentRuntimeInfo {
  readonly architecture: string;
  readonly environment: ProcessEnvironment;
  readonly platform: NodeJS.Platform;
  readonly release: string;
}

export const codexAppServerUserAgent = (
  runtime?: UserAgentRuntimeInfo
): string => {
  const runtimeInfo = runtime ?? {
    architecture: arch(),
    environment: process.env,
    platform: platform(),
    release: release(),
  };
  return `${CODEX_USER_AGENT_PRODUCT}/${CODEX_APP_SERVER_COMPATIBILITY_VERSION} (${codexOperatingSystemName(runtimeInfo.platform)} ${runtimeInfo.release}; ${codexArchitectureName(runtimeInfo.architecture)}) ${terminalUserAgentToken(runtimeInfo.environment)}`;
};
