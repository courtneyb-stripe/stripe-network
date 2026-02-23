/**
 * Shared dropdown for metric type and time range (Network list + Account detail).
 */

import { useState } from 'react'
import ChevronDownIcon from '../../icons/ChevronDownIcon'

export default function MetricDropdown<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  emphasized = false,
}: {
  value: T
  options: readonly T[]
  onChange: (v: T) => void
  ariaLabel: string
  emphasized?: boolean
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setOpen(false)}
        className={`inline-flex items-center gap-1 rounded-[length:var(--radius-xsmall)] text-subdued transition-colors hover:text-default focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary ${emphasized ? 'font-label-medium-emphasized' : 'font-label-medium'}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
      >
        <span>{value}</span>
        <ChevronDownIcon size={8} fill="var(--color-icon-subdued)" />
      </button>
      {open && (
        <ul
          className="absolute left-0 top-full z-10 mt-1 min-w-[140px] rounded-[length:var(--radius-small)] border border-neutral-50 bg-surface py-1 shadow-lg"
          role="listbox"
        >
          {options.map((opt) => (
            <li key={opt} role="option" aria-selected={opt === value}>
              <button
                type="button"
                className="w-full px-3 py-1.5 text-left font-label-medium text-default hover:bg-offset focus:bg-offset focus:outline-none"
                onMouseDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onChange(opt)
                  setOpen(false)
                }}
              >
                {opt}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
