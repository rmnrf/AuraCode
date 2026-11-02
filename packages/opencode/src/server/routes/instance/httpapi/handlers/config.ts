import { Config } from "@/config/config"
// auracode_change start - preserve Aura API default model overlay
import { recommend } from "@/auracode/provider/catalog"
import { Auth } from "@/auth"
import { Option } from "effect"
import { ProviderV2 } from "@opencode-ai/core/provider"
import { ModelV2 } from "@opencode-ai/core/model"
import { filterPromptTrainingModels, nonEmptyProviders } from "@/auracode/provider/model-filter"
// auracode_change end
import { Provider } from "@/provider/provider"
import * as InstanceState from "@/effect/instance-state"
import { Effect } from "effect"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { InstanceHttpApi } from "../api"
import { markInstanceForDisposal } from "../lifecycle"

export const configHandlers = HttpApiBuilder.group(InstanceHttpApi, "config", (handlers) =>
  Effect.gen(function* () {
    const providerSvc = yield* Provider.Service
    const configSvc = yield* Config.Service
    const auth = yield* Auth.Service // auracode_change

    const get = Effect.fn("ConfigHttpApi.get")(function* () {
      return yield* configSvc.get()
    })

    const update = Effect.fn("ConfigHttpApi.update")(function* (ctx) {
      yield* configSvc.update(ctx.payload)
      yield* markInstanceForDisposal(yield* InstanceState.context)
      return ctx.payload
    })

    // auracode_change start
    const warnings = Effect.fn("ConfigHttpApi.warnings")(function* () {
      return yield* configSvc.warnings()
    })
    // auracode_change end

    const providers = Effect.fn("ConfigHttpApi.providers")(function* () {
      // auracode_change start
      const config = yield* configSvc.get()
      const providers = filterPromptTrainingModels(
        yield* providerSvc.list(),
        config.hide_prompt_training_models === true,
      )
      const defaults = Provider.defaultModelIDs(nonEmptyProviders(providers))
      // auracode_change end

      // auracode_change start - Fetch default model from Aura API when the aura provider is available.
      if (defaults[ProviderV2.ID.aura]) {
        const info = yield* auth.get("aura").pipe(Effect.option)
        const model = yield* Effect.promise(() =>
          recommend(
            providers[ProviderV2.ID.aura].models,
            config.provider?.aura?.options,
            Option.getOrUndefined(info),
            Option.isSome(info),
          ),
        )
        if (model && providers[ProviderV2.ID.aura]?.models[model]) defaults[ProviderV2.ID.aura] = ModelV2.ID.make(model)
      }
      // auracode_change end

      return {
        providers: Object.values(providers).map(Provider.toPublicInfo),
        default: defaults,
      }
    })

    return handlers
      .handle("get", get)
      .handle("update", update)
      .handle("warnings", warnings)
      .handle("providers", providers) // auracode_change
  }),
)
