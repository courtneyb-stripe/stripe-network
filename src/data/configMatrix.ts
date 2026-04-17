/*
SIGNAL GROUPS — header rendering rules

COMPLIANCE ROLES → signal group chips + account status badge
  merchant     → Payments (+ Billing if billingEnabled); Payouts are Recipient-only
  recipient    → Transfers, Payouts (Transfers folds into Financial accounts if Storer also active)
  storer       → Financial accounts
  card_holder  → Card issuing (configure modal + resolver; “Issuer” pill is not selectable — use Card issuer)
  borrower     → Financing

RELATIONSHIP ROLE → metadata only, no pills, no account status badge
  customer     → Payments (consume side, no compliance)

TRANSFERS FOLD RULE
  Recipient alone     → Transfers pill shows
  Recipient + Storer  → Transfers folds into Financial accounts (one pill)
  Storer alone        → Financial accounts only, no Transfers

BILLING
  → appears as a signal group chip when Merchant selected
  → toggle: Uses billing (off by default)
  → sub-options when on: Invoicing, Subscriptions, Metered billing (at least one required)

ACCOUNT STATUS (derived, compliance roles only)
  all active or limited only → Enabled (green #2B8700); limited does not restrict the account
  any pausing_soon   → Restricted soon (yellow)
  any paused         → Restricted (red #E61947)
  customer only      → no badge

RISK BADGE (appended to account status)
  low      → nothing
  elevated → yellow badge "Elevated risk"
  high     → red badge "High risk" (#E61947)

NON-COMPLIANCE ALERT
  → orange dot on relevant signal group chip
  → account status badge unchanged

ROLE DIRECTION + COMPLIANCE
  merchant     → distributes, hasCompliance: true
  recipient    → distributes, hasCompliance: true
  storer       → distributes, hasCompliance: true
  issuer       → distributes, hasCompliance: true
  card_holder  → consumes,    hasCompliance: true
  borrower     → consumes,    hasCompliance: true
  customer     → consumes,    hasCompliance: false

STORER AUTO-SELECT
  Selecting Storer automatically adds Recipient if not already active (nudge, not hard block)
*/

export type AccountRoleId =
  | 'merchant' | 'customer' | 'recipient'
  | 'storer' | 'borrower' | 'issuer' | 'card_holder'

export type CapabilityGroupId =
  | 'payments' | 'payouts' | 'transfers'
  | 'billing' | 'treasury' | 'capital' | 'issuing'

export type CapabilityStatus =
  | 'active' | 'pausing_soon' | 'limited' | 'paused'

export type RiskLevel = 'low' | 'elevated' | 'high'

export type BillingFlavor =
  | 'invoicing' | 'subscriptions' | 'metered_billing'

export type RoleDirection = 'distributes' | 'consumes'

export type RelationshipFlags = {
  hasActiveSubscriptions: boolean
  hasIssuedCard: boolean
  expiredPaymentMethod: boolean
}

export type SignalGroupConfig = {
  capabilityStatus: CapabilityStatus
  // Payments
  hasPaymentMethodOnFile?: boolean
  // Payouts
  hasPayoutSchedule?: boolean
  // Financial accounts (treasury group id)
  hasFinancialAccounts?: boolean
  // Financing (capital group id)
  hasBusinessFinancing?: boolean
  financingType?: 'loan' | 'cash_advance'
  // Card Issuing (issuing group id)
  participatesInCardProgram?: boolean
  // Billing
  billingEnabled?: boolean
  billingFlavors?: Set<BillingFlavor>
}

export const COMPLIANCE_ROLES: AccountRoleId[] = [
  'merchant', 'recipient', 'storer', 'issuer', 'card_holder', 'borrower'
]

export const RELATIONSHIP_ROLES: AccountRoleId[] = ['customer']

export const ROLE_METADATA: Record<AccountRoleId, {
  direction: RoleDirection
  hasCompliance: boolean
}> = {
  merchant:    { direction: 'distributes', hasCompliance: true },
  recipient:   { direction: 'distributes', hasCompliance: true },
  storer:      { direction: 'distributes', hasCompliance: true },
  issuer:      { direction: 'distributes', hasCompliance: true },
  card_holder: { direction: 'consumes',    hasCompliance: true },
  borrower:    { direction: 'consumes',    hasCompliance: true },
  customer:    { direction: 'consumes',    hasCompliance: false },
}

export const ROLE_TO_CAPABILITY_GROUPS: Record<AccountRoleId, CapabilityGroupId[]> = {
  merchant:    ['payments'],
  customer:    ['payments'],
  recipient:   ['transfers', 'payouts'],
  storer:      ['treasury'],
  borrower:    ['capital'],
  /** Card Issuing is driven only by Card issuer in the prototype UI (Issuer role is not selectable). */
  issuer:      [],
  card_holder: ['issuing'],
}

export const SIGNAL_GROUP_DEFAULTS: Record<AccountRoleId, Partial<SignalGroupConfig>> = {
  merchant:    { hasPaymentMethodOnFile: true },
  customer:    { hasPaymentMethodOnFile: true },
  recipient:   { hasPayoutSchedule: true },
  storer:      { hasFinancialAccounts: true },
  borrower:    { hasBusinessFinancing: true },
  issuer:      {},
  card_holder: { participatesInCardProgram: true },
}

