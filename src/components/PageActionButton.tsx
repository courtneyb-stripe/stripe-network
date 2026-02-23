/**
 * PageActionButton — Primary action button for page headers (Network, Transactions).
 * Icon-only or icon + label; same shadow and focus ring.
 */

type PageActionButtonProps = {
  iconOnly?: boolean
  children: React.ReactNode
} & React.ComponentPropsWithoutRef<'button'>

export function PageActionButton({
  iconOnly = false,
  children,
  className = '',
  ...props
}: PageActionButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex h-[28px] min-h-[28px] shrink-0 items-center justify-center rounded-[length:var(--radius-action)] border border-neutral-100 bg-surface font-label-medium-emphasized text-default transition-colors hover:bg-offset focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-action-primary ${iconOnly ? 'min-w-[28px] px-0' : 'w-fit gap-[8px] px-[8px] py-[4px]'} ${className}`}
      style={{ boxShadow: 'var(--shadow-button)' }}
      {...props}
    >
      {children}
    </button>
  )
}
