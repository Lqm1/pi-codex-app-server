# Delete the Pi session for thread delete

An explicit Codex `thread/delete` permanently deletes the corresponding Pi JSONL rather than adding Pi-specific trash or recovery behavior. The adapter follows Codex deletion semantics and must not claim success while retaining the conversation as an active Pi session.
