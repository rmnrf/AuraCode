import { createContext, createSignal, onCleanup, useContext, type Accessor, type ParentComponent } from "solid-js"
import {
  EMPTY_AURA_EMBEDDING_MODEL_CATALOG,
  type AuraEmbeddingModelCatalog,
} from "@auracode/aura-indexing/embedding-models"
import { useVSCode } from "./vscode"
import type { ExtensionMessage } from "../types/messages"

type AuraEmbeddingModelsContextValue = {
  catalog: Accessor<AuraEmbeddingModelCatalog>
}

export const AuraEmbeddingModelsContext = createContext<AuraEmbeddingModelsContextValue>()

export const AuraEmbeddingModelsProvider: ParentComponent = (props) => {
  const vscode = useVSCode()
  const [catalog, setCatalog] = createSignal<AuraEmbeddingModelCatalog>(EMPTY_AURA_EMBEDDING_MODEL_CATALOG)

  const unsubscribe = vscode.onMessage((message: ExtensionMessage) => {
    if (message.type !== "auraEmbeddingModelsLoaded") return
    setCatalog(message.catalog)
  })

  vscode.postMessage({ type: "requestAuraEmbeddingModels" })

  onCleanup(unsubscribe)

  return <AuraEmbeddingModelsContext.Provider value={{ catalog }}>{props.children}</AuraEmbeddingModelsContext.Provider>
}

export function useAuraEmbeddingModels(): AuraEmbeddingModelsContextValue {
  const context = useContext(AuraEmbeddingModelsContext)
  if (!context) {
    throw new Error("useAuraEmbeddingModels must be used within a AuraEmbeddingModelsProvider")
  }
  return context
}
