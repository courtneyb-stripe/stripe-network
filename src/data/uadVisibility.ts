/**
 * UAD visibility — which capability groups apply for a role set, and configure-modal section order.
 * - `resolveCapabilityGroups` feeds account badge, Actions required, and (with prototype) which header
 *   chips show: `AccountDetailActionBar` intersects config `getActionBarVisibility` with groups from here.
 * - `signalGroupsForConfigureModal` mirrors the same ordering for Configure account.
 * - Customer does not contribute capability groups (relationship-only); Payments come from Merchant only.
 */

import {
  AccountRoleId,
  CapabilityGroupId,
  CapabilityStatus,
  COMPLIANCE_ROLES,
  ROLE_TO_CAPABILITY_GROUPS,
} from './configMatrix'

/** Union of `ROLE_TO_CAPABILITY_GROUPS` for all active roles + billing when merchant is on and billing is enabled. */
export function resolveCapabilityGroups(
  activeRoles: Set<AccountRoleId>,
  billingEnabled: boolean
): CapabilityGroupId[] {
  const hasComplianceRole = [...activeRoles].some((r) => COMPLIANCE_ROLES.includes(r))
  /** Relationship-only accounts (e.g. Customer alone) have no compliance capability groups on the header. */
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
 * Configure modal section order (and consistent with header “extra” groups). Transfers omitted when
 * Storer is active (folds into Treasury).
 * Billing is omitted from Configure for now (still resolved via `resolveCapabilityGroups` + merchant billing toggle elsewhere).
 */
export function signalGroupsForConfigureModal(roles: ReadonlySet<AccountRoleId>): CapabilityGroupId[] {
  const out: CapabilityGroupId[] = []
  if (roles.has('merchant')) out.push('payments')
  if (roles.has('recipient') || roles.has('merchant') || roles.has('gp_recipient')) out.push('payouts')
  if (roles.has('recipient') && !roles.has('storer')) out.push('transfers')
  if (roles.has('storer')) out.push('treasury')
  if (roles.has('borrower')) out.push('capital')
  if (roles.has('card_holder')) out.push('issuing')
  return out
}

/** Exactly one role and it is Connect `recipient`. */
export function isRecipientOnlyRoles(roles: ReadonlySet<AccountRoleId>): boolean {
  return roles.size === 1 && roles.has('recipient')
}

/**
 * GP recipient never models Connect payout schedules (any role combo). Connect recipient-alone ditto.
 * Drives Configure toggle, URL `payoutSchedule`, prototype flag sync, and payouts popover external well.
 */
export function suppressConnectPayoutSchedule(roles: ReadonlySet<AccountRoleId>): boolean {
  return roles.has('gp_recipient') || isRecipientOnlyRoles(roles)
}

/**
 * Whether Configure shows “Has payout schedule” and popover may use the schedule + destinations well.
 */
export function canConfigurePayoutSchedule(roles: ReadonlySet<AccountRoleId>): boolean {
  if (suppressConnectPayoutSchedule(roles)) return false
  return roles.has('merchant') || roles.has('recipient')
}

/** Popover lower well when explicit schedule block vs external destinations-only. */
export function payoutsPopoverLowerWellForRoles(
  roles: ReadonlySet<AccountRoleId>
): 'payoutInformation' | 'external' | undefined {
  return suppressConnectPayoutSchedule(roles) ? 'external' : undefined
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

/**
 * True when any resolved compliance capability (excl. billing) or Tax is not **active** —
 * used to surface Actions required (limited / pausing_soon / paused, and tax non-active).
 */
export function hasAnyNonActiveComplianceStatus(
  capabilityStatuses: Record<CapabilityGroupId, CapabilityStatus>,
  activeGroups: CapabilityGroupId[],
  taxCapabilityStatus: CapabilityStatus
): boolean {
  for (const g of capabilityGroupsWithStatus(activeGroups)) {
    const s = capabilityStatuses[g]
    if (s != null && s !== 'active') return true
  }
  return taxCapabilityStatus !== 'active'
}

export function isRelationshipOnly(activeRoles: Set<AccountRoleId>): boolean {
  return [...activeRoles].every(r => COMPLIANCE_ROLES.indexOf(r) === -1)
}
