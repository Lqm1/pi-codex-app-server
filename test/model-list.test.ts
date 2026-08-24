import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";
import { z } from "zod";

import type { AppServerConfig } from "../src/config/app-server-config.js";
import { appServerLogger } from "../src/logging/app-server-logger.js";
import { JsonRpcConnection } from "../src/protocol/json-rpc-connection.js";
import type { AppServer } from "../src/server/app-server.js";
import { createAppServer } from "../src/server/create-app-server.js";
import type { MessageTransport } from "../src/transports/message-transport.js";

const CONFIGURED_PROVIDER = "000-configured-test-provider";
const UNCONFIGURED_PROVIDER = "001-unconfigured-test-provider";
const temporaryDirectories: string[] = [];
const modelListResponseSchema = z.object({
  id: z.number().int().min(2).max(4),
  result: z.object({
    data: z.array(
      z.object({ displayName: z.string(), id: z.string() }).passthrough()
    ),
  }),
});

const modelConfiguration = {
  providers: {
    [CONFIGURED_PROVIDER]: {
      api: "openai-completions",
      baseUrl: "https://configured.example.invalid/v1",
      models: [{ id: "configured-model" }],
      name: "Configured Test Provider",
    },
    [UNCONFIGURED_PROVIDER]: {
      api: "openai-completions",
      baseUrl: "https://unconfigured.example.invalid/v1",
      models: [{ id: "unconfigured-model" }],
    },
  },
};

const oneModelListExchange =
  async function* oneModelListExchange(): AsyncIterable<string> {
    yield '{"id":1,"method":"initialize","params":{"clientInfo":{"name":"model-list-test","title":null,"version":"1"},"capabilities":null}}';
    yield '{"method":"initialized"}';
    yield '{"id":2,"method":"model/list","params":{"limit":500}}';
    yield '{"id":3,"method":"model/list","params":{"cursor":"pi-models:500","limit":500}}';
    yield '{"id":4,"method":"model/list","params":{"cursor":"pi-models:1000","limit":500}}';
  };

const createTestConfig = async (): Promise<AppServerConfig> => {
  const directory = await mkdtemp(path.join(tmpdir(), "pi-codex-models-"));
  temporaryDirectories.push(directory);
  const piAgentDir = path.join(directory, "agent");
  const appServerHome = path.join(directory, "app-server");
  await Promise.all([
    mkdir(piAgentDir, { recursive: true }),
    mkdir(appServerHome, { recursive: true }),
  ]);
  await Promise.all([
    writeFile(
      path.join(piAgentDir, "auth.json"),
      JSON.stringify({
        [CONFIGURED_PROVIDER]: { key: "test-key", type: "api_key" },
      })
    ),
    writeFile(
      path.join(piAgentDir, "models.json"),
      JSON.stringify(modelConfiguration)
    ),
  ]);
  return {
    hostName: "model-list-test",
    listenUrl: new URL("ws://127.0.0.1:0"),
    paths: {
      database: path.join(appServerHome, "state.sqlite"),
      endpoint: path.join(appServerHome, "endpoint.json"),
      home: appServerHome,
      logs: path.join(appServerHome, "logs"),
    },
    piAgentDir,
    remoteControl: {
      baseUrl: new URL("http://127.0.0.1:3000/backend-api/"),
      enabled: false,
    },
  };
};

const requestModels = async (
  appServer: AppServer,
  clientId: string
): Promise<
  readonly { readonly displayName: string; readonly id: string }[]
> => {
  const sent: string[] = [];
  const transport: MessageTransport = {
    close: () => {},
    read: oneModelListExchange,
    send: (message) => {
      sent.push(message);
      return Promise.resolve();
    },
  };
  const connection = new JsonRpcConnection({
    clientId,
    logger: appServerLogger,
    transport,
  });
  appServer.register(connection);
  await connection.run();
  return sent
    .map((message) => modelListResponseSchema.safeParse(JSON.parse(message)))
    .filter((result) => result.success)
    .flatMap(({ data }) => data.result.data);
};

const requestModelIds = async (
  appServer: AppServer,
  clientId: string
): Promise<string[]> => {
  const models = await requestModels(appServer, clientId);
  return models.map(({ id }) => id);
};

describe("model/list", () => {
  afterEach(async () => {
    await Promise.all(
      temporaryDirectories
        .splice(0)
        .map((directory) => rm(directory, { force: true, recursive: true }))
    );
  });

  it("includes the provider in every model display name", async () => {
    const appServer = await createAppServer(await createTestConfig());
    let models: readonly {
      readonly displayName: string;
      readonly id: string;
    }[];
    try {
      models = await requestModels(appServer, "model-display-name-test");
    } finally {
      appServer.close();
    }
    expect(models).toContainEqual(
      expect.objectContaining({
        displayName: "[Configured Test Provider] configured-model",
        id: `${CONFIGURED_PROVIDER}/configured-model`,
      })
    );
  });

  it("returns only models from providers available to Pi", async () => {
    const appServer = await createAppServer(await createTestConfig());
    let modelIds: string[];
    try {
      modelIds = await requestModelIds(appServer, "model-list-test");
    } finally {
      appServer.close();
    }
    expect(modelIds).toContain(`${CONFIGURED_PROVIDER}/configured-model`);
    expect(modelIds).not.toContain(
      `${UNCONFIGURED_PROVIDER}/unconfigured-model`
    );
  });

  it("reloads provider additions and removals without restarting", async () => {
    const config = await createTestConfig();
    const appServer = await createAppServer(config);
    try {
      const before = await requestModelIds(appServer, "before-auth-change");
      expect(before).toContain(`${CONFIGURED_PROVIDER}/configured-model`);
      expect(before).not.toContain(
        `${UNCONFIGURED_PROVIDER}/unconfigured-model`
      );

      await writeFile(
        path.join(config.piAgentDir, "auth.json"),
        JSON.stringify({
          [UNCONFIGURED_PROVIDER]: { key: "test-key", type: "api_key" },
        })
      );

      const after = await requestModelIds(appServer, "after-auth-change");
      expect(after).not.toContain(`${CONFIGURED_PROVIDER}/configured-model`);
      expect(after).toContain(`${UNCONFIGURED_PROVIDER}/unconfigured-model`);
    } finally {
      appServer.close();
    }
  });
});
