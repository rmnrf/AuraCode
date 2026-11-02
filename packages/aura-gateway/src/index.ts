// ============================================================================
// Plugin
// ============================================================================
export { AuraAuthPlugin, default } from "./plugin.js"

// ============================================================================
// Provider
// ============================================================================
export { createAura } from "./provider.js"
export { createAuraDebug } from "./provider-debug.js"
export { auraCustomLoader } from "./loader.js"
export { buildAuraHeaders, getEditorNameHeader, getFeatureHeader, getDefaultHeaders, getUserAgent } from "./headers.js"

// ============================================================================
// Auth
// ============================================================================
export { authenticateWithDeviceAuth } from "./auth/device-auth.js"
export { authenticateWithDeviceAuthTUI } from "./auth/device-auth-tui.js"
export { getAuraUrlFromToken, isValidAuracodeToken, getApiKey } from "./auth/token.js"
export { poll, formatTimeRemaining } from "./auth/polling.js"
export { migrateLegacyAuraAuth, LEGACY_CONFIG_PATH } from "./auth/legacy-migration.js"

// ============================================================================
// API
// ============================================================================
export {
  fetchProfile,
  fetchBalance,
  fetchProfileWithBalance,
  fetchDefaultModel,
  getAuraProfile,
  defaultOrganizationId,
  getAuraBalance,
  getAuraDefaultModel,
  promptOrganizationSelection,
} from "./api/profile.js"
export { fetchAuraPassState } from "./api/aura-pass.js"
export {
  fetchAuraModels,
  type AuraModelsResult,
  fetchAuraImageModels,
  type AuraImageModel,
  type AuraImageModelsResult,
  fetchAuraTranscriptionModels,
  type AuraTranscriptionModel,
  type AuraTranscriptionModelsResult,
  supportsTools,
} from "./api/models.js"
export {
  EMPTY_AURA_EMBEDDING_MODEL_CATALOG,
  fetchAuraEmbeddingModelCatalog,
  type AuraEmbeddingModel,
  type AuraEmbeddingModelCatalog,
  type AuraEmbeddingModelCatalogIssue,
} from "./api/embedding-models.js"
export { resolveAuraGatewayBaseUrl, resolveAuraGatewayUrl, resolveAuraOpenRouterBaseUrl } from "./api/url.js"
export {
  AUTOCOMPLETE_MODELS,
  DEFAULT_AUTOCOMPLETE_MODEL,
  getAutocompleteModel,
  getAutocompleteModelById,
  validAutocompleteModel,
  validAutocompleteProvider,
  type AutocompleteModelDef,
  type AutocompleteProviderID,
} from "./autocomplete.js"
export {
  fetchOrganizationModes,
  clearModesCache,
  type OrganizationMode,
  type OrganizationModeConfig,
} from "./api/modes.js"
export { fetchAuracodeNotifications, type AuracodeNotification } from "./api/notifications.js"
export {
  AUTO_DECISION_HEADER,
  AUTO_ROUTING_CUSTOM_ROUTERS_PATH,
  AUTO_ROUTING_ORGANIZATION_HEADER,
  AUTO_ROUTING_PLATFORM_MEASUREMENTS_PATH,
  CUSTOM_ROUTER_DECIDE_PATH,
  CUSTOM_ROUTER_EVAL_CASE_PATH,
  CUSTOM_ROUTER_EVAL_PLAN_PATH,
  CUSTOM_ROUTER_EVAL_RESULT_PATH,
  CUSTOM_ROUTER_MODEL_PREFIX,
  CUSTOM_ROUTER_SLUG_PATTERN,
  MAX_CUSTOM_ROUTER_ENTRIES,
  ClientCustomRouterEntrySchema,
  CustomRouterDecideResponseSchema,
  CustomRouterDecisionSchema,
  CustomRouterErrorCodeSchema,
  CustomRouterErrorResponseSchema,
  CustomRouterEntryRefSchema,
  CustomRouterEntrySchema,
  CustomRouterListEntrySchema,
  CustomRouterListResponseSchema,
  CustomRouterReferenceSchema,
  CustomRouterSummarySchema,
  GatewayCustomRouterEntrySchema,
  MeasuredAsModelIdSchema,
  PlatformMeasurementsResponseSchema,
  customRouterCandidateModel,
  customRouterClientEntriesPath,
  customRouterEntryKey,
  customRouterModelId,
  customRouterPath,
  isCustomRouterModelId,
  parseCustomRouterCandidateModel,
  parseCustomRouterModelId,
  suggestMeasuredAs,
  type ClientCustomRouterEntry,
  type ClientEvalCaseResponse,
  type ClientEvalPlanItem,
  type ClientEvalPlanResponse,
  type CustomRouterDecideRequest,
  type CustomRouterDecideResponse,
  type CustomRouterDecision,
  type CustomRouterClientEntryId,
  type CustomRouterEntry,
  type CustomRouterEntryRef,
  type CustomRouterErrorCode,
  type CustomRouterListEntry,
  type CustomRouterListResponse,
  type CustomRouterReference,
  type CustomRouterSummary,
  type GatewayCustomRouterEntry,
  type PlatformMeasurementsResponse,
} from "./api/custom-router.js"
export {
  CustomRouterRequestError,
  decideCustomRouter,
  fetchClientEvalCase,
  fetchClientEvalPlan,
  fetchCustomRouters,
  fetchPlatformMeasurements,
  registerCustomRouterClientEntry,
  removeCustomRouterClientEntry,
  uploadClientEvalResult,
  type FetchLike,
} from "./api/custom-router-api.js"
export {
  fetchByokEntries,
  fetchCodingPlanSubscriptions,
  fetchCodingPlanUsage,
  type ByokEntry,
  type CodingPlanSubscription,
  type CodingPlanQuotaWindow,
} from "./api/trpc.js"
export {
  fetchCloudSession,
  fetchCloudSessionForImport,
  SessionImportValidationError,
  prepareSessionImport,
  importSessionToDb,
} from "./cloud-sessions.js"

