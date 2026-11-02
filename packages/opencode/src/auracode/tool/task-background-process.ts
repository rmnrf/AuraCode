import { BackgroundProcess } from "@/auracode/background-process"
import { SessionID } from "@/session/schema"
import { Effect } from "effect"

export namespace AuraTaskBackgroundProcess {
  export function finish(sessionID: SessionID) {
    return Effect.promise(() => BackgroundProcess.stopSession(sessionID)).pipe(Effect.ignore)
  }
}
