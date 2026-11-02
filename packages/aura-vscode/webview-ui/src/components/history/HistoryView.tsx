/**
 * HistoryView component
 * Unified panel for local, cloud, and optional worktree session history.
 * Contains a source tab bar and an always-visible "Import session" button.
 */

/**
 * HistoryView component
 * Unified panel for local, cloud, and optional worktree session history.
 * Contains a source tab bar and an always-visible "Import session" button.
 */
import { Component, type Accessor, type JSX } from "solid-js"
import { Button } from "@auracode/aura-ui/button"
import SessionList from "./SessionList"
import type { SessionInfo } from "../../types/messages"

interface HistoryViewProps {
  onSelectSession: (id: string) => void
  onBack?: () => void
  worktreeSessionIds?: Accessor<ReadonlySet<string> | undefined>
  /** Filter the Local tab to these session ids. */
  sessionIds?: Accessor<ReadonlySet<string> | undefined>
  /** Extra per-row actions rendered in the Local tab. */
  rowActions?: (session: SessionInfo) => JSX.Element
}

type Source = "local" | "cloud" | "worktree"

const EMPTY_SESSION_IDS = new Set<string>()

const HistoryView: Component<HistoryViewProps> = (props) => (
  <div class="history-view">
    <div class="history-view-header">
      <Button variant="ghost" size="small" icon="arrow-left" onClick={() => props.onBack?.()}>
        Back
      </Button>
    </div>
    <div class="history-view-content">
      <SessionList
        onSelectSession={props.onSelectSession}
        sessionIds={props.sessionIds}
        rowActions={props.rowActions}
      />
    </div>
  </div>
)
export default HistoryView
