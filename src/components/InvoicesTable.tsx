/**
 * InvoicesTable — Billing tab invoices table. Figma 20:9812.
 * Columns: Amount, Status, Due date, Invoice number, Description, Frequency, Created.
 * Same structure as TransactionsTable/PayoutsTable (52px rows, zebra striping).
 */

import { ROW_HEIGHT } from '../constants/table'
import { PillBadge } from './PillBadge'

const COLUMNS = [
  { key: 'amount', label: 'Amount', width: 'w-[140px]', align: 'left' as const },
  { key: 'status', label: 'Status', width: 'w-[100px]', align: 'right' as const },
  { key: 'dueDate', label: 'Due date', width: 'w-[180px]', align: 'left' as const },
  { key: 'invoiceNumber', label: 'Invoice number', width: 'w-[120px]', align: 'left' as const },
  { key: 'description', label: 'Description', width: 'min-w-0 flex-1', align: 'left' as const },
  { key: 'frequency', label: 'Frequency', width: 'w-[100px]', align: 'left' as const },
  { key: 'created', label: 'Created', width: 'w-[140px]', align: 'left' as const },
] as const

export type InvoiceStatus = 'paid' | 'pending' | 'overdue'

export type InvoiceRow = {
  amount: string
  amountCurrency: string
  status: InvoiceStatus
  dueDate: string
  invoiceNumber: string
  description: string
  frequency: string
  created: string
}

