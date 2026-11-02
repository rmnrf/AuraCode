import { Effect } from "effect"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { InstanceHttpApi } from "@/server/routes/instance/httpapi/api"
import { TelemetryCapturePayload, TelemetrySetEnabledPayload } from "../groups/telemetry"

export const telemetryHandlers = HttpApiBuilder.group(InstanceHttpApi, "telemetry", (handlers) =>
  Effect.gen(function* () {
    const capture = Effect.fn("TelemetryHttpApi.capture")(function* (ctx: {
      payload: typeof TelemetryCapturePayload.Type
    }) {
      // Compatibility only: no collection, storage, logs or transport.
      return false
    })

    const setEnabled = Effect.fn("TelemetryHttpApi.setEnabled")(function* (ctx: {
      payload: typeof TelemetrySetEnabledPayload.Type
    }) {
      return false
    })

    return handlers.handle("capture", capture).handle("setEnabled", setEnabled)
  }),
)
