import type { Logger } from "@logtape/logtape";
import {
  JSONRPCClient,
  JSONRPCErrorCode,
  JSONRPCServer,
  JSONRPCServerAndClient,
} from "json-rpc-2.0";
import type { TypedJSONRPCServerAndClient } from "json-rpc-2.0";

import type { ServerNotification } from "../../vendor/openai-codex-app-server-protocol/typescript/ServerNotification.js";
import type { MessageTransport } from "../transports/message-transport.js";
import type {
  CodexClientMethods,
  CodexServerMethods,
} from "./generated/codex-methods.js";
import {
  CodexClientMethodNames,
  CodexClientNeutralResponses,
} from "./generated/codex-methods.js";
import {
  ProtocolValidationError,
  addJsonRpcVersion,
  parseClientNotification,
  parseClientRequest,
  parseCodexWireMessage,
  parseServerNotification,
  parseServerRequest,
  removeJsonRpcVersion,
  validateClientResponse,
  validateServerResponse,
} from "./validation.js";
import type { JsonRpcLibraryMessage } from "./validation.js";

export interface JsonRpcRequestContext {
  readonly clientId: string;
  readonly signal: AbortSignal;
}

type ClientMethod = keyof CodexClientMethods;
type ServerMethod = keyof CodexServerMethods;
type ServerNotificationMethod = ServerNotification["method"];
type ServerNotificationFor<Method extends ServerNotificationMethod> = Extract<
  ServerNotification,
  { readonly method: Method }
>;
type ServerNotificationParams<Method extends ServerNotificationMethod> =
  ServerNotificationFor<Method> extends { readonly params: infer Params }
    ? Params
    : undefined;

export type ClientRequestHandler<Method extends ClientMethod> = (
  params: Parameters<CodexClientMethods[Method]>[0],
  context: JsonRpcRequestContext
) =>
  | ReturnType<CodexClientMethods[Method]>
  | PromiseLike<ReturnType<CodexClientMethods[Method]>>;

export type ClientNotificationHandler = (
  context: JsonRpcRequestContext
) => void | PromiseLike<void>;

type CodexJsonRpcPeer = TypedJSONRPCServerAndClient<
  CodexClientMethods,
  CodexServerMethods,
  JsonRpcRequestContext,
  JsonRpcRequestContext
>;

export class JsonRpcConnection {
  readonly #abortController = new AbortController();
  readonly #clientId: string;
  readonly #context: JsonRpcRequestContext;
  readonly #logger: Logger;
  readonly #pendingClientRequests = new Map<string | number, ClientMethod>();
  readonly #pendingServerRequests = new Map<string | number, ServerMethod>();
  readonly #peer: CodexJsonRpcPeer;
  readonly #transport: MessageTransport;

  constructor(options: {
    readonly clientId: string;
    readonly logger: Logger;
    readonly transport: MessageTransport;
  }) {
    this.#clientId = options.clientId;
    this.#context = {
      clientId: options.clientId,
      signal: this.#abortController.signal,
    };
    this.#logger = options.logger;
    this.#transport = options.transport;
    const sendPayload = async (
      payload: JsonRpcLibraryMessage
    ): Promise<void> => {
      await this.#sendPayload(payload);
    };
    const reportLibraryError = (message: string): void => {
      this.#logger.error(message, { clientId: this.#clientId });
    };
    const server = new JSONRPCServer<JsonRpcRequestContext>({
      errorListener: reportLibraryError,
    });
    const client = new JSONRPCClient<JsonRpcRequestContext>(sendPayload);
    this.#peer = new JSONRPCServerAndClient(server, client, {
      errorListener: reportLibraryError,
    });
  }

  close(): void {
    this.#abortController.abort();
    this.#peer.rejectAllPendingRequests("JSON-RPC connection closed");
    this.#transport.close();
  }

  registerRequest<Method extends ClientMethod>(
    method: Method,
    handler: ClientRequestHandler<Method>
  ): void {
    this.#peer.addMethod(method, handler);
  }

  registerCompatibilityFallbacks(): void {
    for (const method of CodexClientMethodNames) {
      this.#registerCompatibilityFallback(method);
    }
  }

  registerInitialized(handler: ClientNotificationHandler): void {
    const initialized = (
      _params: undefined,
      context: JsonRpcRequestContext
    ): void | PromiseLike<void> => handler(context);
    this.#peer.server.addMethod("initialized", initialized);
  }

  async run(): Promise<void> {
    try {
      for await (const message of this.#transport.read()) {
        await this.#receive(message);
      }
    } catch (error) {
      const failure =
        error instanceof Error ? error : new Error("JSON-RPC transport failed");
      this.#logger.error(failure, { clientId: this.#clientId });
      throw failure;
    } finally {
      this.close();
    }
  }

  notify<Method extends ServerNotificationMethod>(
    method: Method,
    params: ServerNotificationParams<Method>
  ): void {
    this.#peer.notify(method, params, this.#context);
  }

  async #receive(text: string): Promise<void> {
    let message;
    try {
      message = parseCodexWireMessage(text);
    } catch (error) {
      const failure =
        error instanceof Error ? error : new Error("Invalid JSON-RPC message");
      this.#logger.warn(failure, { clientId: this.#clientId });
      await this.#transport.send(
        JSON.stringify({
          error: {
            code: JSONRPCErrorCode.ParseError,
            message: failure.message,
          },
          id: null,
        })
      );
      return;
    }

    try {
      if ("method" in message) {
        if ("id" in message) {
          const request = parseClientRequest(message);
          this.#pendingClientRequests.set(request.id, request.method);
        } else {
          parseClientNotification(message);
        }
      } else {
        const method = this.#pendingServerRequests.get(message.id);
        if (method && message.result !== undefined) {
          validateServerResponse(method, message.result);
        }
        this.#pendingServerRequests.delete(message.id);
      }
    } catch (error) {
      if (
        error instanceof ProtocolValidationError &&
        "method" in message &&
        "id" in message
      ) {
        await this.#transport.send(
          JSON.stringify({
            error: {
              code: JSONRPCErrorCode.InvalidParams,
              message: error.message,
            },
            id: message.id,
          })
        );
        return;
      }
      throw error;
    }

    await this.#peer.receiveAndSend(
      addJsonRpcVersion(message),
      this.#context,
      this.#context
    );
  }

  #registerCompatibilityFallback<Method extends ClientMethod>(
    method: Method
  ): void {
    this.#peer.server.addMethod(method, () =>
      structuredClone(CodexClientNeutralResponses[method])
    );
  }

  async #sendPayload(payload: JsonRpcLibraryMessage): Promise<void> {
    const message = removeJsonRpcVersion(payload);
    if ("method" in message) {
      if ("id" in message) {
        const request = parseServerRequest(message);
        this.#pendingServerRequests.set(request.id, request.method);
      } else {
        parseServerNotification(message);
      }
    } else {
      const method = this.#pendingClientRequests.get(message.id);
      if (method && message.result !== undefined) {
        validateClientResponse(method, message.result);
      }
      this.#pendingClientRequests.delete(message.id);
    }
    await this.#transport.send(JSON.stringify(message));
  }
}
