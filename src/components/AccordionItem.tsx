/**
 * AccordionItem — Single expandable item: chevron (left) + title, optional subtitle, optional tooltip + panel.
 * Sail Accordion. Uses Sail info icon (NextIcon xsmall info). Chevron 12px, left of title.
 * Chevron uses same hover area as IconButton (32px) but offset so its center visually left-aligns with list icons below.
 */

import { useState } from 'react'
import ChevronDownIcon from '../icons/ChevronDownIcon'
import InfoIcon from '../icons/InfoIcon'
import LabelTooltip from './LabelTooltip'

export type AccordionItemProps = {
  title: string
  /** Optional subtitle below the title (Sail UI). */
  subtitle?: string
  /** When provided, shows info icon with tooltip (Sail accordion tooltip variant). */
  tooltipLabel?: string
  /** Required when tooltipLabel is set. Unique id for the tooltip. */
  tooltipId?: string
  /** When true, the accordion panel is expanded on initial render. */
  defaultExpanded?: boolean
  children: React.ReactNode
}

export function AccordionItem({
  title,
  subtitle,
  tooltipLabel,
  tooltipId,
  defaultExpanded = false,
  children,
}: AccordionItemProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  return (
    <section className="flex flex-col gap-4" role="listitem">
      <button
        type="button"
        className="flex w-full items-center gap-2 text-left"
        aria-expanded={expanded}
        onClick={() => setExpanded((e) => !e)}
      >
        {/* IconButton-sized hover (32px), offset so chevron visually left-aligns with 12px list icons below */}
        <span className="flex h-3 w-3 min-w-[12px] shrink-0 items-center overflow-visible" aria-hidden>
          <span
            className="flex h-8 w-8 min-h-8 min-w-8 shrink-0 items-center justify-center rounded-[8px] text-default transition-colors hover:bg-offset -ml-[10px]"
            aria-hidden
          >
            <ChevronDownIcon
              size={12}
              fill="var(--color-icon-subdued)"
              className={`shrink-0 transition-transform ${expanded ? '' : 'rotate-[-90deg]'}`}
            />
          </span>
        </span>
        <div className="flex min-w-0 flex-1 flex-col items-start gap-0">
          <div className="flex items-center gap-2 shrink-0 min-w-0">
            <span className="text-[16px] leading-6 font-semibold tracking-0 text-default">
              {title}
            </span>
            {tooltipLabel != null && tooltipId != null && (
              <LabelTooltip label={tooltipLabel} tooltipId={tooltipId} placement="top">
                <span className="flex shrink-0 items-center justify-center text-icon-subdued">
                  <InfoIcon size={12} />
                </span>
              </LabelTooltip>
            )}
          </div>
          {subtitle != null && (
            <span className="font-label-medium text-subdued text-[14px] leading-5 mt-0.5">
              {subtitle}
            </span>
          )}
        </div>
      </button>
      {expanded && (
        <div className="flex flex-col gap-0">
          {children}
        </div>
      )}
    </section>
  )
}
