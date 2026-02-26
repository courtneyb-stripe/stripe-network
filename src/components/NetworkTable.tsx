/**
 * NetworkTable — Figma Table 2.0 node 2:10689 (Stripe Network Cursor SRC).
 * Data table with header, data rows, and skeleton loading rows.
 */

import { type ReactNode, useState } from 'react'
import { Link } from 'react-router-dom'
import { generateNetworkRows } from '../data/networkDummyData'
import { MOCK_ACCOUNTS } from '../data/mockAccounts'
import type { NetworkTabId } from './NetworkPageHeader'
import { Icon } from '../icons/SailIcons'
import { PillBadge, RestrictedIcon } from './PillBadge'

const COLUMNS = [
  { key: 'account', label: 'Account', align: 'left', width: 'w-[184px]' },
  { key: 'status', label: 'Status', align: 'left', width: 'w-[100px]' },
  { key: 'risk', label: 'Risk', align: 'left', width: 'w-[72px]' },
  { key: 'email', label: 'Email', align: 'left', width: 'w-[260px]' },
  { key: 'configurations', label: 'Configurations', align: 'left', width: 'w-[240px]' },
  { key: 'lastTransaction', label: 'Last transaction', align: 'left', width: 'w-[120px]' },
  { key: 'lifetimeValue', label: 'Lifetime value', align: 'right', width: 'w-[120px]' },
  { key: 'dateAdded', label: 'Date added', align: 'left', width: 'min-w-0 flex-1 ml-[8px]' },
] as const

import type { NetworkRow, StatusKind } from '../data/networkDummyData'
import { ROW_HEIGHT } from '../constants/table'

type Row = NetworkRow

/** Only merchant configs (Merchant or Merchant, Customer) get a status and can be radar rule matches. */
const hasMerchantConfig = (config: string) => config.includes('Merchant')

const MOCK_ROWS: Row[] = MOCK_ACCOUNTS.map((a) => ({
  id: a.id,
  status: hasMerchantConfig(a.configurations) ? a.status : null,
  isRadarRuleMatch: hasMerchantConfig(a.configurations) && !!a.isRadarRuleMatch,
  account: a.name,
  email: a.email,
  configurations: a.configurations,
  lastTransaction: 'Jan 15, 2025',
  lifetimeValue: '$12,500',
  dateAdded: 'Jul 10, 2021',
  isTopSpender: false,
  isSubscriber: false,
  isInternational: false,
  highRefunds: false,
  highDisputes: false,
  last30Days: true,
}))

const GENERATED_ROWS = generateNetworkRows()
const DATA_ROWS: Row[] = [...MOCK_ROWS, ...GENERATED_ROWS.slice(MOCK_ACCOUNTS.length)]

const SKELETON_ROW_COUNT = 7

export type SavedViewId = '1' | '2' | '3' | '4' | '5' | '6' | '7'

export type CustomerViewId = 'c1' | 'c2' | 'c3' | 'c4' | 'c5' | 'c6' | 'c7'

function filterRowsByTab(rows: Row[], tab: NetworkTabId): Row[] {
  if (tab === 'all') return rows
  if (tab === 'merchants') return rows.filter((row) => row.configurations.includes('Merchant'))
  // Customers = anyone who is a customer (Customer-only OR Merchant, Customer — merchants are also customers)
  if (tab === 'customers') return rows.filter((row) => row.configurations.includes('Customer'))
  // Recipients = customer-only accounts (no Merchant)
  if (tab === 'recipients') return rows.filter((row) => !row.configurations.includes('Merchant'))
  return rows
}

function filterRowsByStatusView(rows: Row[], viewId: SavedViewId): Row[] {
  if (viewId === '1') return rows // All
  if (viewId === '2') return rows.filter((row) => row.status === 'restricted')
  if (viewId === '3') return rows.filter((row) => row.status === 'restricted_soon')
  if (viewId === '4' || viewId === '5') return [] // In review, Rejected — no data yet
  if (viewId === '6') return rows.filter((row) => row.status === 'enabled')
  if (viewId === '7') return rows.filter((row) => row.isRadarRuleMatch)
  return rows
}

