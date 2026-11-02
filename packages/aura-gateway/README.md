# @auracode/aura-gateway

Unified Aura Gateway package for OpenCode providing authentication, AI provider integration, and API access.

## Features

- **Authentication**: Device authorization flow for Aura Gateway
- **AI Provider**: OpenRouter-based provider with Aura Gateway integration
- **API Integration**: Profile, balance, and model management
- **TUI Helpers**: Utilities for terminal UI components

## Installation

```bash
bun add @auracode/aura-gateway
```

## Usage

### Plugin Registration

```typescript
import { AuraAuthPlugin } from "@auracode/aura-gateway"

// Register with OpenCode
const plugins = [AuraAuthPlugin]
```

### Provider Usage

```typescript
import { createAura } from "@auracode/aura-gateway"

const provider = createAura({
  auracodeToken: process.env.AURACODE_API_KEY,
  auracodeOrganizationId: "org-123",
})

const model = provider.languageModel("anthropic/claude-sonnet-4")
```

### API Access

```typescript
import { fetchProfile, fetchBalance } from "@auracode/aura-gateway"

const profile = await fetchProfile(token)
const balance = await fetchBalance(token)
```

## License

MIT
