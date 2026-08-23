import type {
  SessionEntry,
  SessionMessageEntry,
} from "@earendil-works/pi-coding-agent";
import { z } from "zod";

import type { ThreadItem } from "../../vendor/openai-codex-app-server-protocol/typescript/v2/ThreadItem.js";
import type { Turn } from "../../vendor/openai-codex-app-server-protocol/typescript/v2/Turn.js";
import type { UserInput } from "../../vendor/openai-codex-app-server-protocol/typescript/v2/UserInput.js";

const jsonValueSchema = z.json();
type PiMessage = SessionMessageEntry["message"];
type PiUserMessage = Extract<PiMessage, { readonly role: "user" }>;
type PiAssistantMessage = Extract<PiMessage, { readonly role: "assistant" }>;
type PiToolResultMessage = Extract<PiMessage, { readonly role: "toolResult" }>;
type PiBashMessage = Extract<PiMessage, { readonly role: "bashExecution" }>;
type PiCustomMessage = Extract<PiMessage, { readonly role: "custom" }>;
type DynamicToolItem = Extract<
  ThreadItem,
  { readonly type: "dynamicToolCall" }
>;

interface MutableTurnState {
  readonly toolCalls: Map<string, DynamicToolItem>;
  readonly turn: Turn;
}

const timestampSeconds = (timestamp: string): number =>
  Math.floor(Date.parse(timestamp) / 1000);

const userContent = (message: PiUserMessage): readonly UserInput[] => {
  if (!Array.isArray(message.content)) {
    return [{ text: message.content, text_elements: [], type: "text" }];
  }
  return message.content.map((content): UserInput => {
    if (content.type === "text") {
      return { text: content.text, text_elements: [], type: "text" };
    }
    return {
      type: "image",
      url: `data:${content.mimeType};base64,${content.data}`,
    };
  });
};

const customMessageText = (message: PiCustomMessage): string =>
  Array.isArray(message.content)
    ? message.content
        .filter((content) => content.type === "text")
        .map(({ text }) => text)
        .join("\n")
    : message.content;

const toolResultContent = (
  message: PiToolResultMessage
): DynamicToolItem["contentItems"] =>
  message.content.map((content) =>
    content.type === "text"
      ? { text: content.text, type: "inputText" }
      : {
          imageUrl: `data:${content.mimeType};base64,${content.data}`,
          type: "inputImage",
        }
  );

const createTurn = (entry: SessionEntry): MutableTurnState => {
  const startedAt = timestampSeconds(entry.timestamp);
  return {
    toolCalls: new Map(),
    turn: {
      completedAt: null,
      durationMs: null,
      error: null,
      id: entry.id,
      items: [],
      itemsView: "full",
      startedAt,
      status: "inProgress",
    },
  };
};

const appendAssistantMessage = (
  state: MutableTurnState,
  entry: SessionMessageEntry,
  message: PiAssistantMessage
): void => {
  for (const [index, content] of message.content.entries()) {
    const id = `${entry.id}:${index}`;
    if (content.type === "text") {
      state.turn.items.push({
        delivery: null,
        id,
        memoryCitation: null,
        phase: null,
        text: content.text,
        type: "agentMessage",
      });
    } else if (content.type === "thinking") {
      state.turn.items.push({
        content: [content.thinking],
        id,
        summary: [],
        type: "reasoning",
      });
    } else {
      const item: DynamicToolItem = {
        arguments: jsonValueSchema.parse(content.arguments),
        contentItems: null,
        durationMs: null,
        id: content.id,
        namespace: null,
        status: "inProgress",
        success: null,
        tool: content.name,
        type: "dynamicToolCall",
      };
      state.toolCalls.set(content.id, item);
      state.turn.items.push(item);
    }
  }

  if (message.stopReason === "aborted") {
    state.turn.status = "interrupted";
  } else if (message.stopReason === "error") {
    state.turn.error = {
      additionalDetails: null,
      codexErrorInfo: null,
      message: message.errorMessage ?? "Pi model request failed",
    };
    state.turn.status = "failed";
  } else if (message.stopReason !== "toolUse") {
    state.turn.status = "completed";
  }
};

