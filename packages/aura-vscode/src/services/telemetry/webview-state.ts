import * as vscode from "vscode"

type Post = (msg: { type: "telemetryState"; enabled: boolean }) => void

/** Disabled editor event collection, regardless of VS Code settings. */
export function pushTelemetryState(post: Post): void {
  post({ type: "telemetryState", enabled: false })
}

/** No subscription is needed when telemetry is permanently disabled. */
export function watchTelemetryState(_post: Post): vscode.Disposable {
  return new vscode.Disposable(() => {})
}
