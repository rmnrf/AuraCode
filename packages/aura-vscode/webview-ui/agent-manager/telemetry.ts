/** Preserve click behavior without collecting or forwarding events. */
type Value = string | number | boolean | undefined
type Properties = Record<string, Value>
type Input = Properties | (() => Properties)

export function capture(_target: unknown, _button: string, _surface: string, _properties: Properties = {}) {}

export function tracker(_target: unknown) {
  return {
    track: (_button: string, _surface: string, _properties?: Properties) => {},
    click: (_button: string, _surface: string, action: () => void, _properties?: Input) => action,
    use: <T>(_button: string, _surface: string, action: (value: T) => void) => action,
  }
}
