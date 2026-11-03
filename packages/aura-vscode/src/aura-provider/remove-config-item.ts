import type { AuraConnectionService } from "../services/cli-backend"

export interface RemoveConfigItemContext {
  connection: AuraConnectionService
  project: () => string | undefined
  directory: () => string
  refresh: () => Promise<void>
}

/** Remove a user-defined MCP from writable project and global configs without Marketplace APIs. */
export async function removeMcp(ctx: RemoveConfigItemContext, name: string): Promise<boolean> {
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(name)) return false
  try {
    const directory = ctx.directory()
    const client = await ctx.connection.getClientAsync(directory)
    const { data } = await client.auracode.removeCustomMcp(
      { directory, name },
      { throwOnError: true },
    )
    if (!data) return false
    await ctx.refresh()
    return true
  } catch (error) {
    console.warn("[AuraCode] Failed to remove MCP server:", name, error)
    return false
  }
}
