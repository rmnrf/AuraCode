import { test, expect } from "bun:test"
import { createServer } from "node:http"
import { validateCustomProvider } from "../../webview-ui/src/components/settings/CustomProviderValidation"
import {
  sanitizeCustomProviderConfig,
  withCustomProviderDeletions,
  resolveCustomProviderAuth,
} from "../../src/shared/custom-provider"
import { fetchOpenAIModels } from "../../src/shared/fetch-models"
import { localConfig } from "@auracode/local-only"

test("the original custom form saves credentials, headers, multiple models and capabilities", () => {
  const form = {
    providerID: "workstation",
    name: "Local workstation",
    npm: "@ai-sdk/openai-compatible" as const,
    baseURL: "http://localhost:1234/v1",
    apiKey: "fake-local-key",
    saving: false,
    models: [
      {
        id: "vision",
        name: "Vision model",
        reasoning: true,
        supportsImages: true,
        modalities: {},
        variants: [
          {
            name: "deep",
            raw: { reasoningEffort: "high" },
            enableThinking: undefined,
            thinking: undefined,
            splitReasoning: undefined,
            reasoningEffort: undefined,
            outputEffort: undefined,
            chatTemplateArgs: undefined,
          },
        ],
      },
      { id: "small", name: "Small model", reasoning: false, supportsImages: false, modalities: {}, variants: [] },
    ],
    headers: [{ key: "X-Local-Server", value: "custom" }],
  }
  const input = {
    form,
    t: (key: string) => key,
    editing: false,
    disabledProviders: [],
    existingProviderIDs: new Set<string>(),
  }
  const result = validateCustomProvider(input).result!
  expect(result.key).toBe("fake-local-key")
  const parsed = sanitizeCustomProviderConfig(result.config)
  expect("error" in parsed).toBe(false)
  if ("error" in parsed) throw new Error(parsed.error)
  expect(parsed.value.options.baseURL).toBe("http://127.0.0.1:1234/v1")
  expect(parsed.value.models.vision.modalities?.input).toEqual(["text", "image"])
  expect(parsed.value.models.vision.variants?.deep).toEqual({ reasoningEffort: "high" })
  const cfg = localConfig({ provider: { workstation: parsed.value }, model: "workstation/vision" })
  expect(cfg.provider.workstation.options.headers).toEqual({ "X-Local-Server": "custom" })
  expect(Object.keys(cfg.provider.workstation.models)).toEqual(["vision", "small"])
  expect(cfg.provider.workstation.models.vision.reasoning).toBe(true)
  expect(
    validateCustomProvider({ ...input, form: { ...form, baseURL: "https://api.openai.com/v1" } }).result,
  ).toBeUndefined()
  expect(
    "error" in sanitizeCustomProviderConfig({ ...result.config, options: { baseURL: "https://api.openai.com/v1" } }),
  ).toBe(true)
  expect(resolveCustomProviderAuth(undefined, false)).toEqual({ mode: "preserve" })
  expect(resolveCustomProviderAuth("", true)).toEqual({ mode: "clear" })
  const patch = withCustomProviderDeletions(
    { ...parsed.value, options: { ...parsed.value.options, headers: { Old: "remove" } } },
    parsed.value,
  )
  expect(patch.options.headers).toEqual({ Old: null, "X-Local-Server": "custom" })
})

test("model discovery authenticates to the local server and rejects redirects and cloud URLs", async () => {
  const requests: string[] = []
  const server = createServer((req, res) => {
    requests.push(req.url!)
    if (req.headers.authorization !== "Bearer fake-local-key" || req.headers["x-local-server"] !== "custom") {
      res.writeHead(401)
      res.end()
      return
    }
    if (req.url === "/redirect/models") {
      res.writeHead(302, { location: "https://example.com/models" })
      res.end()
      return
    }
    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ data: [{ id: "vision" }, { id: "small", name: "Small" }] }))
  })
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve))
  try {
    const address = server.address()
    if (!address || typeof address === "string") throw new Error("No listening port")
    const base = `http://127.0.0.1:${address.port}`
    const options = { apiKey: "fake-local-key", headers: { "X-Local-Server": "custom" } }
    expect(await fetchOpenAIModels({ ...options, baseURL: base + "/v1" })).toEqual([
      { id: "small", name: "Small" },
      { id: "vision", name: "vision" },
    ])
    await expect(fetchOpenAIModels({ baseURL: base + "/v1" })).rejects.toThrow("HTTP 401")
    await expect(fetchOpenAIModels({ ...options, baseURL: base + "/redirect" })).rejects.toThrow("redirect")
    await expect(fetchOpenAIModels({ ...options, baseURL: "https://example.com/v1" })).rejects.toThrow("only")
    expect(requests).toEqual(["/v1/models", "/v1/models", "/redirect/models"])
  } finally {
    server.closeAllConnections()
    await new Promise<void>((resolve) => server.close(() => resolve()))
  }
})
