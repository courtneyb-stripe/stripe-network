/**
 * App header from Figma: Stripe Network – H1 '26 (node 1962:36055)
 * Uses design tokens from index.css: text-subdued, text-default, feedback-success-on,
 * border-neutral-100, icon-default, bg-offset.
 */

import ChevronDownIcon from '../icons/ChevronDownIcon'
import { ConvertIcon } from '../icons/ConvertIcon'
import { Icon } from '../icons/SailIcons'

export default function AppHeader() {
  return (
    <header className="flex flex-col gap-4 p-4 md:p-6 bg-surface border-b border-neutral-100">
      {/* Brand row */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-black flex items-center justify-center text-white font-semibold text-sm tracking-tight" aria-hidden>
          TL
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-label-small uppercase tracking-wide text-subdued">
            Network IA (onsite)
          </span>
          <span className="font-title truncate text-default">
            Toybox Labs
          </span>
        </div>
      </div>

      {/* Action buttons row — Figma Label/Medium emphasized for button text */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="font-label-medium inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-neutral-100 hover:bg-offset transition-colors text-default"
        >
          <Icon name="checkCircleFilled" size={16} fill="var(--color-feedback-success-on)" />
          Payouts
        </button>
        <button
          type="button"
          className="font-label-medium inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-neutral-100 hover:bg-offset transition-colors text-default"
        >
          <Icon name="checkCircleFilled" size={16} fill="var(--color-feedback-success-on)" />
          Payments
        </button>
        <button
          type="button"
          className="font-label-medium inline-flex items-center gap-2 px-4 py-2 rounded-full border border-transparent hover:bg-offset transition-colors text-default bg-offset"
        >
          <ConvertIcon size={16} fill="var(--color-icon-default)" />
          Move money
          <ChevronDownIcon size={8} fill="var(--color-icon-default)" />
        </button>
        <button
          type="button"
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-offset transition-colors bg-offset"
          aria-label="More options"
        >
          <Icon name="more" size={16} fill="var(--color-icon-default)" />
        </button>
        <button
          type="button"
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-offset transition-colors bg-offset"
          aria-label="Expand"
        >
          <Icon name="arrowsOutward" size={16} fill="var(--color-icon-default)" />
        </button>
        <button
          type="button"
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-offset transition-colors bg-offset"
          aria-label="Settings"
        >
          <Icon name="settings" size={16} fill="var(--color-icon-default)" />
        </button>
      </div>
    </header>
  )
}
