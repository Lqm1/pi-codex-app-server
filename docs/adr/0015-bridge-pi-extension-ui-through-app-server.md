# Bridge Pi extension UI through app-server requests

Provide daemon-run Pi sessions with an RPC-style extension UI context and translate Pi `select`, `confirm`, `input`, and `editor` dialogs into Codex user-input requests, with notifications and simple presentation state forwarded where clients support them. TUI-only custom components and raw terminal input remain unavailable in the daemon, and unsupported client interactions resolve using Pi's normal cancel or timeout behavior.
