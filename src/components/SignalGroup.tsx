import { forwardRef, type ReactNode } from 'react'

type SignalGroupProps = {
  children: ReactNode
}

/**
 * Header row for signal group chips (Payments, Payouts, Billing, …) below the account title.
 * Figma: node 112:49522 (header/signal-group-row), nested in the Payouts/Payments/Billing row.
 * Ref attaches to the inner pill row for layout measurement.
 */
const SignalGroup = forwardRef<HTMLDivElement, SignalGroupProps>(function SignalGroup(
  { children },
  ref
) {
  return (
    <div
      className="-ml-3 flex flex-wrap items-center gap-[8px]"
      data-name="Payouts Payments Billing row"
    >
      <div
        ref={ref}
        className="flex flex-wrap items-center gap-1"
        data-name="header/signal-group-row"
        data-node-id="112:49522"
      >
        {children}
      </div>
    </div>
  )
})

export default SignalGroup
