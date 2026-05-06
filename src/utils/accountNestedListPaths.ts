/**
 * Deep links for account-scoped **nested** list shells (no matching `/transactions` primary tab).
 *
 * Money movement rows that map to {@link TRANSACTIONS_PAGE_TABS} should use
 * {@link buildTransactionsListPath} instead of these paths for hub “View full list” pagination,
 * except chip-specific MM full-list types that use {@link accountMoneyMovementNestedListPath}.
 */

export function accountMoneyMovementNestedListPath(accountId: string, movementTypeId: string): string {
  return `/network/${accountId}/money-movement/${movementTypeId}`
}

export function accountMoneyReceivedPath(accountId: string, kind: 'payouts' | 'transfers'): string {
  return `/network/${accountId}/money-received/${kind}`
}

export function accountPaymentsCollectedPath(accountId: string): string {
  return `/network/${accountId}/payments-collected`
}

export function accountSubscriptionsPath(accountId: string): string {
  return `/network/${accountId}/subscriptions`
}

export function accountDirectoryPath(
  accountId: string,
  segment: 'customers' | 'recipients' | 'card-holders',
): string {
  return `/network/${accountId}/directory/${segment}`
}
