// auracode_change - local providers are configured explicitly; no remote catalog.
import * as Core from "@opencode-ai/core/models-dev"
import { Context, Effect, Layer } from "effect"
import { LayerNode } from "@opencode-ai/core/effect/layer-node"
import { AppNodeBuilder } from "@opencode-ai/core/effect/app-node-builder"
export const Model = Core.Model
export type Model = Core.Model
export const Provider = Core.Provider
export type Provider = Core.Provider
export const CatalogModelStatus = Core.CatalogModelStatus
export type CatalogModelStatus = Core.CatalogModelStatus
export interface Interface extends Core.Interface {
  readonly getFailure: (id: string) => Effect.Effect<undefined>
}
export class Service extends Context.Service<Service, Interface>()("@opencode/ModelsDev") {}
export const layer = Layer.succeed(
  Service,
  Service.of({
    get: () => Effect.succeed({}),
    refresh: () => Effect.void,
    getFailure: () => Effect.succeed(undefined),
  }),
)
export const node = LayerNode.make({ service: Service, layer, deps: [] })
export const defaultLayer: Layer.Layer<Service> = Layer.suspend(() => AppNodeBuilder.build(node))
export { AI_SDK_PROVIDERS, PROMPTS } from "@auracode/aura-gateway"
export * as ModelsDev from "./models"
