/*
SIGNAL GROUPS — header rendering rules

COMPLIANCE ROLES → signal group chips + account status badge (see `ROLE_TO_CAPABILITY_GROUPS`)
  merchant     → Payments, Payouts (+ Billing if billingEnabled)
  recipient    → Transfers, Payouts (Transfers fold into Treasury / FA when Storer also active)
  gp_recipient → Payouts only (Global Payouts recipient)
  storer       → Treasury (chip label “Treasury”)
  card_holder  → Card issuing (configure modal + resolver; “Issuer” pill is not selectable — use Card issuer)
  borrower     → Capital (chip label “Capital”)

RELATIONSHIP ROLE
  customer     → contributes Payments in the matrix, but see `uadVisibility.resolveCapabilityGroups`:
                 if GP recipient is on and Merchant is off, Customer does not add Payments (GP-only payout account).

TRANSFERS FOLD RULE
  Recipient alone     → Transfers pill shows
  Recipient + Storer  → Transfers folds into Treasury (one pill)
  Storer alone        → Treasury only, no Transfers

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
  merchant      → distributes, hasCompliance: true
  recipient     → distributes, hasCompliance: true
  gp_recipient  → distributes, hasCompliance: true
  storer        → distributes, hasCompliance: true
  issuer        → distributes, hasCompliance: true
  card_holder   → consumes,    hasCompliance: true
  borrower      → consumes,    hasCompliance: true
  customer      → consumes,    hasCompliance: false

STORER AUTO-SELECT
  Selecting Storer automatically adds Recipient if not already active (nudge, not hard block)
*/

export type AccountRoleId =
  | 'merchant' | 'customer' | 'recipient' | 'gp_recipient'
  | 'storer' | 'borrower' | 'issuer' | 'card_holder'

export type CapabilityGroupId =
  | 'payments' | 'payouts' | 'transfers'
  | 'billing' | 'treasury' | 'capital' | 'issuing'

/**
 * Header / Configure groups backed by a single compliance capability (no “limited” sub-cap mix).
 * Configure omits **Limited** for these; signal popover uses one status column for paused / pausing_soon.
 */
export const CAPABILITY_GROUP_SINGLE_SIGNAL = new Set<CapabilityGroupId>(['payouts', 'issuing'])

/** `PaymentsPopoverPanel` `variant` → underlying `CapabilityGroupId` (FA popover → treasury). */
export type SignalPopoverPanelVariant =
  | 'payments'
  | 'payouts'
  | 'transfers'
  | 'financialAccounts'
  | 'financing'
  | 'cardIssuing'
  | 'billing'

export function capabilityGroupForSignalPopover(
  variant: SignalPopoverPanelVariant
): CapabilityGroupId {
  switch (variant) {
    case 'payments':
      return 'payments'
    case 'payouts':
      return 'payouts'
    case 'transfers':
      return 'transfers'
    case 'financialAccounts':
      return 'treasury'
    case 'financing':
      return 'capital'
    case 'cardIssuing':
      return 'issuing'
    case 'billing':
      return 'billing'
  }
}

/** True when the signal popover is for Payouts or Card issuing only (single-cap chip). */
export function signalPopoverSingleCapabilityRow(variant: SignalPopoverPanelVariant): boolean {
  return CAPABILITY_GROUP_SINGLE_SIGNAL.has(capabilityGroupForSignalPopover(variant))
}

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
  'merchant', 'recipient', 'gp_recipient', 'storer', 'issuer', 'card_holder', 'borrower'
]

export const RELATIONSHIP_ROLES: AccountRoleId[] = ['customer']

export const ROLE_METADATA: Record<AccountRoleId, {
  direction: RoleDirection
  hasCompliance: boolean
}> = {
  merchant:    { direction: 'distributes', hasCompliance: true },
  recipient:   { direction: 'distributes', hasCompliance: true },
  gp_recipient: { direction: 'distributes', hasCompliance: true },
  storer:      { direction: 'distributes', hasCompliance: true },
  issuer:      { direction: 'distributes', hasCompliance: true },
  card_holder: { direction: 'consumes',    hasCompliance: true },
  borrower:    { direction: 'consumes',    hasCompliance: true },
  customer:    { direction: 'consumes',    hasCompliance: false },
}

