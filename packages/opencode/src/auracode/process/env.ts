export function model(extra?: NodeJS.ProcessEnv | null): Record<string, string> {
  const env = Object.fromEntries(
    Object.entries({ ...process.env, ...(extra ?? {}) }).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  )
  delete env.AURA_SERVER_PASSWORD
  delete env.AURA_SERVER_USERNAME
  delete env.AURA_BROWSER_BROKER_URL
  delete env.AURA_BROWSER_BROKER_TOKEN
  delete env.AURA_CONFIG
  delete env.AURA_CONFIG_CONTENT
  delete env.AURA_CONFIG_DIR
  return env
}
