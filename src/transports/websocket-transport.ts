import type { RawData, WebSocket } from "ws";
import { WebSocket as WebSocketState } from "ws";

import { AsyncMessageQueue } from "./async-message-queue.js";
import type { MessageTransport } from "./message-transport.js";

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
  readonly #socket: WebSocket;
  #closed = false;

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
    }
    this.#finish();
  }

  read(): AsyncIterable<string> {
    return this.#messages;
  }

  send(message: string): Promise<void> {
    if (this.#closed || this.#socket.readyState !== WebSocketState.OPEN) {
      throw new Error("Cannot write to a closed WebSocket transport");
    }
    this.#socket.send(message);
    return Promise.resolve();
  }

  #finish(): void {
    if (this.#closed) {
      return;
    }
    this.#closed = true;
    this.#messages.close();
  }
}
