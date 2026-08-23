# Separate the app-server daemon from the control extension

The app-server must remain available across Pi session changes, forks, and extension reloads. Run it as a long-lived daemon backed by the Pi SDK, and use the Pi extension only to control and inspect that daemon. A session-scoped extension server would disconnect clients whenever Pi replaces the active extension runtime.
