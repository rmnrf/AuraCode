// Aura notification types (mirrored from aura-gateway)
export interface AuracodeNotificationAction {
  actionText: string
  actionURL: string
}

export interface AuracodeNotification {
  id: string
  title: string
  message: string
  action?: AuracodeNotificationAction
  showIn?: string[]
  suggestModelId?: string
}

// Profile types from aura-gateway
export interface AuracodeBalance {
  balance: number
}

export interface AuraPassState {
  currentPeriodBaseCreditsUsd: number
  currentPeriodUsageUsd: number
  currentPeriodBonusCreditsUsd: number
  nextBillingAt?: string | null
}

export interface ProfileData {
  profile: {
    email: string
    name?: string
    organizations?: Array<{ id: string; name: string; role: string }>
    selectedOrganizationId?: string
    hasPersonalAccount?: boolean
  }
  balance: AuracodeBalance | null
  auraPass: AuraPassState | null
  currentOrgId: string | null
}
