import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { spawnSync } from "node:child_process"
const archive = process.argv[2]
if (!archive) throw new Error("Pass a VSIX filename")
const dir = await fs.mkdtemp(path.join(os.tmpdir(), "auracode-audit-"))
try {
  // PowerShell's Expand-Archive expects a .zip extension.
  const zip = path.join(dir, "extension.zip")
  await fs.copyFile(archive, zip)
  const result = spawnSync(
    "powershell",
    [
      "-NoProfile",
      "-NonInteractive",
      "-Command",
      "Expand-Archive -LiteralPath $env:AURA_AUDIT_ZIP -DestinationPath $env:AURA_AUDIT_DIR",
    ],
    {
      env: { ...process.env, AURA_AUDIT_ZIP: zip, AURA_AUDIT_DIR: path.join(dir, "unpacked") },
      stdio: "inherit",
      windowsHide: true,
    },
  )
  if (result.status !== 0) throw new Error("Could not extract VSIX")
  const root = path.join(dir, "unpacked", "extension")
  const manifest = JSON.parse(await fs.readFile(path.join(root, "package.json"), "utf8"))
  if (manifest.name !== "aura-code" || manifest.displayName !== "AuraCode")
    throw new Error("Incorrect extension identity")
  await fs.access(path.join(root, "bin", "aura.exe"))
  for (const file of [
    "dist/extension.js",
    "dist/webview.js",
    "dist/agent-manager.js",
    "dist/settings.js",
    "package.json",
  ]) {
    const text = await fs.readFile(path.join(root, file), "utf8")
    if (new RegExp(["ki", "lo"].join("") + "(?:code| code|\\.ai|sessions|[-_]code)", "i").test(text)) throw new Error(`Old product name remains in ${file}`)
    if (/phc_[A-Za-z0-9]+|us\.i\.posthog\.com/.test(text)) throw new Error(`Analytics transport remains in ${file}`)
  }
  console.log("VSIX identity, backend presence and primary bundle branding verified")
} finally {
  await fs.rm(dir, { recursive: true, force: true })
}
