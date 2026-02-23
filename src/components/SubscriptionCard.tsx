/**
 * SubscriptionCard — Billing tab subscription summary. Figma 20:9802.
 * Badges (e.g. Active, Update scheduled), plan name, invoice frequency, next invoice with link icon.
 */

import { Icon } from '../icons/SailIcons'
import { IconButton } from './IconButton'
import { PillBadge } from './PillBadge'

export type SubscriptionCardBadge = {
  label: string
  variant: 'success' | 'attention' | 'critical' | 'neutral'
}

type SubscriptionCardProps = {
  /** Plan name (e.g. "Basic plan"). */
  planName: string
  /** Status badges shown above the plan name (e.g. Active, Update scheduled). */
  badges?: SubscriptionCardBadge[]
  /** Label for invoice frequency row. */
  invoiceFrequencyLabel?: string
  /** Value for invoice frequency (e.g. "Weekly on Tue"). */
  invoiceFrequencyValue?: string
  /** Label for next invoice row. */
  nextInvoiceLabel?: string
  /** Value for next invoice (e.g. "Sep 12 for $12.00"). */
  nextInvoiceValue?: string
  /** Called when the "more" actions icon is clicked. */
  onMoreClick?: () => void
  /** Called when the next invoice link/icon is clicked (optional). */
  onNextInvoiceClick?: () => void
}

export default function SubscriptionCard({
  planName,
  badges = [],
  invoiceFrequencyLabel = 'Invoice frequency',
  invoiceFrequencyValue,
  nextInvoiceLabel = 'Next invoice',
  nextInvoiceValue,
  onMoreClick,
  onNextInvoiceClick,
}: SubscriptionCardProps) {
  return (
    <div
      className="flex w-full min-w-0 flex-col gap-4 overflow-hidden rounded-[12px] border border-neutral-100 bg-surface p-4 shadow-[0px_1px_2px_-0.5px_rgba(0,0,0,0.05)]"
      data-name="Subscription Card"
      data-node-id="20:9802"
    >
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-5">
        <div className="flex w-full shrink-0 items-start gap-4">
          <div className="flex min-w-0 flex-1 flex-wrap items-start gap-1">
            {badges.map((badge) => (
              <PillBadge key={badge.label} label={badge.label} variant={badge.variant} />
            ))}
          </div>
          {onMoreClick && (
            <IconButton
              label="More actions"
              tooltipId="subscription-card-more-tooltip"
              onClick={onMoreClick}
            >
              <Icon name="more" size={12} fill="var(--color-icon-default)" />
            </IconButton>
          )}
        </div>
        <p className="min-w-0 shrink-0 truncate font-label-medium-emphasized text-[16px] leading-5 tracking-[-0.32px] text-default">
          {planName}
        </p>
      </div>
      <div className="flex shrink-0 flex-col gap-1.5">
        {invoiceFrequencyValue != null && (
          <div className="flex w-full items-center gap-6">
            <p className="min-w-0 flex-1 truncate font-label-medium text-[14px] leading-5 text-subdued">
              {invoiceFrequencyLabel}
            </p>
            <p className="shrink-0 font-label-medium text-[14px] leading-5 text-default">
              {invoiceFrequencyValue}
            </p>
          </div>
        )}
        {nextInvoiceValue != null && (
          <div className="flex w-full items-center gap-6">
            <p className="min-w-0 flex-1 truncate font-label-medium text-[14px] leading-5 text-subdued">
              {nextInvoiceLabel}
            </p>
            <div className="flex shrink-0 items-center justify-end gap-1">
              {onNextInvoiceClick ? (
                <button
                  type="button"
                  onClick={onNextInvoiceClick}
                  className="flex items-center gap-1 rounded-[4px] font-label-medium text-[14px] leading-5 text-default transition-colors hover:bg-offset focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary"
                  aria-label="View next invoice"
                >
                  <Icon name="link" size={10} fill="var(--color-icon-default)" />
                  <span>{nextInvoiceValue}</span>
                </button>
              ) : (
                <>
                  <Icon name="link" size={10} fill="var(--color-icon-default)" aria-hidden />
                  <span className="font-label-medium text-[14px] leading-5 text-default">
                    {nextInvoiceValue}
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