function filterRowsByCustomerView(rows: Row[], viewId: CustomerViewId): Row[] {
  if (viewId === 'c1') return rows // All
  if (viewId === 'c2') return rows.filter((row) => row.isTopSpender)
  if (viewId === 'c3') return rows.filter((row) => row.isSubscriber)
  if (viewId === 'c4') return rows.filter((row) => row.isInternational)
  if (viewId === 'c5') return rows.filter((row) => row.highRefunds)
  if (viewId === 'c6') return rows.filter((row) => row.highDisputes)
  if (viewId === 'c7') return rows.filter((row) => row.last30Days)
  return rows
}

function parseLtv(value: string): number {
  const cleaned = value.replace(/[$,]/g, '')
  const n = parseFloat(cleaned)
  return Number.isNaN(n) ? 0 : n
}

function sortRowsByLtv(rows: Row[], direction: 'asc' | 'desc'): Row[] {
  return [...rows].sort((a, b) => {
    const va = parseLtv(a.lifetimeValue)
    const vb = parseLtv(b.lifetimeValue)
    return direction === 'asc' ? va - vb : vb - va
  })
}

/** Sort by Config: "Customer" first, then "Merchant, Customer". */
function sortRowsByConfig(rows: Row[]): Row[] {
  return [...rows].sort((a, b) => a.configurations.localeCompare(b.configurations))
}

function filterRows(rows: Row[], query: string): Row[] {
  const q = query.trim().toLowerCase()
  if (!q) return rows
  return rows.filter((row) => {
    const statusText =
      row.status === 'enabled'
        ? 'enabled'
        : row.status === 'restricted_soon'
          ? 'restricted soon'
          : row.status === 'restricted'
            ? 'restricted'
            : ''
    const riskText = row.isRadarRuleMatch ? 'high risk' : ''
    const searchable = [
      statusText,
      riskText,
      row.account,
      row.email,
      row.configurations,
      row.lastTransaction,
      row.lifetimeValue,
      row.dateAdded,
    ].join(' ').toLowerCase()
    return searchable.includes(q)
  })
}

/** Exported for NetworkList/Metrics: rows after tab + view (status or customer) + search (no sort). */
export function getFilteredRows(
  activeTab: NetworkTabId,
  statusViewId: SavedViewId,
  searchQuery: string,
  customerViewId?: CustomerViewId
): Row[] {
  const byTab = filterRowsByTab(DATA_ROWS, activeTab)
  const byView =
    activeTab === 'customers'
      ? filterRowsByCustomerView(byTab, customerViewId ?? 'c1')
      : filterRowsByStatusView(byTab, statusViewId)
  return filterRows(byView, searchQuery)
}

/** Column set when merchant is not Shopify: no Status, LTV shown as Total spend. */
function getVisibleColumns(statusViewId: SavedViewId, isShopify: boolean): Col[] {
  let cols = statusViewId === '7' ? [...COLUMNS] : COLUMNS.filter((c): c is Col => c.key !== 'risk')
  if (!isShopify) {
    cols = cols.filter((c): c is Col => c.key !== 'status')
  }
  return cols
}

export { parseLtv }

function StatusBadge({ kind }: { kind: StatusKind }) {
  if (kind === null) {
    return <span className="font-label-medium text-subdued">–</span>
  }
  if (kind === 'enabled') {
    return <PillBadge label="Enabled" variant="success" />
  }
  if (kind === 'restricted_soon') {
    return <PillBadge label="Restricted soon" variant="attention" />
  }
  if (kind === 'restricted') {
    return <PillBadge label="Restricted" variant="critical" icon={<RestrictedIcon />} />
  }
  return null
}

type LtvSortDirection = 'asc' | 'desc' | null

