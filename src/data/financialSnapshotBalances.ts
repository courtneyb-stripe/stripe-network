/**
 * Mock balance lines for Financial snapshot → Balances skeleton (prototype).
 * When the Financial accounts row is hidden, the leading lines still sum to a coherent total.
 */

const BALANCE_LINE_AMOUNTS_USD = [4_000, 3_000, 5_345.67] as const

/** Indexes 0–1: generic balance wells; index 2: Financial accounts row. */
export const FINANCIAL_SNAPSHOT_FA_BALANCE_LINE_INDEX = 2 as const

export function formatFinancialSnapshotBalancesTotal(showFinancialAccountsLine: boolean): string {
  const amounts: number[] = showFinancialAccountsLine
    ? [...BALANCE_LINE_AMOUNTS_USD]
    : [...BALANCE_LINE_AMOUNTS_USD.slice(0, FINANCIAL_SNAPSHOT_FA_BALANCE_LINE_INDEX)]
  const sum = amounts.reduce((a, b) => a + b, 0)
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(sum)
}
