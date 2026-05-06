/**
 * SubscriptionCard — **baby/card/subscription** (Figma Stripe Network ’26 **6269:117912**).
 * Hub carousel + Billing grid: badges (dense), plan title, metadata rows (invoice frequency, next invoice w/ link + dotted underline, optional service period).
 */

import type { ReactNode } from 'react'
import { Icon } from '../icons/SailIcons'
import { PillBadge, type PillBadgeVariant } from './PillBadge'

export type SubscriptionCardBadge = {
  label: string
  variant: PillBadgeVariant
}

type SubscriptionCardProps = {
  /** Plan name (e.g. "Monthly Plus"). */
  planName: string
  /** Status badges (dense pills). */
  badges?: SubscriptionCardBadge[]
  invoiceFrequencyLabel?: string
  invoiceFrequencyValue?: string
  nextInvoiceLabel?: string
  nextInvoiceValue?: string
  servicePeriodLabel?: string
  servicePeriodValue?: string
  onNextInvoiceClick?: () => void
  /** Carousel: pass `min-w-[320px] max-w-[422px] shrink-0`. Grid: omit or `min-w-0 w-full`. */
  className?: string
}

function MetaRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-h-5 w-full items-center justify-between gap-6">
      <p className="min-w-0 flex-1 truncate font-label-medium text-[14px] leading-5 tracking-[-0.15px] text-subdued">
        {label}
      </p>
      <div className="flex min-w-0 shrink-0 justify-end font-label-medium text-[14px] leading-5 tracking-[-0.15px] text-default">
        {children}
      </div>
    </div>
  )
}

export default function SubscriptionCard({
  planName,
  badges = [],
  invoiceFrequencyLabel = 'Invoice frequency',
  invoiceFrequencyValue,
  nextInvoiceLabel = 'Next invoice',
  nextInvoiceValue,
  servicePeriodLabel = 'Service period',
  servicePeriodValue,
  onNextInvoiceClick,
  className = '',
}: SubscriptionCardProps) {
  const rootClass =
    `flex min-h-[212px] w-full min-w-0 flex-col gap-4 overflow-hidden rounded-[16px] border border-neutral-50 bg-surface px-6 pb-5 pt-6 shadow-[0px_1px_2px_-0.5px_rgba(0,0,0,0.05)] ${className}`.trim()

  const showFooter =
    invoiceFrequencyValue != null || nextInvoiceValue != null || servicePeriodValue != null

  const nextInvoiceInner = (
    <span className="inline-flex items-center justify-end gap-1">
      <Icon name="link" size={10} fill="var(--color-icon-default)" className="shrink-0" aria-hidden />
      <span className="underline decoration-dotted underline-offset-[3px]">{nextInvoiceValue}</span>
    </span>
  )

  return (
    <div className={rootClass} data-name="baby/card/subscription" data-node-id="6269:117912">
      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <div className="flex w-full flex-wrap items-start gap-1">
          {badges.map((badge) => (
            <PillBadge key={badge.label} label={badge.label} variant={badge.variant} dense />
          ))}
        </div>
        <p
          className="min-w-0 shrink-0 font-semibold text-[16px] leading-5 tracking-[-0.32px] text-default"
          style={{ fontFeatureSettings: "'lnum' 1, 'pnum' 1" }}
        >
          {planName}
        </p>
      </div>
      {showFooter ? (
        <div className="flex shrink-0 flex-col gap-1.5">
          {invoiceFrequencyValue != null && (
            <MetaRow label={invoiceFrequencyLabel}>{invoiceFrequencyValue}</MetaRow>
          )}
          {nextInvoiceValue != null && (
            <MetaRow label={nextInvoiceLabel}>
              {onNextInvoiceClick != null ? (
                <button
                  type="button"
                  onClick={onNextInvoiceClick}
                  className="inline-flex max-w-full items-center justify-end gap-1 rounded-[4px] font-label-medium text-[14px] leading-5 tracking-[-0.15px] text-default transition-colors hover:bg-offset focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary"
                  aria-label="View next invoice"
                >
                  {nextInvoiceInner}
                </button>
              ) : (
                nextInvoiceInner
              )}
            </MetaRow>
          )}
          {servicePeriodValue != null && (
            <MetaRow label={servicePeriodLabel}>{servicePeriodValue}</MetaRow>
          )}
        </div>
      ) : null}
    </div>
  )
}
