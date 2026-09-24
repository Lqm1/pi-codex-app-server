import { platform } from "node:os";

import type { InitializeParams } from "../../vendor/openai-codex-app-server-protocol/typescript/InitializeParams.js";
import type { InitializeResponse } from "../../vendor/openai-codex-app-server-protocol/typescript/InitializeResponse.js";
import type { GetAccountResponse } from "../../vendor/openai-codex-app-server-protocol/typescript/v2/GetAccountResponse.js";
import type { ModelProviderCapabilitiesReadResponse } from "../../vendor/openai-codex-app-server-protocol/typescript/v2/ModelProviderCapabilitiesReadResponse.js";
import type { ThreadStartParams } from "../../vendor/openai-codex-app-server-protocol/typescript/v2/ThreadStartParams.js";
import type { TurnInterruptParams } from "../../vendor/openai-codex-app-server-protocol/typescript/v2/TurnInterruptParams.js";
import type { TurnStartParams } from "../../vendor/openai-codex-app-server-protocol/typescript/v2/TurnStartParams.js";
import { codexAppServerUserAgent } from "../codex-app-server-identity.js";
import type { AppServerConfig } from "../config/app-server-config.js";
import type { PiLiveSessionManager } from "../pi/live-session-manager.js";
import type { PiModelCatalog } from "../pi/model-catalog.js";
import type { PiModelRuntime } from "../pi/pi-model-runtime.js";
import type { PiSessionRepository } from "../pi/session-repository.js";
import type { PiThreadCatalog } from "../pi/thread-catalog.js";
import type { JsonRpcConnection } from "../protocol/json-rpc-connection.js";
import type { MetadataDatabase } from "../storage/metadata-database.js";
import { registerNeutralCompatibilityResponses } from "./neutral-compatibility-responses.js";

const readModelProviderCapabilities =
  (): ModelProviderCapabilitiesReadResponse => ({
    imageGeneration: false,
    namespaceTools: false,
    webSearch: false,
  });

const platformOs = (): string => {
  const current = platform();
  if (current === "darwin") {
    return "macos";
  }
  if (current === "win32") {
    return "windows";
  }
  return current;
};

export class AppServer {
  readonly #clients = new Map<string, InitializeParams>();
  readonly #config: AppServerConfig;
  readonly #database: MetadataDatabase;
  readonly #modelCatalog: PiModelCatalog;
  readonly #liveSessionManager: PiLiveSessionManager;
  readonly #modelRuntime: PiModelRuntime;
  readonly #sessionRepository: PiSessionRepository;
  readonly #threadCatalog: PiThreadCatalog;

  constructor(options: {
    readonly config: AppServerConfig;
    readonly database: MetadataDatabase;
    readonly modelCatalog: PiModelCatalog;
    readonly liveSessionManager: PiLiveSessionManager;
    readonly modelRuntime: PiModelRuntime;
    readonly sessionRepository: PiSessionRepository;
    readonly threadCatalog: PiThreadCatalog;
  }) {
    this.#config = options.config;
    this.#database = options.database;
    this.#modelCatalog = options.modelCatalog;
    this.#liveSessionManager = options.liveSessionManager;
    this.#modelRuntime = options.modelRuntime;
    this.#sessionRepository = options.sessionRepository;
    this.#threadCatalog = options.threadCatalog;
  }

  close(): void {
    this.#liveSessionManager.close();
    this.#database.close();
  }

  get database(): MetadataDatabase {
    return this.#database;
  }

  get modelRuntime(): PiModelRuntime {
    return this.#modelRuntime;
  }

  register(connection: JsonRpcConnection): void {
    connection.registerCompatibilityFallbacks();
    registerNeutralCompatibilityResponses(connection);

    const initialize = (
      params: InitializeParams,
      context: { readonly clientId: string }
    ): InitializeResponse => {
      this.#clients.set(context.clientId, params);
      const response: InitializeResponse = {
        codexHome: this.#config.paths.home,
        platformFamily: platform() === "win32" ? "windows" : "unix",
        platformOs: platformOs(),
        userAgent: codexAppServerUserAgent(),
      };
      return response;
    };
    connection.registerRequest("initialize", initialize);

    const initialized = (context: { readonly clientId: string }): void => {
      if (!this.#clients.has(context.clientId)) {
        throw new Error("Client is not initialized");
      }
    };
    connection.registerInitialized(initialized);

    const listModels = (
      params: Parameters<PiModelCatalog["list"]>[0],
      context: { readonly signal: AbortSignal }
    ) => this.#modelCatalog.list(params, context.signal);
    connection.registerRequest("model/list", listModels);

    connection.registerRequest(
      "modelProvider/capabilities/read",
      readModelProviderCapabilities
    );

    const readAccount = (): GetAccountResponse => ({
      account: this.#modelRuntime.hasOpenAiAuthentication()
        ? { email: null, planType: "unknown", type: "chatgpt" }
        : null,
      requiresOpenaiAuth: false,
    });
    connection.registerRequest("account/read", readAccount);

    const logout = async (
      _params: undefined,
      context: { readonly signal: AbortSignal }
    ): Promise<Record<string, never>> => {
      await this.#modelRuntime.logoutOpenAi(context.signal);
      return {};
    };
    connection.registerRequest("account/logout", logout);

    const listThreads = this.#threadCatalog.list.bind(this.#threadCatalog);
    connection.registerRequest("thread/list", listThreads);

    const readThread = async (params: {
      readonly includeTurns?: boolean;
      readonly threadId: string;
    }) => {
      const thread = await this.#threadCatalog.read(
        params.threadId,
        params.includeTurns
      );
      if (!thread) {
        throw new Error(`Thread not found: ${params.threadId}`);
      }
      return { thread };
    };
    connection.registerRequest("thread/read", readThread);

