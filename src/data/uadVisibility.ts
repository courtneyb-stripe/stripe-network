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

/**
 * Signal group chip ordering for the configure modal and header extras — same ordering rules.
 * When Storer is active, Transfers is omitted (it rolls up into Financial accounts / treasury).
 */
export function signalGroupsForConfigureModal(roles: ReadonlySet<AccountRoleId>): CapabilityGroupId[] {
  const out: CapabilityGroupId[] = []
  if (roles.has('merchant') || roles.has('customer')) out.push('payments')
  if (roles.has('recipient')) out.push('payouts')
  if (roles.has('merchant')) out.push('billing')
  if (roles.has('recipient') && !roles.has('storer')) out.push('transfers')
  if (roles.has('storer')) out.push('treasury')
  if (roles.has('borrower')) out.push('capital')
  if (roles.has('card_holder')) out.push('issuing')
  return out
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
  /** Paused restricts the account; limited does not (account remains effectively active). */
  if (statuses.some((s) => s === 'paused')) return 'restricted'
  if (statuses.some((s) => s === 'pausing_soon')) return 'restricted_soon'
  return 'enabled'
}

export function isRelationshipOnly(activeRoles: Set<AccountRoleId>): boolean {
  return [...activeRoles].every(r => COMPLIANCE_ROLES.indexOf(r) === -1)
}
