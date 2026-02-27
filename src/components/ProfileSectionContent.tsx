/**
 * Profile section content — Figma node 48:13117 (Stripe Network Cursor SRC).
 * Replaces the section underneath the "Profile" section header in the account details sidebar.
 */

import { Link } from 'react-router-dom'
import { PropertyList, PropertyListItem } from './PropertyList'
import { DescriptionTooltipTrigger } from './DescriptionTooltipTrigger'
import { usePrototypeOptional } from '../context/PrototypeContext'
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

function RiskLevelValue({
  isHighRisk,
  accountId,
}: {
  isHighRisk: boolean
  accountId: string | undefined
}) {
  if (!accountId) {
    return <span className="font-label-medium">{isHighRisk ? 'High' : 'Low'}</span>
  }
  return (
    <div className="flex flex-col gap-0.5 items-start">
      <span
        className="font-label-medium leading-5 tracking-[-0.15px]"
        style={
          isHighRisk
            ? { color: 'var(--color-feedback-critical-on)' }
            : undefined
        }
      >
        {isHighRisk ? 'High' : 'Low'}
      </span>
      <Link
        to={`/network/${accountId}/risk-analysis`}
        className="font-label-medium text-subdued underline hover:text-default hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary rounded-[length:var(--radius-xsmall)] w-fit"
      >
        View risk analysis
      </Link>
    </div>
  )
}

type ProfileSectionContentProps = {
  showAccountRisk?: boolean
  accountId?: string
}

export default function ProfileSectionContent({
  showAccountRisk = false,
  accountId,
}: ProfileSectionContentProps) {
  const prototype = usePrototypeOptional()
  const isLowFidelity = prototype?.fidelity === 'low'

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
                <RiskLevelValue
                  isHighRisk={showAccountRisk}
                  accountId={accountId}
                />
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
                <RiskLevelValue
                  isHighRisk={showAccountRisk}
                  accountId={accountId}
                />
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
