/**
 * NetworkTable — Figma Table 2.0 node 2:10689 (Stripe Network Cursor SRC).
 * Data table with header, data rows, and skeleton loading rows.
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { generateNetworkRows } from '../data/networkDummyData'
import type { NetworkTabId } from './NetworkPageHeader'
import { Icon } from '../icons/SailIcons'

const COLUMNS = [
  { key: 'account', label: 'Account', align: 'left', width: 'w-[184px]' },
  { key: 'status', label: 'Status', align: 'left', width: 'w-[100px]' },
  { key: 'email', label: 'Email', align: 'left', width: 'w-[260px]' },
  { key: 'configurations', label: 'Configurations', align: 'left', width: 'w-[240px]' },
  { key: 'lastTransaction', label: 'Last transaction', align: 'left', width: 'w-[120px]' },
  { key: 'lifetimeValue', label: 'Lifetime value', align: 'right', width: 'w-[120px]' },
  { key: 'dateAdded', label: 'Date added', align: 'left', width: 'min-w-0 flex-1 ml-[8px]' },
] as const

import type { NetworkRow, StatusKind } from '../data/networkDummyData'

type Row = NetworkRow

const DATA_ROWS: Row[] = generateNetworkRows()

const ROW_HEIGHT = 52
const SKELETON_ROW_COUNT = 7

export type SavedViewId = '1' | '2' | '3' | '4' | '5' | '6' | '7'

export type CustomerViewId = 'c1' | 'c2' | 'c3' | 'c4' | 'c5' | 'c6' | 'c7'

function filterRowsByTab(rows: Row[], tab: NetworkTabId): Row[] {
  if (tab === 'all') return rows
  if (tab === 'merchants') return rows.filter((row) => row.configurations.includes('Merchant'))
  // Customers = anyone who is a customer (Customer-only OR Merchant, Customer — merchants are also customers)
  if (tab === 'customers') return rows.filter((row) => row.configurations.includes('Customer'))
  return rows
}

function filterRowsByStatusView(rows: Row[], viewId: SavedViewId): Row[] {
  if (viewId === '1') return rows // All
  if (viewId === '2') return rows.filter((row) => row.status === 'restricted')
  if (viewId === '3') return rows.filter((row) => row.status === 'restricted_soon')
  if (viewId === '4' || viewId === '5') return [] // In review, Rejected — no data yet
  if (viewId === '6') return rows.filter((row) => row.status === 'enabled')
  if (viewId === '7') return rows.filter((row) => row.status === 'radar_rule_matches')
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
            : row.status === 'radar_rule_matches'
              ? 'radar rule matches'
              : ''
    const searchable = [
      statusText,
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

export { parseLtv }

function RestrictedIcon() {
  return (
    <span className="ml-1 inline-flex shrink-0" aria-hidden>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="6" cy="6" r="6" fill="var(--color-icon-feedback-critical)" />
        <path
          d="M4 4l4 4M8 4l-4 4"
          stroke="white"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
      </svg>
    </span>
  )
}

function StatusBadge({ kind }: { kind: StatusKind }) {
  if (kind === null) {
    return <span className="font-label-medium text-subdued">–</span>
  }
  if (kind === 'enabled') {
    return (
      <span
        className="inline-flex items-center justify-center rounded-[length:var(--radius-xsmall)] px-[6px] py-[2px] font-label-small"
        style={{
          backgroundColor: 'var(--color-feedback-success-subdued)',
          color: 'var(--color-feedback-success-on)',
        }}
      >
        Enabled
      </span>
    )
  }
  if (kind === 'restricted_soon') {
    return (
      <span
        className="inline-flex items-center justify-center rounded-[length:var(--radius-xsmall)] px-[6px] py-[2px] font-label-small"
        style={{
          backgroundColor: 'var(--color-feedback-attention-subdued)',
          color: 'var(--color-feedback-attention-on)',
        }}
      >
        Restricted soon
      </span>
    )
  }
  if (kind === 'restricted') {
    return (
      <span
        className="inline-flex items-center rounded-[length:var(--radius-xsmall)] px-[6px] py-[2px] font-label-small"
        style={{
          backgroundColor: 'var(--color-feedback-critical-subdued)',
          color: 'var(--color-feedback-critical-on)',
        }}
      >
        Restricted
        <RestrictedIcon />
      </span>
    )
  }
  if (kind === 'radar_rule_matches') {
    return <span className="font-label-medium text-subdued">–</span>
  }
  return null
}

type LtvSortDirection = 'asc' | 'desc' | null

function TableHeader({
  ltvSortDirection,
  onLtvSortClick,
}: {
  ltvSortDirection: LtvSortDirection
  onLtvSortClick: () => void
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
        {COLUMNS.map((col) => {
          const isLtv = col.key === 'lifetimeValue'
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
                  <span className="truncate text-right">{col.label}</span>
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
  isAlternate,
}: {
  row: Row
  isAlternate: boolean
}) {
  return (
    <Link
      to={`/account/${row.id}`}
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
        <div className={`flex min-w-0 shrink-0 items-center overflow-hidden ${COLUMNS[0].width}`}>
          <span className="truncate font-label-medium-emphasized text-default">{row.account}</span>
        </div>
        <div className={`flex min-w-0 shrink-0 items-center overflow-hidden ${COLUMNS[1].width}`}>
          <StatusBadge kind={row.status} />
        </div>
        <div className={`flex min-w-0 shrink-0 items-center overflow-hidden ${COLUMNS[2].width}`}>
          <span className="truncate font-label-medium text-default">{row.email}</span>
        </div>
        <div className={`flex min-w-0 shrink-0 items-center overflow-hidden ${COLUMNS[3].width}`}>
          <span className="truncate font-label-medium text-default">{row.configurations}</span>
        </div>
        <div className={`flex min-w-0 shrink-0 items-center overflow-hidden ${COLUMNS[4].width}`}>
          <span className="truncate font-label-medium text-default">{row.lastTransaction}</span>
        </div>
        <div className={`flex min-w-0 shrink-0 items-center justify-end overflow-hidden ${COLUMNS[5].width}`}>
          <span className="truncate font-label-medium text-default">{row.lifetimeValue}</span>
        </div>
        <div className={`flex min-w-0 flex-1 items-center overflow-hidden ${COLUMNS[6].width}`}>
          <span className="truncate font-label-medium text-default">{row.dateAdded}</span>
        </div>
      </div>
    </Link>
  )
}

function SkeletonRow({ isAlternate }: { isAlternate: boolean }) {
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
        {COLUMNS.map((col) => (
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
}: {
  activeTab?: NetworkTabId
  statusViewId?: SavedViewId
  customerViewId?: CustomerViewId
  searchQuery?: string
}) {
  const [ltvSortDirection, setLtvSortDirection] = useState<LtvSortDirection>(null)
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
      <TableHeader ltvSortDirection={ltvSortDirection} onLtvSortClick={handleLtvSortClick} />
      <div className="flex flex-col">
        {filteredRows.map((row, i) => (
          <TableRow key={i} row={row} isAlternate={i % 2 === 0} />
        ))}
        {showSkeletons &&
          Array.from({ length: SKELETON_ROW_COUNT }, (_, i) => (
            <SkeletonRow
              key={`skeleton-${i}`}
              isAlternate={(filteredRows.length + i) % 2 === 0}
            />
          ))}
      </div>
    </div>
  )
}
