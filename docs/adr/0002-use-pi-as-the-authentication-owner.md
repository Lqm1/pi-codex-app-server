# Use Pi as the authentication owner

Use Pi's existing OpenAI Codex OAuth credential store and refresh flow as the sole owner of OpenAI credentials. The app-server reuses the Pi credential and routes login, refresh, and logout through Pi so two stores cannot rotate the same refresh token independently.
