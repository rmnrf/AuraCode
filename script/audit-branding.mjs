import fs from "node:fs/promises"
import path from "node:path"
const findings = []
const skip = new Set([".git", "node_modules", "dist", "out", ".artifacts", ".turbo", ".cache"])
async function walk(dir) {
  for (const item of await fs.readdir(dir, { withFileTypes: true })) {
    if (skip.has(item.name)) continue
    const file = path.join(dir, item.name)
    if (new RegExp(["ki", "lo"].join(""), "i").test(item.name)) findings.push(`${file}: old name in path`)
    if (item.isDirectory()) {
      await walk(file)
      continue
    }
    if (!item.isFile()) continue
    const data = await fs.readFile(file)
    if (data.includes(0)) continue
    if (/^(LICENSE|NOTICE)(\.[a-z]+)?$/i.test(item.name)) continue
    const lines = data.toString("utf8").split("\n")
    lines.forEach((line, index) => {
      if (new RegExp(["ki", "lo"].join(""), "i").test(line) && !/copyright/i.test(line))
        findings.push(`${file}:${index + 1}`)
    })
  }
}
await walk(".")
if (findings.length) {
  console.error(findings.join("\n"))
  process.exitCode = 1
} else console.log("Branding audit passed; only mandatory license/copyright attribution is excluded.")
