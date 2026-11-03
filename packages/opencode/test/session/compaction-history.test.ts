import { expect, test } from "bun:test"
import type { SessionV1 } from "@opencode-ai/core/v1/session"
import { compactionHistory } from "../../src/auracode/session/compaction-history"

type Fixture = {
  info: { id: string; role: "user" | "assistant"; parentID?: string; summary?: boolean; finish?: string; error?: unknown }
  parts: Array<{ type: string; text?: string; tail_start_id?: string }>
}
const history = (...messages: Fixture[]) => messages as unknown as SessionV1.WithParts[]
const user = (id: string, text: string): Fixture => ({ info: { id, role: "user" }, parts: [{ type: "text", text }] })
const assistant = (id: string, parentID: string, text: string): Fixture => ({
  info: { id, role: "assistant", parentID }, parts: [{ type: "text", text }],
})
const marker = (id: string, tail?: string): Fixture => ({
  info: { id, role: "user" }, parts: [{ type: "compaction", ...(tail ? { tail_start_id: tail } : {}) }],
})
const summary = (id: string, parentID: string, text: string): Fixture => ({
  info: { id, role: "assistant", parentID, summary: true, finish: "stop" },
  parts: [{ type: "text", text }],
})

test("no checkpoint: keep the complete transcript", () => {
  const messages = history(user("u1", "first"), assistant("a1", "u1", "done"))
  expect(compactionHistory(messages)).toEqual({ available: messages, previousSummary: undefined })
})

test("repeat compaction uses previous summary and only new conversation", () => {
  const messages = history(
    user("u1", "important original instructions"),
    assistant("a1", "u1", "initial work"),
    marker("c1"),
    summary("s1", "c1", "Saved objective and decisions"),
    user("u2", "a new request"),
    assistant("a2", "u2", "new work"),
  )
  const out = compactionHistory(messages)
  expect(out.previousSummary).toBe("Saved objective and decisions")
  expect(out.available.map((m) => m.info.id)).toEqual(["u2", "a2"])
})

test("retained tail before the checkpoint remains available for the next summary", () => {
  const messages = history(
    user("u1", "already summarized"),
    user("u2", "the important recent task"),
    assistant("a2", "u2", "specific file details"),
    marker("c1", "u2"),
    summary("s1", "c1", "Older history summary"),
    user("u3", "follow-up"),
  )
  const out = compactionHistory(messages)
  expect(out.available.map((m) => m.info.id)).toEqual(["u2", "a2", "u3"])
  expect(out.previousSummary).toBe("Older history summary")
})

test("latest checkpoint supersedes earlier summaries and old history", () => {
  const messages = history(
    user("u1", "early"), marker("c1"), summary("s1", "c1", "First"),
    user("u2", "middle"), marker("c2", "u2"), summary("s2", "c2", "First + middle"),
    user("u3", "latest"),
  )
  const out = compactionHistory(messages)
  expect(out.previousSummary).toBe("First + middle")
  expect(out.available.map((m) => m.info.id)).toEqual(["u2", "u3"])
})

test("failed, unfinished and empty summaries never discard conversation", () => {
  const failed = summary("s1", "c1", "incomplete")
  failed.info.error = { message: "stream failed" }
  const unfinished = summary("s2", "c2", "unfinished")
  delete unfinished.info.finish
  const blank = summary("s3", "c3", "  ")
  const messages = history(user("u1", "must stay"), marker("c1"), failed,
    marker("c2"), unfinished, marker("c3"), blank)
  const out = compactionHistory(messages)
  expect(out.previousSummary).toBeUndefined()
  expect(out.available).toEqual(messages)
})

test("invalid tail marker falls back to messages after successful compaction", () => {
  const messages = history(user("u1", "already done"), marker("c1", "not-found"),
    summary("s1", "c1", "Done"), user("u2", "new task"))
  expect(compactionHistory(messages).available.map((m) => m.info.id)).toEqual(["u2"])
})
