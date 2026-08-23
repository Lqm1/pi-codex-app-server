# Model projects after Codex project roots

Keep a persistent Codex-compatible project catalog and associate discovered Pi sessions by their Git worktree root, falling back to the session `cwd` outside Git. Nested working directories therefore share one project, separate worktrees remain distinct roots, and explicit app-server projects may still contain multiple roots.
