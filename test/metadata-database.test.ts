import { describe, expect, test } from "vitest";

import { MetadataDatabase } from "../src/storage/metadata-database.js";

describe(MetadataDatabase, () => {
  test("persists projects and thread metadata", () => {
    const database = new MetadataDatabase(":memory:");
    database.upsertProject({
      createdAt: 100,
      id: "project-1",
      metadata: { source: "pi" },
      name: "Example",
      position: 0,
      roots: [{ path: "/workspace/example" }],
      updatedAt: 100,
    });
    database.upsertThread({
      archived: false,
      projectId: "project-1",
      sessionFile: "/sessions/thread-1.jsonl",
      threadId: "thread-1",
      updatedAt: 120,
    });

    expect(database.listProjects()).toStrictEqual([
      {
        createdAt: 100,
        id: "project-1",
        metadata: { source: "pi" },
        name: "Example",
        position: 0,
        roots: [{ path: "/workspace/example" }],
        updatedAt: 100,
      },
    ]);
    expect(database.getThread("thread-1")).toStrictEqual({
      archived: false,
      projectId: "project-1",
      sessionFile: "/sessions/thread-1.jsonl",
      threadId: "thread-1",
      updatedAt: 120,
    });
    expect(database.listThreads()).toHaveLength(1);

    database.close();
  });

  test("archives and deletes thread metadata", () => {
    const database = new MetadataDatabase(":memory:");
    database.upsertThread({
      archived: false,
      projectId: null,
      sessionFile: "/sessions/thread-1.jsonl",
      threadId: "thread-1",
      updatedAt: 120,
    });

    expect(database.setThreadArchived("thread-1", true)).toBeTruthy();
    expect(database.getThread("thread-1")?.archived).toBeTruthy();
    expect(database.setThreadArchived("missing-thread", true)).toBeFalsy();
    database.deleteThread("thread-1");
    expect(database.getThread("thread-1")).toBeUndefined();

    database.close();
  });

  test("allows one writer and fences an expired owner", () => {
    const database = new MetadataDatabase(":memory:");
    const first = database.acquireLease({
      nowMs: 1000,
      ownerId: "tui-1",
      ownerKind: "tui",
      threadId: "thread-1",
      ttlMs: 500,
    });
    expect(first).toStrictEqual({
      expiresAtMs: 1500,
      fence: 1,
      ownerId: "tui-1",
      ownerKind: "tui",
      threadId: "thread-1",
    });

    expect(
      database.acquireLease({
        nowMs: 1200,
        ownerId: "daemon-1",
        ownerKind: "daemon",
        threadId: "thread-1",
        ttlMs: 500,
      })
    ).toBeUndefined();

    const takeover = database.acquireLease({
      nowMs: 1500,
      ownerId: "daemon-1",
      ownerKind: "daemon",
      threadId: "thread-1",
      ttlMs: 500,
    });
    expect(takeover?.fence).toBe(2);
    expect(
      database.renewLease({
        expiresAtMs: 2500,
        fence: 1,
        ownerId: "tui-1",
        threadId: "thread-1",
      })
    ).toBeUndefined();
    expect(
      database.renewLease({
        expiresAtMs: 2500,
        fence: 2,
        ownerId: "daemon-1",
        threadId: "thread-1",
      })?.expiresAtMs
    ).toBe(2500);
    database.close();
  });

  test("allows only the lease owner to release a lease", () => {
    const database = new MetadataDatabase(":memory:");
    const lease = database.acquireLease({
      nowMs: 1000,
      ownerId: "daemon-1",
      ownerKind: "daemon",
      threadId: "thread-1",
      ttlMs: 500,
    });

    expect(lease?.ownerId).toBe("daemon-1");
    expect(database.releaseLease("thread-1", "tui-1")).toBeFalsy();
    expect(database.releaseLease("thread-1", "daemon-1")).toBeTruthy();
    expect(database.releaseLease("thread-1", "daemon-1")).toBeFalsy();

    database.close();
  });
});