function TableHeader() {
  return (
    <div
      className="group flex w-full shrink-0 items-center overflow-hidden pr-6"
      data-name="Table Header"
      data-node-id="20:9813"
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

function InvoiceTableRow({
  row,
  isAlternate,
  onClick,
}: {
  row: InvoiceRow
  isAlternate: boolean
  onClick?: (row: InvoiceRow) => void
}) {
  const statusBadge =
    row.status === 'paid' ? <PillBadge label="Paid" variant="success" /> :
    row.status === 'pending' ? <PillBadge label="Pending" variant="attention" /> :
    row.status === 'overdue' ? <PillBadge label="Overdue" variant="critical" /> : null

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
        <div className={`flex min-w-0 shrink-0 items-center justify-end overflow-hidden ${COLUMNS[1].width}`}>
          {statusBadge}
        </div>
        <div className={`flex min-w-0 shrink-0 items-center overflow-hidden ${COLUMNS[2].width}`}>
          <span className="truncate font-label-medium text-default">{row.dueDate}</span>
        </div>
        <div className={`flex min-w-0 shrink-0 items-center overflow-hidden ${COLUMNS[3].width}`}>
          <span className="truncate font-label-medium text-default">{row.invoiceNumber}</span>
        </div>
        <div className={`flex min-w-0 flex-1 items-center overflow-hidden ${COLUMNS[4].width}`}>
          <span className="truncate font-label-medium text-default">{row.description}</span>
        </div>
        <div className={`flex min-w-0 shrink-0 items-center overflow-hidden ${COLUMNS[5].width}`}>
          <span className="truncate font-label-medium text-default">{row.frequency}</span>
        </div>
        <div className={`flex min-w-0 shrink-0 items-center overflow-hidden ${COLUMNS[6].width}`}>
          <span className="truncate font-label-medium text-default">{row.created}</span>
        </div>
      </div>
    </div>
  )
}

const AMOUNTS = ['$128.60', '$256.00', '$512.30', '$99.00', '$1,240.00']
const STATUSES: InvoiceStatus[] = ['paid', 'paid', 'pending', 'paid', 'overdue']
const DUE_DATES = ['Jan 31, 10:29 AM', 'Jan 16, 10:29 AM', 'Feb 14, 10:00 AM', 'Jan 23, 9:15 AM', 'Feb 7, 11:00 AM']
const INVOICE_NUMBERS = ['F-145078', 'F-145077', 'F-145079', 'F-145080', 'F-145081', 'F-145082', 'F-145083', 'F-145084', 'F-145085', 'F-145086']
const DESCRIPTIONS = ['Basic plan', 'Basic plan', 'Basic plan', 'Pro plan', 'Basic plan', 'Enterprise plan', 'Basic plan', 'Pro plan', 'Basic plan', 'Add-ons']
const FREQUENCIES = ['Weekly', 'Weekly', 'Weekly', 'Monthly', 'Weekly', 'Monthly', 'Weekly', 'Monthly', 'Weekly', 'One-time']
const CREATED_DATES = ['Jan 9, 8:12 AM', 'Jan 2, 9:24 AM', 'Jan 15, 8:00 AM', 'Jan 5, 10:00 AM', 'Jan 12, 2:30 PM', 'Dec 28, 9:00 AM', 'Jan 8, 11:15 AM', 'Dec 20, 4:00 PM', 'Jan 10, 8:45 AM', 'Jan 18, 1:00 PM']

export function generateInvoiceRows(count: number): InvoiceRow[] {
  const rows: InvoiceRow[] = []
  for (let i = 0; i < count; i++) {
    rows.push({
      amount: AMOUNTS[i % AMOUNTS.length],
      amountCurrency: 'USD',
      status: STATUSES[i % STATUSES.length],
      dueDate: DUE_DATES[i % DUE_DATES.length],
      invoiceNumber: INVOICE_NUMBERS[i % INVOICE_NUMBERS.length],
      description: DESCRIPTIONS[i % DESCRIPTIONS.length],
      frequency: FREQUENCIES[i % FREQUENCIES.length],
      created: CREATED_DATES[i % CREATED_DATES.length],
    })
  }
  return rows
}

/** Alternative dataset for second billing view (e.g. Toybox Labs). */
const AMOUNTS_B = ['$2,450.00', '$1,890.50', '$3,100.00', '$567.25', '$4,200.00']
const DUE_DATES_B = ['Mar 1, 9:00 AM', 'Feb 28, 2:00 PM', 'Mar 15, 10:30 AM', 'Feb 25, 4:15 PM', 'Mar 8, 11:00 AM']
const INVOICE_NUMBERS_B = ['INV-TB-1001', 'INV-TB-1002', 'INV-TB-1003', 'INV-TB-1004', 'INV-TB-1005', 'INV-TB-1006', 'INV-TB-1007', 'INV-TB-1008', 'INV-TB-1009', 'INV-TB-1010']
const DESCRIPTIONS_B = ['Enterprise plan', 'API usage', 'Professional plan', 'Storage add-on', 'Support retainer', 'Enterprise plan', 'Consulting', 'Professional plan', 'Add-ons', 'Enterprise plan']
const CREATED_DATES_B = ['Feb 1, 8:00 AM', 'Jan 28, 3:00 PM', 'Feb 5, 9:30 AM', 'Jan 22, 1:00 PM', 'Feb 10, 10:15 AM', 'Jan 15, 4:45 PM', 'Feb 3, 11:00 AM', 'Jan 18, 2:30 PM', 'Feb 8, 9:00 AM', 'Jan 25, 5:00 PM']

export function generateInvoiceRowsAlt(count: number): InvoiceRow[] {
  const rows: InvoiceRow[] = []
  for (let i = 0; i < count; i++) {
    rows.push({
      amount: AMOUNTS_B[i % AMOUNTS_B.length],
      amountCurrency: 'USD',
      status: STATUSES[i % STATUSES.length],
      dueDate: DUE_DATES_B[i % DUE_DATES_B.length],
      invoiceNumber: INVOICE_NUMBERS_B[i % INVOICE_NUMBERS_B.length],
      description: DESCRIPTIONS_B[i % DESCRIPTIONS_B.length],
      frequency: FREQUENCIES[i % FREQUENCIES.length],
      created: CREATED_DATES_B[i % CREATED_DATES_B.length],
    })
  }
  return rows
}

const DEFAULT_ROWS = generateInvoiceRows(10)

type InvoicesTableProps = {
  rows?: InvoiceRow[]
  onRowClick?: (row: InvoiceRow) => void
}

export default function InvoicesTable({ rows = DEFAULT_ROWS, onRowClick }: InvoicesTableProps) {
  return (
    <div
      className="flex w-full flex-col overflow-auto pt-0 pb-2"
      data-name="Invoices table"
      data-node-id="20:9812"
    >
      <TableHeader />
      <div className="flex flex-col">
        {rows.map((row, i) => (
          <InvoiceTableRow key={i} row={row} isAlternate={i % 2 === 0} onClick={onRowClick} />
        ))}
      </div>
    </div>
  )
}
