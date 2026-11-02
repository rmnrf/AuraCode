export * from "./client.js"
export * from "./server.js"

import { createAuraClient } from "./client.js"
import { createAuraServer } from "./server.js"
import type { ServerOptions } from "./server.js"

export async function createAura(options?: ServerOptions) {
  const server = await createAuraServer({
    ...options,
  })

  const client = createAuraClient({
    baseUrl: server.url,
  })

  return {
    client,
    server,
  }
}
