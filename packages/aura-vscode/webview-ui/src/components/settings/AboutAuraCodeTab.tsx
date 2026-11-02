import { Component } from "solid-js"
import type { ConnectionState, MigrationSource } from "../../types/messages"

export interface AboutAuraCodeTabProps {
  port: number | null
  connectionState: ConnectionState
  extensionVersion?: string
  onMigrationClick?: (source: MigrationSource) => void
}

const AboutAuraCodeTab: Component<AboutAuraCodeTabProps> = (props) => (
  <div>
    <h3>AuraCode {props.extensionVersion}</h3>
    <p>Local AI coding agent. LLM requests stay on this computer. Event telemetry is permanently disabled.</p>
    <p>MIT license. See the bundled LICENSE for attribution.</p>
  </div>
)
export default AboutAuraCodeTab
