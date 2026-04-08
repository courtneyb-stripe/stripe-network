/*
HEADER RENDERING RULES — logic reference

COMPLIANCE ROLES → capability pills + account status badge
  merchant   → Payments, Payouts (+ Billing pill if billingEnabled)
  recipient  → Payouts, Transfers
  storer     → Treasury, Transfers
  issuer     → Issuing
  (deduped on overlap — Merchant + Recipient = Payments, Payouts, Transfers)

RELATIONSHIP ROLES → metadata only, no pills, no account status badge
  customer   → "{n} active subscriptions" + "•••• {last4}" (expired = orange #CC4B00)
  borrower   → "{n} active loans" + "•••• {last4}"
  card holder (via hasIssuedCard flag) → "•••• {last4}"

MIXED (compliance + relationship roles active)
  → show pills from compliance roles only
  → relationship metadata does NOT appear in header (surfaces in body/popover)

BILLING
  → toggle only appears when merchant role is selected
  → at least one flavor required when billing on: invoicing, subscriptions, metered_billing
  → Billing header control appears only when billingEnabled is true
  → Billing is always shown as enabled in the header (no compliance capability status; never restricted/paused UI)

ACCOUNT STATUS (derived, compliance roles only)
  all active         → Enabled
  any pausing_soon   → Restricted soon
  any limited/paused → Restricted
  customer/borrower/card holder only → no badge

RISK BADGE (appended to account status)
  low      → nothing
  elevated → yellow badge "Elevated risk"
  high     → red badge "High risk"

NON-COMPLIANCE ALERT
  → orange dot on relevant pill
  → account status badge unchanged
*/

export type AccountRoleId =
  | 'merchant' | 'customer' | 'recipient'
  | 'storer' | 'borrower' | 'issuer'

export const COMPLIANCE_ROLES: AccountRoleId[] = [
  'merchant', 'recipient', 'storer', 'issuer'
]

export const RELATIONSHIP_ROLES: AccountRoleId[] = [
  'customer', 'borrower'
]

export type CapabilityGroupId =
  | 'payments' | 'payouts' | 'transfers'
  | 'billing' | 'treasury' | 'capital' | 'issuing'

export type CapabilityStatus =
  | 'active' | 'pausing_soon' | 'limited' | 'paused'

export type RiskLevel = 'low' | 'elevated' | 'high'

export type BillingFlavor = 'invoicing' | 'subscriptions' | 'metered_billing'

export const BILLING_FLAVOR_LABELS: Record<BillingFlavor, string> = {
  invoicing: 'Invoicing',
  subscriptions: 'Subscriptions',
  metered_billing: 'Metered billing',
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

export type RelationshipFlags = {
  hasActiveSubscriptions: boolean
  hasIssuedCard: boolean
  expiredPaymentMethod: boolean
}

export const ROLE_TO_CAPABILITY_GROUPS: Record<AccountRoleId, CapabilityGroupId[]> = {
  merchant:  ['payments', 'payouts'],
  customer:  [],
  recipient: ['payouts', 'transfers'],
  storer:    ['treasury', 'transfers'],
  borrower:  [],
  issuer:    ['issuing'],
}

export const CAPABILITY_STATUS_STYLES: Record<CapabilityStatus, { hex: string; icon: string }> = {
  active:       { hex: '#2B8700', icon: 'status-active' },
  pausing_soon: { hex: '#CC4B00', icon: 'status-pausing-soon' },
  limited:      { hex: '#CC4B00', icon: 'status-limited' },
  paused:       { hex: '#E61947', icon: 'status-paused' },
}

export const RISK_BADGE: Record<RiskLevel, { label: string; hex: string } | null> = {
  low:      null,
  elevated: { label: 'Elevated risk', hex: '#F5A623' },
  high:     { label: 'High risk',     hex: '#E61947' },
}
