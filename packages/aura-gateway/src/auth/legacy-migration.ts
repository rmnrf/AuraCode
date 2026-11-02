/**
 * Legacy Aura CLI migration module
 *
 * Migrates authentication from the legacy AuraCode VS Code extension CLI
 * config path (~/.auracode/cli/config.json) to the new auth.json format.
 */
import fs from "fs/promises"
import os from "os"
import path from "path"

export const LEGACY_CONFIG_PATH = path.join(os.homedir(), ".auracode", "cli", "config.json")

interface LegacyProvider {
  id: string
  provider: string
  auracodeToken?: string
  auracodeModel?: string
  auracodeOrganizationId?: string
}

interface LegacyConfig {
  providers?: LegacyProvider[]
}

interface LegacyAuraAuth {
  token: string
  organizationId?: string
}

// Auth info types matching opencode's Auth module
type ApiAuth = { type: "api"; key: string }
type OAuthAuth = { type: "oauth"; access: string; refresh: string; expires: number; accountId?: string }
type AuthInfo = ApiAuth | OAuthAuth

/**
 * Extract aura auth from legacy config
 */
function extractAuraAuth(config: LegacyConfig): LegacyAuraAuth | undefined {
  if (!config.providers) return undefined

  const provider = config.providers.find((p) => p.provider === "auracode")
  if (!provider?.auracodeToken) return undefined

  return {
    token: provider.auracodeToken,
    organizationId: provider.auracodeOrganizationId,
  }
}

/**
 * Migrate Aura authentication from legacy CLI config path.
 *
 * Checks ~/.auracode/cli/config.json for existing aura credentials
 * and migrates them to the new auth.json format.
 *
 * @param hasAuraAuth - Callback to check if aura auth already exists
 * @param saveAuraAuth - Callback to save the migrated auth
 * @returns true if migration was performed, false otherwise
 */
export async function migrateLegacyAuraAuth(
  hasAuraAuth: () => Promise<boolean>,
  saveAuraAuth: (auth: AuthInfo) => Promise<void>,
): Promise<boolean> {
  // Skip if aura auth already configured
  if (await hasAuraAuth()) return false

  // Check if legacy config exists and parse it
  const content = await fs.readFile(LEGACY_CONFIG_PATH, "utf-8").catch(() => null)
  if (!content) return false

  let config: LegacyConfig | null = null
  try {
    config = JSON.parse(content) as LegacyConfig
  } catch {
    return false
  }

  // Extract aura auth from legacy config
  const legacy = extractAuraAuth(config)
  if (!legacy) return false

  // Migrate to new format
  // Use OAuth format if organization ID present, otherwise API format
  if (legacy.organizationId) {
    await saveAuraAuth({
      type: "oauth",
      access: legacy.token,
      refresh: "",
      expires: 0,
      accountId: legacy.organizationId,
    })
  } else {
    await saveAuraAuth({
      type: "api",
      key: legacy.token,
    })
  }

  return true
}
