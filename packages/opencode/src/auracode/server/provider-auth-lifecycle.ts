import { InstanceStore } from "@/project/instance-store"
import { ModelCache } from "@/provider/model-cache"
import { AuraViewers } from "@/auracode/presence/service" // auracode_change
import { Effect } from "effect"

export const disposeAllInstancesAfterProviderAuthCallback = Effect.fn(
  "AuraServer.disposeAllInstancesAfterProviderAuthCallback",
)(function* () {
  const store = yield* InstanceStore.Service
  yield* store.disposeAll()
})

// auracode_change start - drop the old presence socket; callers invoke this for the "aura" provider only
export const invalidatePresence = Effect.fn("AuraServer.invalidatePresence")(function* () {
  const viewers = yield* AuraViewers.Service
  yield* viewers.invalidateAuth()
})
// auracode_change end

export const invalidateAfterProviderAuthChange = Effect.fn("AuraServer.invalidateAfterProviderAuthChange")(function* (
  providerID: string,
) {
  const cache = yield* ModelCache.Service
  yield* cache.clear(providerID)
  yield* disposeAllInstancesAfterProviderAuthCallback()
})
