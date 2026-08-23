# Map account logout to Pi authentication

`account/logout` removes the shared Pi `openai-codex` credential and disconnects authenticated Remote Control state. Because Pi is the sole credential owner and the adapter keeps no independent login copy, per-device disconnection remains a separate Remote Control client-revocation operation.
