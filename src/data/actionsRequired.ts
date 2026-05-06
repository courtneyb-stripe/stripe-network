/**
 * Actions required — 9 items for modal list, sidebar preview, and Payouts/Payments dropdowns.
 *
 * Data shape: Each ActionRequiredItem has title, dueDate, impactsFilter (payments | payouts | both | other),
 * and optional extraCapabilityGroupsCount / capabilityCount. Display text is derived via getImpactsDisplayString
 * or getImpactsDisplayParts (base + optional "+X more"); do not store a static impacts label on the item.
 *
 * Display logic: ActionRequiredDescriptionRow shows "Impacts " + base string; when extraCapabilityGroupsCount > 0,
 * it appends a dotted "+X more" with tooltip from getImpactsMoreTooltipLabel (bullet list of capability names).
 * When there is no "+X more", the main "Impacts X" text can show a tooltip via getImpactsTooltipLabel (capabilities
 * paused). Modal filter chips use impactsFilter (All / Impacts payments / Impacts payouts). Deep link: Payouts
 * dropdown → modal filtered to "Impacts payouts"; Payments dropdown → "Impacts payments".
 *
 * Where used: ActionsRequiredSidebarSection (sidebar, first 3), ActionsRequiredModal (full list + filter),
 * AccountDetailActionBar dropdown (filtered by Payouts/Payments). All use List with variant="noDividers".
 */

export type ImpactsFilter = 'payments' | 'payouts' | 'both' | 'other'

export type ActionRequiredItem = {
  id: string
  title: string
  dueDate: Date
  /** For modal filter chips: payments, payouts, or both. Use 'other' when action does not impact Payments or Payouts. */
  impactsFilter: ImpactsFilter
  /** When set, show "+X more" after the main impacts string (e.g. "Payments +1 more"). */
  extraCapabilityGroupsCount?: number
  /** When impactsFilter is 'other', number of capabilities to show as "X capabilities". */
  capabilityCount?: number
}

/** All 9 actions — matches sidebar (first 3) and Payouts/Payments dropdown content. extraCapabilityGroupsCount >= 2 simulates bullet list of many impacted capabilities. */
export const ACTIONS_REQUIRED_LIST: ActionRequiredItem[] = [
  {
    id: '0',
    title: 'Provide an address for business representative',
    dueDate: new Date(2026, 1, 3),
    impactsFilter: 'both',
    extraCapabilityGroupsCount: 3,
  },
  {
    id: '1',
    title: 'Verify business ownership',
    dueDate: new Date(2026, 0, 28),
    impactsFilter: 'payouts',
    extraCapabilityGroupsCount: 2,
  },
  {
    id: '2',
    title: 'Complete identity verification',
    dueDate: new Date(2026, 1, 10),
    impactsFilter: 'payments',
    extraCapabilityGroupsCount: 4,
  },
  {
    id: '3',
    title: 'Submit additional documentation',
    dueDate: new Date(2026, 0, 20),
    impactsFilter: 'payouts',
    extraCapabilityGroupsCount: 2,
  },
  {
    id: '4',
    title: 'Add bank account information',
    dueDate: new Date(2026, 1, 5),
    impactsFilter: 'payouts',
    extraCapabilityGroupsCount: 3,
  },
  {
    id: '5',
    title: 'Verify tax information',
    dueDate: new Date(2026, 0, 15),
    impactsFilter: 'payments',
    extraCapabilityGroupsCount: 2,
  },
  {
    id: '6',
    title: 'Update business address',
    dueDate: new Date(2026, 1, 1),
    impactsFilter: 'both',
    extraCapabilityGroupsCount: 2,
  },
  {
    id: '7',
    title: 'Accept updated service agreement',
    dueDate: new Date(2026, 0, 25),
    impactsFilter: 'payments',
    extraCapabilityGroupsCount: 3,
  },
  {
    id: '8',
    title: 'Complete payout verification',
    dueDate: new Date(2026, 1, 8),
    impactsFilter: 'payouts',
    extraCapabilityGroupsCount: 2,
  },
]

/**
 * True when expired default PM should appear under **Blocking issues** (Needs Attention sidebar + modal).
 * Requires a payment method on file and “Default payment method is expired” in Configure.
 */
export function shouldSurfaceExpiredPaymentMethodBlocking(
  prototype: {
    hasPaymentMethodOnFile: boolean
    relationship: { expiredPaymentMethod: boolean }
  } | null | undefined
): boolean {
  if (prototype == null) return false
  return (
    prototype.hasPaymentMethodOnFile === true && prototype.relationship.expiredPaymentMethod === true
  )
}

/**
 * Configure → “Default payment method is expired”. Shown under Blocking issues when
 * {@link shouldSurfaceExpiredPaymentMethodBlocking} is true — not counted in ACTIONS_REQUIRED_LIST.
 */
export const BLOCKING_EXPIRED_DEFAULT_PAYMENT_METHOD: ActionRequiredItem = {
  id: 'blocking-expired-default-pm',
  title: 'Replace expired default payment method',
  dueDate: new Date(2026, 3, 1),
  impactsFilter: 'payments',
}

