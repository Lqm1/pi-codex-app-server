import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { SessionManager } from "@earendil-works/pi-coding-agent";
import { describe, expect, test, vi } from "vitest";

import type { AppServerConfig } from "../src/config/app-server-config.js";
import { appServerLogger } from "../src/logging/app-server-logger.js";
import { PiLiveSessionManager } from "../src/pi/live-session-manager.js";
import { PiModelCatalog } from "../src/pi/model-catalog.js";
import { PiModelRuntime } from "../src/pi/pi-model-runtime.js";
import { PiSessionRepository } from "../src/pi/session-repository.js";
import { PiThreadCatalog } from "../src/pi/thread-catalog.js";
import { JsonRpcConnection } from "../src/protocol/json-rpc-connection.js";
import { parseCodexWireMessage } from "../src/protocol/validation.js";
import { AppServer } from "../src/server/app-server.js";
import { MetadataDatabase } from "../src/storage/metadata-database.js";

const syntheticHistory = [
  {
    cwd: "/workspace",
    id: "synthetic-session",
    timestamp: "2026-01-01T00:00:00.000Z",
    type: "session",
    version: 3,
  },
  ...["system", "user", "system", "user", "system"].map((role, index) => ({
    id: `entry-${index}`,
    message: {
      content: role === "system" ? "Internal instructions" : "Hello",
      role,
      timestamp: index * 1000,
    },
    parentId: index === 0 ? null : `entry-${index - 1}`,
    timestamp: `2026-01-01T00:00:0${index}.000Z`,
    type: "message",
  })),
]
  .map((entry) => JSON.stringify(entry))
  .join("\n");

const read = async function* read(): AsyncIterable<string> {
  yield JSON.stringify({
    id: 1,
    method: "thread/read",
    params: { includeTurns: false, threadId: "synthetic-session" },
  });
  yield JSON.stringify({
    id: 2,
    method: "thread/read",
    params: { includeTurns: true, threadId: "synthetic-session" },
  });
  yield JSON.stringify({
    id: 3,
    method: "thread/resume",
    params: { threadId: "synthetic-session" },
  });
};

describe("Thread history", () => {
  test("thread/read and thread/resume project system-containing history without rewriting it", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "pi-thread-history-"));
    const database = new MetadataDatabase(":memory:");
    try {
      const sessionFile = path.join(directory, "synthetic.jsonl");
      await writeFile(sessionFile, syntheticHistory);
      const config: AppServerConfig = {
        autoStart: false,
        hostName: "test",
        listenUrl: new URL("ws://127.0.0.1:0"),
        paths: {
          database: ":memory:",
          endpoint: path.join(directory, "endpoint.json"),
          home: directory,
          logs: path.join(directory, "logs"),
        },
        piAgentDir: directory,
        remoteControl: {
          baseUrl: new URL("https://example.invalid/"),
          enabled: false,
        },
      };
      const sessionRepository = new PiSessionRepository(database);
      // Never enumerate the user's real Pi sessions.
      vi.spyOn(sessionRepository, "list").mockResolvedValue(
        await SessionManager.list("/workspace", directory)
      );
      database.upsertThread({
        archived: false,
        projectId: null,
        sessionFile,
        threadId: "synthetic-session",
        updatedAt: 0,
      });
      const threadCatalog = new PiThreadCatalog({
        database,
        sessionRepository,
      });
      const modelRuntime = await PiModelRuntime.create(config);
      const modelCatalog = new PiModelCatalog(modelRuntime);
      const liveSessionManager = new PiLiveSessionManager({
        modelCatalog,
        modelRuntime,
        sessionRepository,
        threadCatalog,
      });
      const server = new AppServer({
        config,
        database,
        liveSessionManager,
        modelCatalog,
        modelRuntime,
        sessionRepository,
        threadCatalog,
      });
      const responses: unknown[] = [];
      const connection = new JsonRpcConnection({
        clientId: "history-test",
        logger: appServerLogger,
        transport: {
          close: () => {},
          read,
          send: (message) => {
            responses.push(parseCodexWireMessage(message));
            return Promise.resolve();
          },
        },
      });
      server.register(connection);
      await connection.run();

      expect(responses).toHaveLength(3);
      expect(responses[0]).toMatchObject({
        id: 1,
        result: { thread: { id: "synthetic-session", turns: [] } },
      });
      const turns = ["entry-1", "entry-3"].map((id) => ({
        id,
        items: [
          {
            content: [{ text: "Hello", type: "text" }],
            id,
            type: "userMessage",
          },
        ],
      }));
      for (const [index, id] of [2, 3].entries()) {
        expect(responses[index + 1]).toMatchObject({
          id,
          result: { thread: { id: "synthetic-session", turns } },
        });
      }
      await expect(readFile(sessionFile, "utf-8")).resolves.toBe(
        syntheticHistory
      );
    } finally {
      database.close();
      await rm(directory, { force: true, recursive: true });
    }
  });
});
