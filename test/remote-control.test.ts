import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { codexAppServerUserAgent } from "../src/codex-app-server-identity.js";
import type { AppServerConfig } from "../src/config/app-server-config.js";
import { loadOrEnroll } from "../src/remote/enrollment.js";
import { resolveRemoteControlEndpoints } from "../src/remote/remote-control-endpoints.js";
import { MetadataDatabase } from "../src/storage/metadata-database.js";

const temporaryDirectories: string[] = [];

describe("Remote Control boundaries", () => {
  afterEach(async () => {
    vi.restoreAllMocks();
    await Promise.all(
      temporaryDirectories
        .splice(0)
        .map((directory) => rm(directory, { force: true, recursive: true }))
    );
  });

  it("normalizes only official ChatGPT and localhost targets", () => {
    const remoteEndpoints = resolveRemoteControlEndpoints(
      new URL("https://chatgpt.com/backend-api/")
    );
    expect(remoteEndpoints.websocketUrl.toString()).toBe(
      "wss://chatgpt.com/backend-api/wham/remote/control/server"
    );
    expect(
      resolveRemoteControlEndpoints(
        new URL("https://chatgpt.com/backend-api")
      ).enrollUrl.toString()
    ).toBe("https://chatgpt.com/backend-api/wham/remote/control/server/enroll");
    expect(() =>
      resolveRemoteControlEndpoints(
        new URL("https://chatgpt.com.evil.example/backend-api/")
      )
    ).toThrow("Unsupported remote-control host");
    expect(() =>
      resolveRemoteControlEndpoints(new URL("http://chatgpt.com/backend-api/"))
    ).toThrow("Remote control requires HTTPS");
  });

  it("persists validated JSON Remote Control state", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "pi-codex-remote-"));
    temporaryDirectories.push(directory);
    const database = new MetadataDatabase(path.join(directory, "state.sqlite"));
    database.setRemoteState("enrollment", {
      enabled: true,
      environmentId: "environment-1",
    });
    expect(database.getRemoteState("enrollment")).toStrictEqual({
      enabled: true,
      environmentId: "environment-1",
    });
    database.close();
  });

  it("advertises the current stable Codex app-server version", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "pi-codex-enroll-"));
    temporaryDirectories.push(directory);
    const database = new MetadataDatabase(path.join(directory, "state.sqlite"));
    const config = {
      hostName: "test-host",
      listenUrl: new URL("ws://127.0.0.1:0"),
      paths: {
        database: path.join(directory, "state.sqlite"),
        endpoint: path.join(directory, "endpoint.json"),
        home: directory,
        logs: path.join(directory, "logs"),
      },
      piAgentDir: directory,
      remoteControl: {
        baseUrl: new URL("http://127.0.0.1:3000/backend-api/"),
        enabled: true,
      },
    } satisfies AppServerConfig;
    let requestBody: unknown;
    let requestUserAgent: string | null = null;
    vi.spyOn(globalThis, "fetch").mockImplementation((_input, init) => {
      requestBody = JSON.parse(String(init?.body));
      requestUserAgent = new Headers(init?.headers).get("user-agent");
      return Promise.resolve(
        Response.json({
          environment_id: "environment-1",
          expires_at: new Date(Date.now() + 60 * 60_000).toISOString(),
          remote_control_token: "remote-token",
          server_id: "server-1",
        })
      );
    });

    const enrollment = await loadOrEnroll({
      auth: { accessToken: "access-token", accountId: "account-1" },
      config,
      database,
      endpoints: resolveRemoteControlEndpoints(config.remoteControl.baseUrl),
    });
    database.close();

    const enrollRequest = z
      .object({ app_server_version: z.string() })
      .passthrough()
      .parse(requestBody);
    expect(enrollRequest.app_server_version).toBe("0.149.0");
    expect(enrollment.appServerVersion).toBe("0.149.0");
    expect(requestUserAgent).toBe(codexAppServerUserAgent());
  });
});
