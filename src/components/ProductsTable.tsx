/**
 * ProductsTable — Products tab table. Figma 214:28398.
 * Columns: Name, Pricing, Tax category, Created, Updated.
 * Same structure as InvoicesTable (52px rows, zebra striping).
 */

import { ROW_HEIGHT } from '../constants/table'

const COLUMNS = [
  { key: 'name', label: 'Name', width: 'w-[400px] min-w-[200px]', align: 'left' as const },
  { key: 'pricing', label: 'Pricing', width: 'w-[120px]', align: 'left' as const },
  { key: 'taxCategory', label: 'Tax category', width: 'min-w-0 flex-1', align: 'left' as const },
  { key: 'created', label: 'Created', width: 'w-[140px]', align: 'left' as const },
  { key: 'updated', label: 'Updated', width: 'w-[140px]', align: 'left' as const },
] as const

export type ProductRow = {
  name: string
  pricing: string
  taxCategory: string
  created: string
  updated: string
}

function TableHeader() {
  return (
    <div
      className="group flex w-full shrink-0 items-center overflow-hidden pr-6"
      data-name="Products table header"
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

function ProductTableRow({
  row,
  isAlternate,
  onClick,
}: {
  row: ProductRow
  isAlternate: boolean
  onClick?: (row: ProductRow) => void
}) {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick ? () => onClick(row) : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick(row)
              }
            }
          : undefined
      }
      className={`group flex w-full shrink-0 cursor-pointer items-center rounded-[length:var(--radius-action)] pr-2 transition-colors ${
        isAlternate ? 'bg-[#fafbfb] hover:bg-offset' : 'bg-surface hover:bg-offset'
      }`}
      data-name="Product table row"
      style={{ height: ROW_HEIGHT, minHeight: ROW_HEIGHT }}
    >
      <div
        className="flex shrink-0 items-center justify-center p-[7px] w-8 opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden
      >
        <div className="h-3.5 w-3.5 shrink-0 rounded-[length:var(--radius-xsmall)] border border-neutral-100 bg-surface" />
      </div>
      <div className="flex min-w-0 flex-1 items-center gap-6">
        <div className={`flex min-w-0 shrink-0 items-center overflow-hidden ${COLUMNS[0].width}`}>
          <span className="truncate font-label-medium-emphasized text-default">{row.name}</span>
        </div>
        <div className={`flex min-w-0 shrink-0 items-center overflow-hidden ${COLUMNS[1].width}`}>
          <span className="truncate font-label-medium text-default">{row.pricing}</span>
        </div>
        <div className={`flex min-w-0 flex-1 items-center overflow-hidden ${COLUMNS[2].width}`}>
          <span className="truncate font-label-medium text-default">{row.taxCategory}</span>
        </div>
        <div className={`flex min-w-0 shrink-0 items-center overflow-hidden ${COLUMNS[3].width}`}>
          <span className="truncate font-label-medium text-default">{row.created}</span>
        </div>
        <div className={`flex min-w-0 shrink-0 items-center overflow-hidden ${COLUMNS[4].width}`}>
          <span className="truncate font-label-medium text-default">{row.updated}</span>
        </div>
      </div>
    </div>
  )
}

// Dummy data from Figma 214:28398 — first row from design, rest varied
const NAMES = [
  'Max bundle plan USA',
  'Starter plan',
  'Pro plan',
  'Enterprise bundle',
  'Add-on: Storage',
  'Basic plan',
  'Growth plan',
  'Team plan',
  'Developer plan',
  'Premium plan',
]
const PRICINGS = ['$24.00 USD', '$12.00 USD', '$49.00 USD', '$199.00 USD', '$9.00 USD', '$29.00 USD', '$99.00 USD', '$299.00 USD', '$79.00 USD', '$149.00 USD']
const TAX_CATEGORIES = [
  'Digital Audio Visual Works - bundle - downloaded with permanent rights and streamed - subscription - with conditional rights',
  'Software as a service',
  'General - tangible goods',
  'Digital products',
  'Software as a service',
  'General - intangible',
  'Digital products',
  'Software as a service',
  'Digital products',
  'General - tangible goods',
]
const CREATED_DATES = ['May 1, 2025', 'Jan 15, 2025', 'Mar 10, 2025', 'Feb 1, 2025', 'Apr 5, 2025', 'Dec 20, 2024', 'Jan 8, 2025', 'Nov 12, 2024', 'Feb 28, 2025', 'Mar 22, 2025']
const UPDATED_DATES = ['Jul 2, 2024', 'Feb 10, 2025', 'Apr 1, 2025', 'Mar 15, 2025', 'May 2, 2025', 'Jan 5, 2025', 'Feb 20, 2025', 'Dec 1, 2024', 'Mar 18, 2025', 'Apr 10, 2025']