export function getActionTitle(actionId: string): string {
  if (actionId === BLOCKING_EXPIRED_DEFAULT_PAYMENT_METHOD.id) {
    return BLOCKING_EXPIRED_DEFAULT_PAYMENT_METHOD.title
  }
  const item = ACTIONS_REQUIRED_LIST.find((a) => a.id === actionId)
  return item?.title ?? `Action required ${actionId}`
}

/** Count by filter for ViewChip "All". */
export const ACTIONS_REQUIRED_COUNT = ACTIONS_REQUIRED_LIST.length

function matchesFilter(item: ActionRequiredItem, filter: 'all' | ImpactsFilter): boolean {
  if (filter === 'all') return true
  if (item.impactsFilter === filter) return true
  if (item.impactsFilter === 'both') return true
  return false
}

export function filterActionsRequired(filter: 'all' | ImpactsFilter): ActionRequiredItem[] {
  return ACTIONS_REQUIRED_LIST.filter((a) => matchesFilter(a, filter))
}

export function getActionsRequiredCountByFilter(filter: 'all' | ImpactsFilter): number {
  return filterActionsRequired(filter).length
}

/** Capability titles paused when this impacts filter applies (for tooltip bullet list). */
const CAPABILITIES_PAUSED_BY_FILTER: Record<ImpactsFilter, string[]> = {
  payouts: ['Transfers'],
  payments: [
    'Card payments',
    'Link payments',
    'Affirm payments',
    'Afterpay Clearpay payments',
    'Klarna payments',
  ],
  both: [
    'Card payments',
    'Transfers',
    'Link payments',
    'Affirm payments',
    'Afterpay Clearpay payments',
    'Klarna payments',
  ],
  other: [],
}

/** Bullet list of capability titles paused by this action (for description tooltip). */
export function getCapabilitiesPausedByAction(impactsFilter: ImpactsFilter): string[] {
  return CAPABILITIES_PAUSED_BY_FILTER[impactsFilter] ?? []
}

/** Capability names for "+X more" tooltip (other capability groups paused). Simulated list. */
const EXTRA_CAPABILITY_NAMES = [
  'Card issuing',
  'Treasury',
  'Capital',
  'Connect',
  'Radar',
]

/** Display string after "Impacts " — Payments, Payouts, "Payments, Payouts", "+X more", or "X capabilities" when other. */
export function getImpactsDisplayString(action: ActionRequiredItem): string {
  if (action.impactsFilter === 'other') {
    const count = action.capabilityCount ?? 0
    return `${count} capabilities`
  }
  const base =
    action.impactsFilter === 'payments'
      ? 'Payments'
      : action.impactsFilter === 'payouts'
        ? 'Payouts'
        : 'Payments, Payouts'
  const more = action.extraCapabilityGroupsCount != null && action.extraCapabilityGroupsCount > 0
    ? ` +${action.extraCapabilityGroupsCount} more`
    : ''
  return base + more
}

/** Base and optional "+X more" parts for display. When more is set, base is plain text and only "+X more" is dotted with tooltip. */
export function getImpactsDisplayParts(action: ActionRequiredItem): { base: string; more: string | undefined } {
  if (action.impactsFilter === 'other') {
    const count = action.capabilityCount ?? 0
    return { base: `${count} capabilities`, more: undefined }
  }
  const base =
    action.impactsFilter === 'payments'
      ? 'Payments'
      : action.impactsFilter === 'payouts'
        ? 'Payouts'
        : 'Payments, Payouts'
  const hasMore = action.extraCapabilityGroupsCount != null && action.extraCapabilityGroupsCount > 0
  const more = hasMore ? ` +${action.extraCapabilityGroupsCount} more` : undefined
  return { base, more }
}

/** Tooltip for the main "Impacts X" text when there is no "+X more" (bullet list of capabilities). */
export function getImpactsTooltipLabel(action: ActionRequiredItem): string {
  if (action.impactsFilter === 'other') {
    const count = action.capabilityCount ?? 0
    return count === 1 ? '1 capability paused' : `${count} capabilities paused`
  }
  const hasMore = action.extraCapabilityGroupsCount != null && action.extraCapabilityGroupsCount > 0
  if (hasMore) {
    return '' // not used; "+X more" uses getImpactsMoreTooltipLabel
  }
  const capabilities = getCapabilitiesPausedByAction(action.impactsFilter)
  return capabilities.length > 0
    ? capabilities.map((t) => `• ${t}`).join('\n')
    : getImpactsDisplayString(action)
}

/** Tooltip for the "+X more" part only: bullet list of the other capabilities paused by name. */
export function getImpactsMoreTooltipLabel(action: ActionRequiredItem): string {
  const n = action.extraCapabilityGroupsCount
  if (n == null || n <= 0) return ''
  const names = EXTRA_CAPABILITY_NAMES.slice(0, n)
  return names.map((t) => `• ${t}`).join('\n')
}
