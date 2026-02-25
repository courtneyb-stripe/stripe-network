/**
 * ViewActivityDropdown — Prototype option in same spot as ThirdPartyActivityToggle.
 * Info icon with tooltip, then dropdown: "View all activity" | "View account activity" (default account).
 */

import { useState } from 'react'
import LabelTooltip from './LabelTooltip'
import InfoIcon from '../icons/InfoIcon'
import ChevronDownIcon from '../icons/ChevronDownIcon'
import { usePrototypeOptional } from '../context/PrototypeContext'
import type { ViewActivityScope } from '../context/PrototypeContext'

const TOOLTIP_LABEL =
  'View account activity shows only this account’s transactions and billing. View all activity includes related accounts (e.g. connected users).'

const OPTIONS: { value: ViewActivityScope; label: string }[] = [
  { value: 'account', label: 'View account activity' },
  { value: 'all', label: 'View all activity' },
]

export default function ViewActivityDropdown() {
  const prototype = usePrototypeOptional()
  const [open, setOpen] = useState(false)

  if (prototype == null) return null
  const { activityFilter, viewActivityScope, setViewActivityScope } = prototype
  if (activityFilter !== 'viewActivityDropdown') return null

  const currentLabel = OPTIONS.find((o) => o.value === viewActivityScope)?.label ?? OPTIONS[0].label

  return (
    <div className="flex items-center gap-2">
      <LabelTooltip
        label={TOOLTIP_LABEL}
        tooltipId="view-activity-dropdown-info-tooltip"
        placement="top"
        variant="light"
        maxWidth={320}
      >
        <button
          type="button"
          aria-label="View activity scope description"
          aria-describedby="view-activity-dropdown-info-tooltip"
          className="flex h-8 w-8 min-h-8 min-w-8 shrink-0 items-center justify-center rounded-[8px] text-default transition-colors hover:bg-offset focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-action-primary"
        >
          <InfoIcon size={12} />
        </button>
      </LabelTooltip>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          onBlur={() => setOpen(false)}
          className="inline-flex min-h-8 shrink-0 items-center justify-center gap-2 rounded-[999px] bg-transparent px-3 py-1.5 font-label-medium-emphasized text-default transition-colors hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-action-primary"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label="View activity scope"
        >
          <span className="min-w-0 truncate">{currentLabel}</span>
          <ChevronDownIcon size={8} fill="var(--color-icon-default)" />
        </button>
        {open && (
          <ul
            className="absolute right-0 top-full z-10 mt-1 min-w-[180px] rounded-[length:var(--radius-small)] border border-neutral-100 bg-surface py-1 shadow-lg"
            role="listbox"
          >
            {OPTIONS.map((opt) => (
              <li key={opt.value} role="option" aria-selected={opt.value === viewActivityScope}>
                <button
                  type="button"
                  className="w-full px-3 py-1.5 text-left font-label-medium text-default hover:bg-offset focus:bg-offset focus:outline-none"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setViewActivityScope(opt.value)
                    setOpen(false)
                  }}
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
