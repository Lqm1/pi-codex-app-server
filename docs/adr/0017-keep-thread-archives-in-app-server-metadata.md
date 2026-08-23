# Keep thread archives in app-server metadata

`thread/archive` and `thread/unarchive` update app-server metadata without moving or hiding the underlying Pi JSONL from native Pi. Pi has no equivalent archive lifecycle, so the adapter preserves Pi history while presenting Codex-compatible archived thread lists.
