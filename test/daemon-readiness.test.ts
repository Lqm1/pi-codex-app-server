import { describe, expect, it } from "vitest";

import { waitForDaemonEndpoint } from "../src/extension/daemon-readiness.js";

describe("daemon readiness", () => {
  it("waits for a matching endpoint beyond the former 300 ms deadline", async () => {
    let elapsedMs = 0;
    const endpoint = {
      pid: 42,
      transport: "websocket" as const,
      url: "ws://127.0.0.1:4242/",
    };
    const result = await waitForDaemonEndpoint({
      clock: {
        now: () => elapsedMs,
        sleep: (durationMs) => {
          elapsedMs += durationMs;
          return Promise.resolve();
        },
      },
      expectedPid: endpoint.pid,
      readEndpoint: () =>
        Promise.resolve(elapsedMs > 300 ? endpoint : undefined),
      timeoutMs: 5000,
    });

    expect(result).toStrictEqual(endpoint);
    expect(elapsedMs).toBeGreaterThan(300);
  });
});
