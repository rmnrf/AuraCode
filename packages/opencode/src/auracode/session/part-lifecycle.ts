import type { MessageV2 } from "@/session/message-v2"

export namespace AuraPartLifecycle {
  export const key = "auracode.lifecycle"

  export function transient(part: MessageV2.Part) {
    return part.type === "text" && part.metadata?.[key] === "transient"
  }
}
