import type { Component } from "@earendil-works/pi-tui";
import {
  Key,
  matchesKey,
  truncateToWidth,
  visibleWidth,
} from "@earendil-works/pi-tui";

const MAX_HEIGHT_RATIO = 0.9;

interface PairingOverlayOptions {
  readonly compactLines: readonly string[];
  readonly fullLines: readonly string[];
  readonly onClose: () => void;
  readonly terminalRows: () => number;
}

interface RenderCache {
  readonly lines: string[];
  readonly terminalRows: number;
  readonly width: number;
}

export class PairingOverlay implements Component {
  readonly #compactLines: readonly string[];
  readonly #fullLines: readonly string[];
  readonly #onClose: () => void;
  readonly #terminalRows: () => number;
  #cache: RenderCache | undefined;
  #closed = false;

  constructor(options: PairingOverlayOptions) {
    this.#compactLines = options.compactLines;
    this.#fullLines = options.fullLines;
    this.#onClose = options.onClose;
    this.#terminalRows = options.terminalRows;
  }

  handleInput(data: string): void {
    if (
      !this.#closed &&
      (matchesKey(data, Key.enter) || matchesKey(data, Key.escape))
    ) {
      this.#closed = true;
      this.#onClose();
    }
  }

  invalidate(): void {
    this.#cache = undefined;
  }

  render(width: number): string[] {
    const terminalRows = this.#terminalRows();
    if (
      this.#cache?.width === width &&
      this.#cache.terminalRows === terminalRows
    ) {
      return this.#cache.lines;
    }
    const availableRows = Math.floor(terminalRows * MAX_HEIGHT_RATIO);
    const fullContentFits =
      this.#fullLines.length <= availableRows &&
      this.#fullLines.every((line) => visibleWidth(line) <= width);
    const lines = fullContentFits ? this.#fullLines : this.#compactLines;
    const renderedLines = lines.map((line) => truncateToWidth(line, width));
    this.#cache = { lines: renderedLines, terminalRows, width };
    return renderedLines;
  }
}
