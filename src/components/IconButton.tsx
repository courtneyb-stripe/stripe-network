/**
 * IconButton — Icon-only button with tooltip on hover.
 * Variants: create (purple +, hover one shade darker), standard (gray fill), ghost (no fill).
 * floatieTrigger: neutral-900 fill, white icon — for prototype floatie only; not in component inventory.
 * Use tooltipPlacement="bottom" in panel/modal headers so labels are visible below the button.
 */

import type { TooltipPlacement } from './LabelTooltip'
import LabelTooltip from './LabelTooltip'

export type IconButtonVariant = 'create' | 'standard' | 'ghost' | 'display' | 'floatieTrigger'

/** 8px corner radius for all icon-only buttons across states. */
const RADIUS_ICON = 'rounded-[8px]'

const VARIANT_CLASSES: Record<IconButtonVariant, string> = {
  create:
    'group bg-[var(--color-brand-25)] text-action-primary hover:bg-[var(--color-brand-50)] [&>svg]:transition-[fill] group-hover:[&>svg_path]:fill-[var(--color-action-primary-hover)]',
  standard: 'bg-offset text-default hover:bg-neutral-50',
  ghost: 'text-default hover:bg-offset',
  display: 'bg-neutral-100 text-icon-subdued pointer-events-none',
  floatieTrigger:
    'bg-[#1a1d21] text-white hover:bg-[#262a30] [&>svg]:transition-[fill] [&>svg]:fill-white',
}

const BASE_CLASS =
  'flex h-8 w-8 min-h-8 min-w-8 shrink-0 items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-action-primary'

type IconButtonProps = {
  label: string
  tooltipId: string
  variant?: IconButtonVariant
  /** When true (e.g. on action bar), use pill radius. Default: 8px for all icon-only buttons. */
  roundedFull?: boolean
  /** Tooltip position. Use "bottom" in panel/modal headers so labels show below the button. */
  tooltipPlacement?: TooltipPlacement
  children: React.ReactNode
  className?: string
} & Omit<React.ComponentPropsWithoutRef<'button'>, 'aria-label'>

export function IconButton({
  label,
  tooltipId,
  variant = 'standard',
  roundedFull = false,
  tooltipPlacement = 'top',
  children,
  className = '',
  ...props
}: IconButtonProps) {
  const radiusClass = roundedFull ? 'rounded-[999px]' : RADIUS_ICON

  if (variant === 'display') {
    return (
      <span
        role="img"
        aria-label={label}
        className={`${BASE_CLASS} ${radiusClass} ${VARIANT_CLASSES.display} ${className}`}
      >
        {children}
      </span>
    )
  }

  const button = (
    <button
      type="button"
      aria-label={label}
      aria-describedby={tooltipId}
      className={`${BASE_CLASS} ${radiusClass} ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
  return (
    <LabelTooltip label={label} tooltipId={tooltipId} placement={tooltipPlacement}>
      {button}
    </LabelTooltip>
  )
}
