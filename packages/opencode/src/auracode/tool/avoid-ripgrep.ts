/** Detect direct calls to external ripgrep without blocking text containing "rg". */
export function isRipgrepExecutable(value: string | undefined): boolean {
  if (!value) return false
  const trimmed = value.trim().replace(/^["']|["']$/g, "").replace(/\\/g, "/")
  const name = trimmed.split("/").at(-1)?.toLowerCase()
  return name === "rg" || name === "rg.exe" || name === "ripgrep" || name === "ripgrep.exe"
}

/** Inspect parsed shell command tokens before asking permission or spawning. */
export function isRipgrepInvocation(tokens: readonly string[]): boolean {
  if (!tokens.length) return false
  let index = 0
  if (tokens[index] === "&" || tokens[index] === ".") index++
  if (["command", "sudo", "env"].includes(tokens[index]?.toLowerCase() ?? "")) index++
  return isRipgrepExecutable(tokens[index])
}
