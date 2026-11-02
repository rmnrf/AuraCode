import * as Log from "@opencode-ai/core/util/log"
import { InstallationBuildKind } from "@opencode-ai/core/installation/version"

export namespace AuraLog {
  export function init() {
    const value = process.env.AURA_LOG_LEVEL?.toUpperCase()
    const level: Log.Level =
      value === "DEBUG" || value === "INFO" || value === "WARN" || value === "ERROR"
        ? value
        : InstallationBuildKind === "release"
          ? "INFO"
          : "DEBUG"
    return Log.init({
      print: process.env.AURA_PRINT_LOGS === "1",
      dev: InstallationBuildKind !== "release",
      level,
    })
  }
}
