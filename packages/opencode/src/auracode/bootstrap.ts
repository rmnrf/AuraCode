import { Cause, Context, Effect, Layer } from "effect"
import { EffectBridge } from "@/effect/bridge"
import { AuraSessions } from "@/aura-sessions/aura-sessions"
import * as Log from "@opencode-ai/core/util/log"
import { Global } from "@opencode-ai/core/global"
import { InstallationVersion } from "@opencode-ai/core/installation/version"
import path from "node:path"
import { Bus } from "@/bus"
import { Config } from "@/config/config"
import { Provider } from "@/provider/provider"
import { Session } from "@/session/session"
import { SessionSummary } from "@/session/summary"
import { SessionExport } from "@/auracode/session-export"
import { createWorkspaceProvider } from "@/auracode/session-export/workspace-provider"
import { Instance } from "@/auracode/instance"
import { InstanceRef } from "@/effect/instance-ref"
import { Identity } from "@auracode/aura-telemetry"
import { MemoryLifecycle } from "@/auracode/memory/turn"
import { MemoryService } from "@auracode/aura-memory/effect/service"
import { MemoryEvents } from "@/auracode/memory/events"
import { installMemoryRuntime } from "@/auracode/memory/runtime"
import { AuraToolRegistry } from "@/auracode/tool/registry"
import { Wakeup } from "@/auracode/wakeup"
import { LayerNode } from "@opencode-ai/core/effect/layer-node"
import { AuracodeWatcher } from "@/auracode/watcher"
import { AppNodeBuilder } from "@opencode-ai/core/effect/app-node-builder" // auracode_change

const log = Log.create({ service: "auracode-bootstrap" })

export namespace AuracodeBootstrap {
  export interface Interface {
    readonly init: () => Effect.Effect<void, unknown>
  }

  export class Service extends Context.Service<Service, Interface>()("@auracode/Bootstrap") {}

  export const layer = Layer.effect(
    Service,
    Effect.gen(function* () {
      // Bind the package memory effect layer to opencode (paths, instance binder, logger, event sink).
      installMemoryRuntime()
      const aura = yield* AuraSessions.Service
      const bus = yield* Bus.Service
      const sessions = yield* Session.Service
      const summary = yield* SessionSummary.Service
      const provider = yield* Provider.Service
      const config = yield* Config.Service
      const memory = yield* MemoryService.Service
      const watcher = yield* AuracodeWatcher.Service
      const wake = yield* Wakeup.Service

      const init = Effect.fn("AuracodeBootstrap.init")(function* () {
        yield* watcher.init()
        yield* aura.init()
        yield* MemoryLifecycle.subscribe({ bus, sessions, summary, provider, config, memory })
        // Invalidate enabled cache on every memory state mutation (properties.directory holds the memory root).
        yield* bus.subscribeCallback(MemoryEvents.Status, (evt) =>
          AuraToolRegistry.invalidateMemoryEnabled(evt.properties.directory),
        )
        yield* bus.subscribeCallback(MemoryEvents.Updated, (evt) =>
          AuraToolRegistry.invalidateMemoryEnabled(evt.properties.directory),
        )
        // Re-arm this directory's persisted wakeups on every instance start: overdue ones
        // fire immediately, the rest get their timers. A failure must not block bootstrap.
        const inst = yield* InstanceRef
        if (inst) {
          yield* wake.adopt(inst.directory).pipe(
            Effect.catchCause((cause) =>
              Effect.sync(() => log.warn("wakeup adopt failed", { err: Cause.squash(cause) })),
            ),
          )
        }
        // Session export bootstrap.
        yield* Effect.gen(function* () {
          if (!SessionExport.enabled) return
          const anon = yield* EffectBridge.fromPromise(() =>
            Identity.getMachineId().catch((err) => {
              log.warn("session export identity failed", { err })
              return undefined
            }),
          )
          SessionExport.init({
            agentVersion: InstallationVersion,
            anonId: anon,
            dbPath: path.join(Global.Path.data, "session-export.db"),
            workspaceKey: Instance.directory,
            subscribeAll: (cb) => Bus.subscribeAll(cb),
            snapshotProvider: createWorkspaceProvider({
              root: Instance.directory,
              statePath: path.join(Global.Path.data, "session-export-workspace.json"),
            }),
          })
        }).pipe(
          Effect.catchCause((cause) =>
            Effect.sync(() => log.warn("session export bootstrap failed", { err: Cause.squash(cause) })),
          ),
        )
        if (process.env["AURA_PLATFORM"] !== "vscode") {
          yield* EffectBridge.fromPromise(() =>
            import("@/auracode/indexing").then((mod) => mod.AuraIndexing.init()),
          ).pipe(
            Effect.catchCause((cause) =>
              Effect.sync(() => log.warn("indexing bootstrap failed", { err: Cause.squash(cause) })),
            ),
            Effect.forkDetach,
          )
        }
      })

      return Service.of({ init })
    }),
  )

  export const defaultLayer = layer.pipe(
    Layer.provide([
      AuraSessions.defaultLayer,
      Session.defaultLayer,
      AppNodeBuilder.build(SessionSummary.node),
      AppNodeBuilder.build(Provider.node),
      AppNodeBuilder.build(Config.node),
      MemoryService.layer,
      Bus.defaultLayer,
      AuracodeWatcher.defaultLayer,
      AppNodeBuilder.build(Wakeup.node),
    ]),
  )

  const memory = LayerNode.make({ service: MemoryService.Service, layer: MemoryService.layer, deps: [] })
  const watcher = LayerNode.make({ service: AuracodeWatcher.Service, layer: AuracodeWatcher.defaultLayer, deps: [] })
  export const node = LayerNode.suspend(() =>
    LayerNode.make({
      service: Service,
      layer,
      deps: [
        AuraSessions.node,
        Session.node,
        SessionSummary.node,
        Provider.node,
        Config.node,
        memory,
        Bus.node,
        watcher,
        Wakeup.node,
      ],
    }),
  )
}
