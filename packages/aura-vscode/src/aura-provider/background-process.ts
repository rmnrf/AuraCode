import type { AuraClient } from "@auracode/sdk/v2/client"

export async function stopSessionProcesses(
  client: AuraClient | null,
  sessionID: string,
  directory: string,
): Promise<void> {
  if (!client) return
  await client.backgroundProcess
    .stopSession({ sessionID, directory })
    .catch((err: unknown) => console.warn("[Aura New] AuraProvider: Failed to stop background processes:", err))
}
