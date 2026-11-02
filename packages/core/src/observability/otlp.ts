import { Layer } from "effect"
export function resource() {
  return { serviceName: "auracode", serviceVersion: "local", attributes: {} }
}
export function loggers() {
  return []
}
export async function tracingLayer() {
  return Layer.empty
}
export * as Otlp from "./otlp"
