import { localURL } from "@auracode/local-only"

const transport = globalThis.fetch.bind(globalThis)

/** Explicitly validate every redirect before making another request. */
async function request(input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]): Promise<Response> {
  const request = new Request(input, init)
  const url = localURL(request.url)
  const response = await transport(new Request(url, request), { redirect: "manual" })
  if ([301, 302, 303, 307, 308].includes(response.status)) {
    await response.body?.cancel()
    throw new Error("AuraCode does not follow HTTP redirects; configure the final local endpoint")
  }
  return response
}

// Bun exposes preconnect on fetch; speculative connections are disabled.
export const auraFetch: typeof fetch = Object.assign(request, { preconnect() {} })
