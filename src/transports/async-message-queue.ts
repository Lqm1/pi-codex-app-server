type PendingMessage = ReturnType<
  typeof Promise.withResolvers<IteratorResult<string>>
>;

export class AsyncMessageQueue
  implements AsyncIterable<string>, AsyncIterator<string>
{
  readonly #messages: string[] = [];
  readonly #waiters: PendingMessage[] = [];
  #closed = false;

  [Symbol.asyncIterator](): AsyncIterator<string> {
    return this;
  }

  close(): void {
    if (this.#closed) {
      return;
    }
    this.#closed = true;
    for (const waiter of this.#waiters.splice(0)) {
      waiter.resolve({ done: true, value: undefined });
    }
  }

  next(): Promise<IteratorResult<string>> {
    const message = this.#messages.shift();
    if (message !== undefined) {
      return Promise.resolve({ done: false, value: message });
    }
    if (this.#closed) {
      return Promise.resolve({ done: true, value: undefined });
    }
    const waiter = Promise.withResolvers<IteratorResult<string>>();
    this.#waiters.push(waiter);
    return waiter.promise;
  }

  push(message: string): void {
    const waiter = this.#waiters.shift();
    if (waiter) {
      waiter.resolve({ done: false, value: message });
    } else {
      this.#messages.push(message);
    }
  }
}
