/**
 * ActionButton — For the action bar row only (AccountDetailActionBar).
 * Corner radius always 999 (pill). Variants: standard (gray fill), outline (e.g. enabled status), icon only, ghost.
 * Standard: icon left, label, optional right chevron (down only). Paused states use standard + chevron (dropdown).
 * Ghost: no border/fill; optional dashed light-gray underline on label with tooltip (Figma 33:11887).
 */

import React from 'react'
import ChevronDownIcon from '../icons/ChevronDownIcon'
import LabelTooltip, { type TooltipPlacement } from './LabelTooltip'

export type ActionButtonVariant = 'standard' | 'outline' | 'iconOnly' | 'ghost'

const RADIUS_CLASS = 'rounded-[999px]' // always 999 for actions row

const VARIANT_CLASSES: Record<ActionButtonVariant, string> = {
  standard: 'bg-offset text-default hover:bg-neutral-50',
  outline: 'border border-neutral-100 bg-surface text-default hover:bg-offset',
  iconOnly: 'bg-offset text-default hover:bg-neutral-50',
  ghost: 'bg-transparent text-default hover:bg-neutral-50',
}

const BASE_CLASS =
  'inline-flex min-h-8 shrink-0 items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-action-primary font-label-medium-emphasized'

/** Figma 33:11887: dashed underline, light gray. */
const LINK_UNDERLINE_CLASS = 'border-b border-dashed cursor-default'
const LINK_UNDERLINE_STYLE = { borderColor: 'var(--color-neutral-100)' } as const

type ActionButtonProps = {
  label: string
  tooltipId: string
  variant?: ActionButtonVariant
  /** Tooltip placement relative to button. Default: 'top'. */
  tooltipPlacement?: TooltipPlacement
  /** When standard and not iconOnly: show down chevron after label (e.g. Move money, Payouts paused). */
  showChevron?: boolean
  /** When ghost: give the label text dashed light-gray underline and use light tooltip for description. */
  labelDottedTooltip?: boolean
  children: React.ReactNode
  className?: string
} & Omit<React.ComponentPropsWithoutRef<'button'>, 'aria-label'>

export function ActionButton({
  label,
  tooltipId,
  variant = 'standard',
  tooltipPlacement = 'top',
  showChevron = false,
  labelDottedTooltip = false,
  children,
  className = '',
  ...props
}: ActionButtonProps) {
  const variantClass = VARIANT_CLASSES[variant]
  const isIconOnly = variant === 'iconOnly'
  const isGhost = variant === 'ghost'
  const useDottedLabel = isGhost && labelDottedTooltip
  const shapeClass = isIconOnly
    ? 'min-w-8 px-0'
    : 'min-w-8 gap-2 px-3 py-1.5'

  const content = useDottedLabel
    ? React.Children.map(children, (child) =>
        typeof child === 'string' ? (
          <span className={LINK_UNDERLINE_CLASS} style={LINK_UNDERLINE_STYLE}>
            {child}
          </span>
        ) : (
          child
        )
      )
    : children

  const button = (
    <button
      type="button"
      aria-label={label}
      aria-describedby={tooltipId}
      className={`${BASE_CLASS} ${RADIUS_CLASS} ${variantClass} ${shapeClass} ${className}`}
      {...props}
    >
      {content}
      {!isIconOnly && showChevron && (
        <ChevronDownIcon size={8} fill="var(--color-icon-default)" />
      )}
    </button>
  )

  return (
    <LabelTooltip
      label={label}
      tooltipId={tooltipId}
      placement={tooltipPlacement}
      variant={useDottedLabel ? 'light' : 'dark'}
    >
      {button}
    </LabelTooltip>
  )
}
