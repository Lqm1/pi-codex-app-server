# Keep agent execution owned by Pi

Reimplement the Codex App Server and Remote Control integration, but not Codex Core's agent execution, sandbox, permissions, approval policy, or tool machinery. Sessions run with unmodified Pi execution semantics: Codex protocol settings map onto an existing Pi capability when one is available, and otherwise are accepted without enforcement and reported as the effective Pi state. The adapter must not invent security behavior or alter Pi's model and tool requests.
