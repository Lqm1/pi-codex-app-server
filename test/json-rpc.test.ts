import { describe, expect, test } from "vitest";

import { codexAppServerUserAgent } from "../src/codex-app-server-identity.js";
import { appServerLogger } from "../src/logging/app-server-logger.js";
import {
  CodexClientMethodNames,
  CodexClientNeutralResponses,
} from "../src/protocol/generated/codex-methods.js";
import { JsonRpcConnection } from "../src/protocol/json-rpc-connection.js";
import {
  ProtocolValidationError,
  addJsonRpcVersion,
  parseClientNotification,
  parseClientRequest,
  parseCodexWireMessage,
  removeJsonRpcVersion,
  validateClientResponse,
} from "../src/protocol/validation.js";
import type { MessageTransport } from "../src/transports/message-transport.js";

const oneExperimentalRequest =
  async function* oneExperimentalRequest(): AsyncIterable<string> {
    yield '{"id":11,"method":"collaborationMode/list","params":{}}';
  };

describe("JSON-RPC boundary", () => {
  test("parses Codex's headerless wire messages", () => {
    const request = parseCodexWireMessage(
      '{"id":7,"method":"initialize","params":{"clientInfo":{"name":"test","title":null,"version":"1"},"capabilities":null}}'
    );
    expect(parseClientRequest(request)).toStrictEqual({
      id: 7,
      method: "initialize",
      params: {
        capabilities: null,
        clientInfo: { name: "test", title: null, version: "1" },
      },
    });

    const notification = parseCodexWireMessage('{"method":"initialized"}');
    expect(parseClientNotification(notification)).toStrictEqual({
      method: "initialized",
    });
  });

  test("rejects invalid envelopes and method parameters", () => {
    expect(() => parseCodexWireMessage("{")).toThrow(/./u);
    expect(() => parseCodexWireMessage('{"method":7,"params":null}')).toThrow(
      ProtocolValidationError
    );

    const invalidInitialize = parseCodexWireMessage(
      '{"id":1,"method":"initialize","params":{}}'
    );
    expect(() => parseClientRequest(invalidInitialize)).toThrow(
      ProtocolValidationError
    );
  });

  test("adds the JSON-RPC version only for the internal library", () => {
    const wireMessage = parseCodexWireMessage(
      '{"id":"request-1","result":{"value":1}}'
    );
    const libraryMessage = addJsonRpcVersion(wireMessage);
    expect(libraryMessage).toStrictEqual({
      id: "request-1",
      jsonrpc: "2.0",
      result: { value: 1 },
    });
    expect(removeJsonRpcVersion(libraryMessage)).toStrictEqual(wireMessage);
  });

  test("validates method-specific responses with official schemas", () => {
    expect(() =>
      validateClientResponse("initialize", {
        codexHome: "/tmp/codex",
        platformFamily: "unix",
        platformOs: "linux",
        userAgent: codexAppServerUserAgent(),
      })
    ).not.toThrow();
    expect(() => validateClientResponse("initialize", {})).toThrow(
      ProtocolValidationError
    );
  });

  test("provides an official-schema-valid response for every client method", () => {
    expect(Object.keys(CodexClientNeutralResponses)).toHaveLength(
      CodexClientMethodNames.length
    );
    for (const method of CodexClientMethodNames) {
      expect(() =>
        validateClientResponse(method, CodexClientNeutralResponses[method])
      ).not.toThrow();
    }
  });

  test("accepts an experimental method through the compatibility fallback", async () => {
    const sent: string[] = [];
    const transport: MessageTransport = {
      close: () => {},
      read: oneExperimentalRequest,
      send: (message) => {
        sent.push(message);
        return Promise.resolve();
      },
    };
    const connection = new JsonRpcConnection({
      clientId: "experimental-test",
      logger: appServerLogger,
      transport,
    });
    connection.registerCompatibilityFallbacks();

    await connection.run();

    expect(sent).toHaveLength(1);
    expect(parseCodexWireMessage(sent[0] ?? "")).toMatchObject({
      id: 11,
      result: { data: [] },
    });
  });

  test("matches the official Codex user-agent format", () => {
    expect(
      codexAppServerUserAgent({
        architecture: "x64",
        environment: { TERM: "dumb" },
        platform: "win32",
        release: "10.0.26200",
      })
    ).toBe("codex_cli_rs/0.149.0 (Windows 10.0.26200; x86_64) dumb");
  });
});
