export * as Database from "./database"

import { EffectDrizzleSqlite } from "@opencode-ai/effect-drizzle-sqlite"
import { layer as sqliteLayer } from "#sqlite"
import { Context, Effect, Layer } from "effect"
import { Global } from "../global"
import { Flag } from "../flag/flag"
import { isAbsolute, join } from "path"
import { existsSync } from "fs" // auracode_change
import { DbPreflight } from "../auracode/db-preflight" // auracode_change
import { ensure as compat } from "../auracode/database-compat" // auracode_change
import { DatabaseMigration } from "./migration"
import { InstallationChannel } from "../installation/version"
import { makeGlobalNode } from "../effect/app-node"

const makeDatabase = EffectDrizzleSqlite.makeWithDefaults()
type DatabaseShape = Effect.Success<typeof makeDatabase>

export interface Interface {
  db: DatabaseShape
}

export class Service extends Context.Service<Service, Interface>()("@opencode/v2/storage/Database") {}

const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    const db = yield* makeDatabase

    // auracode_change start - install SQLite's busy handler before concurrent processes can race to recover the WAL
    yield* db.run("PRAGMA busy_timeout = 5000")
    yield* db.run("PRAGMA journal_mode = WAL")
    // auracode_change end
    yield* db.run("PRAGMA synchronous = NORMAL")
    yield* db.run("PRAGMA cache_size = -64000")
    yield* db.run("PRAGMA foreign_keys = ON")
    yield* db.run("PRAGMA wal_checkpoint(PASSIVE)")
    yield* DatabaseMigration.apply(db)
    yield* compat(db) // auracode_change - keep the shared database usable by released CLIs

    return { db }
  }).pipe(Effect.orDie),
)

export function layerFromPath(filename: string) {
  DbPreflight.assertWritable(filename) // auracode_change - actionable error (and self-heal for aura-owned files) instead of an opaque wal_checkpoint crash on read-only db files
  return layer.pipe(Layer.provide(sqliteLayer({ filename, disableWAL: true }))) // auracode_change - Database configures WAL after busy_timeout
}

export function path() {
  if (Flag.AURA_DB) {
    if (Flag.AURA_DB === ":memory:" || isAbsolute(Flag.AURA_DB)) return Flag.AURA_DB
    return join(Global.Path.data, Flag.AURA_DB)
  }
  if (
    ["latest", "beta", "prod"].includes(InstallationChannel) ||
    process.env.AURA_DISABLE_CHANNEL_DB === "1" ||
    process.env.AURA_DISABLE_CHANNEL_DB === "true"
  )
    return join(Global.Path.data, "aura.db")
  // auracode_change start - aura-branded dev-channel db name, falling back to a pre-existing opencode-named db
  const safe = InstallationChannel.replace(/[^a-zA-Z0-9._-]/g, "-")
  const next = join(Global.Path.data, `aura-${safe}.db`)
  const prev = join(Global.Path.data, `opencode-${safe}.db`)
  if (!existsSync(next) && existsSync(prev)) return prev
  return next
  // auracode_change end
}

// auracode_change - resolve the database path when the layer builds, not at module evaluation, so AURA_DB overrides set after import (tests, embedded hosts) take effect
export const node = makeGlobalNode({
  service: Service,
  layer: Layer.unwrap(Effect.sync(() => layerFromPath(path()))),
  deps: [],
})
