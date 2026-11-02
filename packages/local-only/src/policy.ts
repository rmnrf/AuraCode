/** Transport policy shared by the extension host, webviews and agent runtime. */
export function localURL(value: string | URL): URL {
  const url = new URL(value)
  if (!["http:", "https:", "ws:", "wss:"].includes(url.protocol))
    throw new Error("AuraCode accepts only local HTTP or WebSocket endpoints")
  if (!["127.0.0.1", "[::1]", "localhost"].includes(url.hostname.toLowerCase()))
    throw new Error("AuraCode accepts only 127.0.0.1, localhost or [::1]")
  if (url.username || url.password) throw new Error("Credentials in endpoint URLs are not supported")
  // Avoid DNS resolution, hosts-file overrides and localhost rebinding.
  if (url.hostname === "localhost") url.hostname = "127.0.0.1"
  return url
}

export function endpoint(value: string): string {
  const url = localURL(value)
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("The LLM endpoint must use HTTP or HTTPS")
  if (url.search || url.hash) throw new Error("The LLM endpoint must not contain a query or fragment")
  return url.toString().replace(/\/+$/, "")
}

type Provider = {
  npm?: string
  name?: string
  env?: string[]
  options?: Record<string, unknown>
  models?: Record<string, { name?: string; limit?: { context?: number; output?: number } } | null>
}

type Config = {
  provider?: Record<string, Provider | null>
  model?: string | null
  small_model?: string | null
  enabled_providers?: string[]
  disabled_providers?: string[]
  plugin?: unknown[]
  mcp?: Record<string, unknown>
  [key: string]: unknown
}

/** Enforce policy after config merging, so project config cannot enable cloud models. */
export function localConfig<T extends Config>(input: T): T {
  const selected = input.provider?.local
  const baseURL = endpoint(String(selected?.options?.baseURL ?? "http://127.0.0.1:1234/v1"))
  const models = Object.fromEntries(
    Object.entries(selected?.models ?? { "local-model": { name: "Local model" } }).map(([id, model]) => [
      id,
      {
        name: model?.name ?? id,
        tool_call: true,
        limit: { context: model?.limit?.context ?? 32768, output: model?.limit?.output ?? 4096 },
      },
    ]),
  )
  const first = Object.keys(models).at(0)
  if (!first) throw new Error("Configure at least one model for the local provider")
  const model = input.model?.startsWith("local/") && models[input.model.slice(6)] ? input.model : `local/${first}`
  return {
    ...input,
    model,
    small_model: model,
    enabled_providers: ["local"],
    disabled_providers: [],
    provider: {
      local: {
        name: "Local OpenAI-compatible server",
        npm: "@ai-sdk/openai-compatible",
        env: [],
        options: { baseURL, apiKey: "local" },
        models,
      },
    },
    plugin: [],
    plugin_origins: [],
    mcp: {},
    share: "disabled",
    autoupdate: false,
    tools: { webfetch: false, websearch: false, codesearch: false },
  }
}

export const environment = {
  AURA_TELEMETRY_LEVEL: "off",
  AURA_DISABLE_SHARE: "true",
  AURA_DISABLE_SESSION_INGEST: "true",
  AURA_REMOTE: "0",
  AURA_DISABLE_AUTOUPDATE: "true",
  AURA_DISABLE_DEFAULT_PLUGINS: "true",
  AURA_DISABLE_MODELS_FETCH: "true",
  AURA_DISABLE_LSP_DOWNLOAD: "true",
  AURA_DISABLE_CODEBASE_INDEXING: "local-only",
  AURA_DISABLE_EXTERNAL_SKILLS: "true",
  AURA_DISABLE_EMBEDDED_WEB_UI: "true",
  DO_NOT_TRACK: "1",
  OTEL_SDK_DISABLED: "true",
} as const
