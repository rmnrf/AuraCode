import { createMemo, Match, Switch, type JSX } from "solid-js"
import { SplitBorder } from "@tui/ui/border"
import { useTheme } from "@tui/context/theme"
import { parseAuraErrorCode, auraErrorTitle, auraErrorDescription } from "@/auracode/aura-errors"
import type { AssistantMessage } from "@auracode/sdk/v2"

interface AuraErrorBlockProps {
  error: NonNullable<AssistantMessage["error"]>
  fallback: JSX.Element
}

export function AuraErrorBlock(props: AuraErrorBlockProps) {
  const { theme } = useTheme()

  const auraErrorCode = createMemo(() => {
    return parseAuraErrorCode(props.error)
  })

  const title = createMemo(() => {
    const code = auraErrorCode()
    return code ? auraErrorTitle(code) : undefined
  })

  const description = createMemo(() => {
    const code = auraErrorCode()
    return code ? auraErrorDescription(code) : undefined
  })

  return (
    <Switch fallback={props.fallback}>
      <Match when={auraErrorCode()}>
        <box
          border={["left"]}
          paddingTop={1}
          paddingBottom={1}
          paddingLeft={2}
          marginTop={1}
          backgroundColor={theme.backgroundPanel}
          customBorderChars={SplitBorder.customBorderChars}
          borderColor={theme.primary}
        >
          <text fg={theme.text}>{title()}</text>
          <text fg={theme.textMuted}>{description()}</text>
          <text fg={theme.primary}>{"Run /connect or `aura auth login` to connect to Aura Gateway"}</text>
        </box>
      </Match>
    </Switch>
  )
}
