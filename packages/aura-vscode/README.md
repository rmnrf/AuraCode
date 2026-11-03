# AuraCode

A local-first derivative of the upstream VS Code coding agent for **Windows x64**. Local inference is the default; custom providers may also use an explicitly configured private LAN endpoint or HTTPS server.

## Local model setup

1. Start your local inference server.
2. Open AuraCode → Settings → Providers → Custom provider.
3. Set a provider ID, display name, Provider API and Base URL. Supported protocols are OpenAI Compatible, OpenAI Responses and Anthropic Messages.
4. Enter an optional API key (or `{env:LOCAL_API_KEY}`) and any custom HTTP headers.
5. Fetch the model list or add model IDs manually. Configure reasoning and image support for each model. Existing modalities and reasoning variants are preserved; the advanced configuration button opens the full provider config.
6. Submit the dialog to save the provider and credentials. Existing providers can be edited, disabled, enabled or deleted from the same settings page.

Custom providers accept `http://localhost`, `http://127.0.0.1`, IPv6 loopback, **HTTP on private LAN IP addresses** (for example `http://192.168.1.50:1234/v1`), and **HTTPS for remote servers**. HTTP to public internet hosts, URL-embedded passwords, query-string secrets and HTTP redirects are refused. Only configured custom provider origins are added to the agent's network allowlist; all other non-local background network requests remain blocked. Use the exact model IDs reported by your provider. API keys are stored separately through the backend auth store; the editor displays a mask when a key is already saved. **A remote custom provider receives your model prompts and API key**—use only a provider you trust.

The backend keeps coding tools, local conversation storage, agent modes and workspace operations. Cloud autocomplete, cloud authentication, cloud session uploads, remote control, online model catalogs, marketplace suggestions, automatic LSP downloads and external plugins are disabled. Event transport, persistent telemetry identity collection and OpenTelemetry exporters have been removed; compatibility hooks do nothing even when telemetry consent is enabled.

This extension does not control telemetry emitted independently by VS Code, other extensions, or commands the user asks the agent to execute. Shell processes and local inference servers are separate programs. This is not an operating-system firewall.

## Model token limits and user MCP servers

### Per-model token limits

Open **AuraCode → Settings → Providers → Edit custom provider**. Each model card
contains a collapsed **Context window and output limits** section. Expand it to
set context size and maximum output tokens independently for each model, then
save the provider. An empty field uses 32,768 context tokens or 4,096 output
tokens. Both fields must be positive whole numbers, with output no greater
than context. The server's actual limits still apply.

### MCP servers (global or project)

Open **Settings → Agent Behaviour → MCP Servers → Add MCP Server**.
Choose a name, local stdio command or remote URL, and **Global** or **Project**.
New servers are disabled by default; enable only after reviewing the command
and server. Click **Save Changes** to persist. Existing servers can be edited,
enabled, disabled and removed in the same section; remote server authorization
headers can be configured in the editor.

For direct JSON configuration, use the global `aura.jsonc` (the Settings
**Global JSON** button) or the project's `.aura/aura.jsonc`
(**Project JSON** button). For example:

```jsonc
{
  "mcp": {
    "filesystem": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-filesystem", "C:/projects/my-workspace"],
      "enabled": false
    },
    "team-tools": {
      "type": "remote",
      "url": "https://mcp.example.com/mcp",
      "headers": { "Authorization": "Bearer YOUR_TOKEN" },
      "oauth": false,
      "enabled": false
    }
  }
}
```

Set `enabled: true` only for servers you trust. Local stdio commands execute
programs on your computer; remote MCP servers may receive context and tool
inputs. Public remote servers require HTTPS; loopback/private LAN IPs may use
HTTP. **Do not commit API keys or MCP bearer tokens to project JSON in version
control.** Prefer a privately stored global configuration for secrets.

Marketplace discovery, notifications, UI buttons and installation are removed
from the extension. Historical Marketplace API routes reject installation and
removal requests and do not fetch a catalog.

## Build on Windows x64

Required: Git with Git LFS, Node 24 and Bun **1.4.4**. The `.github/workflows/build-windows.yml` workflow builds the same package on a Windows runner.

```powershell
$env:AURA_VERSION = "1.0.4"
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
bunx vsce package --no-dependencies --target win32-x64 --out ../../auracode-1.0.4-win32-x64.vsix
```

Install the resulting package using VS Code's **Extensions: Install from VSIX** command.

## Validation status

See `VALIDATION.md` for checks actually performed. A prepared build workflow is not evidence of a successful native build.

## License

MIT. Original copyright and license notices must remain in distributed copies. Product branding has changed; mandatory legal attribution is preserved in LICENSE files. Git history also preserves the historical origin of this derivative.
