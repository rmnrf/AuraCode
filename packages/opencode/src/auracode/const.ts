import { InstallationVersion } from "@opencode-ai/core/installation/version"

export const DEFAULT_HEADERS = {
  "HTTP-Referer": "https://auracode.ai",
  "X-Title": "AuraCode",
  "User-Agent": `Aura-Code/${InstallationVersion}`,
}
