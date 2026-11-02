#!/usr/bin/env bun
import { $ } from "bun"
import pkg from "../package.json"
import { Script } from "@opencode-ai/script"
import { fileURLToPath } from "url"
// auracode_change start
import fs from "node:fs"
import path from "node:path"
import { NpmPublish } from "./auracode/npm-publish"
import * as AuraSbom from "./auracode/sbom"
import * as AuraRelease from "../../../script/auracode/release"
import type { Manifest } from "../../../script/auracode/sbom/index"
// auracode_change end

const dir = fileURLToPath(new URL("..", import.meta.url))
process.chdir(dir)

// auracode_change start
const evidence: Manifest.Entry[] = []

/** Record SBOM evidence for one npm tarball, or an explicit failure entry. */
async function describe(file: string | undefined, name: string, version: string) {
  const described = file
    ? await AuraSbom.npmPackage({
        file,
        name,
        release: { version, channel: Script.channel },
        out: path.resolve("dist"),
      }).catch((err) => {
        console.error(`sbom: could not describe ${name}@${version}`, err)
        return undefined
      })
    : undefined
  evidence.push(
    described?.entry ?? {
      artifact: file ? path.basename(file) : `${name}@${version}`,
      sha256: "",
      distribution: "npm",
      error: `SBOM generation failed for ${name}@${version}`,
    },
  )
}

/** Fetch the tarball the registry actually serves for an already-published version. */
async function registry(name: string, version: string) {
  const dest = path.resolve("dist", ".sbom-registry")
  await fs.promises.mkdir(dest, { recursive: true })
  const out = await $`npm pack ${name}@${version} --pack-destination ${dest} --json`
    .quiet()
    .json()
    .catch((err) => {
      console.error(`sbom: could not fetch published ${name}@${version}`, err)
      return undefined
    })
  const filename = (out as { filename?: string }[] | undefined)?.at(0)?.filename
  return filename ? path.join(dest, filename) : undefined
}
// auracode_change end

async function published(name: string, version: string) {
  return (await $`npm view ${name}@${version} version`.nothrow()).exitCode === 0
}

async function publish(dir: string, name: string, version: string) {
  // GitHub artifact downloads can drop the executable bit, and Docker uses the
  // unpacked dist binaries directly rather than the published tarball.
  if (process.platform !== "win32") await $`chmod -R 755 .`.cwd(dir)
  if (await published(name, version)) {
    console.log(`already published ${name}@${version}`)
    // auracode_change start - a re-run must still describe what the registry
    // serves, otherwise the distribution manifest shrinks and its upload would
    // replace the complete evidence from the first run.
    await describe(await registry(name, version), name, version)
    // auracode_change end
    return
  }
  // auracode_change start - remove stale tarballs so the SBOM subject and the
  // published bytes are provably the file this pack just wrote.
  for (const stale of await Array.fromAsync(new Bun.Glob("*.tgz").scan({ cwd: dir }))) {
    await fs.promises.rm(path.join(dir, stale), { force: true })
  }
  // auracode_change end
  await $`bun pm pack`.cwd(dir)
  // auracode_change start - describe the exact tarball before publishing it, and
  // publish that resolved path rather than a glob.
  const packed = await Array.fromAsync(new Bun.Glob("*.tgz").scan({ cwd: dir }))
  if (packed.length !== 1) {
    throw new Error(`bun pm pack must produce exactly one tarball for ${name}, found ${packed.length}`)
  }
  const tarball = packed[0]
  await describe(path.join(dir, tarball), name, version)

  await NpmPublish.retry({
    name,
    version,
    run: () => $`npm publish ${tarball} --access public --tag ${Script.channel} --provenance`.cwd(dir),
    exists: () => published(name, version),
  })
  // auracode_change end
}

const binaries: Record<string, string> = {}
// auracode_change start
for (const filepath of new Bun.Glob("*/*/package.json").scanSync({ cwd: "./dist" })) {
  // auracode_change end
  const pkg = await Bun.file(`./dist/${filepath}`).json()
  binaries[pkg.name] = pkg.version
}
console.log("binaries", binaries)
const version = Object.values(binaries)[0]

await $`mkdir -p ./dist/${pkg.name}`
await $`cp -r ./bin ./dist/${pkg.name}/bin`
await $`cp ./script/postinstall.mjs ./dist/${pkg.name}/postinstall.mjs`
await Bun.file(`./dist/${pkg.name}/LICENSE`).write(await Bun.file("../../LICENSE").text())
await Bun.file(`./dist/${pkg.name}/README.md`).write(await Bun.file("./README.md").text()) // auracode_change

