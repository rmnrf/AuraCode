import { Effect } from "effect"
import { effectCmd } from "../effect-cmd"
import { withNetworkOptions, resolveNetworkOptions } from "../network"
import { Flag } from "@opencode-ai/core/flag/flag"

export const ServeCommand = effectCmd({
  command: "serve",
  builder: (yargs) => withNetworkOptions(yargs),
  describe: "starts a headless aura server",
  // Server loads instances per-request via x-aura-directory header — no
  // need for an ambient project InstanceContext at startup.
  instance: false, // auracode_change
  handler: Effect.fn("Cli.serve")(function* (args) {
    const { Server } = yield* Effect.promise(() => import("../../server/server"))
    if (!Flag.AURA_SERVER_PASSWORD) {
      console.log("Warning: AURA_SERVER_PASSWORD is not set; server is unsecured.")
    }
    const opts = yield* resolveNetworkOptions(args)
    const server = yield* Effect.promise(() => Server.listen(opts))

    // auracode_change start
    const urls = server.urls

    console.log(`aura server listening on ${urls.bind}`)
    if (urls.local !== urls.bind) console.log(`  Local:   ${urls.local}`)
    if (urls.network) console.log(`  Network: ${urls.network}`)
    // auracode_change end

    // auracode_change start - graceful signal shutdown
    // yield* Effect.never
    const { InstanceRuntime } = yield* Effect.promise(() => import("../../project/instance-runtime"))
    const { startParentWatchdog } = yield* Effect.promise(() => import("../../auracode/parent-watchdog"))
    const { AuraSessions } = yield* Effect.promise(() => import("@/aura-sessions/aura-sessions"))
    yield* Effect.promise(
      () =>
        new Promise<void>((resolve) => {
          // Exit if the editor client that spawned us is hard-killed (no signal reaches us).
          const stopWatchdog = startParentWatchdog(() => process.kill(process.pid, "SIGTERM"))
          let stopping = false
          const shutdown = async () => {
            if (stopping) return
            stopping = true
            stopWatchdog()
            // The editor may exit before its SIGKILL fallback can run.
            const timeout = setTimeout(() => process.exit(1), 5000)
            timeout.unref()
            try {
              await AuraSessions.drainIngestForShutdown() // auracode_change
              await InstanceRuntime.disposeAllInstances()
              await server.stop(true)
            } finally {
              clearTimeout(timeout)
              resolve()
            }
          }
          process.once("SIGTERM", shutdown)
          process.once("SIGINT", shutdown)
          process.once("SIGHUP", shutdown)
        }),
    )
    // auracode_change end
  }),
})
