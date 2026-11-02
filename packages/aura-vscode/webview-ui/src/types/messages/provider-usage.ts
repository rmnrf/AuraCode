import type { ProviderUsage } from "@auracode/sdk/v2/client"

export type ProviderUsageData = ProviderUsage

export interface ProviderUsageLoadedMessage {
  type: "providerUsageLoaded"
  data?: ProviderUsageData
  error?: string
  reset?: boolean
}

export interface RequestProviderUsageMessage {
  type: "requestProviderUsage"
}

export interface RefreshProviderUsageMessage {
  type: "refreshProviderUsage"
}