await Bun.file(`./dist/${pkg.name}/package.json`).write(
  JSON.stringify(
    {
      name: pkg.name, // auracode_change
      bin: {
        // auracode_change start
        aura: `./bin/aura`,
        auracode: `./bin/aura`,
        // auracode_change end
      },
      scripts: {
        postinstall: "node ./postinstall.mjs",
      },
      version: version,
      license: pkg.license,
      keywords: pkg.keywords, // auracode_change
      private: pkg.private, // auracode_change
      os: ["darwin", "linux", "win32"],
      cpu: ["arm64", "x64"],
      optionalDependencies: binaries,
      // auracode_change start
      repository: {
        type: "git",
        url: "https://github.com/Aura-Org/auracode",
      },
      // auracode_change end
    },
    null,
    2,
  ),
)

const tasks = Object.entries(binaries).map(async ([name]) => {
  await publish(`./dist/${name}`, name, binaries[name])
})
await Promise.all(tasks)
await publish(`./dist/${pkg.name}`, pkg.name, version) // auracode_change

const image = "ghcr.io/aura-org/auracode" // auracode_change
const platforms = "linux/amd64,linux/arm64"
const tags = [`${image}:${version}`, `${image}:${Script.channel}`]
const tagFlags = tags.flatMap((t) => ["-t", t])

