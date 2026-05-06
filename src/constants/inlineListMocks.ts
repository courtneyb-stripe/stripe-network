/**
 * Mock total result counts for inline list pagination (skeleton / prototype surfaces).
 */

export const INLINE_LIST_TOTALS = {
  /** Default MM total; superseded by {@link totalResultsForMoneyMovementChip} per chip (except **All**). */
  moneyMovement: 2776,
  invoices: 142,
  products: 156,
  /** Purchases — inline list on My Revenue (“As your customer”); prototype total mirrors legacy products mock. */
  purchases: 156,
  network: 56,
  recentActivity: 234,
  commerceNetwork: 124,
  commerceProducts: 42,
  activityLogs: 15420,
  activityEvents: 3840,
  /** Payments collected — nested list under account detail (prototype). */
  paymentsCollected: 412,
  /** Billing subscriptions — nested list (prototype). */
  subscriptions: 67,
} as const

/**
 * Mock result counts per Money movement view chip (`moneyMovementViewChips` ids).
 * **All** has no pagination — callers should omit the footer when `mmTypeId === 'all'`.
 */
const MONEY_MOVEMENT_INLINE_TOTALS_BY_CHIP: Record<string, number> = {
  payments: 2776,
  'collected-fees': 412,
  payouts: 189,
  transfers: 94,
  'global-payouts': 56,
  'financial-accounts': 1203,
  'issuing-balance': 78,
  'stripe-balance-payments': 2156,
  'card-transactions': 8834,
  /** Primary tab `top-ups` — not an MM chip; its own mock total for `/transactions`. */
  'top-ups': 320,
}

export function totalResultsForMoneyMovementChip(mmTypeId: string): number {
  return (
    MONEY_MOVEMENT_INLINE_TOTALS_BY_CHIP[mmTypeId] ?? INLINE_LIST_TOTALS.moneyMovement
  )
}
