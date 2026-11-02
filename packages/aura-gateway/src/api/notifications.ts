import { z } from "zod"
import { AURA_API_BASE } from "./constants.js"
import { getDefaultHeaders, buildAuraHeaders } from "../headers.js"

/**
 * Aura notification schema
 */
export const AuracodeNotificationSchema = z.object({
  id: z.string(),
  title: z.string(),
  message: z.string(),
  action: z
    .object({
      actionText: z.string(),
      actionURL: z.string(),
    })
    .optional(),
  showIn: z.array(z.string()).optional(),
  suggestModelId: z.string().optional(),
})

export type AuracodeNotification = z.infer<typeof AuracodeNotificationSchema>

const NotificationsResponseSchema = z.object({
  notifications: z.array(AuracodeNotificationSchema),
})

const NOTIFICATIONS_TIMEOUT_MS = 5000

/**
 * Fetch notifications from Aura API
 *
 * @param options - Configuration with token and optional organization ID
 * @returns Array of notifications from the Aura API (clients filter by showIn)
 */
export async function fetchAuracodeNotifications(options: {
  auracodeToken?: string
  auracodeOrganizationId?: string
}): Promise<AuracodeNotification[]> {
  const token = options.auracodeToken
  if (!token) return []

  const url = `${AURA_API_BASE}/api/users/notifications`

  try {
    const response = await fetch(url, {
      headers: {
        ...getDefaultHeaders(),
        ...buildAuraHeaders(undefined, { auracodeOrganizationId: options.auracodeOrganizationId }),
        Authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(NOTIFICATIONS_TIMEOUT_MS),
    })

    if (!response.ok) return []

    const json = await response.json()
    const result = NotificationsResponseSchema.safeParse(json)

    if (!result.success) return []

    return result.data.notifications
  } catch {
    return []
  }
}
