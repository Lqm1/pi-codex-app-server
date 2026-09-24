import { once } from "node:events";

import type { RawData, WebSocket } from "ws";
import { WebSocket as WebSocketState } from "ws";

import { AsyncMessageQueue } from "./async-message-queue.js";
import type { MessageTransport } from "./message-transport.js";

interface PendingSend {
  readonly message: string;
  readonly reject: (reason?: Error) => void;
  readonly resolve: (value: boolean) => void;
}

const textFrame = (data: RawData): string => {
  if (Array.isArray(data)) {
    return Buffer.concat(data).toString("utf-8");
  }
  if (data instanceof ArrayBuffer) {
    return Buffer.from(new Uint8Array(data)).toString("utf-8");
  }
  return data.toString("utf-8");
};

export class WebSocketTransport implements MessageTransport {
  readonly #messages = new AsyncMessageQueue();
  readonly #sendQueue: PendingSend[] = [];
  readonly #socket: WebSocket;
  #closed = false;
  #sending = false;

  constructor(socket: WebSocket) {
    this.#socket = socket;
    socket.on("message", (data, isBinary) => {
      if (isBinary) {
        socket.close(1003, "Only JSON text frames are supported");
      } else {
        this.#messages.push(textFrame(data));
      }
    });
    socket.on("close", () => this.#finish());
    socket.on("error", () => this.#finish());
  }

  close(): void {
    if (
      this.#socket.readyState === WebSocketState.OPEN ||
      this.#socket.readyState === WebSocketState.CONNECTING
    ) {
      this.#socket.close(1000, "App Server connection closed");
      const forceClose = setTimeout(() => {
        if (this.#socket.readyState !== WebSocketState.CLOSED) {
          this.#socket.terminate();
        }
      }, 250);
      forceClose.unref?.();
    }
    this.#finish();
  }

  read(): AsyncIterable<string> {
    return this.#messages;
  }

  async send(message: string): Promise<void> {
    const completion = Promise.withResolvers<boolean>();
    this.#sendQueue.push({
      message,
      reject: completion.reject,
      resolve: completion.resolve,
    });
    void this.#flushSendQueue();
    await completion.promise;
  }

  async waitUntilOpen(timeoutMs = 30_000): Promise<void> {
    if (!this.#closed && this.#socket.readyState === WebSocketState.OPEN) {
      return;
    }
    if (this.#closed || this.#socket.readyState >= WebSocketState.CLOSING) {
      throw new Error("WebSocket closed before opening");
    }

    const controller = new AbortController();
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);
    timeout.unref?.();

    try {
      await Promise.race([
        once(this.#socket, "open", { signal: controller.signal }),
        this.#rejectOnClose(controller.signal),
        this.#rejectOnError(controller.signal),
      ]);
    } catch (error) {
      if (timedOut) {
        throw new Error("Timed out waiting for WebSocket to open", {
          cause: error,
        });
      }
      throw error;
    } finally {
      clearTimeout(timeout);
      controller.abort();
    }
  }

  async #flushSendQueue(): Promise<void> {
    if (this.#sending) {
      return;
    }
    this.#sending = true;
    try {
      let pending = this.#sendQueue.shift();
      while (pending) {
        try {
          // eslint-disable-next-line no-await-in-loop -- WebSocket writes must preserve transport order.
          await this.#sendNow(pending.message);
          pending.resolve(true);
        } catch (error) {
          pending.reject(
            error instanceof Error ? error : new Error("WebSocket send failed")
          );
        }
        pending = this.#sendQueue.shift();
      }
    } finally {
      this.#sending = false;
    }
  }

  async #rejectOnClose(signal: AbortSignal): Promise<never> {
    await once(this.#socket, "close", { signal });
    throw new Error("WebSocket closed before opening");
  }

  async #rejectOnError(signal: AbortSignal): Promise<never> {
    const [cause] = await once(this.#socket, "error", { signal });
    throw new Error("WebSocket failed before opening", { cause });
  }

  async #sendNow(message: string): Promise<void> {
    if (this.#closed || this.#socket.readyState !== WebSocketState.OPEN) {
      throw new Error("Cannot write to a closed WebSocket transport");
    }
    const completion = Promise.withResolvers<boolean>();
    // eslint-disable-next-line promise/prefer-await-to-callbacks -- ws reports send completion through its callback API.
    this.#socket.send(message, (error) => {
      if (error) {
        completion.reject(error);
      } else {
        completion.resolve(true);
      }
    });
    await completion.promise;
  }

  #finish(): void {
    if (this.#closed) {
      return;
    }
    this.#closed = true;
    this.#messages.close();
    const failure = new Error("Cannot write to a closed WebSocket transport");
    for (const pending of this.#sendQueue.splice(0)) {
      pending.reject(failure);
    }
  }
}
