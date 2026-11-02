import type { IndexingConfig } from "@auracode/aura-indexing/config"

type Auth = unknown

type Env = {
  AURA_API_KEY?: string
  AURA_ORG_ID?: string
}

type Provider = {
  key?: unknown
  options?: Record<string, unknown>
}

export type AuraIndexingAuth = {
  apiKey?: string
  baseUrl?: string
  organizationId?: string
}

const providers = [
  "openai",
  "ollama",
  "openai-compatible",
  "gemini",
  "mistral",
  "vercel-ai-gateway",
  "bedrock",
  "openrouter",
  "voyage",
]

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {}
  return value as Record<string, unknown>
}

function text(value: unknown): string | undefined {
  if (typeof value !== "string") return
  const trimmed = value.trim()
  return trimmed || undefined
}

function token(auth: Auth): string | undefined {
  const data = record(auth)
  if (data.type === "api") return text(data.key)
  if (data.type === "oauth") return text(data.access)
  return
}

function org(auth: Auth): string | undefined {
  const data = record(auth)
  if (data.type === "oauth") return text(data.accountId)
  return
}

function value(input: unknown): boolean {
  if (input === undefined || input === null) return false
  if (typeof input === "string") return input.trim().length > 0
  if (typeof input === "object") return Object.values(input).some(value)
  return true
}

function hasOtherProvider(indexing: unknown): boolean {
  const cfg = record(indexing)
  return providers.some((provider) => value(cfg[provider]))
}

export function resolveAuraIndexingAuth(input: {
  config?: unknown
  provider?: Provider
  auth?: Auth
  env?: Env
}): AuraIndexingAuth {
  const config = record(input.config)
  const options = record(record(config.provider).aura)
  const provider = input.provider ?? record(input.provider)
  const providerOptions = record(provider.options)
  const providerConfig = record(options.options)
  const aura = record(record(config.indexing).aura)
  const env = input.env ?? process.env

  return {
    apiKey:
      text(aura.apiKey) ??
      text(providerConfig.apiKey) ??
      token(input.auth) ??
      text(provider.key) ??
      text(providerOptions.auracodeToken) ??
      text(env.AURA_API_KEY),
    baseUrl: text(aura.baseUrl) ?? text(providerConfig.baseURL) ?? text(providerConfig.baseUrl),
    organizationId:
      text(aura.organizationId) ??
      text(providerConfig.auracodeOrganizationId) ??
      org(input.auth) ??
      text(providerOptions.auracodeOrganizationId) ??
      text(env.AURA_ORG_ID),
  }
}

export function hasAuraIndexingAuth(input: Parameters<typeof resolveAuraIndexingAuth>[0]): boolean {
  return !!resolveAuraIndexingAuth(input).apiKey
}

export function shouldDefaultIndexingToAura(indexing: unknown, auth: AuraIndexingAuth): boolean {
  const cfg = record(indexing)
  if (cfg.provider !== undefined || !auth.apiKey) return false
  return !hasOtherProvider(cfg)
}

export function indexingWithAuraDefault(
  indexing: IndexingConfig | undefined,
  auth: AuraIndexingAuth,
): IndexingConfig | undefined {
  if (!shouldDefaultIndexingToAura(indexing, auth)) return indexing
  return { ...indexing, provider: "aura" }
}
