import { dict as app } from "../../i18n/fr"
import { dict as ui } from "@auracode/aura-ui/i18n/fr"
import { dict as aura } from "@auracode/aura-i18n/fr"
import { dict as english } from "../../../agent-manager/i18n/en"
import { dict as am } from "../../../agent-manager/i18n/fr"

export default function dictionary(base: Record<string, string>): Record<string, string> {
  return { ...base, ...app, ...ui, ...aura, ...english, ...am }
}
