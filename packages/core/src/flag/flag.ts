import { Config } from "effect"
import { InstallationChannel } from "../installation/version" // auracode_change

export function truthy(key: string) {
  const value = process.env[key]?.toLowerCase()
  return value === "true" || value === "1"
}

// auracode_change start
function falsy(key: string) {
  const value = process.env[key]?.toLowerCase()
  return value === "false" || value === "0"
}

const UNSTABLE_CHANNELS = new Set(["dev", "beta", "local"])
function unstableDefault(key: string) {
  return truthy(key) || (!falsy(key) && UNSTABLE_CHANNELS.has(InstallationChannel))
}

function number(key: string) {
  const value = process.env[key]
  if (!value) return undefined
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined
}

const AURA_EXPERIMENTAL = truthy("AURA_EXPERIMENTAL")
const AURA_DISABLE_CLAUDE_CODE = truthy("AURA_DISABLE_CLAUDE_CODE")
const AURA_DISABLE_CLAUDE_CODE_SKILLS = AURA_DISABLE_CLAUDE_CODE || truthy("AURA_DISABLE_CLAUDE_CODE_SKILLS")
// auracode_change end
const copy = process.env["AURA_EXPERIMENTAL_DISABLE_COPY_ON_SELECT"]
const fff = process.env["AURA_DISABLE_FFF"]

function enabledByExperimental(key: string) {
  return process.env[key] === undefined ? truthy("AURA_EXPERIMENTAL") : truthy(key)
}

