import type { BuiltinTuiPlugin } from "@opencode-ai/tui/builtins"
import HomeNews from "@/auracode/plugins/home-news"
import HomeOnboarding from "@/auracode/plugins/home-onboarding"
import Attention from "@/auracode/plugins/attention"
import HomeFooter from "@/auracode/plugins/home-footer"
import Permissions from "@/auracode/plugins/permissions"
import SidebarFooter from "@/auracode/plugins/sidebar-footer"
import MemoryStatus from "@/auracode/plugins/memory-status"
import MemoryPalette from "@/auracode/plugins/memory-palette"
import SidebarProcesses from "@/auracode/plugins/sidebar-background-processes"
import SidebarIndexing from "@/auracode/plugins/sidebar-indexing"
import SidebarPr from "@/auracode/plugins/sidebar-pr"
import SidebarUsage from "@/auracode/plugins/sidebar-usage"
import Sandbox from "@/auracode/plugins/sandbox"
import Remote from "@/auracode/plugins/remote"
import Reload from "@/auracode/plugins/reload"
import SessionSwitcher from "@/auracode/plugins/session-switcher"
import SessionV2Debug from "@/auracode/plugins/session-v2-debug"
import type { RuntimeFlags } from "@/effect/runtime-flags"

const plugins = [
  HomeNews,
  HomeOnboarding,
  Attention,
  HomeFooter,
  Permissions,
  SidebarFooter,
  MemoryStatus,
  MemoryPalette,
  SidebarProcesses,
  SidebarIndexing,
  SidebarPr,
  SidebarUsage,
  Sandbox,
  Remote,
  Reload,
] satisfies BuiltinTuiPlugin[]

export function withAuraTuiPlugins(
  builtins: BuiltinTuiPlugin[],
  flags: Pick<RuntimeFlags.Info, "experimentalEventSystem" | "experimentalSessionSwitcher">,
) {
  return [
    ...plugins,
    ...(flags.experimentalEventSystem ? [SessionV2Debug] : []),
    ...(flags.experimentalSessionSwitcher ? [SessionSwitcher] : []),
    ...builtins,
  ]
}
