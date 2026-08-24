import { describe, expect, it, vi } from "vitest";

import { PairingOverlay } from "../src/extension/pairing-overlay.js";

describe(PairingOverlay, () => {
  it.each(["\r", "\u001B"])("closes when the user presses %j", (keypress) => {
    const onClose = vi.fn<() => void>();
    const overlay = new PairingOverlay({
      compactLines: ["Manual code: ABCD-EFGH"],
      fullLines: ["QR-LINE"],
      onClose,
      terminalRows: () => 30,
    });

    overlay.handleInput(keypress);

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("renders the QR code when the overlay has enough room", () => {
    const overlay = new PairingOverlay({
      compactLines: ["Manual code: ABCD-EFGH"],
      fullLines: ["QR-LINE-1", "QR-LINE-2"],
      onClose: vi.fn<() => void>(),
      terminalRows: () => 30,
    });

    expect(overlay.render(40)).toStrictEqual(["QR-LINE-1", "QR-LINE-2"]);
  });

  it("falls back to the manual code when the terminal is too small", () => {
    const overlay = new PairingOverlay({
      compactLines: ["Manual code: ABCD-EFGH"],
      fullLines: ["QR-LINE-1", "QR-LINE-2", "QR-LINE-3"],
      onClose: vi.fn<() => void>(),
      terminalRows: () => 3,
    });

    expect(overlay.render(40)).toStrictEqual(["Manual code: ABCD-EFGH"]);
  });
});
