/**
 * RadarHighRiskCard — Figma 1966:24778 (Stripe Network H1 '26).
 * Shown above Balances on account detail when account is a Radar rule match (high risk).
 * Title, recommendation copy, Reject account button, View risk analysis link, fraud score indicator.
 */

import { Link } from 'react-router-dom'
import FraudScoreIndicator from './FraudScoreIndicator'

type RadarHighRiskCardProps = {
  accountId: string | undefined
  /** Fraud score 0–100; default 85. */
  fraudScore?: number
}

export default function RadarHighRiskCard({ accountId, fraudScore = 85 }: RadarHighRiskCardProps) {
  return (
    <div
      className="flex w-full flex-col gap-5 rounded-[8px] border border-neutral-100 bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
      data-name="Radar/AI/06"
      data-node-id="1966:24778"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-col gap-3">
          <h2 className="text-[18px] leading-[26px] font-semibold tracking-[-0.15px] text-default">
            Radar detected high risk of fraud
          </h2>
          <p className="font-label-medium text-default leading-5 tracking-[-0.15px]">
            We recommend rejecting the account to avoid financial loss to your platform.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            className="inline-flex h-7 min-h-7 items-center justify-center rounded-[length:var(--radius-action)] border border-neutral-100 bg-surface px-2 py-1 font-label-medium-emphasized text-default shadow-[var(--shadow-button)] transition-colors hover:bg-offset focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2"
            style={{ boxShadow: '0px 1px 1px 0px rgba(26,27,37,0.16), 0px 0px 0px 1px #d5dbe1' }}
          >
            Reject account
          </button>
          {accountId && (
            <Link
              to={`/network/${accountId}/risk-analysis`}
              className="font-label-medium text-action-primary underline hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 rounded-[length:var(--radius-xsmall)]"
            >
              View risk analysis
            </Link>
          )}
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-center">
        <FraudScoreIndicator score={fraudScore} />
      </div>
    </div>
  )
}
