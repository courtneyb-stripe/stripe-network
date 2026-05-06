/**
 * Profile / Details sidebar card — Figma Sections/Metadata (249:141968).
 * Inner bordered card: account title, skeleton header lines, divider, icon + value rows.
 * Icons are neutral-100 squares until assets are provided. Risk row (checkmark position): elevated/high copy + link; otherwise skeleton.
 */

import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { DescriptionTooltipTrigger } from './DescriptionTooltipTrigger'
import { usePrototypeOptional } from '../context/PrototypeContext'
import type { RiskLevel } from '../data/configMatrix'

type ProfileSectionContentProps = {
  accountId?: string
  accountName?: string
}

/** Match skeleton prop bars: 12px height, 3px radius, neutral-100 fill. */
function SkeletonBar({ className = '' }: { className?: string }) {
  return (
    <div
      className={`h-3 shrink-0 rounded-[3px] bg-neutral-100 ${className}`}
      aria-hidden
    />
  )
}

/** Placeholder for row icons — same fill + radius as skeleton bars (user-provided icons later). */
function MetadataIconPlaceholder() {
  return (
    <span
      className="inline-block size-3 shrink-0 rounded-[3px] bg-neutral-100"
      aria-hidden
    />
  )
}

function MetadataRow({
  icon,
  children,
  align = 'center',
}: {
  icon: ReactNode
  children: ReactNode
  align?: 'center' | 'start'
}) {
  return (
    <div
      className={`flex min-w-0 w-full gap-5 ${align === 'center' ? 'items-center' : 'items-start'}`}
      data-name="Label"
    >
      <div
        className={`flex h-5 w-3 shrink-0 justify-center ${align === 'center' ? 'items-center' : 'items-start pt-0.5'}`}
      >
        {icon}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">{children}</div>
    </div>
  )
}

function RiskAccountCallout({
  riskLevel,
  accountId,
}: {
  riskLevel: RiskLevel | undefined
  accountId: string | undefined
}) {
  const path = accountId != null ? `/network/${accountId}/risk-analysis` : null
  const linkClass =
    'w-fit font-label-medium leading-5 tracking-[-0.15px] underline underline-offset-2 decoration-solid hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary rounded-[length:var(--radius-xsmall)]'

  if (riskLevel === 'elevated') {
    const style = { color: 'var(--color-feedback-attention-on)' } as const
    if (path != null) {
      return (
        <Link to={path} className={linkClass} style={style}>
          Elevated risk account
        </Link>
      )
    }
    return (
      <span className={linkClass} style={style}>
        Elevated risk account
      </span>
    )
  }

  if (riskLevel === 'high') {
    const style = { color: 'var(--color-feedback-critical-on)' } as const
    if (path != null) {
      return (
        <Link to={path} className={linkClass} style={style}>
          High risk account
        </Link>
      )
    }
    return (
      <span className={linkClass} style={style}>
        High risk account
      </span>
    )
  }

  return <SkeletonBar className="w-full max-w-[min(100%,14rem)]" />
}

const CONFIGURATION_LINK_ITEMS = [
  {
    label: 'Merchant',
    tooltipLabel: 'Accounts that can receive payments and pay out to bank accounts.',
    tooltipId: 'details-config-merchant-tooltip',
  },
  {
    label: 'Customer',
    tooltipLabel: 'Accounts that can make payments (e.g. pay for products).',
    tooltipId: 'details-config-customer-tooltip',
  },
  {
    label: 'Recipient',
    tooltipLabel: 'Accounts that receive payouts from your platform.',
    tooltipId: 'details-config-recipient-tooltip',
  },
  {
    label: 'Storer',
    tooltipLabel: 'Accounts that store funds or goods on behalf of others.',
    tooltipId: 'details-config-storer-tooltip',
  },
  {
    label: 'Borrower',
    tooltipLabel: 'Accounts that have accessed financing products.',
    tooltipId: 'details-config-borrower-tooltip',
  },
  {
    label: 'Card issuer',
    tooltipLabel: 'Accounts enabled for issuing cards.',
    tooltipId: 'details-config-card-issuer-tooltip',
  },
] as const

