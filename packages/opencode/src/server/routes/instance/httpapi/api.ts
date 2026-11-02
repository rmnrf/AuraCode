import { Schema } from "effect"
import { HttpApi } from "effect/unstable/httpapi"
import { EventV2 } from "@opencode-ai/core/event"
import { EventManifest } from "@/event-manifest"
import { Credential } from "@opencode-ai/core/credential"
import { Integration } from "@opencode-ai/core/integration"
import { SkillV2 } from "@opencode-ai/core/skill"
import { InstanceDisposed } from "@/server/event"
import { Question } from "@/question"
import { BusEvent } from "@/bus/bus-event" // auracode_change - include legacy Aura events until they migrate to EventV2
import { ConfigApi } from "./groups/config"
import { ControlApi } from "./groups/control"
import { ControlPlaneApi } from "./groups/control-plane"
import { EventApi } from "./groups/event"
import { ExperimentalApi } from "./groups/experimental"
import { FileApi } from "./groups/file"
import { InstanceApi } from "./groups/instance"
import { McpApi } from "./groups/mcp"
import { PermissionApi } from "./groups/permission"
import { ProjectApi } from "./groups/project"
import { ProjectCopyApi } from "./groups/project-copy"
import { ProviderApi } from "./groups/provider"
import { PtyApi, PtyConnectApi } from "./groups/pty"
import { QuestionApi } from "./groups/question"
import { SessionApi } from "./groups/session"
import { SyncApi } from "./groups/sync"
import { TuiApi } from "./groups/tui"
import { WorkspaceApi } from "./groups/workspace"
// auracode_change start - Aura HttpApi groups
import { AgentBuilderApi } from "@/auracode/server/httpapi/groups/agent-builder"
import { AgentUsageApi } from "@/auracode/server/httpapi/groups/agent-usage"
import { BranchNameApi } from "@/auracode/server/httpapi/groups/branch-name"
import { CommitMessageApi } from "@/auracode/server/httpapi/groups/commit-message"
import { CloudAgentApi } from "@/auracode/server/httpapi/groups/cloud-agent"
import { BackgroundProcessApi } from "@/auracode/server/httpapi/groups/background-process"
import { ConfigConsoleApi } from "@/auracode/server/httpapi/groups/config-console"
import { EnhancePromptApi } from "@/auracode/server/httpapi/groups/enhance-prompt"
import { IndexingApi } from "@/auracode/server/httpapi/groups/indexing"
import { InstanceReloadApi } from "@/auracode/server/httpapi/groups/instance-reload"
import { AuraGatewayApi } from "@/auracode/server/httpapi/groups/aura-gateway"
import { AuracodeApi } from "@/auracode/server/httpapi/groups/auracode"
import { MigrateApi } from "@/auracode/server/httpapi/groups/migrate"
import { NetworkApi } from "@/auracode/server/httpapi/groups/network"
import { RemoteApi } from "@/auracode/server/httpapi/groups/remote"
import { SandboxApi } from "@/auracode/server/httpapi/groups/sandbox"
import { SessionHostApi } from "@/auracode/server/httpapi/groups/session-host"
import { SessionImportApi } from "@/auracode/server/httpapi/groups/session-import"
import { SuggestionApi } from "@/auracode/server/httpapi/groups/suggestion"
import { TelemetryApi } from "@/auracode/server/httpapi/groups/telemetry"
import { MemoryApi } from "@/auracode/server/httpapi/groups/memory" // auracode_change
// auracode_change end
import { makeApi } from "@opencode-ai/protocol/api"
import { LocationMiddleware } from "@opencode-ai/server/location"
import { SessionLocationMiddleware } from "@opencode-ai/server/middleware/session-location"
import { GlobalApi } from "./groups/global"
import { Authorization } from "./middleware/authorization"
import { SchemaErrorMiddleware } from "./middleware/schema-error"

const EventSchema = Schema.Union([
  ...EventManifest.Latest.values()
    .map((definition) =>
      Schema.Struct({
        id: EventV2.ID,
        type: Schema.Literal(definition.type),
        properties: definition.data,
      }).annotate({ identifier: `Event.${definition.type}` }),
    )
    .toArray(),
  ...BusEvent.effectPayloads(), // auracode_change - include legacy Aura events until they migrate to EventV2
  InstanceDisposed,
]).annotate({ identifier: "Event" })

export const ServerApi = makeApi({
  definitions: EventManifest.Latest.values().toArray(),
  locationMiddleware: LocationMiddleware,
  sessionLocationMiddleware: SessionLocationMiddleware,
})

export const RootHttpApi = HttpApi.make("opencode-root")
  .addHttpApi(ControlApi)
  .addHttpApi(ControlPlaneApi)
  .addHttpApi(GlobalApi)
  .middleware(SchemaErrorMiddleware)
  .middleware(Authorization)

export const InstanceHttpApi = HttpApi.make("opencode-instance")
  .addHttpApi(ConfigApi)
  .addHttpApi(ExperimentalApi)
  .addHttpApi(FileApi)
  .addHttpApi(InstanceApi)
  .addHttpApi(McpApi)
  .addHttpApi(ProjectApi)
  .addHttpApi(ProjectCopyApi)
  .addHttpApi(PtyApi)
  .addHttpApi(QuestionApi)
  .addHttpApi(PermissionApi)
  .addHttpApi(ProviderApi)
  .addHttpApi(SessionApi)
  .addHttpApi(SyncApi)
  .addHttpApi(TuiApi)
  .addHttpApi(WorkspaceApi)
  // auracode_change start - Aura HttpApi groups
  .addHttpApi(AgentBuilderApi)
  .addHttpApi(AgentUsageApi)
  .addHttpApi(BackgroundProcessApi)
  .addHttpApi(BranchNameApi)
  .addHttpApi(CommitMessageApi)
  .addHttpApi(CloudAgentApi)
  .addHttpApi(ConfigConsoleApi)
  .addHttpApi(EnhancePromptApi)
  .addHttpApi(IndexingApi)
  .addHttpApi(InstanceReloadApi)
  .addHttpApi(AuraGatewayApi)
  .addHttpApi(AuracodeApi)
  .addHttpApi(MigrateApi)
  .addHttpApi(NetworkApi)
  .addHttpApi(RemoteApi)
  .addHttpApi(SandboxApi)
  .addHttpApi(SessionHostApi)
  .addHttpApi(SessionImportApi)
  .addHttpApi(SuggestionApi)
  .addHttpApi(TelemetryApi)
  .addHttpApi(MemoryApi)
  // auracode_change end
  .middleware(SchemaErrorMiddleware)

export const OpenCodeHttpApi = HttpApi.make("opencode")
  .addHttpApi(RootHttpApi)
  .addHttpApi(EventApi)
  .addHttpApi(InstanceHttpApi)
  .addHttpApi(ServerApi)
  .addHttpApi(PtyConnectApi)
  .annotate(HttpApi.AdditionalSchemas, [
    EventSchema,
    Question.Replied,
    Question.Rejected,
    Credential.Value,
    Integration.Inputs,
    Integration.Method,
    Integration.Ref,
    SkillV2.Source,
  ])

export type RootHttpApiType = typeof RootHttpApi
export type InstanceHttpApiType = typeof InstanceHttpApi
