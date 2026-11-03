import { IconButton } from "@auracode/aura-ui/icon-button"
import { TextField } from "@auracode/aura-ui/text-field"
import { Show } from "solid-js"
import { useLanguage } from "../../context/language"

export type Translator = ReturnType<typeof useLanguage>["t"]

// undefined = not set; true/false = enable_thinking value
export type EnableThinkingValue = undefined | boolean
export type ThinkingTypeValue = undefined | "enabled" | "disabled" | "adaptive"
export type SplitReasoningValue = undefined | boolean
export type ReasoningEffortValue = undefined | "none" | "minimal" | "low" | "medium" | "high" | "xhigh"
export type OutputEffortValue = undefined | "low" | "medium" | "high" | "xhigh" | "max"
export type ChatTemplateArgsValue = undefined | boolean
export type Modality = "text" | "audio" | "image" | "video" | "pdf"

export type Modalities = {
  input?: Modality[]
  output?: Modality[]
}

export type VariantEntry = {
  name: string
  raw?: Record<string, unknown>
  enableThinking: EnableThinkingValue
  thinking: ThinkingTypeValue
  splitReasoning: SplitReasoningValue
  reasoningEffort: ReasoningEffortValue
  outputEffort: OutputEffortValue
  chatTemplateArgs: ChatTemplateArgsValue
}

export type ModelEntry = {
  id: string
  name: string
  reasoning: boolean
  supportsImages: boolean
  /** Optional per-model limits. Empty strings use the runtime defaults. */
  contextWindow: string
  maxOutputTokens: string
  modalities: Modalities
  variants: VariantEntry[]
}

type ModelCardProps = {
  m: ModelEntry
  errors: { id?: string; name?: string; contextWindow?: string; maxOutputTokens?: string; variants?: Array<{ name?: string }> }
  t: Translator
  canRemove: boolean
  onChangeId: (val: string) => void
  onChangeName: (val: string) => void
  onChangeReasoning: (val: boolean) => void
  onChangeSupportsImages: (val: boolean) => void
  onChangeContextWindow: (val: string) => void
  onChangeMaxOutputTokens: (val: string) => void
  onRemove: () => void
}

export function ModelCard(props: ModelCardProps) {
  const issue = () => props.errors.variants?.find((error) => error.name)?.name

  return (
    <div
      style={{
        display: "flex",
        "flex-direction": "column",
        gap: "8px",
        padding: "8px",
        border: "1px solid var(--border-weak-base, var(--vscode-panel-border))",
        "border-radius": "6px",
      }}
    >
      {/* Model id + name + remove */}
      <div style={{ display: "flex", gap: "8px", "align-items": "flex-end" }}>
        <div style={{ flex: 1 }}>
          <TextField
            label={props.t("provider.custom.models.id.label")}
            placeholder={props.t("provider.custom.models.id.placeholder")}
            value={props.m.id}
            onChange={props.onChangeId}
            validationState={props.errors.id ? "invalid" : undefined}
            error={props.errors.id}
          />
        </div>
        <div style={{ flex: 1 }}>
          <TextField
            label={props.t("provider.custom.models.name.label")}
            placeholder={props.t("provider.custom.models.name.placeholder")}
            value={props.m.name}
            onChange={props.onChangeName}
            validationState={props.errors.name ? "invalid" : undefined}
            error={props.errors.name}
          />
        </div>
        <IconButton
          type="button"
          icon="trash"
          variant="ghost"
          onClick={props.onRemove}
          disabled={!props.canRemove}
          aria-label={props.t("provider.custom.models.remove")}
          style={{ "margin-bottom": "4px" }}
        />
      </div>

      {/* Reasoning and Image toggles */}
      <div style={{ display: "flex", gap: "16px", "align-items": "center", "flex-wrap": "wrap" }}>
        <label
          style={{
            display: "flex",
            "align-items": "center",
            gap: "8px",
            cursor: "pointer",
            "font-size": "var(--aura-font-size-13)",
            color: "var(--vscode-foreground)",
          }}
        >
          <input
            type="checkbox"
            checked={props.m.reasoning}
            onChange={(e) => props.onChangeReasoning(e.currentTarget.checked)}
          />
          {props.t("provider.custom.models.reasoning.label")}
        </label>

        <label
          style={{
            display: "flex",
            "align-items": "center",
            gap: "8px",
            cursor: "pointer",
            "font-size": "var(--aura-font-size-13)",
            color: "var(--vscode-foreground)",
          }}
        >
          <input
            type="checkbox"
            checked={props.m.supportsImages}
            onChange={(e) => props.onChangeSupportsImages(e.currentTarget.checked)}
          />
          {props.t("provider.custom.models.modalities.image")}
        </label>
      </div>

      <details style={{ "border-top": "1px solid var(--border-weak-base)", "padding-top": "8px" }}>
        <summary style={{ cursor: "pointer", "font-size": "var(--aura-font-size-13)", "font-weight": "500" }}>
          Context window and output limits
        </summary>
        <div style={{ display: "flex", gap: "12px", "flex-wrap": "wrap", "padding-top": "12px" }}>
          <div style={{ flex: 1, "min-width": "140px" }}>
            <TextField
              type="number"
              label="Context window (tokens)"
              placeholder="32768 (default)"
              value={props.m.contextWindow}
              onChange={props.onChangeContextWindow}
              validationState={props.errors.contextWindow ? "invalid" : undefined}
              error={props.errors.contextWindow}
            />
          </div>
          <div style={{ flex: 1, "min-width": "140px" }}>
            <TextField
              type="number"
              label="Max output tokens"
              placeholder="4096 (default)"
              value={props.m.maxOutputTokens}
              onChange={props.onChangeMaxOutputTokens}
              validationState={props.errors.maxOutputTokens ? "invalid" : undefined}
              error={props.errors.maxOutputTokens}
            />
          </div>
        </div>
        <p style={{ "font-size": "var(--aura-font-size-11)", color: "var(--text-weak-base)", margin: "8px 0 0" }}>
          Leave blank to use the default. Enter limits supported by your model server.
        </p>
      </details>

      <Show when={issue()}>
        {(error) => (
          <span
            role="alert"
            style={{ "font-size": "var(--aura-font-size-12)", color: "var(--vscode-errorForeground)" }}
          >
            {error()}
          </span>
        )}
      </Show>
    </div>
  )
}
