/**
 * PayoutsTable — Payouts tab table. Same structure as TransactionsTable (52px rows, zebra striping).
 * Columns: Amount, Status, Destination (Sail bank/brand icon + bank name + •••• NNNN), Arrive by (date).
 */

import { ROW_HEIGHT } from '../constants/table'
import { BrandIcon } from '../icons/SailIcons'
import { PillBadge } from './PillBadge'

/** Map display bank name to Sail BrandIcon name (Wells Fargo, Chase, etc.). Falls back to "bank" if unknown. */
const BANK_TO_SAIL_BRAND: Record<string, string> = {
  'Chase': 'morganchase',
  'Bank of America': 'boa',
  'Wells Fargo': 'wellsfargo',
  'Citi': 'citibank',
  'US Bank': 'usbank',
  'Capital One': 'capitalone',
  'PNC': 'pnc',
  'Truist': 'truist',
}
const DEFAULT_BANK_BRAND = 'bank'

const COLUMNS = [
  { key: 'amount', label: 'Amount', width: 'w-[120px]', align: 'left' as const },
  { key: 'status', label: 'Status', width: 'w-[100px]', align: 'left' as const },
  { key: 'destination', label: 'Destination', width: 'min-w-0 flex-1', align: 'left' as const },
  { key: 'arriveBy', label: 'Arrive by', width: 'w-[140px]', align: 'left' as const },
] as const

export type PayoutStatus = 'paid' | 'pending' | 'in_transit' | 'failed' | 'canceled'

export type PayoutRow = {
  amount: string
  amountCurrency: string
  status: PayoutStatus
  bankName: string
  destinationLast4: string
  arriveBy: string
  /** Account name for filtering (e.g. Toybox Labs, Shopify). */
  accountName?: string
}

function PayoutTableRow({
  row,
  isAlternate,
  onClick,
}: {
  row: PayoutRow
  isAlternate: boolean
  onClick?: (row: PayoutRow) => void
}) {
  const statusBadge =
    row.status === 'paid' ? <PillBadge label="Paid" variant="success" /> :
    row.status === 'pending' ? <PillBadge label="Pending" variant="attention" /> :
    row.status === 'in_transit' ? <PillBadge label="In transit" variant="neutral" /> :
    row.status === 'failed' ? <PillBadge label="Failed" variant="critical" /> :
    row.status === 'canceled' ? <PillBadge label="Canceled" variant="neutral" /> : null

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick ? () => onClick(row) : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(row) } } : undefined}
      className={`group flex w-full shrink-0 cursor-pointer items-center rounded-[length:var(--radius-action)] pr-2 transition-colors ${
        isAlternate ? 'bg-[#fafbfb] hover:bg-offset' : 'bg-surface hover:bg-offset'
      }`}
      data-name="Table Row 2.0"
      style={{ height: ROW_HEIGHT, minHeight: ROW_HEIGHT }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-6">
        <div className={`flex min-w-0 shrink-0 items-center gap-1.5 overflow-hidden ${COLUMNS[0].width}`}>
          <span className="truncate font-label-medium-emphasized text-default tabular-nums">{row.amount}</span>
          <span className="shrink-0 font-label-small text-default">{row.amountCurrency}</span>
        </div>
        <div className={`flex min-w-0 shrink-0 items-center overflow-hidden ${COLUMNS[1].width}`}>
          {statusBadge}
        </div>
        <div className={`flex min-w-0 shrink-0 items-center gap-1.5 overflow-hidden ${COLUMNS[2].width} text-default`}>
          <BrandIcon name={(BANK_TO_SAIL_BRAND[row.bankName] ?? DEFAULT_BANK_BRAND) as never} size={20} />
          <span className="truncate font-label-medium">{row.bankName}</span>
          <span className="shrink-0 font-label-medium tabular-nums">•••• {row.destinationLast4}</span>
        </div>
        <div className={`flex min-w-0 shrink-0 items-center overflow-hidden ${COLUMNS[3].width}`}>
          <span className="truncate font-label-medium text-default">{row.arriveBy}</span>
        </div>
      </div>
    </div>
  )
}

const BANK_NAMES = ['Chase', 'Bank of America', 'Wells Fargo', 'Citi', 'US Bank', 'Capital One', 'PNC', 'Truist']
const ARRIVE_BY_DATES = [
  'Aug 26, 2025', 'Aug 25, 2025', 'Aug 24, 2025', 'Aug 23, 2025', 'Aug 22, 2025', 'Aug 21, 2025',
  'Aug 20, 2025', 'Aug 19, 2025', 'Aug 18, 2025', 'Sep 2, 2025', 'Sep 1, 2025', 'Aug 31, 2025',
]
const PAYOUT_AMOUNTS = [
  '$1,200.00', '$850.50', '$2,340.00', '$456.78', '$5,000.00', '$312.00', '$1,890.25', '$675.00',
]
const PAYOUT_STATUSES: PayoutStatus[] = ['paid', 'paid', 'pending', 'in_transit', 'paid', 'failed', 'pending', 'canceled']
const PAYOUT_ACCOUNT_NAMES = ['Toybox Labs', 'Shopify'] as const

export function generatePayoutRows(count: number): PayoutRow[] {
  const rows: PayoutRow[] = []
  for (let i = 0; i < count; i++) {
    rows.push({
      amount: PAYOUT_AMOUNTS[i % PAYOUT_AMOUNTS.length],
      amountCurrency: 'USD',
      status: PAYOUT_STATUSES[i % PAYOUT_STATUSES.length],
      bankName: BANK_NAMES[i % BANK_NAMES.length],
      destinationLast4: String(1000 + (i % 9000)).slice(-4),
      arriveBy: ARRIVE_BY_DATES[i % ARRIVE_BY_DATES.length],
      accountName: PAYOUT_ACCOUNT_NAMES[i % PAYOUT_ACCOUNT_NAMES.length],
    })
  }
  return rows
}

const DEFAULT_PAYOUT_ROWS = generatePayoutRows(24)

type PayoutsTableProps = {
  rows?: PayoutRow[]
  onRowClick?: (row: PayoutRow) => void
}

export default function PayoutsTable({ rows = DEFAULT_PAYOUT_ROWS, onRowClick }: PayoutsTableProps) {
  return (
    <div
      className="flex w-full flex-col overflow-auto pt-0 pb-2"
      data-name="Payouts Table"
    >
      <div className="flex flex-col">
        {rows.map((row, i) => (
          <PayoutTableRow key={i} row={row} isAlternate={i % 2 === 0} onClick={onRowClick} />
        ))}
      </div>
    </div>
  )
}
