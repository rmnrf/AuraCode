import { AuracodeMarkdown } from "../config/markdown"

export namespace AuracodeInstruction {
  export function content(text: string, item: string, options: AuracodeMarkdown.Options) {
    return AuracodeMarkdown.substitute(text, item, options)
  }

  export async function read(item: string, options: AuracodeMarkdown.Options) {
    return content(await AuracodeMarkdown.read(item, options), item, options)
  }
}
