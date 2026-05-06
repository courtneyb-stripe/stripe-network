/**
 * SearchBar — List search + filter + table controls.
 * `layoutVariant="listToolbar"` matches List Views 2025 (Figma 5756:275810 — M1 Search Row).
 */

import type { ReactNode } from 'react'
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
  activeFilter?: ActiveFilter | null
  onAddFilterClick?: () => void
  /** Legacy 16px row gap; listToolbar = 8px gap + M1 filter well + 44px controls (2025 list views). */
  layoutVariant?: 'default' | 'listToolbar'
}

function TableControlsButton({
  'aria-label': ariaLabel,
  className = '',
  children,
}: {
  'aria-label': string
  className?: string
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={`flex shrink-0 items-center justify-center border border-neutral-50 bg-surface transition-colors hover:bg-offset focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-action-primary ${className}`.trim()}
    >
      {children}
    </button>
  )
}

const ADD_FILTER_BUTTON_CLASS =
  'flex h-7 shrink-0 items-center gap-2 rounded-[6px] border border-neutral-50 bg-surface px-2 py-1.5 font-label-small-emphasized text-subdued transition-colors hover:bg-offset focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-action-primary'

export default function SearchBar({
  value,
  onSearchChange,
  placeholder = 'Search',
  searchAriaLabel,
  filterAriaLabel = 'Add filter',
  optionsAriaLabel = 'Table options',
  activeFilter,
  onAddFilterClick,
  layoutVariant = 'default',
}: SearchBarProps) {
  const ariaLabel = searchAriaLabel ?? placeholder
  const showActiveFilter = activeFilter != null
  const handleAddFilterClick = () => {
    onAddFilterClick?.()
  }

  const filterControl = (
    <button
      type="button"
      aria-label={filterAriaLabel}
      className={ADD_FILTER_BUTTON_CLASS}
      onClick={handleAddFilterClick}
    >
      <Icon name="add" size={16} fill="var(--color-icon-subdued)" />
      <span className="leading-4">Filter</span>
    </button>
  )

  if (layoutVariant === 'listToolbar') {
    return (
      <div className="flex w-full min-w-0 items-center gap-2" data-name="Search Row">
        <div
          className="flex min-w-0 flex-1 items-center rounded-[12px] border border-neutral-50 bg-surface p-2"
          data-name="M1 Search Bar"
        >
          <div className="flex h-7 min-h-7 w-full min-w-0 items-center gap-3 overflow-hidden rounded-[8px] px-2 py-1">
            <Icon name="search" size={16} fill="var(--color-icon-subdued)" className="shrink-0" aria-hidden />
            {showActiveFilter ? (
              <span className="min-w-0 truncate font-label-medium text-icon-subdued">{placeholder}</span>
            ) : (
              <label className="flex min-w-0 flex-1 items-center">
                <input
                  type="search"
                  placeholder={placeholder}
                  value={value}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="min-w-0 flex-1 border-0 bg-transparent font-label-medium text-default placeholder:text-[#6c7688] focus:outline-none focus:ring-0"
                  aria-label={ariaLabel}
                />
              </label>
            )}
          </div>
        </div>

        {showActiveFilter ? (
          <div
            className="flex h-11 min-h-11 shrink-0 items-center gap-2 rounded-[12px] border border-neutral-50 bg-[#f8f9fb] px-2"
            data-name="M1 Filter Well"
          >
            <ActiveFilterChip
              label={activeFilter.label}
              value={activeFilter.value}
              onClear={activeFilter.onClear}
              clearAriaLabel={activeFilter.clearAriaLabel}
            />
            {filterControl}
          </div>
        ) : (
          <div
            className="flex h-11 min-h-11 shrink-0 items-center justify-center rounded-[12px] border border-neutral-50 bg-[#f8f9fb] px-2"
            data-name="M1 Filter Well"
          >
            {filterControl}
          </div>
        )}

        <TableControlsButton aria-label={optionsAriaLabel} className="size-11 rounded-[12px]">
          <Icon name="settings" size={16} fill="var(--color-icon-default)" />
        </TableControlsButton>
      </div>
    )
  }

  const addLabelLegacy = filterAriaLabel === 'Add filter' ? 'Add filter' : 'Filter'

  return (
    <div className="flex w-full items-center gap-[16px]" data-name="Search Row">
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

      {showActiveFilter ? (
        <div className="flex shrink-0 items-center gap-[10px] rounded-[12px] border border-[var(--color-offset)] bg-offset p-[8px]">
          <ActiveFilterChip
            label={activeFilter.label}
            value={activeFilter.value}
            onClear={activeFilter.onClear}
            clearAriaLabel={activeFilter.clearAriaLabel}
          />
          <button type="button" aria-label={filterAriaLabel} className={ADD_FILTER_BUTTON_CLASS} onClick={handleAddFilterClick}>
            <Icon name="add" size={16} fill="var(--color-icon-subdued)" />
            <span className="leading-4">{addLabelLegacy}</span>
          </button>
        </div>
      ) : (
        <button type="button" aria-label={filterAriaLabel} className={ADD_FILTER_BUTTON_CLASS} onClick={handleAddFilterClick}>
          <Icon name="add" size={16} fill="var(--color-icon-subdued)" />
          <span className="leading-4">{addLabelLegacy}</span>
        </button>
      )}

      <TableControlsButton aria-label={optionsAriaLabel} className="h-7 min-h-7 w-7 min-w-7 rounded-[8px]">
        <Icon name="settings" size={16} fill="var(--color-icon-default)" />
      </TableControlsButton>
    </div>
  )
}
