import { Effect } from "effect"
import type { DatabaseMigration } from "../migration"

export default {
  id: "20260903104806_auracode_board_reset",
  up(tx) {
    return Effect.gen(function* () {
      // auracode_change start
      yield* tx.run(`ALTER TABLE \`aura_board\` ADD \`cleared_seq\` integer DEFAULT 0 NOT NULL;`)
      // auracode_change end
    })
  },
} satisfies DatabaseMigration.Migration
