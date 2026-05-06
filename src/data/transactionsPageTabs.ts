/**
 * Primary `/transactions` tabs — aligned with Money movement view chips.
 */

export const TRANSACTIONS_PAGE_TABS = [
  { id: 'payments', label: 'Payments' },
  { id: 'payouts', label: 'Payouts' },
  { id: 'platform-fees', label: 'Collected fees' },
  { id: 'transfers', label: 'Transfers' },
  { id: 'top-ups', label: 'Top ups' },
  { id: 'financial-accounts', label: 'Financial accounts' },
] as const

export type TransactionsTabId = (typeof TRANSACTIONS_PAGE_TABS)[number]['id']

export function parseTransactionsTabFromUrl(tab: string | null | undefined): TransactionsTabId {
  if (
    tab != null &&
    (TRANSACTIONS_PAGE_TABS as readonly { id: string }[]).some((t) => t.id === tab)
  ) {
    return tab as TransactionsTabId
  }
  return 'payments'
}