export const Flag = {
  OTEL_EXPORTER_OTLP_ENDPOINT: process.env["OTEL_EXPORTER_OTLP_ENDPOINT"],
  OTEL_EXPORTER_OTLP_HEADERS: process.env["OTEL_EXPORTER_OTLP_HEADERS"],

  AURA_AUTO_SHARE: truthy("AURA_AUTO_SHARE"), // auracode_change
  AURA_AUTO_HEAP_SNAPSHOT: truthy("AURA_AUTO_HEAP_SNAPSHOT"),
  AURA_GIT_BASH_PATH: process.env["AURA_GIT_BASH_PATH"],
  AURA_CONFIG: process.env["AURA_CONFIG"],
  AURA_CONFIG_CONTENT: process.env["AURA_CONFIG_CONTENT"],
  AURA_DISABLE_AUTOUPDATE: truthy("AURA_DISABLE_AUTOUPDATE"),
  AURA_ALWAYS_NOTIFY_UPDATE: truthy("AURA_ALWAYS_NOTIFY_UPDATE"),
  AURA_DISABLE_PRUNE: truthy("AURA_DISABLE_PRUNE"),
  AURA_DISABLE_TERMINAL_TITLE: truthy("AURA_DISABLE_TERMINAL_TITLE"),
  AURA_SHOW_TTFD: truthy("AURA_SHOW_TTFD"),
  // auracode_change start
  AURA_DISABLE_DEFAULT_PLUGINS: truthy("AURA_DISABLE_DEFAULT_PLUGINS"),
  AURA_DISABLE_LSP_DOWNLOAD: truthy("AURA_DISABLE_LSP_DOWNLOAD"),
  AURA_ENABLE_EXPERIMENTAL_MODELS: truthy("AURA_ENABLE_EXPERIMENTAL_MODELS"),
  // auracode_change end
  AURA_DISABLE_AUTOCOMPACT: truthy("AURA_DISABLE_AUTOCOMPACT"),
  AURA_DISABLE_MODELS_FETCH: truthy("AURA_DISABLE_MODELS_FETCH"),
  AURA_DISABLE_MOUSE: truthy("AURA_DISABLE_MOUSE"),
  // auracode_change start
  AURA_DISABLE_CLAUDE_CODE,
  AURA_DISABLE_CLAUDE_CODE_PROMPT: AURA_DISABLE_CLAUDE_CODE || truthy("AURA_DISABLE_CLAUDE_CODE_PROMPT"),
  AURA_DISABLE_CLAUDE_CODE_SKILLS,
  AURA_DISABLE_EXTERNAL_SKILLS: truthy("AURA_DISABLE_EXTERNAL_SKILLS"),
  AURA_EXPERIMENTAL_CUSTOMIZE_SKILL: unstableDefault("AURA_EXPERIMENTAL_CUSTOMIZE_SKILL"),
  // auracode_change end
  AURA_FAKE_VCS: process.env["AURA_FAKE_VCS"],
  AURA_SERVER_PASSWORD: process.env["AURA_SERVER_PASSWORD"],
  AURA_SERVER_USERNAME: process.env["AURA_SERVER_USERNAME"],
  AURA_ENABLE_QUESTION_TOOL: truthy("AURA_ENABLE_QUESTION_TOOL"), // auracode_change

  AURA_EXPERIMENTAL, // auracode_change

  AURA_EXPERIMENTAL_CLAUDE_MIGRATION: truthy("AURA_EXPERIMENTAL_CLAUDE_MIGRATION"), // auracode_change

  AURA_EXPERIMENTAL_FILEWATCHER: Config.boolean("AURA_EXPERIMENTAL_FILEWATCHER").pipe(Config.withDefault(false)), // auracode_change

  AURA_EXPERIMENTAL_DISABLE_FILEWATCHER: Config.boolean("AURA_EXPERIMENTAL_DISABLE_FILEWATCHER").pipe(
    Config.withDefault(false),
  ),

  AURA_EXPERIMENTAL_ICON_DISCOVERY: AURA_EXPERIMENTAL || truthy("AURA_EXPERIMENTAL_ICON_DISCOVERY"), // auracode_change

  AURA_EXPERIMENTAL_DISABLE_COPY_ON_SELECT:
    copy === undefined ? process.platform === "win32" : truthy("AURA_EXPERIMENTAL_DISABLE_COPY_ON_SELECT"),

  AURA_ENABLE_EXA: truthy("AURA_ENABLE_EXA") || AURA_EXPERIMENTAL || truthy("AURA_EXPERIMENTAL_EXA"), // auracode_change

  AURA_EXPERIMENTAL_BASH_DEFAULT_TIMEOUT_MS: number("AURA_EXPERIMENTAL_BASH_DEFAULT_TIMEOUT_MS"), // auracode_change

  AURA_EXPERIMENTAL_OUTPUT_TOKEN_MAX: number("AURA_EXPERIMENTAL_OUTPUT_TOKEN_MAX"), // auracode_change

  AURA_EXPERIMENTAL_OXFMT: AURA_EXPERIMENTAL || truthy("AURA_EXPERIMENTAL_OXFMT"), // auracode_change

  AURA_EXPERIMENTAL_LSP_TY: truthy("AURA_EXPERIMENTAL_LSP_TY"), // auracode_change

  AURA_EXPERIMENTAL_LSP_TOOL: AURA_EXPERIMENTAL || truthy("AURA_EXPERIMENTAL_LSP_TOOL"), // auracode_change

  AURA_EXPERIMENTAL_SCOUT: AURA_EXPERIMENTAL || truthy("AURA_EXPERIMENTAL_SCOUT"), // auracode_change

  AURA_EXPERIMENTAL_MARKDOWN: !falsy("AURA_EXPERIMENTAL_MARKDOWN"), // auracode_change

  AURA_ENABLE_PARALLEL: truthy("AURA_ENABLE_PARALLEL") || truthy("AURA_EXPERIMENTAL_PARALLEL"), // auracode_change

  AURA_MODELS_URL: process.env["AURA_MODELS_URL"],

  AURA_MODELS_PATH: process.env["AURA_MODELS_PATH"],

  AURA_DISABLE_EMBEDDED_WEB_UI: truthy("AURA_DISABLE_EMBEDDED_WEB_UI"), // auracode_change

  AURA_DB: process.env["AURA_DB"],

  AURA_DISABLE_CHANNEL_DB: truthy("AURA_DISABLE_CHANNEL_DB"), // auracode_change

  AURA_SKIP_MIGRATIONS: truthy("AURA_SKIP_MIGRATIONS"), // auracode_change

  AURA_STRICT_CONFIG_DEPS: truthy("AURA_STRICT_CONFIG_DEPS"), // auracode_change

  AURA_WORKSPACE_ID: process.env["AURA_WORKSPACE_ID"],

  AURA_EXPERIMENTAL_WORKSPACES: enabledByExperimental("AURA_EXPERIMENTAL_WORKSPACES"),

  AURA_EXPERIMENTAL_EVENT_SYSTEM: AURA_EXPERIMENTAL || truthy("AURA_EXPERIMENTAL_EVENT_SYSTEM"), // auracode_change

  AURA_EXPERIMENTAL_SESSION_SWITCHING: AURA_EXPERIMENTAL || truthy("AURA_EXPERIMENTAL_SESSION_SWITCHING"), // auracode_change

  AURA_EXPERIMENTAL_SESSION_SWITCHER: enabledByExperimental("AURA_EXPERIMENTAL_SESSION_SWITCHER"), // auracode_change

  AURA_DISABLE_FFF: fff === undefined ? process.platform === "win32" : truthy("AURA_DISABLE_FFF"), // auracode_change

  get AURA_DISABLE_PROJECT_CONFIG() {
    return truthy("AURA_DISABLE_PROJECT_CONFIG")
  },
  get AURA_EXPERIMENTAL_REFERENCES() {
    return enabledByExperimental("AURA_EXPERIMENTAL_REFERENCES")
  },
  get AURA_TUI_CONFIG() {
    return process.env["AURA_TUI_CONFIG"]
  },
  get AURA_CONFIG_DIR() {
    return process.env["AURA_CONFIG_DIR"]
  },
  get AURA_PURE() {
    return truthy("AURA_PURE")
  },
  get AURA_PERMISSION() {
    return process.env["AURA_PERMISSION"]
  },
  get AURA_PLUGIN_META_FILE() {
    return process.env["AURA_PLUGIN_META_FILE"]
  },
  get AURA_CLIENT() {
    return process.env["AURA_CLIENT"] ?? "cli"
  },
  // auracode_change start
  get AURA_SESSION_RETRY_LIMIT() {
    return number("AURA_SESSION_RETRY_LIMIT")
  },
  // auracode_change end
}
