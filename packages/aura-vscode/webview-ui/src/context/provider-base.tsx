import type { ParentComponent } from "solid-js"
import { ThemeProvider } from "@auracode/aura-ui/theme"
import { DialogProvider } from "@auracode/aura-ui/context/dialog"
import { Toast } from "@auracode/aura-ui/toast"
import { VSCodeProvider } from "./vscode"
import { ServerProvider } from "./server"
import { LanguageBridge } from "./language-bridge"
import { ProviderProvider } from "./provider"
import { ConfigProvider } from "./config"
import { DisplayProvider } from "./display"

export const Base: ParentComponent<{ content?: ParentComponent }> = (props) => {
  const Content = props.content ?? ((props) => props.children)
  return (
    <ThemeProvider defaultTheme="aura-vscode">
      <DialogProvider>
        <VSCodeProvider>
          <ServerProvider>
            <LanguageBridge>
              <Content>
                <ProviderProvider>
                  <ConfigProvider>
                    <DisplayProvider>{props.children}</DisplayProvider>
                  </ConfigProvider>
                </ProviderProvider>
              </Content>
            </LanguageBridge>
          </ServerProvider>
        </VSCodeProvider>
        <Toast.Region />
      </DialogProvider>
    </ThemeProvider>
  )
}
