/**
 * NetworkFilterGroup — Figma M0 Filter Group node 2:10679 (Stripe Network Cursor SRC).
 * Saved view chips + search/toolbar bar for the Network list.
 */

import { Icon } from '../icons/SailIcons'

import type { SavedViewId, CustomerViewId } from './NetworkTable'

const VIEW_CHIPS: { id: SavedViewId; label: string }[] = [
  { id: '1', label: 'All' },
  { id: '2', label: 'Restricted' },
  { id: '3', label: 'Restricted soon' },
  { id: '4', label: 'In review' },
  { id: '5', label: 'Rejected' },
  { id: '6', label: 'Enabled' },
  { id: '7', label: 'Radar rule matches' },
]

const CUSTOMER_VIEW_CHIPS: { id: CustomerViewId; label: string }[] = [
  { id: 'c1', label: 'All' },
  { id: 'c2', label: 'Top spender' },
  { id: 'c3', label: 'Subscriber' },
  { id: 'c4', label: 'International' },
  { id: 'c5', label: 'High refunds' },
  { id: 'c6', label: 'High disputes' },
  { id: 'c7', label: 'Last 30 days' },
]

function ViewChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-fit shrink-0 items-baseline gap-1 overflow-clip rounded-[10px] border border-solid px-3 py-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-action-primary ${
        active
          ? 'border-default bg-default text-neutral-0'
          : 'border-neutral-100 bg-surface text-subdued hover:border-neutral-100 hover:bg-offset'
      }`}
      data-name="View Chip 2.0"
      data-node-id="6:5122"
    >
      <span className="shrink-0 truncate font-label-medium-emphasized leading-5">{label}</span>
      <span className="shrink-0 font-label-small leading-4 tabular-nums">{count.toLocaleString()}</span>
    </button>
  )
}

function FilterBarButton({
  'aria-label': ariaLabel,
  children,
  className = '',
}: {
  'aria-label': string
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={`flex h-7 min-h-7 w-7 shrink-0 items-center justify-center rounded-[length:var(--radius-action)] border border-neutral-50 bg-surface font-label-medium-emphasized transition-colors hover:bg-offset focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-action-primary ${className}`}
    >
      {children}
    </button>
  )
}

import type { NetworkTabId } from './NetworkPageHeader'

export interface NetworkFilterGroupProps {
  activeTab?: NetworkTabId
  selectedViewId?: SavedViewId
  onViewChange?: (viewId: SavedViewId) => void
  viewCounts?: Partial<Record<SavedViewId, number>>
  selectedCustomerViewId?: CustomerViewId
  onCustomerViewChange?: (viewId: CustomerViewId) => void
  customerViewCounts?: Partial<Record<CustomerViewId, number>>
  searchQuery?: string
  onSearchChange?: (value: string) => void
}

export default function NetworkFilterGroup({
  activeTab = 'all',
  selectedViewId = '1',
  onViewChange,
  viewCounts = {},
  selectedCustomerViewId = 'c1',
  onCustomerViewChange,
  customerViewCounts = {},
  searchQuery = '',
  onSearchChange,
}: NetworkFilterGroupProps) {
  const isCustomerTab = activeTab === 'customers'
  const chips = isCustomerTab ? CUSTOMER_VIEW_CHIPS : VIEW_CHIPS

  return (
    <div
      className="flex w-full flex-col gap-[12px] px-[40px] py-[8px]"
      data-name="M0 Filter Group"
      data-node-id="2:10679"
    >
      {/* Saved Views — 12px gap below to search bar (Figma 2:10679) */}
      <div
        className="flex w-full shrink-0 items-center gap-[8px]"
        data-name="Saved Views 2.0"
      >
        {chips.map((chip) => (
          <ViewChip
            key={chip.id}
            label={chip.label}
            count={
              isCustomerTab
                ? (customerViewCounts[chip.id as CustomerViewId] ?? 0)
                : (viewCounts[chip.id as SavedViewId] ?? 0)
            }
            active={
              isCustomerTab
                ? selectedCustomerViewId === chip.id
                : selectedViewId === chip.id
            }
            onClick={() =>
              isCustomerTab
                ? onCustomerViewChange?.(chip.id as CustomerViewId)
                : onViewChange?.(chip.id as SavedViewId)
            }
          />
        ))}
        <button
          type="button"
          aria-label="Add view"
          className="flex h-9 w-9 shrink-0 items-center justify-center overflow-clip rounded-[10px] border border-neutral-100 bg-surface transition-colors hover:bg-offset focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-action-primary"
          data-name="Add View"
        >
          <Icon name="add" size={12} fill="var(--color-icon-default)" />
        </button>
      </div>

      {/* M0 Bar: Filter + Search + Table controls — focus border on this container when search is active */}
      <div
        className="flex w-full shrink-0 flex-col rounded-[length:var(--radius-xlarge)] border-[1.5px] border-neutral-50 p-[4px] transition-[border-color] focus-within:border-neutral-100"
        data-name="M0 Bar"
      >
        <div className="flex w-full items-center gap-[10px] rounded-[length:var(--radius-rounded)] p-[6px]">
          <FilterBarButton aria-label="Filter">
            <Icon name="filter" size={16} fill="var(--color-icon-default)" />
          </FilterBarButton>
          <div className="flex min-h-px min-w-0 flex-1 items-center" data-name="Search">
            <label className="flex w-full min-w-0 items-center gap-[8px]">
              <Icon name="search" size={16} fill="var(--color-icon-subdued)" className="shrink-0" aria-hidden />
              <input
                type="search"
                placeholder="Search by name, email or description"
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="min-w-0 flex-1 border-0 bg-transparent font-label-medium text-default placeholder:text-icon-subdued focus:outline-none focus:ring-0"
                aria-label="Search by name, email or description"
              />
            </label>
          </div>
          <FilterBarButton aria-label="Table options">
            <Icon name="settings" size={16} fill="var(--color-icon-default)" />
          </FilterBarButton>
        </div>
      </div>
    </div>
  )
}
