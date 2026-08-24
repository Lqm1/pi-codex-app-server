import { setTimeout as delay } from "node:timers/promises";

const INITIAL_POLL_DELAY_MS = 50;
const MAX_POLL_DELAY_MS = 500;

export interface DaemonEndpoint {
  readonly pid: number;
  readonly startedAt?: string;
  readonly transport: "websocket";
  readonly url: string;
}

interface PollClock {
  readonly now: () => number;
  readonly sleep: (durationMs: number) => Promise<void>;
}

const systemClock: PollClock = {
  now: Date.now,
  sleep: async (durationMs) => {
    await delay(durationMs);
  },
};

export const waitForDaemonEndpoint = async (options: {
  readonly clock?: PollClock;
  readonly expectedPid: number;
  readonly readEndpoint: () => Promise<DaemonEndpoint | undefined>;
  readonly timeoutMs: number;
}): Promise<DaemonEndpoint> => {
  const clock = options.clock ?? systemClock;
  const deadline = clock.now() + options.timeoutMs;

  const poll = async (pollDelayMs: number): Promise<DaemonEndpoint> => {
    const endpoint = await options.readEndpoint();
    if (endpoint?.pid === options.expectedPid) {
      return endpoint;
    }
    const remainingMs = deadline - clock.now();
    if (remainingMs <= 0) {
      throw new Error(
        `Codex App Server did not become ready within ${options.timeoutMs} ms`
      );
    }
    await clock.sleep(Math.min(pollDelayMs, remainingMs));
    return await poll(Math.min(pollDelayMs * 2, MAX_POLL_DELAY_MS));
  };

  return await poll(INITIAL_POLL_DELAY_MS);
};
