// English runtime translations for autocomplete (auracode:autocomplete.* namespace)
// Source: src/i18n/locales/en/auracode.json → "autocomplete" section

export const dict = {
  "auracode:autocomplete.statusBar.enabled": "$(sparkle) Autocomplete",
  "auracode:autocomplete.statusBar.snoozed": "snoozed",
  "auracode:autocomplete.statusBar.warning": "$(warning) Autocomplete",
  "auracode:autocomplete.statusBar.tooltip.basic": "AuraCode Autocomplete",
  "auracode:autocomplete.statusBar.tooltip.noUsableProvider":
    "**No autocomplete model configured**\n\nTo enable autocomplete, add a profile with one of these supported providers: {{providers}}.\n\n[Open Settings]({{command}})",
  "auracode:autocomplete.statusBar.tooltip.completionSummary":
    "Performed {{count}} completions between {{startTime}} and {{endTime}}, for a total cost of {{cost}}.",
  "auracode:autocomplete.statusBar.tooltip.providerInfo": "Autocompletions provided by {{model}} via {{provider}}.",
  "auracode:autocomplete.statusBar.cost.zero": "$0.00",
  "auracode:autocomplete.statusBar.cost.lessThanCent": "<$0.01",
  "auracode:autocomplete.codeAction.title": "AuraCode: Suggested Edits",
  "auracode:autocomplete.incompatibilityExtensionPopup.message":
    "The AuraCode Autocomplete is being blocked by a conflict with GitHub Copilot. To fix this, you must disable Copilot's inline suggestions.",
  "auracode:autocomplete.incompatibilityExtensionPopup.disableCopilot": "Disable Copilot",
  "auracode:autocomplete.incompatibilityExtensionPopup.disableInlineAssist": "Disable Autocomplete",
  "auracode:autocomplete.creditsExhausted.message":
    "AuraCode Autocomplete has been paused. Possible causes: your Aura account has no remaining credits, or your configured API key (BYOK) has reached its quota limit. Add Aura credits or check your API key configuration to resume autocomplete.",
  "auracode:autocomplete.creditsExhausted.addCredits": "Add Credits",
  "auracode:autocomplete.authError.message":
    "AuraCode Autocomplete has been paused due to an authentication issue. Possible causes: you are not signed in to Aura, or your API key (BYOK) is invalid or missing. Please sign in again or check your provider API key settings.",
}
