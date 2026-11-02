/**
 * Aura Gateway Team Selection Dialog
 *
 * Allows switching between organizations and personal account.
 * Marks the current team with "→ (current)" indicator.
 */

import { DialogSelect } from "@tui/ui/dialog-select"
import type { Organization } from "@auracode/aura-gateway"
import { getOrganizationOptions } from "@auracode/aura-gateway/tui"

interface DialogAuraTeamSelectProps {
  organizations: Organization[]
  currentOrgId?: string | null
  hasPersonalAccount?: boolean
  onSelect: (orgId: string | null) => Promise<void>
}

export function DialogAuraTeamSelect(props: DialogAuraTeamSelectProps) {
  // Get formatted options with current markers
  const options = getOrganizationOptions(
    props.organizations,
    props.currentOrgId || undefined,
    props.hasPersonalAccount !== false,
  )

  return (
    <DialogSelect
      title="Select Team"
      options={options}
      current={props.currentOrgId || null}
      onSelect={async (option: any) => {
        await props.onSelect(option.value)
      }}
    />
  )
}
