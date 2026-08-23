# Pi Codex App Server

This project lets Codex-compatible clients use Pi Coding Agent as a local coding agent and connected host.

## Language

**Pi-backed Codex server**: A service that presents the Codex app-server contract while Pi Coding Agent performs the agent work. _Avoid_: Codex clone, fake Codex

**Pi execution semantics**: The unmodified model, tool, permission, approval, and process-execution behavior supplied by Pi Coding Agent. The server exposes this behavior but does not replace it with Codex Core behavior. _Avoid_: Codex sandbox, compatibility sandbox

**App-server daemon**: The long-lived process that accepts Codex app-server connections and owns remotely accessible sessions. _Avoid_: Extension server, Pi session

**Control extension**: The Pi extension through which a user starts, stops, configures, and inspects the app-server daemon. _Avoid_: App-server daemon, server extension

**Connected host**: A computer registered with ChatGPT Remote that provides its projects, files, tools, permissions, and agent sessions to paired mobile or desktop clients. _Avoid_: Relay server, remote client

**Pi credential**: An OpenAI credential owned and refreshed by Pi Coding Agent and shared with the Pi-backed Codex server. _Avoid_: App-server credential, copied token

**Shared session**: A Pi agent session coordinated by the app-server daemon and exposed to Pi TUI and remote app-server clients. Its sole active writer is either the daemon or the Pi TUI process currently holding the session lease. _Avoid_: Shared session file, multi-writer session

**Native Pi session**: A regular Pi TUI session owned and persisted directly by the Pi process, outside app-server daemon ownership. _Avoid_: Shared session, daemon session

**Pi project**: A project root known from a Pi session or explicitly registered through the app-server project API. All Pi projects belong to the connected host's project catalog. _Avoid_: ChatGPT workspace, selected session
