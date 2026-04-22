import { forwardRef, type ReactNode } from 'react'

type SignalGroupProps = {
  children: ReactNode
}

/**
 * Header row for signal group chips (Payments, Payouts, Billing, …) below the account title.
 * Figma: node 112:49522 (`header/signal-group-row`), nested in the Payouts/Payments/Billing row.
 * Bottom hairline: AccountDetailActionBar — neutral-50 rule below this row (Home 2:6375).
 * Ref attaches to the inner pill row for layout measurement.
 */
const SignalGroup = forwardRef<HTMLDivElement, SignalGroupProps>(function SignalGroup(
  { children },
  ref
) {
  return (
    <div
      className="flex flex-wrap items-center gap-[8px]"
      data-name="Payouts Payments Billing row"
    >
      <div
        ref={ref}
        className="flex flex-wrap items-center gap-[8px]"
        data-name="header/signal-group-row"
        data-node-id="112:49522"
      >
        {children}
      </div>
    </div>
  )
})

export default SignalGroup
