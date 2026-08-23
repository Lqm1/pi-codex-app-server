# Fix the backend identity after project testing

Choose one backend identity as a project-level behavior rather than a user setting. Test the truthful Pi identity first; if the OpenAI backend rejects it because it requires Codex-compatible identity fields, change the implementation to the required Codex identity and keep that result fixed for the project.