function ConfigurationsLinksRow() {
  const commaClass =
    'mx-[2px] font-label-medium text-[14px] leading-5 tracking-[-0.15px] text-default'

  return (
    <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-0 gap-y-0.5">
      {CONFIGURATION_LINK_ITEMS.map((item, i) => (
        <span key={item.tooltipId} className="inline-flex items-baseline whitespace-nowrap">
          <DescriptionTooltipTrigger tooltipLabel={item.tooltipLabel} tooltipId={item.tooltipId}>
            {item.label}
          </DescriptionTooltipTrigger>
          {i < CONFIGURATION_LINK_ITEMS.length - 1 ? <span className={commaClass}>,</span> : null}
        </span>
      ))}
    </div>
  )
}

export default function ProfileSectionContent({
  accountId,
  accountName = '—',
}: ProfileSectionContentProps) {
  const prototype = usePrototypeOptional()
  const riskLevel = prototype?.riskLevel

  return (
    <div
      className="w-full shrink-0 rounded-[16px] border border-neutral-50 bg-surface p-6"
      data-name="Sections/Metadata card"
      data-node-id="249:141971"
    >
      <div className="flex w-full flex-col gap-4">
        <div className="flex min-w-0 w-full flex-col gap-1">
          <p
            className="m-0 min-w-0 font-semibold text-[16px] leading-5 tracking-[-0.31px] text-default"
            data-node-id="249:141977"
          >
            {accountName}
          </p>
          <div className="flex max-w-[233px] flex-col gap-0.5" data-name="baby/prop-list">
            <div className="w-20 py-0.5">
              <SkeletonBar className="w-full" />
            </div>
            <div className="flex w-full items-center py-0.5">
              <SkeletonBar className="max-w-[227px] flex-1" />
            </div>
          </div>
        </div>

        <div className="h-px w-full shrink-0 bg-neutral-50" aria-hidden data-name="Divider" />

        <div className="flex w-full flex-col gap-3" data-name="Business metadata">
          <MetadataRow icon={<MetadataIconPlaceholder />} align="center">
            <SkeletonBar className="w-full max-w-[min(100%,14rem)]" />
          </MetadataRow>
          <MetadataRow icon={<MetadataIconPlaceholder />} align="center">
            <SkeletonBar className="w-full max-w-[min(100%,14rem)]" />
          </MetadataRow>
          <MetadataRow icon={<MetadataIconPlaceholder />} align="center">
            <div className="py-0.5">
              <RiskAccountCallout riskLevel={riskLevel} accountId={accountId} />
            </div>
          </MetadataRow>
          <MetadataRow icon={<MetadataIconPlaceholder />} align="center">
            <SkeletonBar className="w-full max-w-[min(100%,14rem)]" />
          </MetadataRow>
          <MetadataRow icon={<MetadataIconPlaceholder />} align="center">
            <SkeletonBar className="w-full max-w-[min(100%,14rem)]" />
          </MetadataRow>
          <MetadataRow icon={<MetadataIconPlaceholder />} align="center">
            <SkeletonBar className="w-full max-w-[min(100%,14rem)]" />
          </MetadataRow>
          <MetadataRow icon={<MetadataIconPlaceholder />} align="center">
            <SkeletonBar className="w-full max-w-[min(100%,14rem)]" />
          </MetadataRow>
          <MetadataRow icon={<MetadataIconPlaceholder />} align="center">
            <SkeletonBar className="w-full max-w-[min(100%,14rem)]" />
          </MetadataRow>
          <MetadataRow icon={<MetadataIconPlaceholder />} align="start">
            <ConfigurationsLinksRow />
          </MetadataRow>
          <MetadataRow icon={<MetadataIconPlaceholder />} align="start">
            <div className="flex flex-wrap gap-1">
              <span
                className="inline-flex h-5 w-[100px] shrink-0 rounded-[4px] bg-neutral-100"
                aria-hidden
              />
              <span
                className="inline-flex h-5 w-20 shrink-0 rounded-[4px] bg-neutral-100"
                aria-hidden
              />
            </div>
          </MetadataRow>
        </div>
      </div>
    </div>
  )
}
