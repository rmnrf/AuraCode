import * as vscode from "vscode"

type Post = (msg: unknown) => void

export function buildThroughputSettingMessage() {
  const config = vscode.workspace.getConfiguration("aura-code.new")
  return {
    type: "throughputSettingLoaded" as const,
    visible: config.get<boolean>("showTokenThroughput", true),
  }
}

export function watchThroughputConfig(post: Post): vscode.Disposable {
  return vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration("aura-code.new.showTokenThroughput")) {
      post(buildThroughputSettingMessage())
    }
  })
}
