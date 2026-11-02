/** Event transport has been removed from AuraCode. */
export namespace Client {
  export function init(_dir = "") {}
  export function getClient() {
    return null
  }
  export function setEnabled(_value: boolean) {}
  export function isEnabled() {
    return false
  }
  export function capture(_event: unknown, _properties?: Record<string, unknown>) {}
  export function alias(_id: string, _alias: string) {}
  export async function shutdown(_timeout?: number) {}
  export function flushInBackground(_delay = 300) {}
}
