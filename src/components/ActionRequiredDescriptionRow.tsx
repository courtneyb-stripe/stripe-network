/**
 * Shared description row for actions required: red circle bullet, dotted "Impacts …" tooltip, past due.
 * Used in sidebar list, fullscreen modal, and Payouts/Payments dropdowns.
 * When other capabilities are impacted (+X more), base (e.g. "Payments, Payouts") is plain text; only "+X more" is dotted with bullet-list tooltip.
 */

import type React from 'react'
import LabelTooltip from './LabelTooltip'

/** Red filled circle bullet (same as Restricted/paused). */
export function CriticalCircleBullet({ size = 6 }: { size?: number }) {
  return (
    <span className="shrink-0 inline-flex" aria-hidden>
      <svg width={size} height={size} viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="6" cy="6" r="6" fill="var(--color-feedback-critical-on)" />
      </svg>
    </span>
  )
}

type ActionRequiredDescriptionRowProps = {
  /** When impactsMore is set: this is plain text (not linked). Else: full "Impacts X" string and only this part is dotted. */
  impactsBase: string
  /** When set, only this part is dotted/tooltip (e.g. " +1 more"). Base is not linked. */
  impactsMore?: string
  /** Tooltip for main impacts (used when impactsMore is not set). */
  mainTooltipLabel: string
  /** Tooltip for "+X more" only (bullet list of capability names). Required when impactsMore is set. */
  moreTooltipLabel?: string
  tooltipId: string
  pastDueText: string
  /** When true, keep impacts + past due on one line (e.g. dropdown so panel can grow to fit). */
  singleLine?: boolean
}

export function ActionRequiredDescriptionRow({
  impactsBase,
  impactsMore,
  mainTooltipLabel,
  moreTooltipLabel = '',
  tooltipId,
  pastDueText,
  singleLine = false,
}: ActionRequiredDescriptionRowProps) {
  /** Figma 33:11887: dashed underline, light gray. */
  const linkUnderline = (content: React.ReactNode, label: string, id: string) => (
    <LabelTooltip placement="top" variant="light" tooltipId={id} label={label}>
      <span
        className="cursor-default border-b border-dashed"
        style={{ borderColor: 'var(--color-neutral-100)' }}
      >
        {content}
      </span>
    </LabelTooltip>
  )
  const impactsContent = impactsMore != null ? (
    <>
      Impacts {impactsBase}
      {' '}
      {linkUnderline(impactsMore, moreTooltipLabel, tooltipId)}
    </>
  ) : (
    <span className="cursor-default">Impacts {impactsBase}</span>
  )
  return (
    <div className={`flex w-full items-center text-[12px] leading-4 text-default ${singleLine ? 'whitespace-nowrap' : ''}`}>
      <span className={`flex items-center gap-1.5 ${singleLine ? '' : 'min-w-0 flex-1'}`}>
        <CriticalCircleBullet size={6} />
        {impactsContent}
        <span className="cursor-default">{pastDueText}</span>
      </span>
    </div>
  )
}
