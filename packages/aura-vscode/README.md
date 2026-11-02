# AuraCode

A local-only derivative of the upstream VS Code coding agent. This worktree targets **Windows x64** and a **local OpenAI-compatible server**.

## Local model setup

1. Start your local inference server with a model that supports streaming `/v1/chat/completions` and tool calls.
2. Open AuraCode → Settings → Providers.
3. Enter the server URL, for example `http://127.0.0.1:1234/v1`, and its exact model ID.
4. Apply the provider and save settings.

Only `127.0.0.1`, `localhost` and `[::1]` are accepted. `localhost` is normalized to the numeric loopback address. HTTP redirects are refused. LAN and cloud model endpoints are rejected, including endpoints introduced through project config. The initial model name `local-model` is a placeholder; change it to your server's model ID.

The backend keeps coding tools, local conversation storage, agent modes and workspace operations. Cloud autocomplete, cloud authentication, cloud session uploads, remote control, online model catalogs, marketplace suggestions, automatic LSP downloads and external plugins are disabled. Event transport, persistent telemetry identity collection and OpenTelemetry exporters have been removed; compatibility hooks do nothing even when telemetry consent is enabled.

This extension does not control telemetry emitted independently by VS Code, other extensions, or commands the user asks the agent to execute. Shell processes and local inference servers are separate programs. This is not an operating-system firewall.

## Build on Windows x64

Required: Git with Git LFS, Node 24 and Bun **1.4.4**. The `.github/workflows/build-windows.yml` workflow builds the same package on a Windows runner.

```powershell
$env:AURA_VERSION = "1.0.0"
$env:AURA_CHANNEL = "latest"
$env:AURA_RELEASE = "true"
bun install
node --experimental-strip-types --test packages/local-only/test/policy.test.ts
node --experimental-transform-types --test packages/aura-telemetry/src/__tests__/privacy.test.ts
cd packages/aura-vscode
bun run prepare:sdk
bun run typecheck
bun run lint
bun script/local-bin.ts --compiled
bun run bundle:production
bunx vsce package --no-dependencies --target win32-x64 --out ../../auracode-1.0.0-win32-x64.vsix
```

Install the resulting package using VS Code's **Extensions: Install from VSIX** command.

## Validation status

See `VALIDATION.md` for checks actually performed. A prepared build workflow is not evidence of a successful native build.

## License

MIT. Original copyright and license notices must remain in distributed copies. Product branding has changed; mandatory legal attribution is preserved in LICENSE files. Git history also preserves the historical origin of this derivative.
