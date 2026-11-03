import type { SessionV1 } from "@opencode-ai/core/v1/session"
import type { MessageID } from "@/session/schema"

/** Nonempty, finished summaries only: a failed attempt must not hide history. */
export function summaryText(message: SessionV1.WithParts): string | undefined {
  const text = message.parts
    .filter((part): part is SessionV1.TextPart => part.type === "text")
    .map((part) => part.text.trim())
    .filter(Boolean)
    .join("\n\n")
    .trim()
  return text || undefined
}

type Completed = { userIndex: number; assistantIndex: number; summary: string }

/**
 * Returns the transcript to compact from the latest successful checkpoint.
 * Each checkpoint already captures earlier history; only its retained tail
 * (if any) and newer turns must be included in the next summary request.
 */
export function compactionHistory(messages: SessionV1.WithParts[]): {
  available: SessionV1.WithParts[]
  previousSummary: string | undefined
} {
  const users = new Map<MessageID, number>()
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i]!
    if (msg.info.role === "user" && msg.parts.some((part) => part.type === "compaction"))
      users.set(msg.info.id, i)
  }

  let latest: Completed | undefined
  const hidden = new Set<number>()
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i]!
    if (msg.info.role !== "assistant" || !msg.info.summary || !msg.info.finish ||
        msg.info.finish === "error" || msg.info.error) continue
    const userIndex = users.get(msg.info.parentID)
    if (userIndex === undefined || userIndex >= i) continue
    const summary = summaryText(msg)
    if (!summary) continue
    latest = { userIndex, assistantIndex: i, summary }
    hidden.add(userIndex)
    hidden.add(i)
  }
  if (!latest) return { available: messages, previousSummary: undefined }

  const marker = messages[latest.userIndex]!.parts.find((part): part is SessionV1.CompactionPart =>
    part.type === "compaction")
  const tailIndex = marker?.tail_start_id
    ? messages.findIndex((message) => message.info.id === marker.tail_start_id)
    : -1
  const start = tailIndex >= 0 && tailIndex < latest.userIndex ? tailIndex : latest.assistantIndex + 1
  return {
    available: messages.filter((_, index) => index >= start && !hidden.has(index)),
    previousSummary: latest.summary,
  }
}
