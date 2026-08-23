import { z } from "zod";

const isAllowedRemoteControlHost = (hostname: string): boolean =>
  hostname === "localhost" ||
  hostname === "127.0.0.1" ||
  hostname === "::1" ||
  hostname === "chatgpt.com" ||
  hostname === "chatgpt-staging.com" ||
  hostname.endsWith(".chatgpt.com") ||
  hostname.endsWith(".chatgpt-staging.com");

const remoteControlBaseUrlSchema = z
  .instanceof(URL)
  .refine(
    (url) => isAllowedRemoteControlHost(url.hostname),
    "Unsupported remote-control host"
  )
  .refine(
    (url) =>
      url.protocol === "https:" ||
      (url.protocol === "http:" &&
        ["localhost", "127.0.0.1", "::1"].includes(url.hostname)),
    "Remote control requires HTTPS except on localhost"
  );

export interface RemoteControlEndpoints {
  readonly enrollUrl: URL;
  readonly pairStatusUrl: URL;
  readonly pairUrl: URL;
  readonly refreshUrl: URL;
  readonly websocketUrl: URL;
}

export const resolveRemoteControlEndpoints = (
  baseUrl: URL
): RemoteControlEndpoints => {
  const normalizedBaseUrl = new URL(remoteControlBaseUrlSchema.parse(baseUrl));
  if (!normalizedBaseUrl.pathname.endsWith("/")) {
    normalizedBaseUrl.pathname = `${normalizedBaseUrl.pathname}/`;
  }
  const resolveEndpoint = (suffix: string): URL =>
    new URL(suffix, normalizedBaseUrl);
  const websocketUrl = resolveEndpoint("wham/remote/control/server");
  websocketUrl.protocol =
    normalizedBaseUrl.protocol === "https:" ? "wss:" : "ws:";
  return {
    enrollUrl: resolveEndpoint("wham/remote/control/server/enroll"),
    pairStatusUrl: resolveEndpoint("wham/remote/control/server/pair/status"),
    pairUrl: resolveEndpoint("wham/remote/control/server/pair"),
    refreshUrl: resolveEndpoint("wham/remote/control/server/refresh"),
    websocketUrl,
  };
};
