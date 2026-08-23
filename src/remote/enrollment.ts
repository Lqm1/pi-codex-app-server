import { randomUUID } from "node:crypto";
import { arch, platform } from "node:os";

import { z } from "zod";

import {
  CODEX_APP_SERVER_COMPATIBILITY_VERSION,
  codexAppServerUserAgent,
} from "../codex-app-server-identity.js";
import type { AppServerConfig } from "../config/app-server-config.js";
import type { MetadataDatabase } from "../storage/metadata-database.js";
import type { RemoteControlAuth } from "./remote-control-auth.js";
import type { RemoteControlEndpoints } from "./remote-control-endpoints.js";

const INSTALLATION_KEY = "remote-control:installation-id";
const ENROLLMENT_KEY = "remote-control:enrollment";
const installationIdSchema = z.uuid();
export const enrollmentSchema = z.object({
  accountId: z.string().min(1),
  appServerVersion: z.string().min(1),
  environmentId: z.string().min(1),
  expiresAt: z.iso.datetime(),
  remoteControlToken: z.string().min(1),
  serverId: z.string().min(1),
  serverName: z.string().min(1),
  websocketUrl: z.url(),
});
export type RemoteControlEnrollment = z.infer<typeof enrollmentSchema>;
const enrollResponseSchema = z.object({
  environment_id: z.string().min(1),
  expires_at: z.iso.datetime(),
  remote_control_token: z.string().min(1),
  server_id: z.string().min(1),
});

export const getOrCreateInstallationId = (
  database: MetadataDatabase
): string => {
  const stored = installationIdSchema.safeParse(
    database.getRemoteState(INSTALLATION_KEY)
  );
  if (stored.success) {
    return stored.data;
  }
  const created = randomUUID();
  database.setRemoteState(INSTALLATION_KEY, created);
  return created;
};

const requestHeaders = (
  auth: RemoteControlAuth,
  currentInstallationId: string
): Headers =>
  new Headers({
    Authorization: `Bearer ${auth.accessToken}`,
    "chatgpt-account-id": auth.accountId,
    "content-type": "application/json",
    "user-agent": codexAppServerUserAgent(),
    "x-codex-installation-id": currentInstallationId,
  });

const persistEnrollment = (
  database: MetadataDatabase,
  auth: RemoteControlAuth,
  endpoints: RemoteControlEndpoints,
  serverName: string,
  response: z.infer<typeof enrollResponseSchema>
): RemoteControlEnrollment => {
  const enrollment: RemoteControlEnrollment = {
    accountId: auth.accountId,
    appServerVersion: CODEX_APP_SERVER_COMPATIBILITY_VERSION,
    environmentId: response.environment_id,
    expiresAt: response.expires_at,
    remoteControlToken: response.remote_control_token,
    serverId: response.server_id,
    serverName,
    websocketUrl: endpoints.websocketUrl.toString(),
  };
  database.setRemoteState(ENROLLMENT_KEY, enrollment);
  return enrollment;
};

const refreshEnrollment = async (options: {
  readonly auth: RemoteControlAuth;
  readonly currentEnrollment: RemoteControlEnrollment;
  readonly database: MetadataDatabase;
  readonly endpoints: RemoteControlEndpoints;
}): Promise<RemoteControlEnrollment> => {
  const currentInstallationId = getOrCreateInstallationId(options.database);
  const httpResponse = await fetch(options.endpoints.refreshUrl, {
    body: JSON.stringify({
      installation_id: currentInstallationId,
      server_id: options.currentEnrollment.serverId,
    }),
    headers: requestHeaders(options.auth, currentInstallationId),
    method: "POST",
    signal: AbortSignal.timeout(30_000),
  });
  if (!httpResponse.ok) {
    throw new Error(
      `Remote Control refresh failed: HTTP ${httpResponse.status}`
    );
  }
  const refreshedEnrollment = enrollResponseSchema.parse(
    await httpResponse.json()
  );
  if (
    refreshedEnrollment.server_id !== options.currentEnrollment.serverId ||
    refreshedEnrollment.environment_id !==
      options.currentEnrollment.environmentId
  ) {
    throw new Error("Remote Control refresh returned a mismatched enrollment");
  }
  return persistEnrollment(
    options.database,
    options.auth,
    options.endpoints,
    options.currentEnrollment.serverName,
    refreshedEnrollment
  );
};

export const loadOrEnroll = async (options: {
  readonly auth: RemoteControlAuth;
  readonly config: AppServerConfig;
  readonly database: MetadataDatabase;
  readonly endpoints: RemoteControlEndpoints;
}): Promise<RemoteControlEnrollment> => {
  const storedEnrollment = enrollmentSchema.safeParse(
    options.database.getRemoteState(ENROLLMENT_KEY)
  );
  const storedEnrollmentMatches =
    storedEnrollment.success &&
    storedEnrollment.data.accountId === options.auth.accountId &&
    storedEnrollment.data.appServerVersion ===
      CODEX_APP_SERVER_COMPATIBILITY_VERSION &&
    storedEnrollment.data.websocketUrl ===
      options.endpoints.websocketUrl.toString();
  if (storedEnrollmentMatches) {
    const expiresAt = Date.parse(storedEnrollment.data.expiresAt);
    if (expiresAt > Date.now() + 5 * 60_000) {
      return storedEnrollment.data;
    }
    try {
      return await refreshEnrollment({
        auth: options.auth,
        currentEnrollment: storedEnrollment.data,
        database: options.database,
        endpoints: options.endpoints,
      });
    } catch (error) {
      if (expiresAt > Date.now()) {
        return storedEnrollment.data;
      }
      throw error;
    }
  }
  const currentInstallationId = getOrCreateInstallationId(options.database);
  const httpResponse = await fetch(options.endpoints.enrollUrl, {
    body: JSON.stringify({
      app_server_version: CODEX_APP_SERVER_COMPATIBILITY_VERSION,
      arch: arch(),
      installation_id: currentInstallationId,
      name: options.config.hostName,
      os: platform(),
    }),
    headers: requestHeaders(options.auth, currentInstallationId),
    method: "POST",
    signal: AbortSignal.timeout(30_000),
  });
  if (!httpResponse.ok) {
    throw new Error(
      `Remote Control enrollment failed: HTTP ${httpResponse.status}`
    );
  }
  const enrolled = enrollResponseSchema.parse(await httpResponse.json());
  return persistEnrollment(
    options.database,
    options.auth,
    options.endpoints,
    options.config.hostName,
    enrolled
  );
};
