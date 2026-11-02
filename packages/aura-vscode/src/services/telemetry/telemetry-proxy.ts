import type { TelemetryEventName, TelemetryPropertiesProvider } from "./types"
/** Compatibility facade. AuraCode never collects or transmits editor events. */
export class TelemetryProxy {
  private static singleton = new TelemetryProxy()
  static getInstance() {
    return TelemetryProxy.singleton
  }
  static capture(_event: TelemetryEventName, _properties?: Record<string, unknown>) {}
  configure(_url: string, _password: string) {}
  setProvider(_provider: TelemetryPropertiesProvider) {}
  isVSCodeTelemetryEnabled() {
    return false
  }
  capture(_event: TelemetryEventName, _properties?: Record<string, unknown>) {}
  setEnabled(_enabled: boolean) {}
  shutdown() {}
}
