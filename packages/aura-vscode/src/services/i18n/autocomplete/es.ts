export const dict = {
  "auracode:autocomplete.statusBar.enabled": "$(sparkle) Autocompletado",
  "auracode:autocomplete.statusBar.snoozed": "pospuesto",
  "auracode:autocomplete.statusBar.warning": "$(warning) Autocompletado",
  "auracode:autocomplete.statusBar.tooltip.basic": "Autocompletado de AuraCode",
  "auracode:autocomplete.statusBar.tooltip.noUsableProvider":
    "**No hay ningún modelo de autocompletado configurado**\n\nPara habilitar el autocompletado, añade un perfil con uno de estos proveedores compatibles: {{providers}}.\n\n[Abrir configuración]({{command}})",
  "auracode:autocomplete.statusBar.tooltip.completionSummary":
    "Se realizaron {{count}} completados entre {{startTime}} y {{endTime}}, con un coste total de {{cost}}.",
  "auracode:autocomplete.statusBar.tooltip.providerInfo":
    "Autocompletados proporcionados por {{model}} mediante {{provider}}.",
  "auracode:autocomplete.statusBar.cost.zero": "$0.00",
  "auracode:autocomplete.statusBar.cost.lessThanCent": "<$0.01",
  "auracode:autocomplete.codeAction.title": "AuraCode: Ediciones sugeridas",
  "auracode:autocomplete.incompatibilityExtensionPopup.message":
    "El autocompletado de AuraCode está bloqueado por un conflicto con GitHub Copilot. Para solucionarlo, debes deshabilitar las sugerencias en línea de Copilot.",
  "auracode:autocomplete.incompatibilityExtensionPopup.disableCopilot": "Deshabilitar Copilot",
  "auracode:autocomplete.incompatibilityExtensionPopup.disableInlineAssist": "Deshabilitar autocompletado",
  "auracode:autocomplete.creditsExhausted.message":
    "El autocompletado de AuraCode se ha pausado. Posibles causas: tu cuenta de Aura no tiene créditos restantes, o tu clave de API configurada (BYOK) alcanzó su límite de cuota. Agrega créditos de Aura o revisa la configuración de tu clave de API para reanudar el autocompletado.",
  "auracode:autocomplete.creditsExhausted.addCredits": "Añadir créditos",
  "auracode:autocomplete.authError.message":
    "El autocompletado de AuraCode se ha pausado por un problema de autenticación. Posibles causas: no has iniciado sesión en Aura, o tu clave de API (BYOK) no es válida o falta. Vuelve a iniciar sesión o revisa la configuración de la clave de API de tu proveedor.",
}
