import { once } from "node:events";
import { createInterface } from "node:readline";
import type { Interface } from "node:readline";

import type { MessageTransport } from "./message-transport.js";

export class StdioTransport implements MessageTransport {
  readonly #readline: Interface;
  #closed = false;

  constructor() {
    this.#readline = createInterface({ input: process.stdin, terminal: false });
  }

  close(): void {
    if (this.#closed) {
      return;
    }
    this.#closed = true;
    this.#readline.close();
  }

  async *read(): AsyncIterable<string> {
    for await (const line of this.#readline) {
      if (line.trim().length > 0) {
        yield line;
      }
    }
  }

  async send(message: string): Promise<void> {
    if (this.#closed) {
      throw new Error("Cannot write to a closed stdio transport");
    }
    if (!process.stdout.write(`${message}\n`)) {
      await once(process.stdout, "drain");
    }
  }
}
