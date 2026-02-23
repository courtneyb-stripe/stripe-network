/**
 * NetworkFilterGroup — Figma M0 Filter Group node 2:10679 (Stripe Network Cursor SRC).
 * Saved view chips + search/toolbar bar for the Network list.
 */

import { Icon } from '../icons/SailIcons'
import SearchBar from './SearchBar'
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

export type ViewChipSize = 'default' | 'compact'

const VIEW_CHIP_SIZE_CLASSES: Record<ViewChipSize, string> = {
  default: 'h-9 min-h-9 rounded-[10px] px-3 py-2',
  compact: 'h-8 min-h-8 rounded-[8px] px-2 py-1.5',
}

export function ViewChip({
  label,
  count,
  active,
  onClick,
  showMoreIcon = false,
  size = 'default',
}: {
  label: string
  count?: number
  active: boolean
  onClick: () => void
  /** When true and active, show more icon (e.g. billing chips). Figma 20:10301. */
  showMoreIcon?: boolean
  /** default = 36px tall, 12px l-r / 8px t-b; compact = 32px tall, 8px l-r / 6px t-b. Same label size. */
  size?: ViewChipSize
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 items-center gap-2 overflow-clip border border-solid transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-action-primary ${VIEW_CHIP_SIZE_CLASSES[size]} ${
        active
          ? 'border-default bg-default text-neutral-0'
          : 'border-neutral-100 bg-surface text-subdued hover:border-neutral-100 hover:bg-offset'
      }`}
      data-name="View Chip 2.0"
      data-node-id="6:5122"
    >
      <span className="shrink-0 truncate text-[14px] leading-5 tracking-[-0.15px] font-[500]">{label}</span>
      {showMoreIcon && active && (
        <Icon name="more" size={16} fill="currentColor" className="shrink-0" />
      )}
      {count !== undefined && (
        <span className="shrink-0 font-label-small leading-4 tabular-nums">{count.toLocaleString()}</span>
      )}
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

      <SearchBar
        value={searchQuery}
        onSearchChange={(v) => onSearchChange?.(v)}
        placeholder="Search by name, email or description"
        searchAriaLabel="Search by name, email or description"
      />
    </div>
  )
}