    const startThread = async (params: ThreadStartParams) => {
      const threadStartResponse = await this.#liveSessionManager.start(params);
      connection.notify("thread/started", {
        thread: threadStartResponse.thread,
      });
      return threadStartResponse;
    };
    connection.registerRequest("thread/start", startThread);

    const resumeThread = async (params: { readonly threadId: string }) => {
      const sessionManager = await this.#sessionRepository.load(
        params.threadId
      );
      const thread = await this.#threadCatalog.read(params.threadId, true);
      if (!(sessionManager && thread)) {
        throw new Error(`Thread not found: ${params.threadId}`);
      }
      this.#liveSessionManager.rebindConnection(params.threadId, connection);
      const sessionContext = sessionManager.buildSessionContext();
      const provider = sessionContext.model?.provider ?? "pi";
      const modelId = sessionContext.model?.modelId ?? "unknown";
      return {
        activePermissionProfile: null,
        approvalPolicy: "never" as const,
        approvalsReviewer: "user" as const,
        cwd: sessionManager.getCwd(),
        initialTurnsPage: null,
        instructionSources: [],
        itemsBackwardsCursor: null,
        model: `${encodeURIComponent(provider)}/${encodeURIComponent(modelId)}`,
        modelProvider: provider,
        multiAgentMode: "explicitRequestOnly" as const,
        reasoningEffort: sessionContext.thinkingLevel,
        runtimeWorkspaceRoots: [sessionManager.getCwd()],
        sandbox: { type: "dangerFullAccess" as const },
        serviceTier: null,
        thread,
        turnsBackwardsCursor: null,
      };
    };
    connection.registerRequest("thread/resume", resumeThread);

    connection.registerRequest("thread/loaded/list", (params) =>
      this.#liveSessionManager.loadedList(params)
    );

    const setThreadName = async (params: {
      readonly name: string;
      readonly threadId: string;
    }): Promise<Record<string, never>> => {
      const sessionManager = await this.#sessionRepository.load(
        params.threadId
      );
      if (!sessionManager) {
        throw new Error(`Thread not found: ${params.threadId}`);
      }
      sessionManager.appendSessionInfo(params.name);
      connection.notify("thread/name/updated", {
        threadId: params.threadId,
        threadName: params.name || undefined,
      });
      return {};
    };
    connection.registerRequest("thread/name/set", setThreadName);

    const compactThread = async (params: {
      readonly threadId: string;
    }): Promise<Record<string, never>> => {
      await this.#liveSessionManager.compact(params.threadId);
      return {};
    };
    connection.registerRequest("thread/compact/start", compactThread);

    connection.registerRequest("thread/unsubscribe", () => ({
      status: "notSubscribed",
    }));

    const startTurn = async (params: TurnStartParams) => ({
      turn: await this.#liveSessionManager.startTurn(params, connection),
    });
    connection.registerRequest("turn/start", startTurn);

    const steerTurn = this.#liveSessionManager.steer.bind(
      this.#liveSessionManager
    );
    connection.registerRequest("turn/steer", steerTurn);

    const interruptTurn = async (params: TurnInterruptParams) => {
      await this.#liveSessionManager.interrupt(params.threadId, params.turnId);
      return {};
    };
    connection.registerRequest("turn/interrupt", interruptTurn);

    const archiveThread = (params: { readonly threadId: string }) => {
      if (!this.#database.setThreadArchived(params.threadId, true)) {
        throw new Error(`Thread not found: ${params.threadId}`);
      }
      return {};
    };
    connection.registerRequest("thread/archive", archiveThread);

    const unarchiveThread = async (params: { readonly threadId: string }) => {
      if (!this.#database.setThreadArchived(params.threadId, false)) {
        throw new Error(`Thread not found: ${params.threadId}`);
      }
      const thread = await this.#threadCatalog.read(params.threadId);
      if (!thread) {
        throw new Error(`Thread not found after unarchive: ${params.threadId}`);
      }
      return { thread };
    };
    connection.registerRequest("thread/unarchive", unarchiveThread);

    const deleteThread = async (params: {
      readonly threadId: string;
    }): Promise<Record<string, never>> => {
      if (!(await this.#sessionRepository.delete(params.threadId))) {
        throw new Error(`Thread not found: ${params.threadId}`);
      }
      return {};
    };
    connection.registerRequest("thread/delete", deleteThread);
  }
}
