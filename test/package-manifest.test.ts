import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";
import { z } from "zod";

const packageManifestSchema = z.object({
  dependencies: z.record(z.string(), z.string()),
});

describe("package manifest", () => {
  it("installs the Pi runtime dependencies required by the daemon", async () => {
    const manifestContents = await readFile(
      new URL("../package.json", import.meta.url),
      "utf-8"
    );
    const manifest = packageManifestSchema.parse(JSON.parse(manifestContents));

    expect(manifest.dependencies).toMatchObject({
      "@earendil-works/pi-ai": expect.any(String),
      "@earendil-works/pi-coding-agent": expect.any(String),
      "@earendil-works/pi-tui": expect.any(String),
    });
  });
});
