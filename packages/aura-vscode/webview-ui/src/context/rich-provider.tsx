import { createContext, onCleanup, onMount, useContext, type ParentComponent } from "solid-js"
import { MarkedProvider } from "@auracode/aura-ui/context/marked"
import { CodeComponentProvider } from "@auracode/aura-ui/context/code"
import { DiffComponentProvider } from "@auracode/aura-ui/context/diff"
import { FileComponentProvider } from "@auracode/aura-ui/context/file"
import { Code } from "@auracode/aura-ui/code"
import { Diff } from "@auracode/aura-ui/diff"
import { File } from "@auracode/aura-ui/file"
import { useVSCode } from "./vscode"

const Context = createContext(false)

export const RichProvider: ParentComponent = (props) => {
  if (useContext(Context)) return props.children
  const vscode = useVSCode()
  onMount(() => {
    const save = (event: Event) => {
      const detail = (event as CustomEvent<{ dataUrl: string; filename: string }>).detail
      if (!detail?.dataUrl || !detail.filename) return
      event.preventDefault()
      vscode.postMessage({ type: "saveImage", dataUrl: detail.dataUrl, filename: detail.filename })
    }
    window.addEventListener("aura:save-image", save)
    onCleanup(() => window.removeEventListener("aura:save-image", save))
  })

  return (
    <Context.Provider value={true}>
      <MarkedProvider>
        <DiffComponentProvider component={Diff}>
          <CodeComponentProvider component={Code}>
            <FileComponentProvider component={File}>{props.children}</FileComponentProvider>
          </CodeComponentProvider>
        </DiffComponentProvider>
      </MarkedProvider>
    </Context.Provider>
  )
}
