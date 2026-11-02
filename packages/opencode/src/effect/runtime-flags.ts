import { Config, ConfigProvider, Context, Effect, Layer, Option } from "effect"
import { ConfigService } from "@/effect/config-service"

const bool = (name: string) => Config.boolean(name).pipe(Config.withDefault(false))
const positiveInteger = (name: string) =>
  Config.number(name).pipe(
    Config.map((value) => (Number.isInteger(value) && value > 0 ? value : undefined)),
    Config.orElse(() => Config.succeed(undefined)),
  )
const experimental = bool("AURA_EXPERIMENTAL")
const enabledByExperimental = (name: string) =>
  Config.all({ experimental, enabled: Config.boolean(name).pipe(Config.option) }).pipe(
    Config.map((flags) => Option.getOrElse(flags.enabled, () => flags.experimental)),
  )

export class Service extends ConfigService.Service<Service>()("@opencode/RuntimeFlags", {
  autoShare: bool("AURA_AUTO_SHARE"),
  pure: bool("AURA_PURE"),
  disableDefaultPlugins: bool("AURA_DISABLE_DEFAULT_PLUGINS"),
  disableChannelDb: bool("AURA_DISABLE_CHANNEL_DB"), // auracode_change
  disableEmbeddedWebUi: bool("AURA_DISABLE_EMBEDDED_WEB_UI"),
  disableExternalSkills: bool("AURA_DISABLE_EXTERNAL_SKILLS"),
  disableSkillShell: bool("AURA_DISABLE_SKILL_SHELL"), // auracode_change - disable shell injection in skill bodies
  disableLspDownload: bool("AURA_DISABLE_LSP_DOWNLOAD"),
  skipMigrations: bool("AURA_SKIP_MIGRATIONS"), // auracode_change
  disableClaudeCodePrompt: Config.all({
    broad: bool("AURA_DISABLE_CLAUDE_CODE"),
    direct: bool("AURA_DISABLE_CLAUDE_CODE_PROMPT"),
  }).pipe(Config.map((flags) => flags.broad || flags.direct)),
  disableClaudeCodeSkills: Config.all({
    broad: bool("AURA_DISABLE_CLAUDE_CODE"),
    direct: bool("AURA_DISABLE_CLAUDE_CODE_SKILLS"),
  }).pipe(Config.map((flags) => flags.broad || flags.direct)),
  enableExa: Config.all({
    experimental,
    enabled: bool("AURA_ENABLE_EXA"),
    legacy: bool("AURA_EXPERIMENTAL_EXA"),
  }).pipe(Config.map((flags) => flags.experimental || flags.enabled || flags.legacy)),
  enableParallel: Config.all({
    enabled: bool("AURA_ENABLE_PARALLEL"),
    legacy: bool("AURA_EXPERIMENTAL_PARALLEL"),
  }).pipe(Config.map((flags) => flags.enabled || flags.legacy)),
  enableExperimentalModels: bool("AURA_ENABLE_EXPERIMENTAL_MODELS"),
  enableQuestionTool: bool("AURA_ENABLE_QUESTION_TOOL"),
  experimentalScout: enabledByExperimental("AURA_EXPERIMENTAL_SCOUT"), // auracode_change
  experimentalReferences: enabledByExperimental("AURA_EXPERIMENTAL_REFERENCES"),
  // auracode_change start - enabled by default, with an opt-out kill switch
  experimentalBackgroundSubagents: Config.boolean("AURA_EXPERIMENTAL_BACKGROUND_SUBAGENTS").pipe(
    Config.withDefault(true),
  ),
  // auracode_change end
  experimentalLspTy: bool("AURA_EXPERIMENTAL_LSP_TY"),
  experimentalLspTool: enabledByExperimental("AURA_EXPERIMENTAL_LSP_TOOL"),
  // auracode_change start - self-context tools
  experimentalContextTools: enabledByExperimental("AURA_EXPERIMENTAL_CONTEXT_TOOLS"),
  // auracode_change end
  experimentalOxfmt: enabledByExperimental("AURA_EXPERIMENTAL_OXFMT"),
  experimentalCodeMode: enabledByExperimental("AURA_EXPERIMENTAL_CODE_MODE"),
  experimentalEventSystem: enabledByExperimental("AURA_EXPERIMENTAL_EVENT_SYSTEM"),
  experimentalSessionSwitcher: enabledByExperimental("AURA_EXPERIMENTAL_SESSION_SWITCHER"), // auracode_change
  // auracode_change start - enabled by default, with an opt-out kill switch
  experimentalSharedAgentBoard: Config.boolean("AURA_EXPERIMENTAL_SHARED_AGENT_BOARD").pipe(Config.withDefault(true)),
  // auracode_change end
  experimentalWorkspaces: enabledByExperimental("AURA_EXPERIMENTAL_WORKSPACES"),
  experimentalIconDiscovery: enabledByExperimental("AURA_EXPERIMENTAL_ICON_DISCOVERY"),
  experimentalMcpApps: enabledByExperimental("AURA_EXPERIMENTAL_MCP_APPS"), // auracode_change
  outputTokenMax: positiveInteger("AURA_EXPERIMENTAL_OUTPUT_TOKEN_MAX"),
  bashDefaultTimeoutMs: positiveInteger("AURA_EXPERIMENTAL_BASH_DEFAULT_TIMEOUT_MS"),
  experimentalNativeLlm: bool("AURA_EXPERIMENTAL_NATIVE_LLM"),
  experimentalWebSockets: bool("AURA_EXPERIMENTAL_WEBSOCKETS"),
  client: Config.string("AURA_CLIENT").pipe(Config.withDefault("cli")),
}) {}

export type Info = Context.Service.Shape<typeof Service>

const emptyConfigLayer = Service.layer.pipe(
  Layer.provide(ConfigProvider.layer(ConfigProvider.fromUnknown({}))),
  Layer.orDie,
)

export const layer = (overrides: Partial<Info> = {}) =>
  Layer.effect(
    Service,
    Effect.gen(function* () {
      const flags = yield* Service
      return Service.of({ ...flags, ...overrides })
    }),
  ).pipe(Layer.provide(emptyConfigLayer))

export const node = LayerNode.make({ service: Service, layer: Service.layer.pipe(Layer.orDie), deps: [] })

export * as RuntimeFlags from "./runtime-flags"
import { LayerNode } from "@opencode-ai/core/effect/layer-node"
