import { AURA_AI_GATEWAY_BASE } from "./constants.js"
import { getAuraUrlFromToken } from "../auth/token.js"

type UrlOptions = {
  baseURL?: string
  token?: string
}

function clean(raw: string) {
  const url = new URL(raw)
  url.search = ""
  url.hash = ""
  return url
}

/** Legacy API app route, e.g. `https://api.aura.ai/api/openrouter/`. */
function route(raw: string, name: "gateway" | "openrouter"): string {
  const url = clean(raw)
  const parts = url.pathname.split("/").filter(Boolean)
  const api = parts.lastIndexOf("api")
  const prefix = api >= 0 ? parts.slice(0, api) : parts
  url.pathname = `/${[...prefix, "api", name].join("/")}/`
  return url.toString()
}

/**
 * AI gateway root, e.g. `https://ai-gateway.aura.ai/api/v1/`, when the URL is the
 * configured AI gateway base. Any other URL (custom base URLs, token-embedded URLs)
 * keeps the legacy API app routing.
 */
function gateway(raw: string): string | undefined {
  const text = clean(raw).toString().replace(/\/+$/, "")
  if (text !== clean(AURA_AI_GATEWAY_BASE).toString().replace(/\/+$/, "")) return undefined
  return `${text}/`
}

function resolve(options: UrlOptions, name: "gateway" | "openrouter"): string {
  const raw = getAuraUrlFromToken(options.baseURL ?? AURA_AI_GATEWAY_BASE, options.token ?? "")
  return gateway(raw) ?? route(raw, name)
}

export function resolveAuraGatewayBaseUrl(options: UrlOptions = {}): string {
  return resolve(options, "gateway")
}

export function resolveAuraOpenRouterBaseUrl(options: UrlOptions = {}): string {
  return resolve(options, "openrouter")
}

/** Resolve a Aura AI gateway endpoint, e.g. `fim/completions`, against the configured gateway base. */
export function resolveAuraGatewayUrl(path: string): string {
  return `${AURA_AI_GATEWAY_BASE}/${path}`
}
