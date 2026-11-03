import { localURL, providerEndpoint } from "@auracode/local-only"

const transport = globalThis.fetch.bind(globalThis)

/** Never follow redirects with authorization headers or sensitive prompts. */
async function withoutRedirects(req: Request): Promise<Response> {
  const response = await transport(req, { redirect: "manual" })
  if ([301, 302, 303, 307, 308].includes(response.status)) {
    await response.body?.cancel()
    throw new Error("AuraCode does not follow HTTP redirects; configure the final endpoint")
  }
  return response
}

/** Called only for explicit Fetch Models actions, before saving provider config. */
export async function providerFetch(input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]): Promise<Response> {
  const req = new Request(input, init)
  return withoutRedirects(new Request(providerEndpoint(req.url), req))
}

async function request(input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]): Promise<Response> {
  const req = new Request(input, init)
  return withoutRedirects(new Request(localURL(req.url), req))
}

// Bun exposes preconnect on fetch; speculative connections are disabled.
export const auraFetch: typeof fetch = Object.assign(request, { preconnect() {} })
