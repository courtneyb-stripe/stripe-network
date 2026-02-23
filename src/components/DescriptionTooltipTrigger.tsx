/**
 * DescriptionTooltipTrigger — Link-style affordance (Figma 33:11880 / 33:11887).
 * Text with dashed light-gray underline; hover shows a description tooltip. Not a real link (no navigation).
 * Use for inline labels like "Merchant" or "Customer" to explain what they mean.
 */

import LabelTooltip from './LabelTooltip'

type DescriptionTooltipTriggerProps = {
  /** The visible text (e.g. "Merchant", "Customer"). */
  children: React.ReactNode
  /** Tooltip content shown on hover. */
  tooltipLabel: string
  /** Unique id for the tooltip. */
  tooltipId: string
}

/** Figma 33:11887: dashed underline, light gray (lighter than text). */
const LINK_UNDERLINE_CLASS = 'cursor-default border-b border-dashed font-label-medium text-[14px] leading-5 tracking-[-0.15px] text-default'
const LINK_UNDERLINE_STYLE = { borderColor: 'var(--color-neutral-100)' } as const

export function DescriptionTooltipTrigger({
  children,
  tooltipLabel,
  tooltipId,
}: DescriptionTooltipTriggerProps) {
  return (
    <LabelTooltip label={tooltipLabel} tooltipId={tooltipId} placement="top" variant="light">
      <span className={LINK_UNDERLINE_CLASS} style={LINK_UNDERLINE_STYLE} data-node-id="33:11880">
        {children}
      </span>
    </LabelTooltip>
  )
}
