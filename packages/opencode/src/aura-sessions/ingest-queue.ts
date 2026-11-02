import { ulid } from "ulid"
import type * as SDK from "@auracode/sdk/v2"
import type { AuraSession } from "@/auracode/session"

export namespace IngestQueue {
  export type Client = {
    url: string
    fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
  }

  export type CloseReason = AuraSession.CloseReason

  export type Data =
    | {
        type: "aura_meta"
        data: {
          platform: string
          orgId?: string
          gitUrl?: string
          gitBranch?: string
        }
      }
    | {
        type: "session"
        data: SDK.Session
      }
    | {
        type: "message"
        data: SDK.Message
      }
    | {
        type: "part"
        data: SDK.Part
      }
    | {
        type: "session_diff"
        data: SDK.SnapshotFileDiff[]
      }
    | {
        type: "model"
        data: SDK.Model[]
      }
    | {
        type: "session_open"
        data: Record<string, never>
      }
    | {
        type: "session_close"
        data: { reason: CloseReason }
      }
    | {
        type: "session_status"
        data: SessionStatus & (SessionStatusSnapshot | SessionStatusTransition)
      }
    | {
        type: "session_pr_link"
        data: { platform: string | null; prUrl: string | null; prNumber: number | null }
      }
    | {
        type: "agent_notification"
        data: { id: string; message: string }
      }

  type StatusName = "idle" | "busy" | "question" | "permission" | "retry" | "scheduled"

  type SessionStatus = {
    status: StatusName
    // scheduled wakeups: the ISO-8601 due time, present only with status
    // "scheduled".
    scheduledAt?: string
  }

  // Historical snapshots omit onset; known transitions replay this whole tuple unchanged.
  type SessionStatusSnapshot = { occurredAt?: never; previousStatus?: never; transitionId?: never }

  type SessionStatusTransition = {
    occurredAt: string
    previousStatus: StatusName | null
    transitionId: string
  }

  type Share = {
    ingestPath: string
  }

  type Timer = ReturnType<typeof setTimeout>

  export type Options = {
    getShare: (sessionId: string) => Promise<Share | undefined>
    getClient: () => Promise<Client | undefined>
    onAuthError?: () => void
    log: {
      info?: (message: string, data: Record<string, unknown>) => void
      error: (message: string, data: Record<string, unknown>) => void
    }
    now?: () => number
    setTimeout?: (fn: () => void, ms: number) => Timer
    clearTimeout?: (timer: Timer) => void
  }

  /** Cloud synchronization has been removed. No message data is queued. */
  export function create(_options: Options) {
    return {
      async sync(_session: string, _data: Data[]) {
        return false
      },
      async flush(_session: string) {},
      async drain(_bound = 3000) {},
    } as const
  }
}