// registries
if (!Script.preview) {
  // auracode_change start - BuildKit attestations are requested explicitly rather
  // than relying on defaults, and the pushed digests are captured so the image
  // SBOM describes an immutable manifest instead of a moving channel tag.
  const metadata = path.resolve("dist", "oci-metadata.json")
  await $`docker buildx build --platform ${platforms} ${tagFlags} --provenance=mode=max --sbom=true --metadata-file ${metadata} --push .`
  evidence.push(...(await describeImages(metadata)))
  // The OpenShell variant is the Dockerfile's openshell stage, built, pushed and described like the main image.
  const variantMetadata = path.resolve("dist", "oci-metadata-openshell.json")
  const variantTagFlags = tags.flatMap((t) => ["-t", `${t}-openshell`])
  await $`docker buildx build --platform ${platforms} ${variantTagFlags} --target openshell --provenance=mode=max --sbom=true --metadata-file ${variantMetadata} --push .`
  evidence.push(...(await describeImages(variantMetadata)))
  // auracode_change end
  // Calculate SHA values
  const arm64Sha = await $`sha256sum ./dist/aura-linux-arm64.tar.gz | cut -d' ' -f1`.text().then((x) => x.trim())
  const x64Sha = await $`sha256sum ./dist/aura-linux-x64.tar.gz | cut -d' ' -f1`.text().then((x) => x.trim())
  const macX64Sha = await $`sha256sum ./dist/aura-darwin-x64.zip | cut -d' ' -f1`.text().then((x) => x.trim())
  const macArm64Sha = await $`sha256sum ./dist/aura-darwin-arm64.zip | cut -d' ' -f1`.text().then((x) => x.trim())

  const [pkgver, _subver = ""] = Script.version.split(/(-.*)/, 2)

  // arch
  const binaryPkgbuild = [
    "# Maintainer: aura", // auracode_change
    "",
    "pkgname='aura-bin'",
    `pkgver=${pkgver}`,
    `_subver=${_subver}`,
    "options=('!debug' '!strip')",
    "pkgrel=1",
    "pkgdesc='The AI coding agent built for the terminal.'",
    "url='https://github.com/Aura-Org/auracode'",
    "arch=('aarch64' 'x86_64')",
    "license=('MIT' 'LGPL-2.0-or-later')", // auracode_change
    "provides=('aura')",
    "conflicts=('aura')",
    "depends=('ripgrep')",
    "",
    `source_aarch64=("\${pkgname}_\${pkgver}_aarch64.tar.gz::https://github.com/Aura-Org/auracode/releases/download/v\${pkgver}\${_subver}/aura-linux-arm64.tar.gz")`,
    `sha256sums_aarch64=('${arm64Sha}')`,

    `source_x86_64=("\${pkgname}_\${pkgver}_x86_64.tar.gz::https://github.com/Aura-Org/auracode/releases/download/v\${pkgver}\${_subver}/aura-linux-x64.tar.gz")`,
    `sha256sums_x86_64=('${x64Sha}')`,
    "",
    "package() {",
    '  install -Dm755 ./aura "${pkgdir}/usr/lib/aura/aura"', // auracode_change
    '  install -Dm755 ./bwrap "${pkgdir}/usr/lib/aura/bwrap"', // auracode_change
    '  install -Dm644 ./aura-sandbox-mutation-worker.js "${pkgdir}/usr/lib/aura/aura-sandbox-mutation-worker.js"', // auracode_change
    '  install -dm755 "${pkgdir}/usr/bin" "${pkgdir}/usr/lib/aura/tree-sitter" "${pkgdir}/usr/share/licenses/aura"', // auracode_change
    '  cp -r ./tree-sitter/. "${pkgdir}/usr/lib/aura/tree-sitter/"', // auracode_change
    '  cp -r ./licenses/. "${pkgdir}/usr/share/licenses/aura/"', // auracode_change
    "  printf '%s\\n' '#!/bin/sh' 'export AURA_TREE_SITTER_WASM_DIR=/usr/lib/aura/tree-sitter' 'exec /usr/lib/aura/aura \"$@\"' > \"${pkgdir}/usr/bin/aura\"", // auracode_change
    '  chmod 755 "${pkgdir}/usr/bin/aura"', // auracode_change
    "}",
    "",
  ].join("\n")

  for (const [pkg, pkgbuild] of [["aura-bin", binaryPkgbuild]]) {
    for (let i = 0; i < 30; i++) {
      try {
        await $`rm -rf ./dist/aur-${pkg}`
        await $`git clone ssh://aur@aur.archlinux.org/${pkg}.git ./dist/aur-${pkg}`
        await $`cd ./dist/aur-${pkg} && git checkout master`
        await Bun.file(`./dist/aur-${pkg}/PKGBUILD`).write(pkgbuild)
        await $`cd ./dist/aur-${pkg} && makepkg --printsrcinfo > .SRCINFO`
        await $`cd ./dist/aur-${pkg} && git add PKGBUILD .SRCINFO`
        if ((await $`cd ./dist/aur-${pkg} && git diff --cached --quiet`.nothrow()).exitCode === 0) break
        await $`cd ./dist/aur-${pkg} && git commit -m "Update to v${Script.version}"`
        await $`cd ./dist/aur-${pkg} && git push`
        break
      } catch {
        continue
      }
    }
  }

  // Homebrew formula
  const homebrewFormula = [
    "# typed: false",
    "# frozen_string_literal: true",
    "",
    "# This file was generated by GoReleaser. DO NOT EDIT.",
    "class Aura < Formula", // auracode_change
    `  desc "The AI coding agent built for the terminal."`,
    `  homepage "https://aura.ai"`, // auracode_change
    `  version "${Script.version.split("-")[0]}"`,
    "",
    `  depends_on "ripgrep"`,
    "",
    "  on_macos do",
    "    if Hardware::CPU.intel?",
    `      url "https://github.com/Aura-Org/auracode/releases/download/v${Script.version}/aura-darwin-x64.zip"`,
    `      sha256 "${macX64Sha}"`,
    "",
    "      def install",
    '        libexec.install "aura", "aura-sandbox-mutation-worker.js", "tree-sitter"', // auracode_change
    '        (bin/"aura").write_env_script libexec/"aura", AURA_TREE_SITTER_WASM_DIR: libexec/"tree-sitter"', // auracode_change
    "      end",
    "    end",
    "    if Hardware::CPU.arm?",
    `      url "https://github.com/Aura-Org/auracode/releases/download/v${Script.version}/aura-darwin-arm64.zip"`,
    `      sha256 "${macArm64Sha}"`,
    "",
    "      def install",
    '        libexec.install "aura", "aura-sandbox-mutation-worker.js", "tree-sitter"', // auracode_change
    '        (bin/"aura").write_env_script libexec/"aura", AURA_TREE_SITTER_WASM_DIR: libexec/"tree-sitter"', // auracode_change
    "      end",
    "    end",
    "  end",
    "",
    "  on_linux do",
    "    if Hardware::CPU.intel? and Hardware::CPU.is_64_bit?",
    `      url "https://github.com/Aura-Org/auracode/releases/download/v${Script.version}/aura-linux-x64.tar.gz"`,
    `      sha256 "${x64Sha}"`,
    "      def install",
    '        libexec.install "aura", "bwrap", "aura-sandbox-mutation-worker.js", "tree-sitter", "licenses"', // auracode_change
    '        (bin/"aura").write_env_script libexec/"aura", AURA_TREE_SITTER_WASM_DIR: libexec/"tree-sitter"', // auracode_change
    "      end",
    "    end",
    "    if Hardware::CPU.arm? and Hardware::CPU.is_64_bit?",
    `      url "https://github.com/Aura-Org/auracode/releases/download/v${Script.version}/aura-linux-arm64.tar.gz"`,
    `      sha256 "${arm64Sha}"`,
    "      def install",
    '        libexec.install "aura", "bwrap", "aura-sandbox-mutation-worker.js", "tree-sitter", "licenses"', // auracode_change
    '        (bin/"aura").write_env_script libexec/"aura", AURA_TREE_SITTER_WASM_DIR: libexec/"tree-sitter"', // auracode_change
    "      end",
    "    end",
    "  end",
    "end",
    "",
    "",
  ].join("\n")

  const token = process.env.GITHUB_TOKEN
  if (!token) {
    console.error("GITHUB_TOKEN is required to update homebrew tap")
    process.exit(1)
  }
  const tap = `https://x-access-token:${token}@github.com/Aura-Org/homebrew-tap.git` // auracode_change
  await $`rm -rf ./dist/homebrew-tap`
  await $`git clone ${tap} ./dist/homebrew-tap`
  await Bun.file("./dist/homebrew-tap/aura.rb").write(homebrewFormula) // auracode_change
  await $`cd ./dist/homebrew-tap && git add aura.rb` // auracode_change
  if ((await $`cd ./dist/homebrew-tap && git diff --cached --quiet`.nothrow()).exitCode !== 0) {
    await $`cd ./dist/homebrew-tap && git commit -m "Update to v${Script.version}"`
    await $`cd ./dist/homebrew-tap && git push`
  }
}

