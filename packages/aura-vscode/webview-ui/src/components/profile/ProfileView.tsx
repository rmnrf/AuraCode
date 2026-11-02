import { Component } from "solid-js"
import { Card } from "@auracode/aura-ui/card"
import type { ProfileData, ProviderUsageData, DeviceAuthState } from "../../types/messages"

export type { ProfileData }

export interface ProfileViewProps {
  profileData: ProfileData | null | undefined
  deviceAuth: DeviceAuthState
  providerUsage?: ProviderUsageData
  providerUsageLoading?: boolean
  providerUsageError?: string
  onLogin: () => void
  onRequestProviderUsage?: () => void
  onRefreshProviderUsage?: () => void
}

const formatBalance = (amount: number): string => {
  return `$${amount.toFixed(2)}`
}

const PERSONAL = "personal"

interface OrgOption {
  value: string
  label: string
  description?: string
}

const ProfileView: Component<ProfileViewProps> = () => (
  <Card>
    <h3>AuraCode</h3>
    <p>Local mode. Configure your OpenAI-compatible server in Settings → Providers.</p>
  </Card>
)
export default ProfileView
