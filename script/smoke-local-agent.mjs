import assert from "node:assert/strict"
import { createServer } from "node:http"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { spawn } from "node:child_process"

// Exercise the compiled agent, its config loader and the actual model adapter.
// The mock server never contacts another service.
const binary = path.resolve(process.argv[2] ?? "packages/aura-vscode/bin/aura.exe")
const root = await mkdtemp(path.join(tmpdir(), "auracode-agent-smoke-"))
const marker = "AURA_LOCAL_SMOKE_OK"
const requests = []
const server = createServer(async (req, res) => {
  try {
    assert.equal(req.url, "/v1/chat/completions")
    assert.equal(req.method, "POST")
    assert.equal(req.headers.authorization, "Bearer aura-smoke-saved-key")
    assert.equal(req.headers["x-aura-smoke"], "custom-header")
    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    const body = JSON.parse(Buffer.concat(chunks).toString())
    assert.equal(body.model, "aura-smoke")
    requests.push(body)
    const common = { id: "chatcmpl-aura-smoke", object: "chat.completion.chunk", created: 1, model: body.model }
    if (body.stream) {
      res.writeHead(200, { "Content-Type": "text/event-stream" })
      for (const choice of [
        { index: 0, delta: { role: "assistant", content: marker }, finish_reason: null },
        { index: 0, delta: {}, finish_reason: "stop" },
      ])
        res.write(`data: ${JSON.stringify({ ...common, choices: [choice] })}\n\n`)
      res.end("data: [DONE]\n\n")
    } else {
      res.writeHead(200, { "Content-Type": "application/json" })
      res.end(
        JSON.stringify({
          ...common,
          object: "chat.completion",
          choices: [{ index: 0, message: { role: "assistant", content: marker }, finish_reason: "stop" }],
          usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
        }),
      )
    }
  } catch (error) {
    res.writeHead(500)
    res.end(String(error))
  }
})
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve))
try {
  const baseURL = `http://127.0.0.1:${server.address().port}/v1`
  const env = {
    ...process.env,
    XDG_DATA_HOME: path.join(root, "data"),
    XDG_CACHE_HOME: path.join(root, "cache"),
    XDG_CONFIG_HOME: path.join(root, "config"),
    XDG_STATE_HOME: path.join(root, "state"),
    AURA_DISABLE_PROJECT_CONFIG: "true",
    AURA_DISABLE_CHANNEL_DB: "true",
    AURA_CONFIG_CONTENT: JSON.stringify({
      provider: {
        workstation: {
          name: "Custom local server",
          npm: "@ai-sdk/openai-compatible",
          options: { baseURL, headers: { "X-Aura-Smoke": "custom-header" } },
          models: { "aura-smoke": { name: "Smoke model" } },
        },
      },
      model: "workstation/aura-smoke",
      permission: { "*": "deny" },
    }),
    AURA_AUTH_CONTENT: JSON.stringify({ workstation: { type: "api", key: "aura-smoke-saved-key" } }),
  }
  delete env.AURA_CONFIG
  delete env.AURA_CONFIG_DIR
  const child = spawn(
    binary,
    ["--pure", "run", "--format", "json", "--model", "workstation/aura-smoke", "Reply with a short confirmation."],
    {
      cwd: root,
      env,
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    },
  )
  let stdout = "",
    stderr = ""
  child.stdout.on("data", (part) => {
    stdout += part
  })
  child.stderr.on("data", (part) => {
    stderr += part
  })
  const timer = setTimeout(() => child.kill(), 90_000)
  const code = await new Promise((resolve, reject) => {
    child.on("error", reject)
    child.on("close", resolve)
  }).finally(() => clearTimeout(timer))
  assert.equal(code, 0, `Compiled agent failed:\n${stdout}\n${stderr}`)
  assert.ok(
    requests.some((body) => body.stream),
    "No streaming local completion request",
  )
  const events = stdout
    .split(/\r?\n/)
    .filter((line) => line.startsWith("{"))
    .map((line) => JSON.parse(line))
  assert.ok(
    events.some((event) => event.type === "text" && event.part?.text?.includes(marker)),
    `No assistant text event:\n${stdout}\n${stderr}`,
  )
  console.log(`Compiled local agent completed streaming inference (${requests.length} local requests)`)
} finally {
  server.closeAllConnections()
  await new Promise((resolve) => server.close(resolve))
  await rm(root, { recursive: true, force: true })
}
