import type { CommandModule } from "yargs"

type Args = {}

export const GenerateCommand = {
  command: "generate",
  builder: (yargs) => yargs,
  handler: async () => {
    const { Server } = await import("../../server/server")
    const specs = (await Server.openapi()) as {
      info: { title: string; description: string } // auracode_change
      paths: Record<string, Record<string, any>>
    }
    // auracode_change start
    specs.info.title = "aura"
    specs.info.description = "aura api"
    // auracode_change end
    for (const item of Object.values(specs.paths)) {
      for (const method of ["get", "post", "put", "delete", "patch"] as const) {
        const operation = item[method]
        if (!operation?.operationId) continue
        operation["x-codeSamples"] = [
          // auracode_change start
          {
            lang: "js",
            source: [
              `import { createAuraClient } from "@auracode/sdk"`,
              ``,
              `const client = createAuraClient()`,
              `await client.${operation.operationId}({`,
              `  ...`,
              `})`,
            ].join("\n"),
          },
          // auracode_change end,
        ]
      }
    }
    const raw = JSON.stringify(specs, null, 2)
      // auracode_change start - replace upstream product name in all descriptions
      .replaceAll("OpenCode", "Aura")
      .replaceAll("opencode.local", "aura.local")
      .replaceAll("opencode serve", "aura serve")
      .replaceAll("https://opencode.ai/", "https://aura.ai/")
    // auracode_change end

    // Format through prettier so output is byte-identical to committed file
    // regardless of whether ./script/format.ts runs afterward.
    const prettier = await import("prettier")
    const babel = await import("prettier/plugins/babel")
    const estree = await import("prettier/plugins/estree")
    const format = prettier.format ?? prettier.default?.format
    const json = await format(raw, {
      parser: "json",
      plugins: [babel.default ?? babel, estree.default ?? estree],
      printWidth: 120,
    })

    // Wait for stdout to finish writing before process.exit() is called
    await new Promise<void>((resolve, reject) => {
      process.stdout.write(json, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  },
} satisfies CommandModule<object, Args>
