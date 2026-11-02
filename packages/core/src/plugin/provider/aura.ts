import { createAura, AURA_OPENROUTER_BASE } from "@auracode/aura-gateway" // auracode_change
import { Effect } from "effect"
import { ProviderV2 } from "../../provider" // auracode_change
import { define } from "../internal"

const id = ProviderV2.ID.aura // auracode_change

export const AuraPlugin = define({
  id: "aura",
  effect: Effect.fn(function* (ctx) {
    yield* ctx.catalog.transform(
      Effect.fn(function* (evt) {
        for (const item of evt.provider.list()) {
          if (item.provider.id !== id) continue // auracode_change
          evt.provider.update(item.provider.id, (provider) => {
            // auracode_change start
            const options = provider.request.body
            const token = options.auracodeToken ?? options.apiKey ?? process.env.AURA_API_KEY
            const org = process.env.AURA_ORG_ID ?? options.auracodeOrganizationId

            provider.api = {
              type: "aisdk",
              package: "@auracode/aura-gateway",
              url: AURA_OPENROUTER_BASE,
            }
            // auracode_change end
            provider.request.headers["HTTP-Referer"] = "https://aura.ai/"
            // auracode_change start
            provider.request.headers["X-Title"] = "AuraCode"
            options.apiKey = token ?? "anonymous"
            options.auracodeToken = options.apiKey
            if (org) options.auracodeOrganizationId = org
            // auracode_change end
          })
        }
      }),
    )
    // auracode_change start
    yield* ctx.aisdk.sdk(
      Effect.fn(function* (evt) {
        if (evt.model.providerID !== id) return
        evt.sdk = createAura(evt.options)
      }),
    )
    // auracode_change end
  }),
})