export const ROLE_TO_CAPABILITY_GROUPS: Record<AccountRoleId, CapabilityGroupId[]> = {
  merchant:    ['payments', 'payouts'],
  customer:    ['payments'],
  recipient:   ['transfers', 'payouts'],
  /** Global Payouts recipient: payouts surface only. */
  gp_recipient: ['payouts'],
  storer:      ['treasury'],
  borrower:    ['capital'],
  /** Card Issuing is driven only by Card issuer in the prototype UI (Issuer role is not selectable). */
  issuer:      [],
  card_holder: ['issuing'],
}

export const SIGNAL_GROUP_DEFAULTS: Record<AccountRoleId, Partial<SignalGroupConfig>> = {
  merchant:    { hasPaymentMethodOnFile: true, hasPayoutSchedule: true },
  customer:    { hasPaymentMethodOnFile: true },
  recipient:   { hasPayoutSchedule: true },
  gp_recipient: {},
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
/** Transfers header-chip popover — same three lead labels as FA comma list, without Treasury extras. */
export const TRANSFERS_GROUP_POPOVER_CHIPS = [
  'Transfers',
  'Inbound transfers',
  'Outbound transfers',
] as const

/** Treasury / financial-accounts popover — comma list (first row); +N is separate (see overflow). */
export const FINANCIAL_ACCOUNTS_POPOVER_CHIPS = [
  ...TRANSFERS_GROUP_POPOVER_CHIPS,
  'Bank accounts',
  'Financial addresses',
  'Holds multi-currencies',
] as const

/** Additional capabilities implied after the comma list (`+N` in popover). */
export const FINANCIAL_ACCOUNTS_POPOVER_OVERFLOW_EXTRA = 3

/** Configure account → Financing: Loan / Cash advance checkboxes (popover chips follow selection). */
export type FinancingProductSelection = {
  loan: boolean
  cashAdvance: boolean
}

export const DEFAULT_FINANCING_POPOVER: FinancingProductSelection = { loan: true, cashAdvance: false }

/**
 * Capability line for Financing popover — matches Configure checkboxes. Omits entries when off.
 * Uses plural capability nouns (same pattern as Payments, Financial accounts, etc.).
 */
export function financingPopoverChipLabels(
  selection: FinancingProductSelection
): string[] {
  const { loan, cashAdvance } = selection
  const out: string[] = []
  if (loan) out.push('Loans')
  if (cashAdvance) out.push('Cash advances')
  return out
}

/**
 * Financing **well** row + paused / granular popover line: one **loan account** display (not the plural capability list).
 * Mask uses •••• like payment method rows (Visa •••• 1933). Do not conflate with `financingPopoverChipLabels` “Loans”.
 */
export const FINANCING_LOAN_MASKED_ACCOUNT_LINE = 'Loan •••• 7809'

/** Human-readable labels for capability / signal group chips (configure modal + account header). */
export const CAPABILITY_GROUP_DISPLAY_LABELS: Record<CapabilityGroupId, string> = {
  payments: 'Payments',
  payouts: 'Payouts',
  transfers: 'Transfers',
  billing: 'Billing',
  treasury: 'Treasury',
  capital: 'Capital',
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
 * Header chips after Payouts/Payments/Billing: shown when the group is resolved for roles (same
 * set as Configure). Status does not hide these — it only updates each chip’s status icon and
 * `deriveAccountStatus` for the account badge. Excludes payments/payouts/billing (their own controls).
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
  treasury: 'Treasury is active for this account.',
  capital: 'Capital is active for this account.',
  issuing: 'Card issuing is active for this account.',
}

/** Stable chip / tooltip order for billing flavors. */
export const BILLING_FLAVOR_ORDER: BillingFlavor[] = ['invoicing', 'subscriptions', 'metered_billing']

/** Billing chip hover: lists active products, stable order. */
export function formatBillingProductsTooltip(flavors: ReadonlySet<BillingFlavor>): string {
  const labels = BILLING_FLAVOR_ORDER.filter((id) => flavors.has(id)).map(
    (id) => BILLING_FLAVOR_LABELS[id]
  )
  return labels.length > 0
    ? `${labels.join(', ')} are active on this account.`
    : 'No billing products are active on this account.'
}
