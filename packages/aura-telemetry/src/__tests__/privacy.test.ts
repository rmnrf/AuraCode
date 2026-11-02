import { test } from "node:test"
import assert from "node:assert/strict"
import { Telemetry } from "../telemetry.ts"
import { Identity } from "../identity.ts"

test("telemetry cannot be enabled, even with consent and identity updates", async () => {
  await Telemetry.init({ dataPath: ".", version: "test", enabled: true })
  Telemetry.setEnabled(true)
  await Telemetry.updateIdentity("test-token", "test-account")
  Telemetry.trackCliStart()
  Telemetry.trackSessionStart("private-session", "private-model", "local")
  Telemetry.flushInBackground()
  assert.equal(Telemetry.isEnabled(), false)
  assert.equal(await Identity.getMachineId(), undefined)
  assert.equal(Identity.getUserId(), null)
  assert.equal(Identity.getOrganizationId(), null)
  await Telemetry.shutdown()
})
