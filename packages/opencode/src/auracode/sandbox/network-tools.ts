export const opaque = [
  { id: "semantic_search", file: "auracode/tool/semantic-search.ts" },
  { id: "lsp", file: "tool/lsp.ts" },
] as const

export const host = [
  { id: "notebook_execute", file: "auracode/tool/notebook-host.ts" },
  { id: "background_process", file: "auracode/tool/background-process.ts" },
] as const
