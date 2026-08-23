import { chmod } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dir, "..");
const sharedOptions = {
  format: "esm",
  packages: "external",
  sourcemap: "external",
  target: "node",
} satisfies Pick<
  Bun.BuildConfig,
  "format" | "packages" | "sourcemap" | "target"
>;

const libraryBuild = await Bun.build({
  ...sharedOptions,
  entrypoints: [
    path.resolve(root, "src/index.ts"),
    path.resolve(root, "src/extension/index.ts"),
  ],
  naming: "[dir]/[name].[ext]",
  outdir: path.resolve(root, "dist"),
  root: path.resolve(root, "src"),
});

const cliBuild = await Bun.build({
  ...sharedOptions,
  banner: "#!/usr/bin/env node",
  entrypoints: [path.resolve(root, "src/cli.ts")],
  outdir: path.resolve(root, "dist"),
});

const failures = [...libraryBuild.logs, ...cliBuild.logs].filter(
  (message) => message.level === "error"
);
if (!libraryBuild.success || !cliBuild.success || failures.length > 0) {
  for (const failure of failures) {
    process.stderr.write(`${failure.message}\n`);
  }
  process.exitCode = 1;
} else {
  await chmod(path.resolve(root, "dist/cli.js"), 0o755);
}
