import "@auracode/local-only/bootstrap" // auracode_change
import yargs from "yargs"
import { hideBin } from "yargs/helpers"
// auracode_change - upstream account console intentionally omitted; AuraCli registers `aura console` for local settings
import { UI } from "./cli/ui"
import { TuiThreadCommand } from "./cli/cmd/tui" // auracode_change - yargs requires the default command builder eagerly
import { InstallationVersion } from "@opencode-ai/core/installation/version"
import { FormatError } from "./cli/error"
import { EOL } from "os"
// auracode_change - upstream web command intentionally omitted; Aura does not ship an embedded web UI
import { errorMessage } from "./util/error"
import { Heap } from "./cli/heap"
import { AuraCli } from "@/auracode/cli/setup" // auracode_change
import * as Log from "@opencode-ai/core/util/log" // auracode_change
import { ensureProcessMetadata } from "@opencode-ai/core/util/opencode-process" // auracode_change
// auracode_change start - defer heavy command implementations until yargs selects them
import {
  AcpCommand,
  AgentCommand,
  AttachCommand,
  DbCommand,
  DebugCommand,
  ExportCommand,
  GenerateCommand,
  GithubCommand,
  ImportCommand,
  McpCommand,
  ModelsCommand,
  PluginCommand,
  PrCommand,
  ProvidersCommand,
  RunCommand,
  ServeCommand,
  SessionCommand,
  StatsCommand,
  UninstallCommand,
  UpgradeCommand,
  waitForLazyCommands,
} from "@/auracode/cli/lazy-commands"
// auracode_change end

const args = hideBin(process.argv)
const metadata = ensureProcessMetadata("main") // auracode_change - correlate logs across the CLI and TUI worker

if (await AuraCli.runner()) process.exit() // auracode_change - run persistent process guardians before CLI bootstrap

function show(out: string) {
  const text = out.trimStart()
  if (!text.startsWith("opencode ")) {
    process.stderr.write(UI.logo() + EOL + EOL)
    process.stderr.write(text + EOL)
    return
  }
  process.stderr.write(out)
}

let cli = yargs(args) // auracode_change
  .parserConfiguration({ "populate--": true })
  .scriptName("aura") // auracode_change
  .wrap(100)
  .help("help", "show help")
  .alias("help", "h")
  .version("version", "show version number", InstallationVersion)
  .alias("version", "v")
  .option("print-logs", {
    describe: "print logs to stderr",
    type: "boolean",
  })
  .option("log-level", {
    describe: "log level",
    type: "string",
    choices: ["DEBUG", "INFO", "WARN", "ERROR"],
  })
  .option("pure", {
    describe: "run without external plugins",
    type: "boolean",
  })
  .middleware(async (opts) => {
    if (opts.printLogs) process.env.AURA_PRINT_LOGS = "1"
    if (opts.logLevel) process.env.AURA_LOG_LEVEL = opts.logLevel
    if (opts.pure) {
      process.env.AURA_PURE = "1"
    }

    Heap.start()

    process.env.AGENT = "1"
    process.env.OPENCODE = "1"
    process.env.AURA_PID = String(process.pid)
    await AuraCli.bootstrap(opts) // auracode_change - env tagging, telemetry init, legacy JSON-to-SQLite migration, and auth migration
    // auracode_change start - retain Aura process/run correlation metadata in startup logs
    Log.Default.info("opencode", {
      version: InstallationVersion,
      command: args[0] ?? "", // avoid persisting prompts, passwords, tokens, headers, or environment values
      process_role: metadata.processRole,
      run_id: metadata.runID,
    })
    // auracode_change end
  })
  .usage("")
  .completion("completion", "generate shell completion script")
  .command(AcpCommand)
  .command(McpCommand)
  .command(TuiThreadCommand)
  .command(AttachCommand)
  .command(RunCommand)
  .command(GenerateCommand)
  .command(DebugCommand)
  // auracode_change - upstream account console intentionally not registered; AuraConsole is added by AuraCli.register
  .command(ProvidersCommand)
  .command(AgentCommand)
  .command(UpgradeCommand)
  .command(UninstallCommand)
  .command(ServeCommand)
  // auracode_change - upstream web command intentionally omitted
  .command(ModelsCommand)
  .command(StatsCommand)
  .command(ExportCommand)
  .command(ImportCommand)
  .command(GithubCommand)
  .command(PrCommand)
  .command(SessionCommand)
  .command(PluginCommand)
  .command(DbCommand)

// auracode_change start - register Aura-specific commands after the upstream chain
cli = AuraCli.register(cli)
await waitForLazyCommands() // auracode_change - yargs completion invokes builders synchronously
cli = cli
  // auracode_change end
  .fail((msg, err) => {
    if (
      msg?.startsWith("Unknown argument") ||
      msg?.startsWith("Not enough non-option arguments") ||
      msg?.startsWith("Invalid values:")
    ) {
      if (err) throw err
      cli.showHelp(show)
    }
    if (err) throw err
    process.exit(1)
  })
  .strict()

try {
  if (args.includes("-h") || args.includes("--help")) {
    await cli.parse(args, (err: Error | undefined, _argv: unknown, out: string) => {
      if (err) throw err
      if (!out) return
      show(out)
    })
  } else {
    await cli.parse()
  }
} catch (e) {
  const formatted = FormatError(e)
  if (formatted) UI.error(formatted)
  if (formatted === undefined) {
    UI.error("Unexpected error" + EOL)
    process.stderr.write(errorMessage(e) + EOL)
  }
  process.exitCode = 1
} finally {
  await AuraCli.shutdown() // auracode_change - telemetry/session-export shutdown + instance disposal

  // Some subprocesses don't react properly to SIGTERM and similar signals.
  // Most notably, some docker-container-based MCP servers don't handle such signals unless
  // run using `docker run --init`.
  // Explicitly exit to avoid any hanging subprocesses.
  process.exit()
}
