# Project Pi history into app-server threads

Pi JSONL remains the sole source of truth for conversation history, and the daemon projects its entries into stable Codex thread, turn, and item representations on demand. A SQLite sidecar stores only app-server concerns such as projects, pairing state, client cursors, ownership leases, and mappings that cannot be derived from Pi history; it does not duplicate conversation content.
