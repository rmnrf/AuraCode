import { Button } from "@auracode/aura-ui/button"
import { Card } from "@auracode/aura-ui/card"
import { useDialog } from "@auracode/aura-ui/context/dialog"
import { Tag } from "@auracode/aura-ui/tag"
import { showToast } from "@auracode/aura-ui/toast"
import { type Component, For, Show, createMemo, onCleanup } from "solid-js"
import { useConfig } from "../../context/config"
import { useLanguage } from "../../context/language"
import { useProvider } from "../../context/provider"
import { useVSCode } from "../../context/vscode"
import { createProviderAction } from "../../utils/provider-action"
import { isCustomProviderPackage } from "../../../../src/shared/provider-model"
import CustomProviderDialog from "./CustomProviderDialog"

const ProvidersTab: Component = () => {
  const dialog = useDialog()
  const { config, updateConfig } = useConfig()
  const language = useLanguage()
  const provider = useProvider()
  const vscode = useVSCode()
  const action = createProviderAction(vscode)
  onCleanup(action.dispose)
  const entries = createMemo(() =>
    Object.entries(config().provider ?? {}).flatMap(([id, cfg]) =>
      cfg && isCustomProviderPackage(cfg.npm) ? [{ id, config: cfg, name: cfg.name ?? id }] : [],
    ),
  )
  const disabled = (id: string) => (config().disabled_providers ?? []).includes(id)

  function toggle(id: string) {
    const next = config().disabled_providers ?? []
    updateConfig({ disabled_providers: disabled(id) ? next.filter((value) => value !== id) : [...next, id] })
  }

  function remove(id: string, name: string) {
    action.send(
      { type: "disconnectProvider", providerID: id },
      {
        onDisconnected: () =>
          showToast({
            variant: "success",
            icon: "circle-check",
            title: language.t("provider.disconnect.toast.disconnected.title", { provider: name }),
          }),
        onError: (message) => showToast({ title: language.t("common.requestFailed"), description: message.message }),
      },
    )
  }

  return (
    <div>
      <h4>{language.t("settings.providers.tag.customProvider")}</h4>
      <p>{language.t("settings.providers.local.description")}</p>
      <Button variant="primary" icon="plus-small" onClick={() => dialog.show(() => <CustomProviderDialog />)}>
        {language.t("provider.custom.title")}
      </Button>
      <Card>
        <Show when={entries().length} fallback={<p>{language.t("settings.providers.connected.empty")}</p>}>
          <For each={entries()}>
            {(item) => (
              <div class="auracode-custom-provider">
                <div>
                  <strong>{item.name}</strong> <Tag>{item.id}</Tag>
                  <p>{String(item.config.options?.baseURL ?? "")}</p>
                  <span>
                    {disabled(item.id)
                      ? language.t("settings.providers.local.disabled")
                      : provider.connected().includes(item.id)
                        ? language.t("settings.providers.local.connected")
                        : language.t("settings.providers.local.configured")}
                  </span>
                </div>
                <div class="auracode-custom-provider-actions">
                  <Button
                    variant="secondary"
                    onClick={() =>
                      dialog.show(() => (
                        <CustomProviderDialog
                          existing={{ providerID: item.id, name: item.name, config: item.config }}
                        />
                      ))
                    }
                  >
                    {language.t("provider.custom.edit.title")}
                  </Button>
                  <Button variant="ghost" onClick={() => toggle(item.id)}>
                    {disabled(item.id)
                      ? language.t("settings.providers.disabled.enable")
                      : language.t("settings.providers.local.disable")}
                  </Button>
                  <Button variant="ghost" onClick={() => remove(item.id, item.name)}>
                    {language.t("common.delete")}
                  </Button>
                </div>
              </div>
            )}
          </For>
        </Show>
      </Card>
      <p>{language.t("settings.providers.local.notice")}</p>
    </div>
  )
}
export default ProvidersTab
