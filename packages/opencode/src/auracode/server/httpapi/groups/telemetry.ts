import { Schema } from "effect"
import { HttpApi, HttpApiEndpoint, HttpApiError, HttpApiGroup, OpenApi } from "effect/unstable/httpapi"
import { Authorization } from "@/server/routes/instance/httpapi/middleware/authorization"
import { InstanceContextMiddleware } from "@/server/routes/instance/httpapi/middleware/instance-context"
import {
  WorkspaceRoutingMiddleware,
  WorkspaceRoutingQuery,
} from "@/server/routes/instance/httpapi/middleware/workspace-routing"
import { described } from "@/server/routes/instance/httpapi/groups/metadata"

const root = "/telemetry"

export const TelemetryCapturePayload = Schema.Struct({
  event: Schema.String.annotate({ description: "Event name" }),
  properties: Schema.optional(Schema.Record(Schema.String, Schema.Unknown)).annotate({
    description: "Event properties",
  }),
})

export const TelemetrySetEnabledPayload = Schema.Struct({
  enabled: Schema.Boolean,
})

export const TelemetryPaths = {
  capture: `${root}/capture`,
  setEnabled: `${root}/setEnabled`,
} as const

export const TelemetryApi = HttpApi.make("telemetry")
  .add(
    HttpApiGroup.make("telemetry")
      .add(
        HttpApiEndpoint.post("capture", TelemetryPaths.capture, {
          query: WorkspaceRoutingQuery,
          payload: TelemetryCapturePayload,
          success: described(Schema.Boolean, "Event captured"),
          error: HttpApiError.BadRequest,
        }).annotateMerge(
          OpenApi.annotations({
            identifier: "telemetry.capture",
            summary: "Capture telemetry event",
            description: "Disabled compatibility endpoint. Events are discarded without storage or transmission.",
          }),
        ),
        HttpApiEndpoint.post("setEnabled", TelemetryPaths.setEnabled, {
          query: WorkspaceRoutingQuery,
          payload: TelemetrySetEnabledPayload,
          success: described(Schema.Boolean, "State updated"),
          error: HttpApiError.BadRequest,
        }).annotateMerge(
          OpenApi.annotations({
            identifier: "telemetry.setEnabled",
            summary: "Disabled telemetry compatibility endpoint",
            description:
              "Telemetry is permanently disabled. This endpoint cannot enable collection or transmission.",
          }),
        ),
      )
      .annotateMerge(
        OpenApi.annotations({
          title: "telemetry",
          description: "Aura telemetry routes.",
        }),
      )
      .middleware(InstanceContextMiddleware)
      .middleware(WorkspaceRoutingMiddleware)
      .middleware(Authorization),
  )
  .annotateMerge(
    OpenApi.annotations({
      title: "aura HttpApi",
      version: "0.0.1",
      description: "Aura HttpApi surface.",
    }),
  )
