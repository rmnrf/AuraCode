import { auraFetch } from "@auracode/local-only/fetch"
import { environment } from "@auracode/local-only"

Object.assign(process.env, environment)
// Ignore observability configuration inherited from the editor or shell.
for (const key of Object.keys(process.env)) {
  if (key.startsWith("OTEL_") && key !== "OTEL_SDK_DISABLED") delete process.env[key]
}
globalThis.fetch = auraFetch
