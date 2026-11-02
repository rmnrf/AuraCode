import * as vscode from "vscode"

export class AuraCodeActionProvider implements vscode.CodeActionProvider {
  static readonly metadata: vscode.CodeActionProviderMetadata = {
    providedCodeActionKinds: [vscode.CodeActionKind.QuickFix, vscode.CodeActionKind.RefactorRewrite],
  }

  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
  ): vscode.CodeAction[] {
    if (range.isEmpty) return []

    const actions: vscode.CodeAction[] = []

    const add = new vscode.CodeAction("Add to AuraCode", vscode.CodeActionKind.RefactorRewrite)
    add.command = { command: "aura-code.new.addToContext", title: "Add to AuraCode" }
    actions.push(add)

    const hasDiagnostics = context.diagnostics.length > 0

    if (hasDiagnostics) {
      const fix = new vscode.CodeAction("Fix with AuraCode", vscode.CodeActionKind.QuickFix)
      fix.command = { command: "aura-code.new.fixCode", title: "Fix with AuraCode" }
      fix.isPreferred = true
      actions.push(fix)
    }

    if (!hasDiagnostics) {
      const explain = new vscode.CodeAction("Explain with AuraCode", vscode.CodeActionKind.RefactorRewrite)
      explain.command = { command: "aura-code.new.explainCode", title: "Explain with AuraCode" }
      actions.push(explain)

      const improve = new vscode.CodeAction("Improve with AuraCode", vscode.CodeActionKind.RefactorRewrite)
      improve.command = { command: "aura-code.new.improveCode", title: "Improve with AuraCode" }
      actions.push(improve)
    }

    return actions
  }
}
