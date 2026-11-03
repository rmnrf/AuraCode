import { expect, test } from "bun:test"
import { COMPOSER, getSelected, promoteDraftModels, type ModelStore, type ResolveEnv } from "../../webview-ui/src/context/session-model-store"

const mode = { providerID: "local", modelID: "default" }
const last = { providerID: "local", modelID: "chosen" }
const env: ResolveEnv = {
  providers: { local: { name: "Local", models: { default: {}, chosen: {} } } } as unknown as ResolveEnv["providers"],
  connected: ["local"],
  ready: true,
  organizationId: null,
  fallback: mode,
  getModeModel: () => mode,
  getGlobalModel: () => mode,
}
const store = (): ModelStore => ({
  sessionOverrides: {},
  agentSelections: {},
  recentModels: [last],
})

test("new task composer and pending tabs use the most recently chosen model over defaults", () => {
  const state = store()
  expect(getSelected(state, env, COMPOSER, "build")).toEqual(last)
  expect(getSelected(state, env, "pending:new-task", "build")).toEqual(last)
  expect(getSelected(state, env, "sidebar-pending:new-task", "build")).toEqual(last)
  expect(getSelected(state, env, "ses_existing", "build")).toEqual(mode)
})

test("real sessions keep their pinned model; new task inherits its own pick", () => {
  const state = store()
  state.sessionOverrides.ses_existing = { build: mode }
  state.sessionOverrides["pending:next"] = { build: last, plan: mode }
  expect(getSelected(state, env, "ses_existing", "build")).toEqual(mode)
  expect(promoteDraftModels(state, env, "pending:next", "build")).toEqual({ build: last, plan: mode })
  expect(promoteDraftModels(state, env, "pending:next", "plan")).toEqual({ build: last, plan: mode })
})

test("promotion freezes the inherited model even if no draft picker was clicked", () => {
  const state = store()
  expect(promoteDraftModels(state, env, "pending:next", "build")).toEqual({ build: last })
  expect(state.sessionOverrides["pending:next"]).toBeUndefined()
})

test("unavailable recent selections fall back to configured model", () => {
  const state = store()
  state.recentModels = [{ providerID: "local", modelID: "removed" }]
  expect(getSelected(state, env, COMPOSER, "build")).toEqual(mode)
})
