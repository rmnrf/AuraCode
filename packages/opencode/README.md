# AuraCode CLI

The AI coding agent built for the terminal. Generate code from natural language, automate tasks, and run terminal commands -- powered by 500+ AI models.

![Aura CLI showing code edits in a terminal](https://raw.githubusercontent.com/Aura-Org/auracode/main/packages/aura-docs/public/img/npm-package-readme/aura-cli.png)

Aura is the all-in-one agentic engineering platform. Build, ship, and iterate faster with the most popular open source coding agent.

[Website](https://aura.ai) · [Install](https://aura.ai/install) · [IDE](https://aura.ai/landing/vs-code) · [CLI](https://aura.ai/cli) · [Docs](https://aura.ai/docs) · [Models](https://aura.ai/leaderboard) · [Gateway](https://aura.ai/gateway) · [Pricing](https://aura.ai/pricing) · [Aura Pass](https://aura.ai/pricing/aura-pass)

[500+ models](https://aura.ai/leaderboard). One open source agent in [VS Code](https://aura.ai/vscode-marketplace), [JetBrains](https://plugins.jetbrains.com/plugin/27133-aura-code), [CLI](https://www.npmjs.com/package/@auracode/cli), [Slack](https://aura.ai/slack), and [Cloud](https://aura.ai/cloud).

## Install

```bash
npm install -g @auracode/cli
```

Or run directly with npx:

```bash
npx --package @auracode/cli aura
```

## Getting Started

Run `aura` in any project directory to launch the interactive TUI:

```bash
aura
```

Run a one-off task:

```bash
aura run "add input validation to the signup form"
```

## Features

- **Code generation** -- describe what you want in natural language
- **Terminal commands** -- the agent can run shell commands on your behalf
- **500+ AI models** -- use models from OpenAI, Anthropic, Google, and more
- **MCP servers** -- extend agent capabilities with the Model Context Protocol
- **Multiple modes** -- Plan with Architect, code with Coder, debug with Debugger, or create your own
- **Sessions** -- resume previous conversations and export transcripts
- **API keys optional** -- bring your own keys or use Aura credits

## Commands

| Command               | Description                |
| --------------------- | -------------------------- |
| `aura`                | Launch interactive TUI     |
| `aura run "<task>"`   | Run a one-off task         |
| `aura auth`           | Manage authentication      |
| `aura models`         | List available models      |
| `aura mcp`            | Manage MCP servers         |
| `aura session list`   | List sessions              |
| `aura session delete` | Delete a session           |
| `aura export`         | Export session transcripts |

Run `aura --help` for the full list.

## Alternative Installation

### Homebrew (macOS/Linux)

```bash
brew install Aura-Org/tap/aura
```

### GitHub Releases

Download pre-built binaries from the [Releases page](https://github.com/Aura-Org/auracode/releases).

## Documentation

- [Docs](https://aura.ai/docs)
- [Getting Started](https://aura.ai/docs/getting-started)

## Links

- [GitHub](https://github.com/Aura-Org/auracode)
- [Discord](https://aura.ai/discord)
- [VS Code Extension](https://aura.ai/vscode-marketplace)
- [Website](https://aura.ai)

## License

MIT
