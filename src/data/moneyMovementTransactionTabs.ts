/**
 * Money movement transaction tabs — V2 account detail tables (Financial snapshot, “As your customer”, etc.).
 *
 * Tab **labels** are a coarse UX grouping; **visibility** is derived from `MONEY_MOVEMENT_MATRIX`
 * (`moneyMovementMatrix.ts`) so Configure roles match the design spreadsheet row-by-row.
 *
 * The **Payments** tab rolls up both customer→merchant and merchant→platform payment rails
 * (see `PaymentsMovementRail` in `moneyMovementMatrix.ts`); filters / split UI are not wired yet.
 *
 * **My revenue** keeps a subset (payments + collected fees) — see `getMyRevenueMoneyMovementTabs`.
 */

import type { AccountRoleId } from './configMatrix'
import {
  MONEY_MOVEMENT_COLUMN_TO_ROLE,
  MONEY_MOVEMENT_MATRIX,
  type MoneyMovementRowId,
  type MoneyMovementSurfaceColumn,
} from './moneyMovementMatrix'

/** Skeleton rows for Money movement placeholder tables on account detail. */
export const MONEY_MOVEMENT_TABLE_SKELETON_ROW_COUNT = 25

const TAB_DEFS = [
  {
    id: 'payments' as const,
    label: 'Payments',
    rows: [
      'payments_made',
      'guest_payments_made',
      'payments_received',
      'guest_payments_received',
    ] as const satisfies readonly MoneyMovementRowId[],
  },
  {
    id: 'collected-fees' as const,
    label: 'Collected fees',
    rows: ['collected_fees_paid'] as const satisfies readonly MoneyMovementRowId[],
  },
  {
    id: 'payouts' as const,
    label: 'Payouts',
    rows: ['payouts'] as const satisfies readonly MoneyMovementRowId[],
  },
  {
    id: 'transfers' as const,
    label: 'Transfers',
    rows: ['transfers'] as const satisfies readonly MoneyMovementRowId[],
  },
  {
    id: 'global-payouts' as const,
    label: 'Global payouts',
    rows: ['global_payouts'] as const satisfies readonly MoneyMovementRowId[],
  },
  {
    id: 'financial-accounts' as const,
    label: 'Financial accounts',
    rows: ['financial_accounts_transactions'] as const satisfies readonly MoneyMovementRowId[],
  },
  {
    id: 'issuing-balance' as const,
    label: 'Issuing balance',
    rows: ['issuing_balance'] as const satisfies readonly MoneyMovementRowId[],
  },
  {
    id: 'stripe-balance-payments' as const,
    label: 'Stripe balance payments',
    rows: ['stripe_balance_payments'] as const satisfies readonly MoneyMovementRowId[],
  },
  {
    id: 'card-transactions' as const,
    label: 'Card transactions',
    rows: ['card_transactions'] as const satisfies readonly MoneyMovementRowId[],
  },
] as const

export type MoneyMovementTransactionTabId = (typeof TAB_DEFS)[number]['id']

export type MoneyMovementTransactionTab = {
  id: MoneyMovementTransactionTabId
  label: string
}

function roleMatchesColumn(roles: ReadonlySet<AccountRoleId>, columnRole: AccountRoleId): boolean {
  if (roles.has(columnRole)) return true
  // Platform global-payout recipient behaves like matrix “Recipient” for these rows.
  if (columnRole === 'recipient' && roles.has('gp_recipient')) return true
  return false
}

function rowMatchesRoles(rowId: MoneyMovementRowId, roles: ReadonlySet<AccountRoleId>): boolean {
  const cells = MONEY_MOVEMENT_MATRIX[rowId]
  if (cells == null) return false
  for (const [colKey, cell] of Object.entries(cells)) {
    if (!cell?.applies) continue
    const columnRole = MONEY_MOVEMENT_COLUMN_TO_ROLE[colKey as MoneyMovementSurfaceColumn]
    if (roleMatchesColumn(roles, columnRole)) return true
  }
  return false
}

function tabMatchesRoles(
  def: (typeof TAB_DEFS)[number],
  roles: ReadonlySet<AccountRoleId>
): boolean {
  return def.rows.some((rowId) => rowMatchesRoles(rowId, roles))
}

/**
 * Returns ordered tabs for the Money movement table (Financial snapshot tab).
 * Empty role edge case: falls back to Payments only.
 */
export function getMoneyMovementTransactionTabs(
  activeRoles: ReadonlySet<AccountRoleId>,
  _billingEnabled: boolean
): MoneyMovementTransactionTab[] {
  const out = TAB_DEFS.filter((t) => tabMatchesRoles(t, activeRoles)).map((t) => ({
    id: t.id,
    label: t.label,
  }))
  return out.length > 0 ? out : [{ id: 'payments', label: 'Payments' }]
}

/** All tabs when prototype / Configure is unavailable. */
export function getDefaultMoneyMovementTransactionTabs(): MoneyMovementTransactionTab[] {
  return TAB_DEFS.map((t) => ({ id: t.id, label: t.label }))
}

/** Label for MM tab id (nested list titles, breadcrumbs). */
export function getMoneyMovementTransactionTabLabel(tabId: string): string {
  const found = TAB_DEFS.find((t) => t.id === tabId)
  return found?.label ?? tabId
}

/** “As your customer” tab: subset of Money movement tabs (no FA / global / issuing strip here). */
const MY_REVENUE_TAB_IDS = new Set<MoneyMovementTransactionTabId>(['payments', 'collected-fees'])

export function getMyRevenueMoneyMovementTabs(
  activeRoles: ReadonlySet<AccountRoleId>,
  billingEnabled: boolean
): MoneyMovementTransactionTab[] {
  return getMoneyMovementTransactionTabs(activeRoles, billingEnabled).filter((t) =>
    MY_REVENUE_TAB_IDS.has(t.id)
  )
}
