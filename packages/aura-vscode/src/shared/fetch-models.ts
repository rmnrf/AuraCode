/**
 * Fetch available models from an OpenAI-compatible /models endpoint.
 * Runs in the extension host — no CLI backend dependency.
 */

import { endpoint } from "@auracode/local-only"
import { auraFetch } from "@auracode/local-only/fetch"
import { parseCustomProviderSecret } from "./custom-provider"

type Options = {
  baseURL: string
  apiKey?: string
  headers?: Record<string, string>
}

type ModelEntry = {
  id: string
  name: string
}

export class FetchModelsError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message)
    this.name = "FetchModelsError"
  }

  get auth() {
    return this.status === 401 || this.status === 403
  }
}

export async function fetchOpenAIModels(opts: Options): Promise<ModelEntry[]> {
  const url = endpoint(opts.baseURL) + "/models"
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...opts.headers,
  }
  const secret = parseCustomProviderSecret(opts.apiKey ?? "")
  if ("error" in secret) throw new FetchModelsError(secret.error)
  const key = secret.value.env ? process.env[secret.value.env] : secret.value.apiKey
  if (secret.value.env && !key) throw new FetchModelsError(`Environment variable ${secret.value.env} is not set`)
  if (key) {
    headers["Authorization"] = `Bearer ${key}`
  }

  const response = await auraFetch(url, {
    method: "GET",
    headers,
    signal: AbortSignal.timeout(15_000),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => "")
    throw new FetchModelsError(`HTTP ${response.status}: ${text.slice(0, 200)}`, response.status)
  }

  const body = (await response.json()) as { data?: Array<{ id?: string; name?: string }> }
  const items = body?.data
  if (!Array.isArray(items)) return []

  const seen = new Set<string>()
  const result: ModelEntry[] = []
  for (const item of items) {
    const id = typeof item.id === "string" ? item.id.trim() : ""
    if (!id || seen.has(id)) continue
    seen.add(id)
    result.push({ id, name: typeof item.name === "string" ? item.name.trim() : id })
  }
  result.sort((a, b) => a.id.localeCompare(b.id))
  return result
}
