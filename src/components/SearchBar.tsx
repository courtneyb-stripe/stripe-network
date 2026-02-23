/**
 * SearchBar — M0 Bar: filter button + search input + table options button.
 * Shared by Network filter group and Transactions list.
 */

import { Icon } from '../icons/SailIcons'

type SearchBarProps = {
  value: string
  onSearchChange: (value: string) => void
  placeholder?: string
  searchAriaLabel?: string
  filterAriaLabel?: string
  optionsAriaLabel?: string
}

function BarButton({
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
      className="flex h-7 min-h-7 w-7 shrink-0 items-center justify-center rounded-[length:var(--radius-action)] border border-neutral-50 bg-surface font-label-medium-emphasized transition-colors hover:bg-offset focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-action-primary"
    >
      {children}
    </button>
  )
}

export default function SearchBar({
  value,
  onSearchChange,
  placeholder = 'Search',
  searchAriaLabel,
  filterAriaLabel = 'Filter',
  optionsAriaLabel = 'Table options',
}: SearchBarProps) {
  const ariaLabel = searchAriaLabel ?? placeholder
  return (
    <div
      className="flex w-full shrink-0 flex-col rounded-[length:var(--radius-xlarge)] border border-neutral-50 p-[4px] transition-[border-color,border-width] focus-within:border-2 focus-within:border-neutral-100"
      data-name="M0 Bar"
    >
      <div className="flex w-full items-center gap-[10px] rounded-[length:var(--radius-rounded)] p-[6px]">
        <BarButton aria-label={filterAriaLabel}>
          <Icon name="filter" size={16} fill="var(--color-icon-default)" />
        </BarButton>
        <div className="flex min-h-px min-w-0 flex-1 items-center">
          <label className="flex w-full min-w-0 items-center gap-[8px]">
            <Icon name="search" size={16} fill="var(--color-icon-subdued)" className="shrink-0" aria-hidden />
            <input
              type="search"
              placeholder={placeholder}
              value={value}
              onChange={(e) => onSearchChange(e.target.value)}
              className="min-w-0 flex-1 border-0 bg-transparent font-label-medium text-default placeholder:text-icon-subdued focus:outline-none focus:ring-0"
              aria-label={ariaLabel}
            />
          </label>
        </div>
        <BarButton aria-label={optionsAriaLabel}>
          <Icon name="settings" size={16} fill="var(--color-icon-default)" />
        </BarButton>
      </div>
    </div>
  )
}
