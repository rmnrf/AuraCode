import { test } from "node:test"
import assert from "node:assert/strict"
import { createServer } from "node:http"
import { endpoint, localConfig, localURL } from "../src/policy.ts"
import { auraFetch } from "../src/fetch.ts"

test("accepts loopback only and normalizes localhost without DNS", () => {
  assert.equal(endpoint("http://localhost:1234/v1/"), "http://127.0.0.1:1234/v1")
  assert.equal(endpoint("http://[::1]:8080/v1"), "http://[::1]:8080/v1")
  for (const value of [
    "https://api.openai.com/v1",
    "http://192.168.1.2/v1",
    "http://0.0.0.0/v1",
    "http://localhost.example.com/v1",
    "http://user:password@localhost/v1",
    "file:///etc/passwd",
    "http://[::ffff:127.0.0.1]/v1",
    "http://127.0.0.2/v1",
    "http://localhost/v1?api_key=x",
    "http://localhost/v1#fragment",
    "ws://localhost/v1",
  ])
    assert.throws(() => endpoint(value), value)
  assert.equal(localURL("ws://localhost:1234/path").hostname, "127.0.0.1")
})

test("project config and model overrides cannot enable cloud providers or plugins", () => {
  const config = localConfig({
    model: "openai/gpt-4",
    small_model: "anthropic/claude",
    enabled_providers: ["openai"],
    plugin: ["evil-plugin"],
    mcp: { cloud: { url: "https://example.com" } },
    provider: {
      openai: { npm: "evil-provider", options: { baseURL: "https://example.com" } },
      local: {
        npm: "evil-provider",
        env: ["OPENAI_API_KEY"],
        options: { baseURL: "http://localhost:8080/v1", headers: { "X-Tracking-ID": "secret" } },
        models: { "my-model": { name: "My model" } },
      },
    },
  })
  assert.deepEqual(Object.keys(config.provider), ["local"])
  assert.equal(config.provider.local.npm, "@ai-sdk/openai-compatible")
  assert.deepEqual(config.provider.local.options, { baseURL: "http://127.0.0.1:8080/v1", apiKey: "local" })
  assert.deepEqual(config.enabled_providers, ["local"])
  assert.equal(config.model, "local/my-model")
  assert.equal(config.small_model, config.model)
  assert.deepEqual(config.plugin, [])
  assert.deepEqual(config.mcp, {})
  assert.throws(() => localConfig({ provider: { local: { options: { baseURL: "https://example.com" } } } }))
})

test("streams an actual local response and refuses every HTTP redirect", async () => {
  let requests = 0
  const server = createServer((req, res) => {
    requests++
    if (req.url === "/redirect") {
      res.writeHead(302, { location: "https://example.com/private" })
      res.end()
      return
    }
    if (req.url === "/local-redirect") {
      res.writeHead(307, { location: "/v1/chat/completions" })
      res.end()
      return
    }
    res.writeHead(200, { "Content-Type": "text/event-stream" })
    res.write('data: {"choices":[{"delta":{"content":"local"}}]}\n\n')
    res.end("data: [DONE]\n\n")
  })
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve))
  try {
    const address = server.address()
    assert.ok(address && typeof address === "object")
    const base = `http://127.0.0.1:${address.port}`
    const res = await auraFetch(`${base}/v1/chat/completions`, {
      method: "POST",
      body: JSON.stringify({ model: "local" }),
    })
    assert.equal(res.status, 200)
    assert.match(await res.text(), /local/)
    await assert.rejects(auraFetch(`${base}/redirect`), /redirect/)
    await assert.rejects(auraFetch(`${base}/local-redirect`), /redirect/)
    await assert.rejects(auraFetch("https://example.com/private"), /only/)
    assert.equal(requests, 3)
  } finally {
    server.closeAllConnections()
    await new Promise<void>((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())))
  }
})
