import { describe, expect, it } from "vitest";

import { renderPairingQrCode } from "../src/extension/pairing-qr-code.js";

describe("pairing QR code", () => {
  it("renders a pairing payload for the Pi TUI", async () => {
    await expect(renderPairingQrCode("pairing-payload")).resolves.toContain(
      "\n"
    );
  });
});
