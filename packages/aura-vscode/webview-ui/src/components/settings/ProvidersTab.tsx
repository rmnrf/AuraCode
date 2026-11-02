import { type Component, createSignal, Show } from "solid-js"
import { Card } from "@auracode/aura-ui/card"
import { TextField } from "@auracode/aura-ui/text-field"
import { Button } from "@auracode/aura-ui/button"
import { endpoint } from "@auracode/local-only"
import { useConfig } from "../../context/config"
import SettingsRow from "./SettingsRow"

const ProvidersTab: Component = () => {
  const { config, updateConfig } = useConfig()
  const [url, setURL] = createSignal(String(config().provider?.local?.options?.baseURL ?? "http://127.0.0.1:1234/v1"))
  const [model, setModel] = createSignal(config().model?.replace(/^local\//, "") ?? "local-model")
  const [error, setError] = createSignal("")
  function apply() {
    try {
      const baseURL = endpoint(url())
      const id = model().trim()
      if (!id) throw new Error("Enter the model ID exposed by your local server")
      updateConfig({
        provider: {
          local: {
            name: "Local OpenAI-compatible server",
            npm: "@ai-sdk/openai-compatible",
            options: { baseURL, apiKey: "local" },
            models: { [id]: { name: id, limit: { context: 32768, output: 4096 } } },
          },
        },
        model: `local/${id}`,
        small_model: `local/${id}`,
        enabled_providers: ["local"],
      })
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }
  return (
    <div>
      <h4>Local LLM</h4>
      <p>AuraCode uses your local OpenAI-compatible server. No account or cloud provider is required.</p>
      <Card>
        <SettingsRow title="Server URL" description="Use 127.0.0.1, localhost or [::1], including the /v1 path.">
          <TextField value={url()} onChange={setURL} placeholder="http://127.0.0.1:1234/v1" />
        </SettingsRow>
        <SettingsRow title="Model ID" description="Use the exact model ID reported by your server.">
          <TextField value={model()} onChange={setModel} placeholder="local-model" />
        </SettingsRow>
        <Button onClick={apply}>Apply local provider</Button>
        <Show when={error()}>
          <p role="alert">{error()}</p>
        </Show>
      </Card>
      <p>Save the settings after applying. The server must support streaming chat completions and tool calls.</p>
    </div>
  )
}
export default ProvidersTab
