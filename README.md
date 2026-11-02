# AuraCode

A local-only source derivative of the upstream VS Code coding agent, packaged independently with only the required workspace dependencies. This worktree targets **Windows x64** and a **local OpenAI-compatible server**.

## Local model setup

1. Start your local inference server.
2. Open AuraCode → Settings → Providers → Custom provider.
3. Set a provider ID, display name, Provider API and Base URL. Supported protocols are OpenAI Compatible, OpenAI Responses and Anthropic Messages.
4. Enter an optional API key (or `{env:LOCAL_API_KEY}`) and any custom HTTP headers.
5. Fetch the model list or add model IDs manually. Configure reasoning and image support for each model. Existing modalities and reasoning variants are preserved; the advanced configuration button opens the full provider config.
6. Submit the dialog to save the provider and credentials. Existing providers can be edited, disabled, enabled or deleted from the same settings page.

Only `127.0.0.1`, `localhost` and `[::1]` are accepted. `localhost` is normalized to the numeric loopback address. HTTP redirects are refused. LAN and cloud model endpoints are rejected, including endpoints introduced through project config. Use the exact model IDs reported by your local server. API keys are stored separately through the backend auth store; the editor displays a mask when a key is already saved.

The backend keeps coding tools, local conversation storage, agent modes and workspace operations. Cloud autocomplete, cloud authentication, cloud session uploads, remote control, online model catalogs, marketplace suggestions, automatic LSP downloads and external plugins are disabled. Event transport, persistent telemetry identity collection and OpenTelemetry exporters have been removed; compatibility hooks do nothing even when telemetry consent is enabled.

This extension does not control telemetry emitted independently by VS Code, other extensions, or commands the user asks the agent to execute. Shell processes and local inference servers are separate programs. This is not an operating-system firewall.

## Build on Windows x64

Required: Git with Git LFS, Node 24 and Bun **1.4.4**. The `.github/workflows/build-windows.yml` workflow builds the same package on a Windows runner.

```powershell
$env:AURA_VERSION = "1.0.1"
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
bunx vsce package --no-dependencies --target win32-x64 --out ../../auracode-1.0.1-win32-x64.vsix
```

Install the resulting package using VS Code's **Extensions: Install from VSIX** command.

## Validation status

See `VALIDATION.md` for checks actually performed. A prepared build workflow is not evidence of a successful native build.

## License

MIT. Original copyright and license notices must remain in distributed copies. Product branding has changed; mandatory legal attribution is preserved in LICENSE files. Git history also preserves the historical origin of this derivative.
