/**
 * PropertyListItem — Sail-style label/value row. Label and value can be string or ReactNode.
 * Layout follows parent PropertyList orientation: vertical (label above value) or horizontal (label left, value right).
 * Optional description tooltip: when tooltipLabel + tooltipId are set, shows info icon (Figma 33:12006) next to label; hover shows description.
 */

import LabelTooltip from './LabelTooltip'
import InfoIcon from '../icons/InfoIcon'
import { usePropertyListOrientation } from './PropertyListContext'

type PropertyListItemProps = {
  /** Label (e.g. "Object ID") or link/node (e.g. <Link>Raw JSON</Link>). */
  label: React.ReactNode
  /** Value (string or node). Omit for label-only rows. Can be fragment of nested PropertyListItems. */
  value?: React.ReactNode
  /** When set with tooltipId, shows info icon next to label; hover shows this description (affordance for tooltip). */
  tooltipLabel?: string
  /** Required when tooltipLabel is set. Unique id for the tooltip. */
  tooltipId?: string
}

function LabelCell({ label, tooltipLabel, tooltipId }: { label: React.ReactNode; tooltipLabel?: string; tooltipId?: string }) {
  const hasTooltip = tooltipLabel != null && tooltipId != null
  return (
    <div className="flex items-center gap-1.5 shrink-0 min-w-0 max-w-full font-label-medium-emphasized text-[14px] leading-5 text-default">
      <span className="truncate min-w-0">{label}</span>
      {hasTooltip && (
        <LabelTooltip label={tooltipLabel} tooltipId={tooltipId} placement="top">
          <span className="flex shrink-0 items-center justify-center text-icon-subdued" aria-hidden>
            <InfoIcon size={12} />
          </span>
        </LabelTooltip>
      )}
    </div>
  )
}

export function PropertyListItem({ label, value, tooltipLabel, tooltipId }: PropertyListItemProps) {
  const orientation = usePropertyListOrientation()
  const isHorizontal = orientation === 'horizontal'

  if (isHorizontal) {
    return (
      <div
        className="flex flex-row gap-6 w-full shrink-0 items-baseline min-w-0"
        data-name="PropertyListItem"
      >
        <LabelCell label={label} tooltipLabel={tooltipLabel} tooltipId={tooltipId} />
        {value != null && (
          <div className="flex flex-col gap-1 items-end min-w-0 flex-1 overflow-hidden font-label-medium text-[14px] leading-5 text-default min-h-0 text-right" data-name="Value">
            {typeof value === 'string' ? (
              <span className="truncate w-full min-w-0">{value}</span>
            ) : (
              <div className="flex flex-col gap-2 w-full min-w-0 overflow-hidden items-end">{value}</div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-0.5 w-full shrink-0" data-name="PropertyListItem">
      <div className="flex items-center gap-1.5 w-full min-w-0 font-label-medium-emphasized text-[14px] leading-5 text-default">
        <span className="truncate min-w-0">{label}</span>
        {tooltipLabel != null && tooltipId != null && (
          <LabelTooltip label={tooltipLabel} tooltipId={tooltipId} placement="top">
            <span className="flex shrink-0 items-center justify-center text-icon-subdued" aria-hidden>
              <InfoIcon size={12} />
            </span>
          </LabelTooltip>
        )}
      </div>
      {value != null && (
        <div className="flex flex-col gap-1 items-start min-w-0 w-full font-label-medium text-[14px] leading-5 text-default" data-name="Value">
          {typeof value === 'string' ? (
            <span className="truncate w-full min-w-0">{value}</span>
          ) : (
            <div className="flex flex-col gap-2 w-full min-w-0">
              {value}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
