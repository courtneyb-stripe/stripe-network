/**
 * Build `/transactions` URLs and location state aligned with {@link TransactionsList} and MM chips.
 *
 * **Account detail → full list (prototype routing):**
 * - Use **`buildMoneyMovementFullListLink`** from Overview / Financial snapshot MM pagination so chip-specific types
 *   without a TXN tab open **`/network/:id/money-movement/:type`** (see {@link NESTED_FULL_LIST_MONEY_MOVEMENT_TYPE_IDS}).
 * - Otherwise use **`buildTransactionsListPath`** + **`transactionsListLinkState`** when the destination maps to a tab in
 *   {@link TRANSACTIONS_PAGE_TABS}: **Payments**, **Payouts**, **Collected fees**, **Transfers**, **Top ups**,
 *   **Financial accounts**. Pass `accountId` / `accountName` (and optional `savedList`) so the TXN list opens scoped.
 * - Keep **nested** `/network/:id/...` shells for surfaces **without** a TXN primary tab (e.g. invoices, subscriptions,
 *   directory segments). Nested money-received / payments-collected routes remain for bookmarks only; hub pagination
 *   should prefer `/transactions` as above when a primary tab exists.
 *
 * MM chip ids that only map approximately to a TXN tab still use {@link transactionsTabForMoneyMovementType} for
 * deep links that target `/transactions` directly; nested full-list links override that for the ids above.
 */

import type { TransactionsTabId } from '../data/transactionsPageTabs'
import { accountMoneyMovementNestedListPath } from './accountNestedListPaths'

/** MM chip ids → `/transactions?tab=` — only tabs in {@link TRANSACTIONS_PAGE_TABS}; others map to the nearest tab. */
const MM_TYPE_TO_TX_TAB: Partial<Record<string, TransactionsTabId>> = {
  payments: 'payments',
  'collected-fees': 'platform-fees',
  payouts: 'payouts',
  'global-payouts': 'payouts',
  transfers: 'transfers',
  'top-ups': 'top-ups',
  'financial-accounts': 'financial-accounts',
  'issuing-balance': 'financial-accounts',
  'stripe-balance-payments': 'payments',
  'card-transactions': 'payments',
}

/**
 * MM chip ids whose **full list** is a dedicated nested shell (no matching row granularity on `/transactions`).
 * Example: `Network / Acme / Stripe balance payments`.
 */
export const NESTED_FULL_LIST_MONEY_MOVEMENT_TYPE_IDS = [
  'stripe-balance-payments',
  'card-transactions',
  'issuing-balance',
] as const

export type NestedFullListMoneyMovementTypeId =
  (typeof NESTED_FULL_LIST_MONEY_MOVEMENT_TYPE_IDS)[number]

const NESTED_FULL_LIST_MM_TYPE_SET = new Set<string>(NESTED_FULL_LIST_MONEY_MOVEMENT_TYPE_IDS)

export function moneyMovementTypeUsesNestedFullList(mmTypeId: string): boolean {
  return NESTED_FULL_LIST_MM_TYPE_SET.has(mmTypeId)
}

/**
 * Resolves the transactions list tab for a Money movement chip.
 * `all` falls back to `payments` for legacy paths; callers should omit pagination `to` when chip is `all`.
 */
export function transactionsTabForMoneyMovementType(mmTypeId: string): TransactionsTabId {
  if (mmTypeId === 'all') return 'payments'
  return MM_TYPE_TO_TX_TAB[mmTypeId] ?? 'payments'
}

/** Resolves Money movement chip id for mock list totals on `/transactions` primary tabs. */
export function moneyMovementChipIdForTransactionsTab(tab: TransactionsTabId): string {
  if (tab === 'top-ups') return 'top-ups'
  for (const [mmId, txId] of Object.entries(MM_TYPE_TO_TX_TAB) as [string, TransactionsTabId][]) {
    if (txId === tab) return mmId
  }
  return 'payments'
}

export type TransactionsLinkQuery = {
  savedList?: string
  accountId?: string
  accountName?: string
}

export function buildTransactionsListPath(
  tab: TransactionsTabId,
  query: TransactionsLinkQuery = {}
): string {
  const qs = new URLSearchParams()
  qs.set('tab', tab)
  if (query.savedList != null && query.savedList !== '') qs.set('savedList', query.savedList)
  if (query.accountId != null && query.accountId !== '') qs.set('accountId', query.accountId)
  if (query.accountName != null && query.accountName !== '') qs.set('accountName', query.accountName)
  return `/transactions?${qs.toString()}`
}

export function transactionsListLinkState(payload: {
  tab: TransactionsTabId
  savedListId?: string
  accountId?: string
  accountName?: string
}) {
  return {
    tab: payload.tab,
    savedListId: payload.savedListId,
    accountId: payload.accountId,
    accountName: payload.accountName,
  }
}

export function buildMoneyMovementFullListLink(args: {
  accountId: string
  accountName: string
  moneyMovementTypeId: string
  /** Passed through to `/transactions` only (e.g. prototype saved list). */
  savedListId?: string
}): { to: string; linkState?: ReturnType<typeof transactionsListLinkState> } {
  if (moneyMovementTypeUsesNestedFullList(args.moneyMovementTypeId)) {
    return {
      to: accountMoneyMovementNestedListPath(args.accountId, args.moneyMovementTypeId),
    }
  }
  const tab = transactionsTabForMoneyMovementType(args.moneyMovementTypeId)
  return {
    to: buildTransactionsListPath(tab, {
      savedList: args.savedListId,
      accountId: args.accountId,
      accountName: args.accountName,
    }),
    linkState: transactionsListLinkState({
      tab,
      savedListId: args.savedListId,
      accountId: args.accountId,
      accountName: args.accountName,
    }),
  }
}
