/**
 * Money movement reference matrix — design spreadsheet “Money movement”.
 * Visual reference: `.cursor/projects/.../assets/image-2e4d3d18-7f4e-4aca-9664-2b4f55f86ace.png`
 *
 * Column keys (`col2`…`col8`) map to checkbox columns left to right after the
 * “Main” column in the sheet. **Rename** `MoneyMovementSurfaceColumn` to real
 * product labels (e.g. merchant balance, FA, card programs) once headers are
 * finalized in design docs.
 *
 * `fromFinancialAccount` matches “(from FA)” in the sheet: the same movement
 * type also rolls up under Financial accounts when it originates from an FA.
 *
 * ## Payments — counterparty rails (logic / modeling only; single **Payments** MM tab for now)
 * Payment movements can be tagged with {@link PaymentsMovementRail} when ingesting real data:
 * - **customer_to_merchant** — end-customer or guest payer → connected account (checkout, invoices, subscriptions).
 * - **merchant_to_platform** — connected account → platform (application fees, platform debits from merchant balance, other platform-collected movements).
 *
 * Matrix rows `payments_made`, `guest_payments_made`, `payments_received`, and `guest_payments_received`
 * may represent either rail depending on counterparty context; UI does not split these yet.
 */

import type { AccountRoleId } from './configMatrix'

/** See module doc — use when modeling which party initiated / received a payment movement. */
export type PaymentsMovementRail = 'customer_to_merchant' | 'merchant_to_platform'

export type MoneyMovementSurfaceColumn =
  | 'col2'
  | 'col3'
  | 'col4'
  | 'col5'
  | 'col6'
  | 'col7'
  | 'col8'

export type MoneyMovementRowId =
  | 'payments_made'
  | 'guest_payments_made'
  | 'payments_received'
  | 'guest_payments_received'
  | 'collected_fees_paid'
  | 'payouts'
  | 'transfers'
  | 'global_payouts'
  | 'financial_accounts_transactions'
  | 'issuing_balance'
  | 'stripe_balance_payments'
  | 'card_transactions'

export type MatrixCell = {
  /** Checkbox present in the sheet for this row/column. */
  applies: boolean
  /** Cell annotated “(from FA)” — subset of Financial accounts activity. */
  fromFinancialAccount?: boolean
}

export type MoneyMovementRowMeta = {
  id: MoneyMovementRowId
  /** Cell text from the “Money movement” column. */
  label: string
  /**
   * Note column from the sheet, if any.
   * Financial accounts row: aggregate category, not a separate ledger object.
   */
  note?: string
}

/** Row order matches the reference spreadsheet. */
export const MONEY_MOVEMENT_ROW_META: readonly MoneyMovementRowMeta[] = [
  { id: 'payments_made', label: 'Payments (made)' },
  { id: 'guest_payments_made', label: 'Guest payments (made)' },
  { id: 'payments_received', label: 'Payments (received)' },
  { id: 'guest_payments_received', label: 'Guest payments (received)' },
  { id: 'collected_fees_paid', label: 'Collected fees (fees paid)' },
  { id: 'payouts', label: 'Payouts' },
  { id: 'transfers', label: 'Transfers' },
  { id: 'global_payouts', label: 'Global payouts' },
  {
    id: 'financial_accounts_transactions',
    label: 'Financial accounts transactions',
    note:
      'Category collecting transactions made from an FA (payments, payouts, transfers, global payouts). Not a separate object.',
  },
  {
    id: 'issuing_balance',
    label: 'Issuing balance',
    note: 'Program / issuing balance for card issuer; distinct from connected-account FA (storer).',
  },
  { id: 'stripe_balance_payments', label: 'Stripe balance payments' },
  {
    id: 'card_transactions',
    label: 'Card transactions',
    note:
      'Card top-ups and card payments; may be omitted from the main transactions table.',
  },
] as const

/**
 * Spreadsheet columns → `AccountRoleId` (Configure). col2…col8 left-to-right after “Main”.
 * `gp_recipient` is treated like recipient for tab visibility only (see `moneyMovementTransactionTabs`).
 */
export const MONEY_MOVEMENT_COLUMN_TO_ROLE: Record<MoneyMovementSurfaceColumn, AccountRoleId> = {
  col2: 'merchant',
  col3: 'recipient',
  col4: 'customer',
  col5: 'storer',
  col6: 'issuer',
  col7: 'card_holder',
  col8: 'borrower',
}

/**
 * Sparse matrix: only store cells that are checked. Omitted = not applicable.
 * Transcribed from the reference sheet — verify against design if numbers shift.
 */
export const MONEY_MOVEMENT_MATRIX: Partial<
  Record<MoneyMovementRowId, Partial<Record<MoneyMovementSurfaceColumn, MatrixCell>>>
> = {
  payments_made: {
    col4: { applies: true },
    col5: { applies: true, fromFinancialAccount: true },
  },
  guest_payments_made: {
    col4: { applies: true },
  },
  payments_received: {
    col2: { applies: true },
  },
  guest_payments_received: {
    col2: { applies: true },
  },
  collected_fees_paid: {
    col2: { applies: true },
    col3: { applies: true },
  },
  payouts: {
    col2: { applies: true },
    col3: { applies: true },
    col5: { applies: true, fromFinancialAccount: true },
  },
  transfers: {
    col3: { applies: true },
    col5: { applies: true, fromFinancialAccount: true },
  },
  global_payouts: {
    col3: { applies: true },
    col5: { applies: true, fromFinancialAccount: true },
  },
  financial_accounts_transactions: {
    col5: { applies: true },
  },
  issuing_balance: {
    col6: { applies: true },
  },
  stripe_balance_payments: {
    col2: { applies: true },
  },
  card_transactions: {
    col6: { applies: true },
    col7: { applies: true },
  },
}

export function movementAppliesToSurface(
  rowId: MoneyMovementRowId,
  column: MoneyMovementSurfaceColumn,
  options?: { onlyFromFinancialAccount?: boolean }
): boolean {
  const cell = MONEY_MOVEMENT_MATRIX[rowId]?.[column]
  if (cell == null || !cell.applies) return false
  if (options?.onlyFromFinancialAccount === true) return cell.fromFinancialAccount === true
  return true
}
