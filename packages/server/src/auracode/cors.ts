const origin = /^https:\/\/([a-z0-9-]+\.)*aura\.ai$/

export function corsOrigin(input: string) {
  return origin.test(input)
}
