/**
 * Aura Gateway Configuration Constants
 * Centralized configuration for all API endpoints, headers, and settings
 */

/** Environment variable for custom Aura API URL */
export const ENV_AURA_API_URL = "AURA_API_URL"

/** Default Aura API URL */
export const DEFAULT_AURA_API_URL = "https://api.aura.ai"

/** Base URL for Aura API - can be overridden by AURA_API_URL env var */
export const AURA_API_BASE = process.env[ENV_AURA_API_URL] || DEFAULT_AURA_API_URL

/** Environment variable for a custom Aura AI Gateway URL (gateway traffic only) */
export const ENV_AURA_AI_GATEWAY_URL = "AURA_AI_GATEWAY_URL"

/** Default Aura AI Gateway URL */
export const DEFAULT_AURA_AI_GATEWAY_URL = "https://ai-gateway.aura.ai/api/v1"

/**
 * Resolve the base URL for AI gateway traffic (chat, models, embeddings, FIM, ...).
 *
 * AURA_AI_GATEWAY_URL takes precedence. When only the legacy AURA_API_URL is set,
 * gateway traffic goes to `${AURA_API_URL}/api/gateway/v1`, which the API app
 * rewrites to the AI gateway's `/api/v1` routes.
 */
export function resolveAuraAiGatewayBase(env: Readonly<Record<string, string | undefined>> = process.env) {
  const value = env[ENV_AURA_AI_GATEWAY_URL]?.trim()
  if (value) return value.replace(/\/+$/, "")
  const api = env[ENV_AURA_API_URL]?.trim()
  if (api) return `${api.replace(/\/+$/, "")}/api/gateway/v1`
  return DEFAULT_AURA_AI_GATEWAY_URL
}

/** Base URL for AI gateway traffic */
export const AURA_AI_GATEWAY_BASE = resolveAuraAiGatewayBase()

/** Environment variable for the public auto-routing worker URL */
export const ENV_AURA_AUTO_ROUTING_URL = "AURA_AUTO_ROUTING_URL"

/** Default public auto-routing worker URL */
export const DEFAULT_AURA_AUTO_ROUTING_URL = "https://auto-routing.auraapps.io"

/** Base URL for the public auto-routing worker - can be overridden by AURA_AUTO_ROUTING_URL env var */
export const AURA_AUTO_ROUTING_BASE = resolveAuraAutoRoutingBase()

/**
 * Resolve the public auto-routing worker base URL. The trailing slash is
 * trimmed so callers can join paths with a leading slash.
 */
export function resolveAuraAutoRoutingBase(env: Readonly<Record<string, string | undefined>> = process.env) {
  return (env[ENV_AURA_AUTO_ROUTING_URL] || DEFAULT_AURA_AUTO_ROUTING_URL).replace(/\/+$/, "")
}

/** Environment variable for custom Event Service URL */
export const AURA_EVENT_SERVICE_URL_ENV = "EVENT_SERVICE_URL"

/** Default Event Service URL (WebSocket endpoint for aura-chat events) */
export const AURA_DEFAULT_EVENT_SERVICE_URL = "wss://events.auraapps.io"

/** Base URL for Event Service - can be overridden by EVENT_SERVICE_URL env var */
export const AURA_EVENT_SERVICE_URL = process.env[AURA_EVENT_SERVICE_URL_ENV] || AURA_DEFAULT_EVENT_SERVICE_URL

/** Default base URL for the OpenRouter-compatible endpoint (chat, responses, messages, models) */
export const AURA_OPENROUTER_BASE = AURA_AI_GATEWAY_BASE

/** Device auth polling interval in milliseconds */
export const POLL_INTERVAL_MS = 3000

/** Default model for authenticated users */
export const DEFAULT_MODEL = "aura-auto/free"

/** Default model for anonymous/free usage */
export const DEFAULT_FREE_MODEL = "aura-auto/free"

/** Token expiration duration in milliseconds (1 year) */
export const TOKEN_EXPIRATION_MS = 365 * 24 * 60 * 60 * 1000

/** User-Agent header base value for requests */
export const USER_AGENT_BASE = "opencode-aura-provider"

/** Content-Type header value for requests */
export const CONTENT_TYPE = "application/json"

/** Default provider name */
export const DEFAULT_PROVIDER_NAME = "aura"

/** Default API key for anonymous requests */
export const ANONYMOUS_API_KEY = "anonymous"

/** Fetch timeout for model requests in milliseconds (10 seconds) */
export const MODELS_FETCH_TIMEOUT_MS = 10 * 1000

/**
 * Header constants for AuraCode API requests
 */
export const HEADER_ORGANIZATIONID = "X-AURACODE-ORGANIZATIONID"
export const HEADER_TASKID = "X-AURACODE-TASKID"
export const HEADER_PARENT_TASKID = "X-AURACODE-PARENT-TASKID"
export const HEADER_PROJECTID = "X-AURACODE-PROJECTID"
export const HEADER_TESTER = "X-AURACODE-TESTER"
export const HEADER_EDITORNAME = "X-AURACODE-EDITORNAME"
export const HEADER_MACHINEID = "X-AURACODE-MACHINEID"

/** Default editor name value */
export const DEFAULT_EDITOR_NAME = "Aura CLI"

/** Environment variable name for custom editor name */
export const ENV_EDITOR_NAME = "AURACODE_EDITOR_NAME"

/** Environment variable name for version (set by CLI at startup) */
export const ENV_VERSION = "AURACODE_VERSION"

/** Tester header value for suppressing warnings */
export const TESTER_SUPPRESS_VALUE = "SUPPRESS"

/** Header name for feature tracking */
export const HEADER_FEATURE = "X-AURACODE-FEATURE"

/** Environment variable name for feature override */
export const ENV_FEATURE = "AURACODE_FEATURE"

export const PROMPTS = [
  "codex",
  "gemini",
  "beast",
  "anthropic",
  "trinity",
  "anthropic_without_todo",
  "ling",
  "gpt55",
] as const

export const AI_SDK_PROVIDERS = [
  "anthropic",
  "openai",
  "openai-compatible",
  "openrouter",
] as const
