/** Only user-configured custom provider origins may bypass the loopback transport boundary. */
const providerOrigins = new Set<string>()

function localHost(host: string): boolean {
  return ["127.0.0.1", "[::1]", "localhost"].includes(host.toLowerCase())
}

function privateHost(host: string): boolean {
  if (localHost(host)) return true
  const octets = host.split(".").map(Number)
  if (octets.length === 4 && octets.every((n) => Number.isInteger(n) && n >= 0 && n <= 255))
    return octets[0] === 10 || (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
      (octets[0] === 192 && octets[1] === 168)
  // IPv6 unique-local ranges (fc00::/7).
  return /^\[(?:fc|fd)[0-9a-f]{0,2}:/i.test(host)
}

/** Explicit custom provider URLs: private LAN HTTP or HTTPS on any reachable host. */
export function providerEndpoint(value: string): string {
  const url = new URL(value)
  if (!["http:", "https:"].includes(url.protocol))
    throw new Error("Custom provider Base URL must use HTTP or HTTPS")
  if (url.username || url.password) throw new Error("Credentials in endpoint URLs are not supported")
  if (url.search || url.hash) throw new Error("The LLM endpoint must not contain a query or fragment")
  if (url.hostname === "localhost") url.hostname = "127.0.0.1"
  if (["0.0.0.0", "[::]", "255.255.255.255"].includes(url.hostname))
    throw new Error("Custom provider Base URL must identify a reachable server")
  if (url.protocol === "http:" && !privateHost(url.hostname))
    throw new Error("Use HTTPS for remote providers; HTTP is allowed only on localhost or private LAN IPs")
  return url.toString().replace(/\/+$/, "")
}

/** Replace the allowlist when effective custom provider configuration changes. */
function configureProviderOrigins(urls: string[]) {
  providerOrigins.clear()
  for (const value of urls) providerOrigins.add(new URL(value).origin)
}

/** Global fetch stays loopback-only except for exact configured provider origins. */
export function localURL(value: string | URL): URL {
  const url = new URL(value)
  if (!["http:", "https:", "ws:", "wss:"].includes(url.protocol))
    throw new Error("AuraCode accepts only HTTP or WebSocket endpoints")
  if (url.username || url.password) throw new Error("Credentials in endpoint URLs are not supported")
  if (url.hostname === "localhost") url.hostname = "127.0.0.1"
  if (!localHost(url.hostname) && !providerOrigins.has(url.origin))
    throw new Error("AuraCode only permits loopback URLs or explicitly configured custom provider origins")
  return url
}

/** Internal CLI and extension-host services must remain loopback-only. */
export function endpoint(value: string): string {
  const url = new URL(value)
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("The internal endpoint must use HTTP or HTTPS")
  if (url.username || url.password) throw new Error("Credentials in endpoint URLs are not supported")
  if (url.search || url.hash) throw new Error("The endpoint must not contain a query or fragment")
  if (!localHost(url.hostname)) throw new Error("The internal endpoint must use localhost, 127.0.0.1 or [::1]")
  if (url.hostname === "localhost") url.hostname = "127.0.0.1"
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
      const baseURL = providerEndpoint(String(selected.options?.baseURL ?? "http://127.0.0.1:1234/v1"))
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
  configureProviderOrigins(Object.values(providers).map((provider) => String(provider.options.baseURL)))
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