export function generateProductRows(count: number): ProductRow[] {
  const rows: ProductRow[] = []
  for (let i = 0; i < count; i++) {
    rows.push({
      name: NAMES[i % NAMES.length],
      pricing: PRICINGS[i % PRICINGS.length],
      taxCategory: TAX_CATEGORIES[i % TAX_CATEGORIES.length],
      created: CREATED_DATES[i % CREATED_DATES.length],
      updated: UPDATED_DATES[i % UPDATED_DATES.length],
    })
  }
  return rows
}

// Toybox Labs — different product set
const NAMES_ALT = [
  'API Pro tier',
  'Widget subscription',
  'Lab analytics bundle',
  'Toybox platform fee',
  'Add-on: Extra seats',
  'Starter for teams',
  'Enterprise API',
  'Sandbox access',
  'Webhook premium',
  'Support retainer',
]
const PRICINGS_ALT = ['$99.00 USD', '$19.00 USD', '$349.00 USD', '$0.50 USD', '$15.00 USD', '$45.00 USD', '$499.00 USD', '$0.00 USD', '$29.00 USD', '$200.00 USD']
const TAX_CATEGORIES_ALT = [
  'Software as a service',
  'Digital products',
  'General - intangible',
  'Software as a service',
  'Software as a service',
  'Digital products',
  'Software as a service',
  'Software as a service',
  'Digital products',
  'Professional services',
]
const CREATED_DATES_ALT = ['Jun 1, 2025', 'Apr 12, 2025', 'May 20, 2025', 'Mar 5, 2025', 'Jul 8, 2025', 'Feb 14, 2025', 'Jan 22, 2025', 'Aug 1, 2024', 'Jun 15, 2025', 'May 3, 2025']
const UPDATED_DATES_ALT = ['Sep 1, 2025', 'Aug 10, 2025', 'Jul 22, 2025', 'Sep 5, 2025', 'Aug 28, 2025', 'Jul 15, 2025', 'Aug 2, 2025', 'Jul 1, 2025', 'Sep 12, 2025', 'Aug 19, 2025']

export function generateProductRowsAlt(count: number): ProductRow[] {
  const rows: ProductRow[] = []
  for (let i = 0; i < count; i++) {
    rows.push({
      name: NAMES_ALT[i % NAMES_ALT.length],
      pricing: PRICINGS_ALT[i % PRICINGS_ALT.length],
      taxCategory: TAX_CATEGORIES_ALT[i % TAX_CATEGORIES_ALT.length],
      created: CREATED_DATES_ALT[i % CREATED_DATES_ALT.length],
      updated: UPDATED_DATES_ALT[i % UPDATED_DATES_ALT.length],
    })
  }
  return rows
}

const DEFAULT_ROWS = generateProductRows(10)

type ProductsTableProps = {
  rows?: ProductRow[]
  onRowClick?: (row: ProductRow) => void
}

export default function ProductsTable({ rows = DEFAULT_ROWS, onRowClick }: ProductsTableProps) {
  return (
    <div
      className="flex w-full flex-col overflow-auto pt-0 pb-2"
      data-name="Products table"
      data-node-id="214:28398"
    >
      <TableHeader />
      <div className="flex flex-col">
        {rows.map((row, i) => (
          <ProductTableRow key={i} row={row} isAlternate={i % 2 === 0} onClick={onRowClick} />
        ))}
      </div>
    </div>
  )
}
