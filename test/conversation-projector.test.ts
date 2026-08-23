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

describe("Pi conversation projection", () => {
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
