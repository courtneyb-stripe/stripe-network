import type { ReactNode } from 'react'
import {
  accountHubHeaderCssVariables,
  accountHubHeaderGap,
  type AccountHubHeaderSpaceOverrides,
} from './accountHubHeaderSpacing'

/**
 * Full-width hub shell: neutral/25, padding, bottom rule, and **identity → capability cards** spacing
 * via `--account-hub-*` variables (defaults in `ACCOUNT_HUB_HEADER_SPACE`).
 */
export function AccountHubHeaderChrome({
  identity,
  capabilityCards,
  spacing,
}: {
  identity: ReactNode
  capabilityCards?: ReactNode
  spacing?: AccountHubHeaderSpaceOverrides
}) {
  return (
    <div
      className={`-mx-6 flex flex-col ${accountHubHeaderGap.identityToCards} border-b border-neutral-50 bg-neutral-25 px-6 py-6`}
      style={accountHubHeaderCssVariables(spacing)}
      data-name="Account hub header chrome"
      data-node-id="6269:112612"
    >
      {identity}
      {capabilityCards}
    </div>
  )
}
