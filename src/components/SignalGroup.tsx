import { forwardRef, type ReactNode } from 'react'

type SignalGroupProps = {
  children: ReactNode
}

/**
 * Header row for hub capability cards (6269:112639) — **4px** horizontal gap between 8px-radius tiles.
 * Legacy name: node 112:49522 (`header/signal-group-row`). Bottom hairline: AccountDetailActionBar.
 */
const SignalGroup = forwardRef<HTMLDivElement, SignalGroupProps>(function SignalGroup(
  { children },
  ref
) {
  return (
    <div
      className="flex flex-wrap items-center gap-[length:var(--spacing-xsmall)]"
      data-name="Payouts Payments Billing row"
    >
      <div
        ref={ref}
        className="flex flex-wrap items-center gap-[length:var(--spacing-xsmall)]"
        data-name="header/signal-group-row"
        data-node-id="112:49522"
      >
        {children}
      </div>
    </div>
  )
})

export default SignalGroup
