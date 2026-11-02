declare global {
  const AURA_VERSION: string
  const AURA_CHANNEL: string
  const AURA_BUILD_KIND: string // auracode_change
}

export const InstallationVersion = typeof AURA_VERSION === "string" ? AURA_VERSION : "local"
export const InstallationChannel = typeof AURA_CHANNEL === "string" ? AURA_CHANNEL : "local"
export const InstallationLocal = InstallationChannel === "local"
// auracode_change start - distinguish release builds from source / local builds
export const InstallationBuildKind: "source" | "release" =
  typeof AURA_BUILD_KIND === "string" && AURA_BUILD_KIND === "release" ? "release" : "source"
// auracode_change end
