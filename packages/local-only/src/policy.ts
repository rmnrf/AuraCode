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

export const LOCAL_ADAPTERS = ["@ai-sdk/openai-compatible", "@ai-sdk/openai", "@ai-sdk/anthropic"] as const

type Provider = {
  npm?: string
  name?: string
  env?: string[]
  options?: Record<string, unknown>
  models?: Record<
    string,
    { name?: string; limit?: { context?: number; output?: number }; [key: string]: unknown } | null
  >
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
  const fallback: Record<string, Provider> = { local: {} }
  const entries = Object.entries(input.provider ?? fallback)
  const providers = Object.fromEntries(
    entries.flatMap(([id, selected]) => {
      if (!selected) return []
      const npm =
        LOCAL_ADAPTERS.find((item) => item === selected.npm) ?? (id === "local" ? LOCAL_ADAPTERS[0] : undefined)
      if (!npm) return []
      const baseURL = endpoint(String(selected.options?.baseURL ?? "http://127.0.0.1:1234/v1"))
      const options: Record<string, unknown> = { ...selected.options, baseURL }
      // Version 1.0.0 persisted this placeholder. It must not override a saved key.
      if (options.apiKey === "local" || options.apiKey === "") delete options.apiKey
      const models = Object.fromEntries(
        Object.entries(selected.models ?? { "local-model": { name: "Local model" } }).flatMap(([key, model]) =>
          model
            ? [
                [
                  key,
                  {
                    ...model,
                    name: model.name ?? key,
                    tool_call: model.tool_call ?? true,
                    limit: {
                      ...model.limit,
                      context: model.limit?.context ?? 32768,
                      output: model.limit?.output ?? 4096,
                    },
                  },
                ],
              ]
            : [],
        ),
      )
      return [[id, { ...selected, name: selected.name ?? "Local OpenAI-compatible server", npm, options, models }]]
    }),
  )
  const disabled = input.disabled_providers ?? []
  const models = Object.entries(providers)
    .filter(([id]) => !disabled.includes(id))
    .flatMap(([id, provider]) => Object.keys(provider.models).map((key) => `${id}/${key}`))
  const model = input.model && models.includes(input.model) ? input.model : (models.at(0) ?? null)
  const small = input.small_model && models.includes(input.small_model) ? input.small_model : model
  return {
    ...input,
    model,
    small_model: small,
    enabled_providers: Object.keys(providers),
    disabled_providers: disabled,
    provider: providers,
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
