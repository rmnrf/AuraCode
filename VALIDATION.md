# Validation of the AuraCode worktree

This is a **source draft**, not a validated Windows release. The GitHub fork has been created. GitHub Actions validation and native VSIX packaging are in progress.

## Checks completed

- Text/path branding audit: passed, excluding mandatory legal copyright and license notices.
- Parse check over repository TypeScript/TSX sources: passed.
- Local endpoint, config override and real HTTP streaming/redirect tests: 3 passed.
- Telemetry consent/identity test: passed; telemetry cannot be enabled.
- VS Code extension host TypeScript check: passed with the repository root supplied as `rootDir` to account for shared source imports.
- Webview TypeScript check: passed.
- Extension ESLint: passed.
- Production JavaScript/webview bundle: built using Node/esbuild.

## Outstanding checks and blockers

- Bun 1.4.4 crashes during JavaScript startup in this environment, including a standalone `console.log(1)`. The native TypeScript compiler also fails to read `/proc/self/exe` here.
- The alternate pnpm/TypeScript check of the whole backend encounters duplicate Drizzle peer dependency type identities. This check is not green and must be rerun using the pinned Bun dependency installation in CI.
- Native Windows backend compilation, VSIX packaging, installation in VS Code and live inference against the user's actual local server remain pending.
- The build workflow is prepared for Windows x64 but has not run. The upstream Bun lockfile was textually renamed and needs regeneration with `bun install` before a frozen reproducible release.
- Inherited documentation screenshots and visual regression image baselines have been removed. Fresh screenshots and visual baselines remain to be generated for AuraCode. Git history, GitHub fork attribution and mandatory legal notices preserve historical attribution.

## Privacy changes to validate in the native build

The active model registry contains only the OpenAI-compatible adapter. Effective config is restricted to provider `local`, with an explicit numeric loopback endpoint. Remote catalogs, plugin auth loaders, cloud autocomplete and remote control are disabled. PostHog transport and identity collection, OpenTelemetry exporters and cloud session ingest queues are removed or replaced by disabled compatibility hooks. The extension's fetch wrapper is injected into its own bundle and does not replace networking in VS Code's shared extension host.

This is application-level policy. User-invoked terminal commands, local model servers, VS Code and unrelated extensions have their own networking and telemetry behavior.
