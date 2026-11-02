/** Permanently disabled compatibility API. No collection, identity, disk I/O or network. */
import type { TelemetryEvent } from "./events.js"
export interface TelemetryProperties {
  appName: string
  appVersion: string
  platform: string
  os_name: string
  os_version: string
  os_arch: string
  editorName?: string
  vscodeVersion?: string
  aauClientToken?: string
}
export type ReviewCommand = "review"
export interface IndexingTelemetryProperties extends Record<string, unknown> {
  source: "scan" | "watcher"
  provider: string
  vectorStore: "lancedb" | "qdrant"
  modelId?: string
  trigger?: "background" | "manual"
  mode?: "full" | "incremental"
}
export interface IndexingCompletedTelemetryProperties extends IndexingTelemetryProperties {
  trigger: "background" | "manual"
  mode: "full" | "incremental"
  filesIndexed: number
  filesDiscovered: number
  totalBlocks: number
  batchErrors: number
}
export interface IndexingFileCountTelemetryProperties extends IndexingTelemetryProperties {
  mode: "full" | "incremental"
  discovered: number
  candidate: number
}
export interface IndexingRetryTelemetryProperties extends IndexingTelemetryProperties {
  mode: "full" | "incremental"
  attempt: number
  maxRetries: number
  batchSize: number
  error: string
}
export interface IndexingErrorTelemetryProperties extends IndexingTelemetryProperties {
  location: string
  error: string
  retryCount?: number
  maxRetries?: number
}
/** One explicit MCP sign-in attempt admitted by the CLI runtime. Never carries server names, URLs, or OAuth secrets. */
export interface McpAuthStartedProperties extends Record<string, unknown> {
  schemaVersion: number
  attemptId: string
  /** The client opens the authorization URL itself (editors, console) instead of the CLI process. */
  external: boolean
}
export interface McpAuthCompletedProperties extends McpAuthStartedProperties {
  outcome: "success" | "failure" | "denied" | "cancelled" | "timeout" | "superseded" | "interrupted"
  phase:
    | "prepare"
    | "callback_setup"
    | "authorization"
    | "token_exchange"
    | "credential_store"
    | "reconnect"
    | "tool_discovery"
  oauthOutcome: "success" | "failure" | "not_performed" | "not_reached"
  connectionOutcome: "connected" | "failed" | "needs_auth" | "needs_client_registration" | "not_attempted"
  errorCode?: string
  redirect: boolean
  durationMs: number
  /** `verified` only when the effective config matches a public marketplace MCP method. */
  attribution: "verified" | "unknown"
  itemType?: "mcp"
  itemId?: string
  methodId?: string
  methodName?: string
  oauthRequirement?: string
  authHandler?: string
}
export namespace Telemetry {
  export async function init(options: { dataPath: string; version: string; enabled: boolean }): Promise<void> {}
  export function setEnabled(value: boolean) {}
  export function isEnabled(): boolean {
    return false
  }
  export async function updateIdentity(token: string | null, accountId?: string): Promise<void> {}
  export function track(event: TelemetryEvent, properties?: Record<string, unknown>) {}
  // CLI Lifecycle
  export function trackCliStart() {}
  // Upload queued events without blocking. Call after bootstrap so the flush
  // overlaps with command execution and shutdown() stays fast (#10242).
  export function flushInBackground() {}
  export function trackCliExit(exitCode?: number) {}
  // Sessions
  export function trackSessionStart(sessionId: string, model?: string, provider?: string) {}
  export function trackSessionEnd(
    sessionId: string,
    stats: {
      messageCount?: number
      inputTokens?: number
      outputTokens?: number
      duration?: number
    },
  ) {}
  export function trackSessionMessage(sessionId: string, source: "user" | "assistant") {}
  // LLM
  export function trackLlmCompletion(properties: {
    taskId?: string
    mode?: "review"
    feature?: "code_reviews"
    command?: ReviewCommand
    tool?: "suggest"
    apiProvider: string
    modelId: string
    inputTokens?: number
    outputTokens?: number
    cacheReadTokens?: number
    cacheWriteTokens?: number
    cost?: number
    completionTime?: number
    duration?: number
  }) {}
  // Features
  export function trackCommandUsed(command: string) {}
  export function trackToolUsed(tool: string, sessionId?: string) {}
  export function trackAgentUsed(agent: string, sessionId?: string) {}
  export function trackPlanFollowup(
    sessionId: string,
    choice: "new_session" | "continue" | "keep_refining" | "custom" | "dismissed",
  ) {}
  export function trackSuggestionAccepted(properties: {
    sessionId: string
    requestId: string
    index: number
    tool: "suggest"
    command: ReviewCommand
    actionCount?: number
  }) {}
  export function trackSuggestionShown(properties: {
    sessionId: string
    requestId: string
    index: number
    tool: "suggest"
    command: ReviewCommand
    actionCount?: number
  }) {}
  export function trackIndexingStarted(properties: IndexingTelemetryProperties) {}
  export function trackIndexingCompleted(properties: IndexingCompletedTelemetryProperties) {}
  export function trackIndexingFileCount(properties: IndexingFileCountTelemetryProperties) {}
  export function trackIndexingBatchRetry(properties: IndexingRetryTelemetryProperties) {}
  export function trackIndexingError(properties: IndexingErrorTelemetryProperties) {}
  // Share
  export function trackShareCreated(sessionId: string) {}
  export function trackShareDeleted(sessionId: string) {}
  // MCP
  export function trackMcpServerConnected(server: string) {}
  export function trackMcpServerError(server: string, error?: string) {}
  export function trackMcpAuthStarted(properties: McpAuthStartedProperties) {}
  export function trackMcpAuthCompleted(properties: McpAuthCompletedProperties) {}
  // Remote
  export function trackRemoteConnectionOpened() {}
  // Auth
  export function trackAuthSuccess(provider: string) {}
  export function trackAuthLogout(provider: string) {}
  // Errors
  export function trackError(error: string, context?: string) {}
  // Feedback
  export interface FeedbackProperties extends Record<string, unknown> {
    providerID: string
    modelID: string
    variant?: string
    rating: "up" | "down" | "cleared"
    previousRating?: "up" | "down"
    sessionID?: string
    messageID?: string
    parentMessageID?: string
  }
  export function trackFeedback(props: FeedbackProperties) {}
  export async function shutdown(timeoutMs?: number): Promise<void> {}
}
