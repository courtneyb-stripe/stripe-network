/**
 * Shared options for metric dropdowns (Network list and Account detail).
 */

export const TIME_RANGE_OPTIONS = [
  'Last 7 days',
  'Last 30 days',
  'Last 90 days',
  'Last 12 months',
  'All time',
] as const

export type TimeRange = (typeof TIME_RANGE_OPTIONS)[number]

/** Balance/account selector options for Account detail "All balances" card. */
export const BALANCE_OPTIONS = [
  'Total balance',
  'FA ****8789',
  'FA ****0908',
  'Loan 1267',
] as const

export type BalanceOption = (typeof BALANCE_OPTIONS)[number]
