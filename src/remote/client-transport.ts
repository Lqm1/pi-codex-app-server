import { AsyncMessageQueue } from "../transports/async-message-queue.js";
import type { MessageTransport } from "../transports/message-transport.js";

export type RemoteMessageSender = (message: string) => Promise<void>;

export class RemoteClientTransport implements MessageTransport {
  readonly #messages = new AsyncMessageQueue();
  readonly #sender: RemoteMessageSender;
  #closed = false;

  constructor(sender: RemoteMessageSender) {
    this.#sender = sender;
  }

  get closed(): boolean {
    return this.#closed;
  }

  close(): void {
    if (this.#closed) {
      return;
    }
    this.#closed = true;
    this.#messages.close();
  }

  push(message: string): void {
    if (!this.#closed) {
      this.#messages.push(message);
    }
  }

  read(): AsyncIterable<string> {
    return this.#messages;
  }

  send(message: string): Promise<void> {
    if (this.#closed) {
      throw new Error("Remote client transport is closed");
    }
    return this.#sender(message);
  }
}
