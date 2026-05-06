/**
 * Prototype view chips for {@link NestedObjectListFilterGroup} on nested account routes.
 */

import { INLINE_LIST_TOTALS, totalResultsForMoneyMovementChip } from '../constants/inlineListMocks'

export const NESTED_INVOICE_LIST_VIEW_CHIPS = [
  { id: 'all', label: 'All', count: INLINE_LIST_TOTALS.invoices },
  { id: 'open', label: 'Open', count: 23 },
  { id: 'paid', label: 'Paid', count: 104 },
  { id: 'void', label: 'Void', count: 5 },
  { id: 'uncollectible', label: 'Uncollectible', count: 2 },
] as const

export type NestedInvoiceListViewChipId = (typeof NESTED_INVOICE_LIST_VIEW_CHIPS)[number]['id']

export const NESTED_FINANCIAL_ACCOUNT_VIEW_CHIPS = [
  { id: 'all', label: 'All activity', count: 312 },
  { id: 'inbound', label: 'Inbound', count: 128 },
  { id: 'outbound', label: 'Outbound', count: 97 },
  { id: 'pending', label: 'Pending', count: 14 },
] as const

export type NestedFinancialAccountViewChipId = (typeof NESTED_FINANCIAL_ACCOUNT_VIEW_CHIPS)[number]['id']

export const NESTED_SUBSCRIPTION_LIST_VIEW_CHIPS = [
  { id: 'all', label: 'All', count: INLINE_LIST_TOTALS.subscriptions },
  { id: 'active', label: 'Active', count: 42 },
  { id: 'past-due', label: 'Past due', count: 5 },
  { id: 'canceled', label: 'Canceled', count: 12 },
] as const

export const NESTED_PAYMENTS_COLLECTED_VIEW_CHIPS = [
  { id: 'all', label: 'All', count: INLINE_LIST_TOTALS.paymentsCollected },
  { id: 'succeeded', label: 'Succeeded', count: 312 },
  { id: 'pending', label: 'Pending', count: 48 },
] as const

export const NESTED_DIRECTORY_SEGMENT_CHIPS = [
  { id: 'customers', label: 'Customers', count: INLINE_LIST_TOTALS.network },
  { id: 'recipients', label: 'Recipients', count: 28 },
  { id: 'card-holders', label: 'Card holders', count: 15 },
] as const

export const NESTED_MONEY_RECEIVED_VIEW_CHIPS = [
  { id: 'payouts', label: 'Payouts', count: totalResultsForMoneyMovementChip('payouts') },
  { id: 'transfers', label: 'Transfers', count: totalResultsForMoneyMovementChip('transfers') },
] as const
