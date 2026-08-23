# Keep delegated extension dialogs on the TUI

When an active Pi TUI holds the writer lease, Pi extension dialogs remain on that TUI and remote clients receive a host-interaction-waiting indication. Pi's public extension API cannot redirect another extension's TUI context; daemon-owned sessions still bridge the same dialogs through app-server user-input requests.