const appendToolResult = (
  state: MutableTurnState,
  message: PiToolResultMessage
): void => {
  const existing = state.toolCalls.get(message.toolCallId);
  if (existing) {
    existing.contentItems = toolResultContent(message);
    existing.status = message.isError ? "failed" : "completed";
    existing.success = !message.isError;
    return;
  }
  state.turn.items.push({
    arguments: null,
    contentItems: toolResultContent(message),
    durationMs: null,
    id: message.toolCallId,
    namespace: null,
    status: message.isError ? "failed" : "completed",
    success: !message.isError,
    tool: message.toolName,
    type: "dynamicToolCall",
  });
};

const appendBashMessage = (
  state: MutableTurnState,
  entry: SessionMessageEntry,
  message: PiBashMessage,
  cwd: string
): void => {
  state.turn.items.push({
    aggregatedOutput: message.output,
    command: message.command,
    commandActions: [],
    cwd,
    durationMs: null,
    exitCode: message.exitCode ?? null,
    id: entry.id,
    pluginId: null,
    processId: null,
    scriptPath: null,
    source: "userShell",
    status:
      message.cancelled || message.exitCode !== 0 ? "failed" : "completed",
    type: "commandExecution",
  });
};

const appendMessage = (
  state: MutableTurnState,
  entry: SessionMessageEntry,
  cwd: string
): void => {
  const { message } = entry;
  switch (message.role) {
    case "user": {
      state.turn.items.push({
        clientId: null,
        content: [...userContent(message)],
        id: entry.id,
        type: "userMessage",
      });
      return;
    }
    case "assistant": {
      appendAssistantMessage(state, entry, message);
      return;
    }
    case "toolResult": {
      appendToolResult(state, message);
      return;
    }
    case "bashExecution": {
      appendBashMessage(state, entry, message, cwd);
      return;
    }
    case "custom": {
      state.turn.items.push({
        delivery: null,
        id: entry.id,
        memoryCitation: null,
        phase: null,
        text: customMessageText(message),
        type: "agentMessage",
      });
      return;
    }
    case "branchSummary":
    case "compactionSummary": {
      state.turn.items.push({
        delivery: null,
        id: entry.id,
        memoryCitation: null,
        phase: null,
        text: message.summary,
        type: "agentMessage",
      });
      return;
    }
    default: {
      const exhaustive: never = message;
      throw new Error(`Unsupported Pi message: ${String(exhaustive)}`);
    }
  }
};

const completeTurnTiming = (
  state: MutableTurnState,
  entry: SessionEntry
): void => {
  const completedAt = timestampSeconds(entry.timestamp);
  state.turn.completedAt = completedAt;
  state.turn.durationMs = state.turn.startedAt
    ? (completedAt - state.turn.startedAt) * 1000
    : null;
};

export const projectPiConversation = (
  entries: readonly SessionEntry[],
  cwd: string
): readonly Turn[] => {
  const turns: Turn[] = [];
  let state: MutableTurnState | undefined;
  for (const entry of entries) {
    const renderableEntry =
      entry.type === "message" ||
      entry.type === "compaction" ||
      entry.type === "branch_summary";
    if (!renderableEntry) {
      continue;
    }
    const startsTurn =
      entry.type === "message" && entry.message.role === "user";
    if (startsTurn && state) {
      if (state.turn.items.length > 0) {
        turns.push(state.turn);
      }
      state = undefined;
    }
    state ??= createTurn(entry);

    if (entry.type === "message") {
      appendMessage(state, entry, cwd);
    } else if (entry.type === "compaction") {
      state.turn.items.push({ id: entry.id, type: "contextCompaction" });
      state.turn.status = "completed";
    } else if (entry.type === "branch_summary") {
      state.turn.items.push({
        delivery: null,
        id: entry.id,
        memoryCitation: null,
        phase: null,
        text: entry.summary,
        type: "agentMessage",
      });
      state.turn.status = "completed";
    }
    completeTurnTiming(state, entry);
  }
  if (state && state.turn.items.length > 0) {
    turns.push(state.turn);
  }
  return turns;
};
