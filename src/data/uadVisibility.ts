import {
  AccountRoleId,
  CapabilityGroupId,
  CapabilityStatus,
  COMPLIANCE_ROLES,
  ROLE_TO_CAPABILITY_GROUPS,
} from './configMatrix'

export function resolveCapabilityGroups(
  activeRoles: Set<AccountRoleId>,
  billingEnabled: boolean
): CapabilityGroupId[] {
  const hasComplianceRole = [...activeRoles].some(r => COMPLIANCE_ROLES.includes(r))
  if (!hasComplianceRole) return []

  const groups = new Set<CapabilityGroupId>()
  for (const role of activeRoles) {
    for (const group of ROLE_TO_CAPABILITY_GROUPS[role]) {
      groups.add(group)
    }
  }
  if (activeRoles.has('merchant') && billingEnabled) {
    groups.add('billing')
  }
  return Array.from(groups)
}

/** Billing is toggled on/off only; it does not carry capability status or affect account status. */
export function capabilityGroupsWithStatus(groups: CapabilityGroupId[]): CapabilityGroupId[] {
  return groups.filter((g) => g !== 'billing')
}

export function deriveAccountStatus(
  capabilityStatuses: Record<CapabilityGroupId, CapabilityStatus>,
  activeGroups: CapabilityGroupId[]
): 'enabled' | 'restricted_soon' | 'restricted' | null {
  const groups = capabilityGroupsWithStatus(activeGroups)
  if (groups.length === 0) return null
  const statuses = groups.map((g) => capabilityStatuses[g])
  if (statuses.some(s => s === 'paused' || s === 'limited')) return 'restricted'
  if (statuses.some(s => s === 'pausing_soon')) return 'restricted_soon'
  return 'enabled'
}

export function isRelationshipOnly(activeRoles: Set<AccountRoleId>): boolean {
  return [...activeRoles].every(r => COMPLIANCE_ROLES.indexOf(r) === -1)
}