type Col = (typeof COLUMNS)[number]

function TableHeader({
  columns,
  ltvSortDirection,
  onLtvSortClick,
  ltvColumnLabel,
}: {
  columns: readonly Col[]
  ltvSortDirection: LtvSortDirection
  onLtvSortClick: () => void
  /** When set (e.g. non-Shopify view), use instead of column label for lifetimeValue. */
  ltvColumnLabel?: string
}) {
  return (
    <div
      className="group flex w-full shrink-0 items-center overflow-hidden pr-6"
      data-name="Table Header"
      style={{ height: ROW_HEIGHT }}
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
        {columns.map((col) => {
          const isLtv = col.key === 'lifetimeValue'
          const headerLabel = isLtv && ltvColumnLabel != null ? ltvColumnLabel : col.label
          return (
            <div
              key={col.key}
              className={`flex min-w-0 shrink-0 items-center overflow-hidden ${col.width} ${col.align === 'right' ? 'justify-end' : ''} ${isLtv ? 'group/ltv' : ''}`}
              data-name="Table Header Cell"
            >
              {isLtv ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    onLtvSortClick()
                  }}
                  className="inline-flex w-full cursor-pointer items-center justify-end gap-1 rounded-[length:var(--radius-xsmall)] font-label-small-emphasized text-subdued transition-colors hover:text-default focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary"
                  aria-sort={ltvSortDirection === 'asc' ? 'ascending' : ltvSortDirection === 'desc' ? 'descending' : undefined}
                >
                  <span className="truncate text-right">{headerLabel}</span>
                  <span
                    className={`flex shrink-0 items-center transition-opacity group-hover/ltv:opacity-100 ${ltvSortDirection != null ? 'opacity-100' : 'opacity-0'}`}
                  >
                    <Icon
                      name={ltvSortDirection === 'asc' ? 'arrowUp' : 'arrowDown'}
                      size={12}
                      fill="var(--color-icon-default)"
                    />
                  </span>
                </button>
              ) : (
                <span
                  className={`truncate font-label-small-emphasized text-subdued ${col.align === 'right' ? 'text-right' : ''}`}
                >
                  {col.label}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TableRow({
  row,
  columns,
  isAlternate,
}: {
  row: Row
  columns: readonly Col[]
  isAlternate: boolean
}) {
  const cellByKey: Record<string, ReactNode> = {
    account: <span className="truncate font-label-medium-emphasized text-default">{row.account}</span>,
    status: <StatusBadge kind={row.status} />,
    risk: row.isRadarRuleMatch ? (
      <PillBadge label="High" variant="critical" />
    ) : (
      <span className="font-label-medium text-subdued">–</span>
    ),
    email: <span className="truncate font-label-medium text-default">{row.email}</span>,
    configurations: <span className="truncate font-label-medium text-default">{row.configurations}</span>,
    lastTransaction: <span className="truncate font-label-medium text-default">{row.lastTransaction}</span>,
    lifetimeValue: <span className="truncate font-label-medium text-default">{row.lifetimeValue}</span>,
    dateAdded: <span className="truncate font-label-medium text-default">{row.dateAdded}</span>,
  }
  return (
    <Link
      to={`/network/${row.id}`}
      state={{
        status: row.status,
        accountName: row.account,
      }}
      className={`group flex w-full shrink-0 cursor-pointer items-center rounded-[length:var(--radius-action)] pr-2 transition-colors ${
        isAlternate ? 'bg-[#fafbfb] hover:bg-offset' : 'bg-surface hover:bg-offset'
      }`}
      data-name="Table Row 2.0"
      style={{ height: ROW_HEIGHT }}
    >
      <div
        className="flex shrink-0 items-center justify-center p-[7px] w-8 opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden
      >
        <div className="h-3.5 w-3.5 shrink-0 rounded-[length:var(--radius-xsmall)] border border-neutral-100 bg-surface" />
      </div>
      <div className="flex min-w-0 flex-1 items-center gap-6">
        {columns.map((col) => (
          <div
            key={col.key}
            className={`flex min-w-0 shrink-0 items-center overflow-hidden ${col.width} ${col.key === 'lifetimeValue' ? 'justify-end' : ''}`}
          >
            {cellByKey[col.key]}
          </div>
        ))}
      </div>
    </Link>
  )
}

function SkeletonRow({ columns, isAlternate }: { columns: readonly Col[]; isAlternate: boolean }) {
  return (
    <div
      className={`group flex w-full shrink-0 items-center rounded-[length:var(--radius-action)] pr-2 transition-colors ${
        isAlternate ? 'bg-[#fafbfb] hover:bg-offset' : 'bg-surface hover:bg-offset'
      }`}
      data-name="Table Row 2.0"
      aria-busy
      style={{ height: ROW_HEIGHT }}
    >
      <div
        className="flex shrink-0 items-center justify-center p-[7px] w-8 opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden
      >
        <div className="h-3.5 w-3.5 shrink-0 rounded-[length:var(--radius-xsmall)] border border-neutral-100 bg-surface" />
      </div>
      <div className="flex min-w-0 flex-1 items-center gap-6">
        {columns.map((col) => (
          <div
            key={col.key}
            className={`flex min-w-0 shrink-0 items-center overflow-hidden ${col.width} ${col.align === 'right' ? 'justify-end' : ''}`}
          >
            <div className="h-2.5 w-full max-w-full rounded-[3px] bg-neutral-50" aria-hidden />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function NetworkTable({
  activeTab = 'all',
  statusViewId = '1',
  customerViewId = 'c1',
  searchQuery = '',
  selectedMerchant = 'Shopify',
}: {
  activeTab?: NetworkTabId
  statusViewId?: SavedViewId
  customerViewId?: CustomerViewId
  searchQuery?: string
  selectedMerchant?: string
}) {
  const [ltvSortDirection, setLtvSortDirection] = useState<LtvSortDirection>(null)
  const isShopify = selectedMerchant === 'Shopify'
  const visibleColumns = getVisibleColumns(statusViewId, isShopify)
  const rowsForTab = filterRowsByTab(DATA_ROWS, activeTab)
  const rowsForView =
    activeTab === 'customers'
      ? filterRowsByCustomerView(rowsForTab, customerViewId)
      : filterRowsByStatusView(rowsForTab, statusViewId)
  const filteredBySearch = filterRows(rowsForView, searchQuery)
  const filteredRows =
    ltvSortDirection === 'asc' || ltvSortDirection === 'desc'
      ? sortRowsByLtv(filteredBySearch, ltvSortDirection)
      : activeTab === 'customers'
        ? sortRowsByConfig(filteredBySearch)
        : filteredBySearch
  const showSkeletons = !searchQuery.trim()

  const handleLtvSortClick = () => {
    setLtvSortDirection((d) => (d === null ? 'asc' : d === 'asc' ? 'desc' : null))
  }

  return (
    <div
      className="flex w-full flex-col overflow-auto px-[40px] pt-0 pb-2"
      data-name="Table 2.0"
      data-node-id="2:10689"
    >
      <TableHeader
        columns={visibleColumns}
        ltvSortDirection={ltvSortDirection}
        onLtvSortClick={handleLtvSortClick}
        ltvColumnLabel={isShopify ? undefined : 'Total spend'}
      />
      <div className="flex flex-col">
        {filteredRows.map((row, i) => (
          <TableRow key={i} row={row} columns={visibleColumns} isAlternate={i % 2 === 0} />
        ))}
        {showSkeletons &&
          Array.from({ length: SKELETON_ROW_COUNT }, (_, i) => (
            <SkeletonRow
              key={`skeleton-${i}`}
              columns={visibleColumns}
              isAlternate={(filteredRows.length + i) % 2 === 0}
            />
          ))}
      </div>
    </div>
  )
}
