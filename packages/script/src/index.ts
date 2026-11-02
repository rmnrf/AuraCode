import { $ } from "bun"
import semver from "semver"
import path from "path"

const rootPkgPath = path.resolve(import.meta.dir, "../../../package.json")
const rootPkg = await Bun.file(rootPkgPath).json()
const expectedBunVersion = rootPkg.packageManager?.split("@")[1]

if (!expectedBunVersion) {
  throw new Error("packageManager field not found in root package.json")
}

// relax version requirement
const expectedBunVersionRange = `^${expectedBunVersion}`

if (!semver.satisfies(process.versions.bun, expectedBunVersionRange)) {
  throw new Error(`This script requires bun@${expectedBunVersionRange}, but you are using bun@${process.versions.bun}`)
}
// auracode_change start
const env = {
  AURA_CHANNEL: process.env["AURA_CHANNEL"],
  AURA_BUMP: process.env["AURA_BUMP"],
  AURA_VERSION: process.env["AURA_VERSION"],
  AURA_RELEASE: process.env["AURA_RELEASE"],
  AURA_PRE_RELEASE: process.env["AURA_PRE_RELEASE"],
}
// auracode_change end
const CHANNEL = await (async () => {
  if (env.AURA_CHANNEL) return env.AURA_CHANNEL // auracode_change
  // auracode_change start - publish to "rc" channel for pre-releases
  if (env.AURA_PRE_RELEASE === "true") return "rc"
  // auracode_change end
  if (env.AURA_BUMP) return "latest" // auracode_change
  if (env.AURA_VERSION && !env.AURA_VERSION.startsWith("0.0.0-")) return "latest" // auracode_change
  return await $`git branch --show-current`.text().then((x) => x.trim().replace(/[^0-9A-Za-z-]/g, "-")) // auracode_change
})()
const IS_PREVIEW = CHANNEL !== "latest"

// auracode_change start - shared helpers for version computation
function parseVersion(input: string) {
  const match = input.trim().match(/^v?(\d+)\.(\d+)\.(\d+)$/)
  if (!match) return
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    value: `${match[1]}.${match[2]}.${match[3]}`,
  }
}

function compareVersion(
  a: NonNullable<ReturnType<typeof parseVersion>>,
  b: NonNullable<ReturnType<typeof parseVersion>>,
) {
  if (a.major !== b.major) return a.major - b.major
  if (a.minor !== b.minor) return a.minor - b.minor
  return a.patch - b.patch
}

async function fetchLatest() {
  const data: any = await fetch("https://registry.npmjs.org/@auracode/cli/latest").then((res) => {
    if (!res.ok) throw new Error(res.statusText)
    return res.json()
  })
  return data.version as string
}

async function fetchHighest() {
  if (!process.env.GH_REPO) return fetchLatest()
  const data: { tagName: string }[] = await $`gh release list --json tagName --limit 100 --repo ${process.env.GH_REPO}`
    .json()
    .catch(() => [])
  const versions = data.flatMap((item) => {
    const version = parseVersion(item.tagName)
    if (!version) return []
    return [version]
  })
  const highest = versions.sort(compareVersion).at(-1)
  if (highest) return highest.value
  return fetchLatest()
}

function bumpVersion(current: string, type: string) {
  const version = parseVersion(current)
  if (!version) throw new Error(`Invalid version: ${current}`)
  if (type === "major") return `${version.major + 1}.0.0`
  if (type === "minor") return `${version.major}.${version.minor + 1}.0`
  return `${version.major}.${version.minor}.${version.patch + 1}`
}
// auracode_change end

const VERSION = await (async () => {
  if (env.AURA_VERSION) return env.AURA_VERSION
  if (IS_PREVIEW) {
    // auracode_change start - rc releases use plain semver required by VS Code Marketplace
    if (env.AURA_BUMP && env.AURA_PRE_RELEASE === "true") {
      const current = await fetchHighest()
      return bumpVersion(current, env.AURA_BUMP.toLowerCase())
    }
    // auracode_change end
    return `0.0.0-${CHANNEL}-${new Date().toISOString().slice(0, 16).replace(/[-:T]/g, "")}`
  }
  const version = await fetchHighest() // auracode_change
  return bumpVersion(version, env.AURA_BUMP?.toLowerCase() ?? "patch") // auracode_change
})()

// auracode_change start
const team = [
  "actions-user",
  "alexkgold",
  "arimesser",
  "arkadiykondrashov",
  "bturcotte520",
  "chrarnoldus",
  "codingelves",
  "dependabot[bot]",
  "dosire",
  "Drixled",
  "DScdng",
  "emilieschario",
  "eshurakov",
  "evanjacobson",
  "Helix-Aura",
  "iscekic",
  "jeanduplessis",
  "jobrietbergen",
  "johnnyeric",
  "jrf0110",
  "aura-code-bot",
  "aura-code-bot[bot]",
  "aura-maintainer[bot]",
  "auracode-bot",
  "auraconnect-lite[bot]",
  "auraconnect[bot]",
  "kirillk",
  "lambertjosh",
  "marius-auracode",
  "olearycrew",
  "pandemicsyn",
  "pedroheyerdahl",
  "RSO",
  "sbreitenother",
  "St0rmz1",
  "suhailkc2025",
]
// auracode_change end

export const Script = {
  get channel() {
    return CHANNEL
  },
  get version() {
    return VERSION
  },
  get preview() {
    return IS_PREVIEW
  },
  get release(): boolean {
    return !!env.AURA_RELEASE
  },
  get team() {
    return team
  },
}
console.log(`aura script`, JSON.stringify(Script, null, 2)) // auracode_change