// ============================================================================
// Server Routes (optional - requires hono and OpenCode dependencies)
// ============================================================================
export { createAuraRoutes } from "./server/routes.js"
export {
  GatewayError,
  UnauthorizedError,
  getOrganizationId,
  getCloudSessions,
  getNotifications,
  getProfile,
  getToken,
  setOrganization,
} from "./server/handlers.js"

// ============================================================================
// Note: TUI exports moved to separate entry point
// ============================================================================
// For TUI components and commands, import from "@auracode/aura-gateway/tui"
// This avoids circular dependencies with opencode TUI infrastructure

// ============================================================================
// Types
// ============================================================================
export type {
  // Auth types
  DeviceAuthInitiateResponse,
  DeviceAuthPollResponse,
  Organization,
  AuracodeProfile,
  AuracodeBalance,
  AuraPassState,
  PollOptions,
  PollResult,
  // Provider types
  AuraProvider,
  AuraProviderOptions,
  AuraMetadata,
  CustomLoaderResult,
  ProviderInfo,
  LanguageModelV3,
} from "./types.js"

// ============================================================================
// Constants
// ============================================================================
export {
  ENV_AURA_API_URL,
  DEFAULT_AURA_API_URL,
  AURA_API_BASE,
  ENV_AURA_AI_GATEWAY_URL,
  DEFAULT_AURA_AI_GATEWAY_URL,
  AURA_AI_GATEWAY_BASE,
  resolveAuraAiGatewayBase,
  ENV_AURA_AUTO_ROUTING_URL,
  DEFAULT_AURA_AUTO_ROUTING_URL,
  AURA_AUTO_ROUTING_BASE,
  resolveAuraAutoRoutingBase,
  AURA_EVENT_SERVICE_URL,
  AURA_OPENROUTER_BASE,
  POLL_INTERVAL_MS,
  DEFAULT_MODEL,
  DEFAULT_FREE_MODEL,
  TOKEN_EXPIRATION_MS,
  USER_AGENT_BASE,
  CONTENT_TYPE,
  DEFAULT_PROVIDER_NAME,
  ANONYMOUS_API_KEY,
  MODELS_FETCH_TIMEOUT_MS,
  HEADER_ORGANIZATIONID,
  HEADER_TASKID,
  HEADER_PARENT_TASKID,
  HEADER_PROJECTID,
  HEADER_TESTER,
  HEADER_EDITORNAME,
  HEADER_MACHINEID,
  HEADER_FEATURE,
  DEFAULT_EDITOR_NAME,
  ENV_EDITOR_NAME,
  ENV_VERSION,
  TESTER_SUPPRESS_VALUE,
  ENV_FEATURE,
  PROMPTS,
  AI_SDK_PROVIDERS,
} from "./api/constants.js"