export const GROUP_FOLD_RULES: Partial<Record<CapabilityGroupId, {
  foldInto: CapabilityGroupId
  whenRolesActive: AccountRoleId[]
}>> = {
  transfers: {
    foldInto: 'treasury',
    whenRolesActive: ['storer', 'recipient'],
  }
}

export const CAPABILITY_STATUS_STYLES: Record<CapabilityStatus, { hex: string; icon: string }> = {
  active:       { hex: '#2B8700', icon: 'status-active' },
  /** Pausing soon: orange circle + minus (Figma 5120:109098). */
  pausing_soon: { hex: '#E46602', icon: 'status-pausing-soon' },
  /** Limited: orange circle + exclamation (Figma 5120:109098). */
  limited:      { hex: '#E46602', icon: 'status-limited' },
  paused:       { hex: '#E61947', icon: 'status-paused' },
}

/** Human-readable label for capability group status (header + popovers). */
export const CAPABILITY_STATUS_DISPLAY_LABELS: Record<CapabilityStatus, string> = {
  active: 'Active',
  pausing_soon: 'Pausing soon',
  limited: 'Limited',
  paused: 'Paused',
}

export const RISK_BADGE: Record<RiskLevel, { label: string; hex: string } | null> = {
  low:      null,
  elevated: { label: 'Elevated risk', hex: '#F5A623' },
  high:     { label: 'High risk',     hex: '#E61947' },
}

export const ROLE_AUTO_SELECT: Partial<Record<AccountRoleId, AccountRoleId[]>> = {
  storer: ['recipient'],
}

export const BILLING_FLAVOR_LABELS: Record<BillingFlavor, string> = {
  invoicing: 'Invoicing',
  subscriptions: 'Subscriptions',
  metered_billing: 'Metered billing',
}

/**
 * Financial accounts signal-group popover — capability chips only (Figma 113:49956).
 * Border tokens: align with `border-neutral-100` / Border default (#d8dee4).
 */
export const FINANCIAL_ACCOUNTS_POPOVER_CHIPS = [
  'Transfers',
  'Inbound transfers',
  'Outbound transfers',
  'Bank accounts',
  'Financial addresses',
  'Holds multi-currencies',
] as const

/** Configure account → Financing: Loan / Cash advance checkboxes (popover chips follow selection). */
export type FinancingProductSelection = {
  loan: boolean
  cashAdvance: boolean
}

export const DEFAULT_FINANCING_POPOVER: FinancingProductSelection = { loan: true, cashAdvance: false }

/**
 * Capability chips for Financing popover — matches “Loan” / “Cash advance” in Configure account.
 * If both off, defaults to loan (same as configure modal nudge).
 */
export function financingPopoverChipLabels(
  selection: FinancingProductSelection
): string[] {
  let { loan, cashAdvance } = selection
  if (!loan && !cashAdvance) {
    loan = true
  }
  const out: string[] = []
  if (loan) out.push('Loans')
  if (cashAdvance) out.push('Cash advances')
  return out
}

/** Human-readable labels for capability / signal group chips (configure modal + account header). */
export const CAPABILITY_GROUP_DISPLAY_LABELS: Record<CapabilityGroupId, string> = {
  payments: 'Payments',
  payouts: 'Payouts',
  transfers: 'Transfers',
  billing: 'Billing',
  treasury: 'Financial accounts',
  capital: 'Financing',
  issuing: 'Card issuing',
}

/** Order used in configure modal sections and stable header chip order. */
export const CAPABILITY_GROUP_DISPLAY_ORDER: CapabilityGroupId[] = [
  'payments',
  'payouts',
  'transfers',
  'billing',
  'treasury',
  'capital',
  'issuing',
]

/**
 * Header chips after Payouts/Payments/Billing: shown when the group is resolved for roles and
 * capability status is active. Excludes payments/payouts (dedicated buttons) and billing (own chip).
 */
export const HEADER_EXTRA_ACTIVE_CAPABILITY_ORDER: CapabilityGroupId[] = [
  'transfers',
  'treasury',
  'capital',
  'issuing',
]

/** Ghost button aria-label / tooltip when status is active (header row). */
export const HEADER_CAPABILITY_ACTIVE_TOOLTIP: Partial<Record<CapabilityGroupId, string>> = {
  transfers: 'Transfers are active for this account.',
  treasury: 'Financial accounts are active for this account.',
  capital: 'Financing is active for this account.',
  issuing: 'Card issuing is active for this account.',
}

const BILLING_FLAVOR_ORDER: BillingFlavor[] = ['invoicing', 'subscriptions', 'metered_billing']

/** Billing chip hover: lists active products, stable order. */
export function formatBillingProductsTooltip(flavors: ReadonlySet<BillingFlavor>): string {
  const labels = BILLING_FLAVOR_ORDER.filter((id) => flavors.has(id)).map(
    (id) => BILLING_FLAVOR_LABELS[id]
  )
  return labels.length > 0
    ? `${labels.join(', ')} are active on this account.`
    : 'No billing products are active on this account.'
}