// auracode_change start - record which npm tarballs and container manifests this
// release produced. Homebrew and AUR redistribute the archives described by the
// archive manifest, so they need no separate evidence.
if (Script.release) {
  // Expected coverage is derived from what this release had to produce, not from
  // what happened to be recorded, so a missing package or image is a shortfall.
  const packages = Object.keys(binaries).length + 1
  const images = Script.preview ? 0 : 2 * (platforms.split(",").length + 1) // main image and OpenShell variant
  const described = await AuraSbom.distribution({
    dir: path.resolve("dist"),
    release: { version, channel: Script.channel },
    entries: evidence,
    expected: packages + images,
  })
  // Evidence is a record of a release that already shipped, so a failure here is
  // reported rather than rolled back onto an npm publish that cannot be undone.
  await AuraRelease.upload({ tag: `v${Script.version}`, files: described.files }).catch((err) =>
    console.error("sbom: could not publish the distribution evidence", err),
  )
}

/**
 * Describe each pushed image manifest.
 *
 * BuildKit writes attestation manifests into the same index with an `unknown`
 * platform; those are not images and must not be described as one.
 */
async function describeImages(metadata: string) {
  const digest = await Bun.file(metadata)
    .json()
    .then((data) => data["containerimage.digest"] as string | undefined)
    .catch((err) => {
      console.error("sbom: could not read the container build metadata", err)
      return undefined
    })
  if (!digest) return []

  const index = await $`docker buildx imagetools inspect ${image}@${digest} --raw`
    .nothrow()
    .json()
    .catch((err) => {
      console.error(`sbom: could not inspect ${image}@${digest}`, err)
      return undefined
    })

  const manifests: { digest: string; platform?: string }[] = (index?.manifests ?? [])
    .filter((item: any) => item?.platform?.architecture && item.platform.architecture !== "unknown")
    .map((item: any) => ({ digest: item.digest, platform: `${item.platform.os}/${item.platform.architecture}` }))

  const entries: Manifest.Entry[] = []
  for (const item of [...manifests, { digest, platform: undefined }]) {
    const described = await AuraSbom.ociImage({
      reference: `${image}@${item.digest}`,
      digest: item.digest,
      platform: item.platform,
      release: { version, channel: Script.channel },
      out: path.resolve("dist"),
    }).catch((err) => {
      console.error(`sbom: could not describe ${image}@${item.digest}`, err)
      return undefined
    })
    entries.push(
      described?.entry ?? {
        artifact: AuraSbom.ociName(item.digest, item.platform),
        sha256: item.digest.replace(/^sha256:/, ""),
        distribution: "oci",
        ...(item.platform ? { target: item.platform } : {}),
        error: `SBOM generation failed for ${image}@${item.digest}`,
      },
    )
  }
  return entries
}
// auracode_change end
