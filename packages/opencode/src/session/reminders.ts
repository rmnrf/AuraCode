import { SessionV1 } from "@opencode-ai/core/v1/session"
import { Effect } from "effect"
import { Agent } from "@/agent/agent"
import { AuraModeReminders } from "@/auracode/session/mode-reminders" // auracode_change
import { Session } from "./session"

export const apply = Effect.fn("SessionReminders.apply")(function* (input: {
  messages: SessionV1.WithParts[]
  agent: Agent.Info
  session: Session.Info
}) {
  // auracode_change start - mode reminder policy (plan, ask, code switches) lives in auracode/session/mode-reminders.ts
  return yield* AuraModeReminders.apply(input)
  // auracode_change end
})

export * as SessionReminders from "./reminders"
