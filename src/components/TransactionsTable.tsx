/**
 * TransactionsTable — Recent transactions table (Figma baby/table 2:6486).
 * Matches NetworkTable (2:10689): same row height (52px), header structure, zebra striping, no outer border.
 * Columns: Amount, Status (badge), Payment method (card icon + last4), Description, Date.
 */

import { ROW_HEIGHT } from '../constants/table'
import { CardIcon } from '../icons/SailIcons'
import { PillBadge } from './PillBadge'

const COLUMNS = [
  { key: 'amount', label: 'Amount', width: 'w-[120px]', align: 'left' as const },
  { key: 'status', label: 'Status', width: 'w-[100px]', align: 'left' as const },
  { key: 'paymentMethod', label: 'Payment method', width: 'w-[140px]', align: 'left' as const },
  { key: 'description', label: 'Description', width: 'min-w-0 flex-1', align: 'left' as const },
  { key: 'date', label: 'Date', width: 'w-[140px]', align: 'left' as const },
] as const

export type TransactionStatus =
  | 'succeeded'
  | 'pending'
  | 'failed'
  | 'refunded'
  | 'disputed'
  | 'uncaptured'

export type TransactionRow = {
  amount: string
  amountCurrency: string
  status: TransactionStatus
  paymentMethodLast4: string
  paymentMethodBrand?: 'visa' | 'amex' | 'mastercard'
  description: string
  date: string
}

