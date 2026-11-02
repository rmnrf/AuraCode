import type { DesktopTheme } from "@opencode-ai/ui/theme/types"
import { DEFAULT_THEMES as UPSTREAM_THEMES } from "@opencode-ai/ui/theme/default-themes"
import auraJson from "./themes/aura.json"
import auraVscodeJson from "./themes/aura-vscode.json"

// Re-export all upstream theme constants
export {
  oc2Theme,
  tokyonightTheme,
  draculaTheme,
  monokaiTheme,
  solarizedTheme,
  nordTheme,
  catppuccinTheme,
  ayuTheme,
  oneDarkProTheme,
  shadesOfPurpleTheme,
  nightowlTheme,
  vesperTheme,
  carbonfoxTheme,
  gruvboxTheme,
  auraTheme as upstreamAuraTheme,
} from "@opencode-ai/ui/theme/default-themes"

export const auraTheme = auraJson as DesktopTheme
export const auraVscodeTheme = auraVscodeJson as DesktopTheme

export const AURA_THEMES: Record<string, DesktopTheme> = {
  aura: auraTheme,
  "aura-vscode": auraVscodeTheme,
}

// Override DEFAULT_THEMES: Aura themes first, then upstream
export const DEFAULT_THEMES: Record<string, DesktopTheme> = {
  ...UPSTREAM_THEMES,
  ...AURA_THEMES,
}
