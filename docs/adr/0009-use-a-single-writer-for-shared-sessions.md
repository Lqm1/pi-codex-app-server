# Use a single writer for shared sessions

The app-server daemon coordinates one active writer for every shared session. An active Pi TUI may hold the writer lease and receive delegated app-server operations through the control extension; otherwise the daemon opens and writes the Pi session directly. Pi's JSONL session manager keeps an in-memory tree and can rewrite the file without cross-process coordination, so the daemon serializes operations and transfers ownership instead of allowing concurrent writers.
