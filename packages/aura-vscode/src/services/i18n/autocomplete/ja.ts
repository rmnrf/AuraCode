export const dict = {
  "auracode:autocomplete.statusBar.enabled": "$(sparkle) オートコンプリート",
  "auracode:autocomplete.statusBar.snoozed": "一時停止中",
  "auracode:autocomplete.statusBar.warning": "$(warning) オートコンプリート",
  "auracode:autocomplete.statusBar.tooltip.basic": "AuraCode オートコンプリート",
  "auracode:autocomplete.statusBar.tooltip.noUsableProvider":
    "**オートコンプリートモデルが設定されていません**\n\nオートコンプリートを有効にするには、次の対応プロバイダーのいずれかを含むプロファイルを追加してください: {{providers}}。\n\n[設定を開く]({{command}})",
  "auracode:autocomplete.statusBar.tooltip.completionSummary":
    "{{startTime}} から {{endTime}} までに {{count}} 件の補完を実行し、合計コストは {{cost}} でした。",
  "auracode:autocomplete.statusBar.tooltip.providerInfo":
    "オートコンプリートは {{provider}} 経由の {{model}} によって提供されています。",
  "auracode:autocomplete.statusBar.cost.zero": "$0.00",
  "auracode:autocomplete.statusBar.cost.lessThanCent": "<$0.01",
  "auracode:autocomplete.codeAction.title": "AuraCode: 提案された編集",
  "auracode:autocomplete.incompatibilityExtensionPopup.message":
    "AuraCode オートコンプリートは GitHub Copilot との競合によりブロックされています。修正するには、Copilot のインライン提案を無効にする必要があります。",
  "auracode:autocomplete.incompatibilityExtensionPopup.disableCopilot": "Copilot を無効化",
  "auracode:autocomplete.incompatibilityExtensionPopup.disableInlineAssist": "オートコンプリートを無効化",
  "auracode:autocomplete.creditsExhausted.message":
    "AuraCode オートコンプリートは一時停止されました。考えられる原因: Aura アカウントに残りクレジットがない、または設定済みの API キー (BYOK) がクォータ上限に達しています。オートコンプリートを再開するには、Aura クレジットを追加するか API キー設定を確認してください。",
  "auracode:autocomplete.creditsExhausted.addCredits": "クレジットを追加",
  "auracode:autocomplete.authError.message":
    "AuraCode オートコンプリートは認証の問題により一時停止されました。考えられる原因: Aura にサインインしていない、または API キー (BYOK) が無効または不足しています。再度サインインするか、プロバイダーの API キー設定を確認してください。",
}
