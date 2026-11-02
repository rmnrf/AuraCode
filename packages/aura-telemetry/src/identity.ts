/** Permanently disabled compatibility API. No collection, identity, disk I/O or network. */
export namespace Identity {
  interface Cache {
    token: string
    email: string
    fetchedAt: number
  }
  export function setDataPath(p: string) {}
  export async function getMachineId(): Promise<string | undefined> {
    return undefined
  }
  export function getDistinctId(): string {
    return "local"
  }
  export function getUserId(): string | null {
    return null
  }
  export function getOrganizationId(): string | null {
    return null
  }
  export function setOrganizationId(orgId: string | null) {}
  export async function updateFromAuraAuth(token: string | null, accountId?: string): Promise<void> {}
  export function reset() {}
}
