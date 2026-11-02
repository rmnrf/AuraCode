/** Compatibility interface: autocomplete no longer collects usage events. */
import type { AutocompleteContext, CacheMatchType, FillInAtCursorSuggestion } from "../types"
import { getSuggestionKey as key } from "./telemetry-utils"

export type { AutocompleteContext, CacheMatchType, FillInAtCursorSuggestion }
export const getSuggestionKey = key
export const MIN_VISIBILITY_DURATION_MS = 300
export type AutocompleteType = "inline" | "chat-textarea"

export class AutocompleteTelemetry {
  constructor(_autocompleteType: AutocompleteType = "inline") {}
  public captureSuggestionRequested(_context: AutocompleteContext): void {}
  public captureSuggestionFiltered(
    _reason: "empty_response" | "filtered_by_postprocessing",
    _context: AutocompleteContext,
  ): void {}
  public captureCacheHit(_matchType: CacheMatchType, _context: AutocompleteContext, _suggestionLength: number): void {}
  public captureLlmSuggestionReturned(_context: AutocompleteContext, _suggestionLength: number): void {}
  public captureLlmRequestCompleted(
    _properties: { latencyMs: number; cost?: number; inputTokens?: number; outputTokens?: number },
    _context: AutocompleteContext,
  ): void {}
  public captureLlmRequestFailed(_properties: { latencyMs: number; error: string }, _context: AutocompleteContext): void {}
  public captureAcceptSuggestion(_suggestionLength?: number): void {}
  public startVisibilityTracking(
    _suggestion: FillInAtCursorSuggestion,
    _source: "llm" | "cache",
    _context: AutocompleteContext,
  ): void {}
  public cancelVisibilityTracking(): void {}
  public dispose(): void {}
}
