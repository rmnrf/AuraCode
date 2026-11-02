export type AuraEmbeddingModel = {
  id: string
  name: string
  dimension: number
  scoreThreshold: number
  note?: string
}

export type AuraEmbeddingModelCatalog = {
  defaultModel: string
  models: AuraEmbeddingModel[]
  aliases: Record<string, string>
}

export const EMPTY_AURA_EMBEDDING_MODEL_CATALOG: AuraEmbeddingModelCatalog = {
  defaultModel: "",
  models: [],
  aliases: {},
}

export function normalizeAuraEmbeddingModelId(model: string | undefined, catalog = EMPTY_AURA_EMBEDDING_MODEL_CATALOG) {
  if (!model) return undefined
  return catalog.aliases[model] ?? model
}

export function getAuraEmbeddingModel(model: string | undefined, catalog = EMPTY_AURA_EMBEDDING_MODEL_CATALOG) {
  const id = normalizeAuraEmbeddingModelId(model, catalog)
  return catalog.models.find((item) => item.id === id)
}

export function formatAuraEmbeddingModelLabel(model: AuraEmbeddingModel): string {
  const note = model.note ? `${model.note}, ` : ""
  return `${model.name} (${note}${model.dimension}d)`
}
