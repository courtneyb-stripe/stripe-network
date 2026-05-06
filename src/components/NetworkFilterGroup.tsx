/**
 * NetworkFilterGroup — M1 Filter Group: List Views 2025 (5756:275810) + Stripe Network ’26 Working (**6256:26549**).
 * Chip row (M1 List Chip) + search row (M1 Search Bar, Filter well, table controls).
 */

import { Icon } from '../icons/SailIcons'
import { M1FilterGroupFrame } from './listView/ListViewTemplates'
import { ViewChip } from './listView/ViewChip'
import SearchBar from './SearchBar'
import type { NetworkTabId } from '../data/networkAudience'
import { networkListUsesSimplifiedSecondaryFilters } from '../data/networkAudience'
import type { SavedViewId, CustomerViewId } from './NetworkTable'

/** Figma 6256:26549 — **All** primary tab: three saved views (+ More). Other merchant tabs keep full status set. */
export const ALL_TAB_MERCHANT_VIEW_CHIPS: { id: SavedViewId; label: string }[] = [
  { id: '1', label: 'High volume' },
  { id: '2', label: 'Actions required' },
  { id: '7', label: 'Risk reporting' },
]

export const ALL_TAB_MERCHANT_VIEW_IDS: SavedViewId[] = ALL_TAB_MERCHANT_VIEW_CHIPS.map((c) => c.id)

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

export type { ViewChipSize, ViewChipVisualVariant } from './listView/ViewChip'
export { ViewChip } from './listView/ViewChip'

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
  /** Merged onto {@link M1FilterGroupFrame} (parent list routes add `px-6` here; nested shells rely on {@link NestedDetailViewRoot} padding). */
  className?: string
}

export type NestedObjectListChip = { id: string; label: string; count?: number }

/**
 * M1 chip row + search for nested account-scoped pages (same structure as {@link NetworkFilterGroup}, custom chips).
 * Use inside {@link NestedDetailViewRoot} (horizontal inset comes from the page shell, not this frame).
 */
export function NestedObjectListFilterGroup({
  chips,
  selectedChipId,
  onChipSelect,
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search by name, email, etc.',
  searchAriaLabel,
  className = '',
}: {
  chips: NestedObjectListChip[]
  selectedChipId: string
  onChipSelect: (id: string) => void
  searchQuery: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  searchAriaLabel?: string
  className?: string
}) {
  const aria = searchAriaLabel ?? searchPlaceholder
  return (
    <M1FilterGroupFrame className={className}>
      <div className="flex w-full shrink-0 flex-wrap items-center gap-2" data-name="Chip Row">
        {chips.map((chip) => (
          <ViewChip
            key={chip.id}
            visualVariant="list"
            label={chip.label}
            count={chip.count}
            active={selectedChipId === chip.id}
            onClick={() => onChipSelect(chip.id)}
          />
        ))}
        <button
          type="button"
          aria-label="More views"
          className="flex size-9 shrink-0 items-center justify-center overflow-clip rounded-[8px] border border-neutral-50 bg-surface transition-colors hover:bg-offset focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-action-primary"
          data-name="More Views"
        >
          <Icon name="more" size={16} fill="var(--color-icon-default)" />
        </button>
      </div>

      <SearchBar
        layoutVariant="listToolbar"
        value={searchQuery}
        onSearchChange={onSearchChange}
        placeholder={searchPlaceholder}
        searchAriaLabel={aria}
      />
    </M1FilterGroupFrame>
  )
}

/** Placeholder M1 chip row + list toolbar for nested detail object-list pages (no interactive chips). */
export function NestedDetailFilterSkeleton({ className = '' }: { className?: string }) {
  const chipWidths = [118, 152, 124]
  return (
    <M1FilterGroupFrame className={className}>
      <div className="flex w-full min-w-0 flex-wrap items-center gap-2" data-name="Chip Row">
        {chipWidths.map((w, i) => (
          <div
            key={i}
            className="h-9 shrink-0 rounded-[8px] bg-neutral-100"
            style={{ width: w }}
            aria-hidden
          />
        ))}
        <div className="size-9 shrink-0 rounded-[8px] bg-neutral-100" aria-hidden />
      </div>
      <SearchBar
        layoutVariant="listToolbar"
        value=""
        onSearchChange={() => {}}
        placeholder="Search by name, email, etc."
        searchAriaLabel="Search (preview)"
        filterAriaLabel="Filter (preview)"
        optionsAriaLabel="Table options (preview)"
      />
    </M1FilterGroupFrame>
  )
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
  className = '',
}: NetworkFilterGroupProps) {
  const isCustomerTab = activeTab === 'customers'
  const simplifiedSecondary = networkListUsesSimplifiedSecondaryFilters(activeTab)

  const chips: { id: SavedViewId; label: string }[] = isCustomerTab
    ? CUSTOMER_VIEW_CHIPS
    : simplifiedSecondary
      ? [{ id: '1', label: 'All' }]
      : activeTab === 'all'
        ? ALL_TAB_MERCHANT_VIEW_CHIPS
        : VIEW_CHIPS

  return (
    <M1FilterGroupFrame className={`px-6 ${className}`.trim()}>
      <div className="flex w-full shrink-0 flex-wrap items-center gap-2" data-name="Chip Row">
        {chips.map((chip) => (
          <ViewChip
            key={chip.id}
            visualVariant="list"
            label={chip.label}
            count={
              isCustomerTab
                ? (customerViewCounts[chip.id as CustomerViewId] ?? 0)
                : (viewCounts[chip.id as SavedViewId] ?? 0)
            }
            active={
              isCustomerTab ? selectedCustomerViewId === chip.id : selectedViewId === chip.id
            }
            onClick={() =>
              isCustomerTab
                ? onCustomerViewChange?.(chip.id as CustomerViewId)
                : onViewChange?.(chip.id as SavedViewId)
            }
          />
        ))}
        {simplifiedSecondary ? (
          <ViewChip
            visualVariant="list"
            label="⋯"
            accessibilityLabel="More filters"
            active={false}
            onClick={() => {}}
          />
        ) : (
          <button
            type="button"
            aria-label="More views"
            className="flex size-9 shrink-0 items-center justify-center overflow-clip rounded-[8px] border border-neutral-50 bg-surface transition-colors hover:bg-offset focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-action-primary"
            data-name="More Views"
          >
            <Icon name="more" size={16} fill="var(--color-icon-default)" />
          </button>
        )}
      </div>

      <SearchBar
        layoutVariant="listToolbar"
        value={searchQuery}
        onSearchChange={(v) => onSearchChange?.(v)}
        placeholder="Search by name, email, etc."
        searchAriaLabel="Search by name, email, etc."
      />
    </M1FilterGroupFrame>
  )
}
