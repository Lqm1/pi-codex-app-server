# Expose all known Pi projects through the connected host

The connected host exposes every project root known from Pi sessions or the app-server project API, matching Codex app-server's host-wide `project/list` behavior. Clients may then filter threads by project, while an unfiltered thread request can list sessions across all projects; the daemon does not crawl unrelated filesystem directories merely to expand this catalog.
