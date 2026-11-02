export const Npm = {
  name: "@auracode/cli",
  path: "@auracode%2fcli",
}

export const Brew = {
  name: "aura",
  tap: "Aura-Org/tap",
  formula: "Aura-Org/tap/aura",
  api: "https://formulae.brew.sh/api/formula/aura.json",
}

export const Choco = {
  name: "aura",
  api: "https://community.chocolatey.org/api/v2/Packages?$filter=Id%20eq%20%27aura%27%20and%20IsLatestVersion&$select=Version",
}

export const Scoop = {
  name: "aura",
  manifest: "https://raw.githubusercontent.com/ScoopInstaller/Main/master/bucket/aura.json",
}

export const Release = {
  install: "https://aura.ai/cli/install",
}
