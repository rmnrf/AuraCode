import type { Auth } from "@/auth"
import { fetchDefaultModel, getAuraUrlFromToken, AURA_API_BASE } from "@auracode/aura-gateway"

type Options = { auracodeOrganizationId?: string; baseURL?: string; apiKey?: string; auracodeToken?: string }

export function token(options: Options | undefined, info: Auth.Info | undefined) {
  if (process.env.AURA_API_KEY) return process.env.AURA_API_KEY
  if (info?.type === "oauth") return info.access
  if (info?.type === "api") return info.key
  if (options?.auracodeToken != null) return options.auracodeToken
  return options?.apiKey || undefined
}

function scoped(url: string) {
  return URL.parse(url)
    ?.pathname.match(/\/api\/organizations\/([^/]+)/)
    ?.at(1)
}

export function organization(options: Options | undefined, info: Auth.Info | undefined) {
  return (
    process.env.AURA_ORG_ID ||
    (info?.type === "oauth" ? info.accountId : undefined) ||
    options?.auracodeOrganizationId ||
    scoped(getAuraUrlFromToken(options?.baseURL ?? "", token(options, info) ?? ""))
  )
}

export function compatible(options: { baseURL?: string; auracodeToken?: string; auracodeOrganizationId?: string }) {
  const org = scoped(getAuraUrlFromToken(options.baseURL ?? "", options.auracodeToken ?? ""))
  return !org || !options.auracodeOrganizationId || org === options.auracodeOrganizationId
}

export async function recommend(
  models: Readonly<Record<string, unknown>>,
  options: Options | undefined,
  info: Auth.Info | undefined,
  known = true,
) {
  const first = Object.keys(models).at(0)
  if (!first || !known) return first
  const org = organization(options, info)
  const key = token(options, info)
  if (!compatible({ baseURL: options?.baseURL, auracodeToken: key, auracodeOrganizationId: org })) return undefined
  const fallback = org ? first : undefined
  const endpoint = getAuraUrlFromToken(options?.baseURL || AURA_API_BASE, key ?? "")
  if (URL.parse(endpoint)?.origin !== URL.parse(AURA_API_BASE)?.origin) return fallback
  const model = await fetchDefaultModel(key, org, fallback)
  return Object.hasOwn(models, model) ? model : fallback
}
