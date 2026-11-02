import { type Component, type JSX, For, Show } from "solid-js"
import { Icon } from "@auracode/aura-ui/icon"
import { useDialog } from "@auracode/aura-ui/context/dialog"
import { useSession } from "../../context/session"
import { useLanguage } from "../../context/language"
import { recentSessions } from "../../context/session-utils"
import type { SessionInfo } from "../../types/messages"
import { formatRelativeDate } from "../../utils/date"
import { WorkspaceScopeHint } from "./WorkspaceScopeHint"

interface WelcomeEmptyStateProps {
  sessions?: () => SessionInfo[]
  onSelectSession?: (id: string) => void
  onShowHistory?: () => void
  footer?: JSX.Element
}

/**
 * Square Aura mark. Hover rotates the mark and crossfades to the yellow Lottie animation,
 * matching Aura Cloud's header logo. The player mounts on first hover so the WASM renderer
 * never delays the empty state; the static mark stays visible until the player can draw, so a
 * slow or failed load never leaves an empty square.
 */
export const AuraLogo = () => (
  <div class="aura-logo" aria-label="AuraCode">
    <strong>A</strong>
  </div>
)

export const WelcomeEmptyState: Component<WelcomeEmptyStateProps> = (props) => {
  const session = useSession()
  const language = useLanguage()
  const dialog = useDialog()
  const recent = () => recentSessions(props.sessions?.() ?? session.sessions())

  return (
    <div class="message-list-empty">
      <AuraLogo />
      <p class="aura-about-text">{language.t("session.messages.welcome")}</p>
      <WorkspaceScopeHint />
      <Show when={recent().length > 0 && props.onSelectSession}>
        <div class="recent-sessions">
          <span class="recent-sessions-label">{language.t("session.recent")}</span>
          <For each={recent()}>
            {(item) => (
              <button class="recent-session-item" onClick={() => props.onSelectSession?.(item.id)}>
                <span class="recent-session-title" dir="auto">
                  {item.title || language.t("session.untitled")}
                </span>
                <span class="recent-session-date">{formatRelativeDate(item.updatedAt)}</span>
              </button>
            )}
          </For>
          <Show when={props.onShowHistory}>
            <button class="show-history-btn" onClick={() => props.onShowHistory?.()}>
              <Icon name="history" size="small" />
              {language.t("session.showHistory")}
            </button>
          </Show>
        </div>
      </Show>
      {props.footer}
    </div>
  )
}
