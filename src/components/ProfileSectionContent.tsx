/**
 * Profile section content — Figma node 48:13117 (Stripe Network Cursor SRC).
 * Replaces the section underneath the "Profile" section header in the account details sidebar.
 */

import { Link } from 'react-router-dom'
import { PropertyList, PropertyListItem } from './PropertyList'
import { DescriptionTooltipTrigger } from './DescriptionTooltipTrigger'
import { usePrototypeOptional } from '../context/PrototypeContext'
import type { RiskLevel } from '../data/configMatrix'
const ACCOUNT_DETAILS = {
  id: 'acct_Ly5pN5pGDWgtpa',
  email: 'contact@example.com',
  created: 'Jul 10, 2021',
  configurations: 'Merchant, Customer',
  country: 'United States',
}

function ProfilePropertySkeletonRow() {
  return (
    <div
      className="flex max-w-[85%] flex-col justify-start gap-0.5 w-full shrink-0"
      data-name="PropertyListItem"
      style={{ height: 'fit-content' }}
    >
      <div className="h-3 w-16 rounded-[3px] bg-neutral-100" aria-hidden />
      <div className="h-3 w-full max-w-[70%] rounded-[3px] bg-neutral-100" aria-hidden />
    </div>
  )
}

function ConfigurationsValue() {
  return (
    <span className="inline-flex items-baseline flex-nowrap gap-0 whitespace-nowrap">
      <DescriptionTooltipTrigger
        tooltipLabel="Accounts that can receive payments and pay out to bank accounts."
        tooltipId="profile-config-merchant-tooltip"
      >
        Merchant
      </DescriptionTooltipTrigger>
      ,{' '}
      <DescriptionTooltipTrigger
        tooltipLabel="Accounts that can make payments (e.g. pay for products)."
        tooltipId="profile-config-customer-tooltip"
      >
        Customer
      </DescriptionTooltipTrigger>
    </span>
  )
}

/** Skeleton rows before the Risk level row (second to last in low-fi list). */
const SKELETON_ROWS_BEFORE_RISK = 4
/** One skeleton row after Risk level so Risk level is second to last. */
const SKELETON_ROWS_AFTER_RISK = 1

function riskLevelLabel(level: RiskLevel): 'Low' | 'Elevated' | 'High' {
  if (level === 'high') return 'High'
  if (level === 'elevated') return 'Elevated'
  return 'Low'
}

function RiskLevelValue({
  riskLevel,
  accountId,
}: {
  riskLevel: RiskLevel | undefined
  accountId: string | undefined
}) {
  const effective: RiskLevel = riskLevel ?? 'low'
  const text = riskLevelLabel(effective)
  const isHigh = effective === 'high'
  const isElevated = effective === 'elevated'

  const valueStyle =
    isHigh
      ? { color: 'var(--color-feedback-critical-on)' }
      : isElevated
        ? { color: 'var(--color-feedback-attention-on)' }
        : undefined

  const riskNestedPath =
    accountId != null ? `/network/${accountId}/risk-analysis` : null

  const linkClassName =
    'font-label-medium leading-5 tracking-[-0.15px] underline hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary rounded-[length:var(--radius-xsmall)] w-fit'

  if (riskNestedPath != null && (isHigh || isElevated)) {
    return (
      <Link to={riskNestedPath} className={linkClassName} style={valueStyle}>
        {text}
      </Link>
    )
  }

  return (
    <span className="font-label-medium leading-5 tracking-[-0.15px]" style={valueStyle}>
      {text}
    </span>
  )
}

type ProfileSectionContentProps = {
  accountId?: string
}

export default function ProfileSectionContent({
  accountId,
}: ProfileSectionContentProps) {
  const prototype = usePrototypeOptional()
  const isLowFidelity = prototype?.fidelity === 'low'
  const contextRiskLevel = prototype?.riskLevel

  return (
    <div
      className="flex flex-col gap-4 w-full shrink-0"
      data-name="Profile section content"
      data-node-id="48:13117"
    >
      <PropertyList className="gap-3">
        <PropertyListItem label="ID" value={ACCOUNT_DETAILS.id} />
        {isLowFidelity ? (
          <>
            {Array.from({ length: SKELETON_ROWS_BEFORE_RISK }, (_, i) => (
              <ProfilePropertySkeletonRow key={`before-${i}`} />
            ))}
            <PropertyListItem
              label="Risk level"
              value={
                <RiskLevelValue riskLevel={contextRiskLevel} accountId={accountId} />
              }
            />
            {Array.from({ length: SKELETON_ROWS_AFTER_RISK }, (_, i) => (
              <ProfilePropertySkeletonRow key={`after-${i}`} />
            ))}
          </>
        ) : (
          <>
            <PropertyListItem
              label="Risk level"
              value={
                <RiskLevelValue riskLevel={contextRiskLevel} accountId={accountId} />
              }
            />
            <PropertyListItem label="Email" value={ACCOUNT_DETAILS.email} />
            <PropertyListItem label="Created" value={ACCOUNT_DETAILS.created} />
            <PropertyListItem
              label="Configurations"
              value={<ConfigurationsValue />}
            />
            <PropertyListItem label="Country" value={ACCOUNT_DETAILS.country} />
          </>
        )}
      </PropertyList>
    </div>
  )
}
