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
    const config = { mcp: { [name]: null } }
    const project = ctx.project()
    if (project) await client.config.update({ directory: project, config }, { throwOnError: true })
    await client.global.config.update({ config }, { throwOnError: true })
    await ctx.refresh()
    return true
  } catch (error) {
    console.warn("[AuraCode] Failed to remove MCP server:", name, error)
    return false
  }
}