/** Header matches NetworkTable TableHeader: same height (52px), checkbox placeholder, font-label-small-emphasized text-subdued. */
function TableHeader() {
  return (
    <div
      className="group flex w-full shrink-0 items-center overflow-hidden pr-6"
      data-name="Table Header"
      data-node-id="2:10689"
      style={{ height: ROW_HEIGHT, minHeight: ROW_HEIGHT }}
    >
      <div
        className="flex shrink-0 items-center justify-center p-[7px] w-8 opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden
      >
        <div
          className="h-3.5 w-3.5 shrink-0 rounded-[length:var(--radius-xsmall)] border border-neutral-100 bg-surface"
          style={{ boxShadow: 'var(--shadow-button)' }}
        />
      </div>
      <div className="flex min-w-0 flex-1 items-center gap-6">
        {COLUMNS.map((col) => (
          <div
            key={col.key}
            className={`flex min-w-0 shrink-0 items-center overflow-hidden ${col.width} ${col.align === 'right' ? 'justify-end' : ''}`}
            data-name="Table Header Cell"
          >
            <span
              className={`truncate font-label-small-emphasized text-subdued ${col.align === 'right' ? 'text-right' : ''}`}
            >
              {col.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TableRow({
  row,
  isAlternate,
  onClick,
}: {
  row: TransactionRow
  isAlternate: boolean
  onClick?: (row: TransactionRow) => void
}) {
  const cardName = row.paymentMethodBrand ?? 'amex'
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
      <div
        className="flex shrink-0 items-center justify-center p-[7px] w-8 opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden
      >
        <div className="h-3.5 w-3.5 shrink-0 rounded-[length:var(--radius-xsmall)] border border-neutral-100 bg-surface" />
      </div>
      <div className="flex min-w-0 flex-1 items-center gap-6">
        <div className={`flex min-w-0 shrink-0 items-center gap-1.5 overflow-hidden ${COLUMNS[0].width}`}>
          <span className="truncate font-label-medium-emphasized text-default tabular-nums">{row.amount}</span>
          <span className="shrink-0 font-label-small text-default">{row.amountCurrency}</span>
        </div>
        <div className={`flex min-w-0 shrink-0 items-center overflow-hidden ${COLUMNS[1].width}`}>
          {row.status === 'succeeded' && <PillBadge label="Succeeded" variant="success" />}
          {row.status === 'pending' && <PillBadge label="Pending" variant="attention" />}
          {row.status === 'failed' && <PillBadge label="Failed" variant="critical" />}
          {row.status === 'refunded' && <PillBadge label="Refunded" variant="neutral" />}
          {row.status === 'disputed' && <PillBadge label="Disputed" variant="neutral" />}
          {row.status === 'uncaptured' && <PillBadge label="Uncaptured" variant="neutral" />}
        </div>
        <div className={`flex min-w-0 shrink-0 items-center gap-1.5 overflow-hidden ${COLUMNS[2].width}`}>
          <CardIcon name={cardName} size={20} />
          <span className="truncate font-label-medium text-default tabular-nums">•••• {row.paymentMethodLast4}</span>
        </div>
        <div className={`flex min-w-0 flex-1 items-center overflow-hidden ${COLUMNS[3].width}`}>
          <span className="truncate font-label-medium text-default">{row.description}</span>
        </div>
        <div className={`flex min-w-0 shrink-0 items-center overflow-hidden ${COLUMNS[4].width}`}>
          <span className="truncate font-label-medium text-default">{row.date}</span>
        </div>
      </div>
    </div>
  )
}

const AMOUNTS = [
  '$0.00', '$12.50', '$24.99', '$49.00', '$75.25', '$128.60', '$199.00', '$250.00', '$320.45',
  '$399.99', '$450.00', '$512.30', '$599.00', '$687.50', '$750.00', '$825.00', '$999.99', '$1,240.00',
]
const DESCRIPTIONS = [
  'Basic plan', 'Pro plan', 'Enterprise plan', 'Invoice #1001', 'Invoice #2042', 'Subscription renewal',
  'One-time payment', 'Consulting fee', 'Software license', 'API usage', 'Storage upgrade', 'Support retainer',
  'Workshop registration', 'Conference ticket', 'Donation', 'Refund', 'Adjustment', 'Credit',
]
const DATES = [
  'Jan 9, 10:29 AM', 'Jan 8, 3:15 PM', 'Jan 7, 9:42 AM', 'Jan 6, 2:00 PM', 'Jan 5, 11:20 AM',
  'Jan 4, 4:55 PM', 'Jan 3, 8:10 AM', 'Jan 2, 1:30 PM', 'Jan 1, 6:45 PM', 'Dec 31, 10:00 AM',
  'Dec 30, 2:22 PM', 'Dec 29, 7:18 AM', 'Dec 28, 12:05 PM', 'Dec 27, 5:40 PM', 'Dec 26, 9:15 AM',
  'Dec 24, 11:30 AM', 'Dec 23, 4:00 PM', 'Dec 22, 8:45 AM', 'Dec 21, 1:12 PM', 'Dec 20, 6:33 PM',
]
const CARD_BRANDS: Array<'amex' | 'visa' | 'mastercard'> = ['amex', 'visa', 'mastercard']
const STATUSES: TransactionStatus[] = ['succeeded', 'succeeded', 'succeeded', 'pending', 'failed', 'refunded', 'disputed', 'uncaptured']

export function generateTransactionRows(count: number): TransactionRow[] {
  const rows: TransactionRow[] = []
  for (let i = 0; i < count; i++) {
    rows.push({
      amount: AMOUNTS[i % AMOUNTS.length],
      amountCurrency: 'USD',
      status: STATUSES[i % STATUSES.length],
      paymentMethodLast4: String(1000 + (i % 9000)).slice(-4),
      paymentMethodBrand: CARD_BRANDS[i % CARD_BRANDS.length],
      description: DESCRIPTIONS[i % DESCRIPTIONS.length],
      date: DATES[i % DATES.length],
    })
  }
  return rows
}

const DEFAULT_ROWS: TransactionRow[] = generateTransactionRows(80)

type TransactionsTableProps = {
  rows?: TransactionRow[]
  /** When provided, clicking a row opens the payment details drawer (or parent handles open). */
  onRowClick?: (row: TransactionRow) => void
}

export default function TransactionsTable({ rows = DEFAULT_ROWS, onRowClick }: TransactionsTableProps) {
  return (
    <div
      className="flex w-full flex-col overflow-auto pt-0 pb-2"
      data-name="Table 2.0"
      data-node-id="2:10689"
    >
      <TableHeader />
      <div className="flex flex-col">
        {rows.map((row, i) => (
          <TableRow key={i} row={row} isAlternate={i % 2 === 0} onClick={onRowClick} />
        ))}
      </div>
    </div>
  )
}
