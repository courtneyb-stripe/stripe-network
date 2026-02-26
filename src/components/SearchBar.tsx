/**
 * SearchBar — List search bar per Figma 2082:23779 / 2082:23906 (Search Row).
 * One row, consistent height: [ M1 Search Bar (search + input or placeholder) ] [ Add filter | or M1 Filter Well (chip left of Add filter) ] [ Table ].
 * Shared by Network filter group and Transactions list (not global search).
 */

import { Icon } from '../icons/SailIcons'
import ActiveFilterChip from './ActiveFilterChip'

export type ActiveFilter = {
  label: string
  value: string
  onClear: () => void
  clearAriaLabel?: string
}

type SearchBarProps = {
  value: string
  onSearchChange: (value: string) => void
  placeholder?: string
  searchAriaLabel?: string
  filterAriaLabel?: string
  optionsAriaLabel?: string
  /** When set, M1 Filter Well appears with this chip left of Add filter; search bar shows placeholder (Figma 2082:23906). */
  activeFilter?: ActiveFilter | null
  /** Called when user clicks Add filter (e.g. to switch to filtered state with a default account). */
  onAddFilterClick?: () => void
}

function TableControlsButton({
  'aria-label': ariaLabel,
  children,
}: {
  'aria-label': string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className="flex h-[28px] min-h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[8px] border border-neutral-50 bg-surface transition-colors hover:bg-offset focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-action-primary"
    >
      {children}
    </button>
  )
}

const ADD_FILTER_BUTTON_CLASS =
  'flex h-[28px] shrink-0 items-center gap-2 rounded-[6px] border border-neutral-50 bg-surface px-[10px] py-[6px] font-label-small-emphasized text-subdued transition-colors hover:bg-offset focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-action-primary'

export default function SearchBar({
  value,
  onSearchChange,
  placeholder = 'Search',
  searchAriaLabel,
  filterAriaLabel = 'Add filter',
  optionsAriaLabel = 'Table options',
  activeFilter,
  onAddFilterClick,
}: SearchBarProps) {
  const ariaLabel = searchAriaLabel ?? placeholder
  const showActiveFilter = activeFilter != null
  const handleAddFilterClick = () => {
    onAddFilterClick?.()
  }

  return (
    <div className="flex w-full items-center gap-[16px]" data-name="Search Row">
      {/* M1 Search Bar only — 44px tall, does not wrap filter or settings (Figma 2082:23908) */}
      <div className="flex h-[44px] min-w-0 flex-1 items-center gap-[12px] overflow-clip rounded-[12px] border border-neutral-50 bg-surface px-[12px]">
        <Icon name="search" size={16} fill="var(--color-icon-subdued)" className="shrink-0" aria-hidden />
        {showActiveFilter ? (
          <span className="font-label-medium text-icon-subdued">{placeholder}</span>
        ) : (
          <label className="flex min-w-0 flex-1 items-center">
            <input
              type="search"
              placeholder={placeholder}
              value={value}
              onChange={(e) => onSearchChange(e.target.value)}
              className="min-w-0 flex-1 border-0 bg-transparent font-label-medium text-default placeholder:text-icon-subdued focus:outline-none focus:ring-0"
              aria-label={ariaLabel}
            />
          </label>
        )}
      </div>

      {/* 16px gap then filter group: M1 Filter Well (chip + Add filter) or Add filter only */}
      {showActiveFilter ? (
        <div
          className="flex shrink-0 items-center gap-[10px] rounded-[12px] border border-[var(--color-offset)] bg-offset p-[8px]"
          data-name="M1 Filter Well"
        >
          <ActiveFilterChip
            label={activeFilter.label}
            value={activeFilter.value}
            onClear={activeFilter.onClear}
            clearAriaLabel={activeFilter.clearAriaLabel}
          />
          <button type="button" aria-label={filterAriaLabel} className={ADD_FILTER_BUTTON_CLASS} onClick={handleAddFilterClick}>
            <Icon name="add" size={16} fill="var(--color-icon-subdued)" />
            <span className="leading-4">Add filter</span>
          </button>
        </div>
      ) : (
        <button type="button" aria-label={filterAriaLabel} className={ADD_FILTER_BUTTON_CLASS} onClick={handleAddFilterClick}>
          <Icon name="add" size={16} fill="var(--color-icon-subdued)" />
          <span className="leading-4">Add filter</span>
        </button>
      )}

      {/* 16px gap then table controls */}
      <TableControlsButton aria-label={optionsAriaLabel}>
        <Icon name="settings" size={16} fill="var(--color-icon-default)" />
      </TableControlsButton>
    </div>
  )
}
