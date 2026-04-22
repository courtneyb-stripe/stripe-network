/**
 * Header signal group chip — Figma 112:49522 (header/signal-group-row).
 * Default: transparent fill, border transparent. Hover / :active / aria-expanded: fill #F4F7FA, border #ECF1F6.
 */

import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react'

type HeaderSignalGroupButtonProps = {
  /** Accessible name (label tooltips hidden for now). */
  tooltipLabel: string
  /** Reserved while hover popover replaces label tooltip. */
  tooltipId?: string
  onClick?: () => void
  /** 12×12 status / check / pause icon */
  leading: ReactNode
  /** Chip label (e.g. Payments) */
  children: ReactNode
  className?: string
} & Omit<ComponentPropsWithoutRef<'button'>, 'children' | 'type'>

/**
 * Figma: h-24px, px-4px, gap from icon to label pl-6 pr-4 on text; Label/Medium (14px regular).
 */
const HeaderSignalGroupButton = forwardRef<HTMLButtonElement, HeaderSignalGroupButtonProps>(
  function HeaderSignalGroupButton(
    {
      tooltipLabel,
      onClick,
      leading,
      children,
      className = '',
      ...props
    },
    ref
  ) {
    const button = (
      <button
        ref={ref}
        type="button"
        aria-label={tooltipLabel}
        onClick={onClick}
        className={[
          'inline-flex h-6 min-h-6 shrink-0 items-center rounded-full border border-transparent',
          'bg-transparent px-1.5 text-default transition-colors',
          'hover:border-[#ECF1F6] hover:bg-[#F4F7FA]',
          'active:border-[#ECF1F6] active:bg-[#F4F7FA]',
          'aria-expanded:border-[#ECF1F6] aria-expanded:bg-[#F4F7FA]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-action-primary',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        <span className="inline-flex shrink-0 items-center justify-center">{leading}</span>
        <span className="pl-1.5 font-label-medium">{children}</span>
      </button>
    )

    return button
  }
)

HeaderSignalGroupButton.displayName = 'HeaderSignalGroupButton'

export default HeaderSignalGroupButton
