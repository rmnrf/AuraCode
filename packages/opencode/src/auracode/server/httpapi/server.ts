import { Layer } from "effect"
import { FetchHttpClient, HttpMiddleware, HttpRouter, HttpServer } from "effect/unstable/http"
import { CorsConfig, isAllowedCorsOrigin, type CorsOptions } from "@opencode-ai/server/cors"
import { compressionLayer } from "@/server/routes/instance/httpapi/middleware/compression"
import { corsVaryFix } from "@/server/routes/instance/httpapi/middleware/cors-vary"
import { errorLayer } from "@/server/routes/instance/httpapi/middleware/error"
import { fenceLayer } from "@/server/routes/instance/httpapi/middleware/fence"
import * as AnacondaDesktop from "@/auracode/anaconda-desktop/service"
import { SessionHost } from "@/auracode/session-hosting"
import { EffectFlock } from "@opencode-ai/core/util/effect-flock"
import { AppNodeBuilderV1 } from "@/effect/app-node-builder-v1" // auracode_change - defaultLayer aliases are gone

import { AuraViewers } from "@/auracode/presence/service" // auracode_change
import { agentBuilderHandlers } from "./handlers/agent-builder"
import { agentUsageHandlers } from "./handlers/agent-usage"
import { anacondaDesktopHandlers } from "./handlers/anaconda-desktop"
import { backgroundProcessHandlers } from "./handlers/background-process"
import { branchNameHandlers } from "./handlers/branch-name"
import { commitMessageHandlers } from "./handlers/commit-message"
import { cloudAgentHandlers } from "./handlers/cloud-agent"
import { configConsoleHandlers } from "./handlers/config-console"
import { enhancePromptHandlers } from "./handlers/enhance-prompt"
import { indexingHandlers } from "./handlers/indexing"
import { instanceReloadHandlers } from "./handlers/instance-reload"
import { auraGatewayHandlers } from "./handlers/aura-gateway"
import { auracodeHandlers } from "./handlers/auracode"
import { memoryHandlers } from "./handlers/memory"
import { migrateHandlers } from "./handlers/migrate"
import { networkHandlers } from "./handlers/network"
import { remoteHandlers } from "./handlers/remote"
import { sandboxHandlers } from "./handlers/sandbox"
import { sessionHostHandlers } from "./handlers/session-host"
import { sessionImportHandlers } from "./handlers/session-import"
import { suggestionHandlers } from "./handlers/suggestion"

export const provide = Layer.provide([
  agentBuilderHandlers,
  agentUsageHandlers,
  anacondaDesktopHandlers.pipe(Layer.provide(AnacondaDesktop.liveLayer)),
  backgroundProcessHandlers,
  branchNameHandlers,
  commitMessageHandlers,
  cloudAgentHandlers,
  configConsoleHandlers,
  enhancePromptHandlers,
  indexingHandlers,
  instanceReloadHandlers,
  auraGatewayHandlers,
  auracodeHandlers,
  memoryHandlers,
  migrateHandlers,
  networkHandlers,
  remoteHandlers,
  sandboxHandlers,
  sessionHostHandlers.pipe(Layer.provide(SessionHost.layer())),
  sessionImportHandlers,
  suggestionHandlers,
])

export function provideListener(opts?: CorsOptions) {
  const cors = HttpRouter.middleware(
    HttpMiddleware.cors({
      allowedOrigins: (origin) => isAllowedCorsOrigin(origin, opts),
      maxAge: 86_400,
    }),
    { global: true },
  )
  return Layer.provide([
    errorLayer,
    compressionLayer,
    corsVaryFix,
    fenceLayer,
    cors,
    AuraViewers.defaultLayer, // auracode_change
    AppNodeBuilderV1.build(EffectFlock.node),
    FetchHttpClient.layer,
    HttpServer.layerServices,
    Layer.succeed(CorsConfig)(opts),
  ])
}
