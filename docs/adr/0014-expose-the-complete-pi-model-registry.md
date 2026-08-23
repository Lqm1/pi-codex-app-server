# Expose the complete Pi model registry

`model/list` exposes every model available through Pi's Model Registry, including non-OpenAI providers. Exact provider and model selections pass through to Pi without request rewriting or implicit fallback; unavailable selections fail explicitly, while client-specific display limitations are handled as compatibility concerns rather than narrowing the server's model catalog.
