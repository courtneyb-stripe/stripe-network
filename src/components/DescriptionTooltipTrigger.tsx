/**
 * DescriptionTooltipTrigger — inline configuration labels (Figma 33:11880).
 * Tooltip + dashed underline are paused; renders plain label text for now.
 */

type DescriptionTooltipTriggerProps = {
  /** The visible text (e.g. "Merchant", "Customer"). */
  children: React.ReactNode
  /** Reserved — tooltip copy when hover is re-enabled. */
  tooltipLabel: string
  /** Reserved — unique id when tooltip is re-enabled. */
  tooltipId: string
}

const LABEL_CLASS =
  'font-label-medium text-[14px] leading-5 tracking-[-0.15px] text-default'

export function DescriptionTooltipTrigger({
  children,
  tooltipLabel: _tooltipLabel,
  tooltipId: _tooltipId,
}: DescriptionTooltipTriggerProps) {
  return (
    <span className={LABEL_CLASS} data-node-id="33:11880">
      {children}
    </span>
  )
}
