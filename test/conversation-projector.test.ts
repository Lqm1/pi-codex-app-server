import type { SessionEntry } from "@earendil-works/pi-coding-agent";
import { describe, expect, test } from "vitest";

import { projectPiConversation } from "../src/pi/conversation-projector.js";

const usage = {
  cacheRead: 0,
  cacheWrite: 0,
  cost: { cacheRead: 0, cacheWrite: 0, input: 0, output: 0, total: 0 },
  input: 10,
  output: 5,
  totalTokens: 15,
};

const historicalMessage = (role: string): SessionEntry =>
  // SAFETY: The entry has the persisted message shape; its deliberately untyped
  // role exercises historical JSONL values absent from the current Pi types.
  ({
    id: `${role}-1`,
    message: { content: "Internal instructions", role, timestamp: 0 },
    parentId: null,
    timestamp: "2026-01-01T00:00:10.000Z",
    type: "message",
  }) as SessionEntry;

const ordinaryEntries = [
  {
    id: "user-1",
    message: { content: "Hello", role: "user", timestamp: 1000 },
    parentId: null,
    timestamp: "2026-01-01T00:00:01.000Z",
    type: "message",
  },
  {
    id: "assistant-1",
    message: {
      api: "openai-responses",
      content: [{ text: "Hi", type: "text" }],
      model: "gpt-test",
      provider: "openai",
      role: "assistant",
      stopReason: "stop",
      timestamp: 2000,
      usage,
    },
    parentId: "user-1",
    timestamp: "2026-01-01T00:00:02.000Z",
    type: "message",
  },
  {
    id: "user-2",
    message: { content: "Continue", role: "user", timestamp: 3000 },
    parentId: "assistant-1",
    timestamp: "2026-01-01T00:00:03.000Z",
    type: "message",
  },
] satisfies SessionEntry[];

describe("Pi conversation projection", () => {
  test.each([0, 1, 2, 3])(
    "ignores a system message at index %i without changing turns or timing",
    (index) => {
      const entries: SessionEntry[] = [...ordinaryEntries];
      entries.splice(index, 0, historicalMessage("system"));
      const original = structuredClone(entries);

      expect(projectPiConversation(entries, "/workspace")).toStrictEqual(
        projectPiConversation(ordinaryEntries, "/workspace")
      );
      expect(entries).toStrictEqual(original);
    }
  );

  test("does not create a turn for system-only history", () => {
    expect(
      projectPiConversation([historicalMessage("system")], "/workspace")
    ).toStrictEqual([]);
  });

  test("still rejects unknown message roles", () => {
    expect(() =>
      projectPiConversation([historicalMessage("unknown")], "/workspace")
    ).toThrow("Unsupported Pi message");
  });

  test("groups messages into turns and joins tool calls with their results", () => {
    const entries = [
      {
        id: "user-1",
        message: {
          content: "Inspect the project",
          role: "user",
          timestamp: 1000,
        },
        parentId: null,
        timestamp: "2026-01-01T00:00:00.000Z",
        type: "message",
      },
      {
        id: "assistant-1",
        message: {
          api: "openai-responses",
          content: [
            { thinking: "I should list files", type: "thinking" },
            {
              arguments: { depth: 2 },
              id: "tool-1",
              name: "list_files",
              type: "toolCall",
            },
          ],
          model: "gpt-test",
          provider: "openai",
          role: "assistant",
          stopReason: "toolUse",
          timestamp: 1100,
          usage,
        },
        parentId: "user-1",
        timestamp: "2026-01-01T00:00:01.000Z",
        type: "message",
      },
      {
        id: "result-1",
        message: {
          content: [{ text: "src/index.ts", type: "text" }],
          isError: false,
          role: "toolResult",
          timestamp: 1200,
          toolCallId: "tool-1",
          toolName: "list_files",
        },
        parentId: "assistant-1",
        timestamp: "2026-01-01T00:00:02.000Z",
        type: "message",
      },
      {
        id: "assistant-2",
        message: {
          api: "openai-responses",
          content: [{ text: "Found the entry point.", type: "text" }],
          model: "gpt-test",
          provider: "openai",
          role: "assistant",
          stopReason: "stop",
          timestamp: 1300,
          usage,
        },
        parentId: "result-1",
        timestamp: "2026-01-01T00:00:03.000Z",
        type: "message",
      },
    ] satisfies SessionEntry[];

    const turns = projectPiConversation(entries, "/workspace");
    expect(turns).toHaveLength(1);
    expect(turns[0]?.status).toBe("completed");
    expect(turns[0]?.items).toContainEqual({
      arguments: { depth: 2 },
      contentItems: [{ text: "src/index.ts", type: "inputText" }],
      durationMs: null,
      id: "tool-1",
      namespace: null,
      status: "completed",
      success: true,
      tool: "list_files",
      type: "dynamicToolCall",
    });
    expect(turns[0]?.items).toContainEqual({
      delivery: null,
      id: "assistant-2:0",
      memoryCitation: null,
      phase: null,
      text: "Found the entry point.",
      type: "agentMessage",
    });
  });
});
