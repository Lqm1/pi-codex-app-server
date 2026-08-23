# Use generated Codex contracts with json-rpc-2.0

The transport uses `json-rpc-2.0` for bidirectional request correlation, error responses, and method dispatch. Compile-time method, parameter, and response correlation comes from a generated TypeScript method map derived from the official `openai/codex` `client_request_definitions!` and `server_request_definitions!` declarations. Runtime protocol validation compiles the vendored official JSON Schemas once with Ajv.

Codex omits the otherwise standard `"jsonrpc":"2.0"` member on the wire. The adapter adds it only while a message is inside `json-rpc-2.0` and removes it before transport output. Codex cancellation remains the protocol-level `turn/interrupt` request rather than introducing `$/cancelRequest`.

Zod is reserved for boundaries that have no official JSON Schema, including environment configuration and SQLite rows. JSON-RPC method schemas are not duplicated in Zod.
