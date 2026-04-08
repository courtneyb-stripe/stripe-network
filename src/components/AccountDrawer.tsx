/**
 * Account drawer — Figma 16:6868.
 * Half-screen panel docked 16px from right, top, and bottom. No scrim.
 * Close via X button or click outside panel.
 */

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { Icon } from '../icons/SailIcons'
import { EditIcon } from '../icons/EditIcon'
import { ExternalLinkIcon } from '../icons/ExternalLinkIcon'
import { Accordion, AccordionItem } from './Accordion'
import { IconButton } from './IconButton'
import { PillBadge } from './PillBadge'
import { PropertyList, PropertyListItem } from './PropertyList'
import SectionHeader from './SectionHeader'
import TabBar from './TabBar'
import {
  getActiveCapabilities,
  getPausedCapabilities,
  getPausedSoonCapabilities,
  getInactiveCapabilities,
  getCapabilitiesTotalCount,
} from '../data/capabilitiesList'

function CloseIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M2 2l8 8M10 2L2 10"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** Red circle with white X — Paused. */
function PausedIcon() {
  return (
    <svg width={12} height={12} viewBox="0 0 12 12" fill="none" aria-hidden>
      <circle cx="6" cy="6" r="6" fill="var(--color-icon-feedback-critical)" />
      <path d="M4 4l4 4M8 4l-4 4" stroke="white" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  )
}

/** Orange filled circle with minus — Paused soon (NextIcon negativeCircleFilled). */
function PausedSoonIcon() {
  return (
    <svg width={12} height={12} viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 0C9.31371 0 12 2.68629 12 6C12 9.31371 9.31371 12 6 12C2.68629 12 0 9.31371 0 6C0 2.68629 2.68629 0 6 0ZM3.65625 5.34375C3.29381 5.34375 3 5.63756 3 6C3 6.36244 3.29381 6.65625 3.65625 6.65625L8.34375 6.65625C8.70619 6.65625 9 6.36244 9 6C9 5.63756 8.70619 5.34375 8.34375 5.34375L3.65625 5.34375Z"
        fill="#CC4B00"
      />
    </svg>
  )
}

/** Empty circle — Inactive (NextIcon circle). */
function InactiveIcon() {
  return (
    <svg width={12} height={12} viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 10.6875C8.58917 10.6875 10.6875 8.58917 10.6875 5.99999C10.6875 3.40964 8.59626 1.3125 6 1.3125C3.41083 1.3125 1.3125 3.41082 1.3125 5.99999C1.3125 8.58917 3.41083 10.6875 6 10.6875ZM6 12C9.31405 12 12 9.31404 12 5.99999C12 2.68595 9.32231 0 6 0C2.68595 0 0 2.68595 0 5.99999C0 9.31404 2.68595 12 6 12Z"
        fill="#D8DEE4"
      />
    </svg>
  )
}

import type { AccountStatusKind } from './AccountDetailsSidebar'

/** Profile drawer dummy data — matches Profile detail design (Account, Contact, Business sections). */
const ACCOUNT_INFORMATION = {
  id: 'acct_1T33YYE3TJsbfSRo',
  type: 'Express',
  termsAcceptance: "Agreement hasn't been accepted",
  termsAgreementType: 'Full',
  dashboardAccess: 'Express',
  negativeBalanceLiability: 'Platform',
  requirementCollection: 'Stripe',
  feePayer: 'Platform - Express',
} as const

const CONTACT_INFORMATION = {
  doingBusinessAs: 'None',
  email: 'None',
  website: 'None',
  privacyPolicy: 'None',
  supportPhoneNumber: 'None',
} as const

const BUSINESS_DETAILS = {
  statementDescriptor: 'None',
  country: 'United States',
  businessType: 'Individual',
  industry: 'None',
  mcc: 'Required now',
} as const

/** Skeleton placeholder for drawer content (label + placeholder bar). */
function SkeletonPropRow({ label }: { label: string }) {
  return (
    <div className="flex flex-col gap-0.5 w-full shrink-0" data-name="List item">
      <p className="font-label-small-emphasized text-default leading-4 w-full">{label}</p>
      <div className="h-3 w-full max-w-[80%] rounded-[3px] bg-neutral-100" aria-hidden />
    </div>
  )
}

const ENABLED_BADGE = <PillBadge label="Enabled" variant="success" />

export type ProfileEditSection = 'contact' | 'business'

type AccountDrawerProps = {
  open: boolean
  onClose: () => void
  status?: AccountStatusKind
  /** When true (e.g. radarRuleMatches), show Account risk + View risk analysis below ID in Account information. */
  showAccountRisk?: boolean
  /** Account id for View risk analysis link (e.g. /network/:accountId/risk-analysis). */
  accountId?: string
  /** When 'payment-details', shows Payment details title and skeleton content (for transaction row click). */
  /** When 'invoice-details', shows Invoice details title and skeleton content (for invoice row click). */
  /** When 'product-details', shows Product details title and skeleton content (for product row click). */
  variant?: 'account' | 'payment-details' | 'invoice-details' | 'product-details'
  /** Called when Edit is clicked on a profile section (Contact information or Business details). Opens Settings modal. */
  onOpenEdit?: (section: ProfileEditSection) => void
  /** Called when Edit is clicked on Capabilities section header. Opens Settings modal to Capabilities. */
  onOpenCapabilitiesEdit?: () => void
}

const PAYMENT_DETAIL_SKELETON_LABELS = [
  'Amount',
  'Status',
  'Payment method',
  'Description',
  'Date',
  'Transaction ID',
  'Created',
  'Customer',
  'Receipt',
] as const

const INVOICE_DETAIL_SKELETON_LABELS = [
  'Amount',
  'Status',
  'Due date',
  'Invoice number',
  'Description',
  'Frequency',
  'Created',
  'Customer',
  'PDF',
] as const

const PRODUCT_DETAIL_SKELETON_LABELS = [
  'Name',
  'Pricing',
  'Tax category',
  'Description',
  'Created',
  'Updated',
  'ID',
  'Status',
] as const

const PROFILE_TABS = [
  { id: 'details', label: 'Details' },
  { id: 'configurations', label: 'Configurations' },
  { id: 'capabilities', label: 'Capabilities' },
] as const

const CAPABILITY_STATUS_TOOLTIPS: Record<string, string> = {
  Active: 'Capabilities that are currently active and in use.',
  Paused: 'Capabilities that are temporarily disabled.',
  'Paused soon': 'Capabilities that will be paused soon unless you take action.',
  Inactive: 'Capabilities that are not yet active. Request to add them for this account.',
}

const OBJECT_DETAIL_PAGE_URL =
  'data:text/html;charset=utf-8,' +
  encodeURIComponent('<!DOCTYPE html><html><body><p>[object detail page]</p></body></html>')

export default function AccountDrawer({
  open,
  onClose,
  status,
  showAccountRisk = false,
  accountId,
  variant = 'account',
  onOpenEdit,
  onOpenCapabilitiesEdit,
}: AccountDrawerProps) {
  const [profileTabId, setProfileTabId] = useState<string>(PROFILE_TABS[0].id)
  const isPaymentDetails = variant === 'payment-details'
  const isInvoiceDetails = variant === 'invoice-details'
  const isProductDetails = variant === 'product-details'
  const isProfilePanel = variant === 'account'
  const isDetailsVariant = isPaymentDetails || isInvoiceDetails || isProductDetails
  const statusBadge =
    !isDetailsVariant && status === 'restricted'
      ? <PillBadge label="Restricted" variant="critical" />
      : !isDetailsVariant && status === 'restricted_soon'
        ? <PillBadge label="Restricted soon" variant="attention" />
        : !isDetailsVariant && status === 'enabled'
          ? ENABLED_BADGE
          : undefined
  const badge =
    !isDetailsVariant && (statusBadge != null || showAccountRisk) ? (
      <div className="flex items-center gap-1">
        {statusBadge}
        {showAccountRisk && (
          <PillBadge label="High risk" variant="critical" />
        )}
      </div>
    ) : !isDetailsVariant && status === undefined ? (
      <span className="font-label-medium text-subdued">–</span>
    ) : undefined
  const title = isProductDetails ? 'Product details' : isInvoiceDetails ? 'Invoice details' : isPaymentDetails ? 'Payment details' : 'Profile'
  const ariaLabel = isProductDetails ? 'Product details' : isInvoiceDetails ? 'Invoice details' : isPaymentDetails ? 'Payment details' : 'Profile'

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  const drawer = (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      onClick={onClose}
    >
      <div
        className="fixed right-4 top-4 bottom-4 w-[50%] min-w-[320px] max-w-[560px] flex flex-col overflow-hidden rounded-[16px] bg-surface px-6 py-5 shadow-[0px_50px_100px_0px_rgba(48,49,61,0.08),0px_15px_35px_0px_rgba(48,49,61,0.08),0px_5px_15px_0px_rgba(0,0,0,0.12)]"
        data-name="baby/card/prop-list_vertical"
        data-node-id="16:6869"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: title + optional badge + (view full details only for non-profile) + close */}
        <div className="flex shrink-0 w-full items-center justify-between gap-2 pb-4" data-node-id="16:6870">
          <div className="flex min-w-0 flex-1 items-center gap-1.5" data-node-id="16:6965">
            <p className="shrink-0 text-[18px] leading-[26px] font-semibold tracking-0 text-default">
              {title}
            </p>
            {badge}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {!isProfilePanel && (
              <IconButton
                label="View full details"
                tooltipId="account-drawer-view-full-details-tooltip"
                variant="ghost"
                tooltipPlacement="bottom"
                onClick={() => window.open(OBJECT_DETAIL_PAGE_URL, '_blank', 'noopener,noreferrer')}
              >
                <ExternalLinkIcon size={12} />
              </IconButton>
            )}
            <IconButton
              label="Close"
              tooltipId="account-drawer-close-tooltip"
              tooltipPlacement="bottom"
              onClick={onClose}
              data-name="Container"
              data-node-id="16:6978"
            >
              <CloseIcon size={12} />
            </IconButton>
          </div>
        </div>
        {/* Profile panel: inline tabs beneath header */}
        {isProfilePanel && (
          <div className="shrink-0 pb-3">
            <TabBar
              tabs={PROFILE_TABS}
              activeId={profileTabId}
              onChange={(id) => setProfileTabId(id)}
              variant="secondary"
            />
          </div>
        )}
        {/* Content */}
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto" data-name="Subs" data-node-id="16:6880">
          {isPaymentDetails ? (
            <div className="flex flex-col gap-3 shrink-0" data-name="Grid">
              {PAYMENT_DETAIL_SKELETON_LABELS.map((label) => (
                <SkeletonPropRow key={label} label={label} />
              ))}
            </div>
          ) : isInvoiceDetails ? (
            <div className="flex flex-col gap-3 shrink-0" data-name="Grid">
              {INVOICE_DETAIL_SKELETON_LABELS.map((label) => (
                <SkeletonPropRow key={label} label={label} />
              ))}
            </div>
          ) : isProductDetails ? (
            <div className="flex flex-col gap-3 shrink-0" data-name="Grid">
              {PRODUCT_DETAIL_SKELETON_LABELS.map((label) => (
                <SkeletonPropRow key={label} label={label} />
              ))}
            </div>
          ) : profileTabId === 'configurations' ? (
            <div className="flex flex-col gap-4 shrink-0" data-name="Configurations view">
              <div className="rounded-[12px] bg-offset px-4 py-4">
                <p className="text-[14px] text-subdued">Configurations</p>
              </div>
            </div>
          ) : profileTabId === 'capabilities' ? (
            <div className="flex flex-col gap-6 shrink-0" data-name="Capabilities view">
              <SectionHeader
                title={`${getCapabilitiesTotalCount(status)} Capabilities`}
                size="small"
                onAction={onOpenCapabilitiesEdit}
                actionLabel="Edit"
                actionIcon={<EditIcon size={12} />}
                actionVariant="ghost"
                tooltipPlacement="bottom"
              />
              <Accordion>
                <AccordionItem
                  title="Active"
                  tooltipLabel={CAPABILITY_STATUS_TOOLTIPS.Active}
                  tooltipId="drawer-cap-active-tooltip"
                  defaultExpanded
                >
                  <div className="flex flex-col gap-3">
                    {getActiveCapabilities(status).map((cap) => (
                      <div key={cap.id} className="flex items-center gap-2 min-w-0">
                        <span className="shrink-0 flex items-center justify-center" aria-hidden>
                          <Icon
                            name="checkCircleFilled"
                            size={12}
                            fill="var(--color-feedback-success-on)"
                          />
                        </span>
                        <p className="font-normal text-[14px] leading-5 tracking-[-0.15px] text-subdued min-w-0 truncate">
                          {cap.title}
                        </p>
                      </div>
                    ))}
                  </div>
                </AccordionItem>
                <AccordionItem
                  title="Paused"
                  tooltipLabel={CAPABILITY_STATUS_TOOLTIPS.Paused}
                  tooltipId="drawer-cap-paused-tooltip"
                  defaultExpanded
                >
                  <div className="flex flex-col gap-3">
                    {getPausedCapabilities(status).map((cap) => (
                      <div key={cap.id} className="flex items-center gap-2 min-w-0">
                        <span className="shrink-0 flex items-center justify-center" aria-hidden>
                          <PausedIcon />
                        </span>
                        <p className="font-normal text-[14px] leading-5 tracking-[-0.15px] text-subdued min-w-0 truncate">
                          {cap.title}
                        </p>
                      </div>
                    ))}
                  </div>
                </AccordionItem>
                <AccordionItem
                  title="Paused soon"
                  tooltipLabel={CAPABILITY_STATUS_TOOLTIPS['Paused soon']}
                  tooltipId="drawer-cap-paused-soon-tooltip"
                  defaultExpanded
                >
                  <div className="flex flex-col gap-3">
                    {getPausedSoonCapabilities(status).map((cap) => (
                      <div key={cap.id} className="flex items-center gap-2 min-w-0">
                        <span className="shrink-0 flex items-center justify-center" aria-hidden>
                          <PausedSoonIcon />
                        </span>
                        <p className="font-normal text-[14px] leading-5 tracking-[-0.15px] text-subdued min-w-0 truncate">
                          {cap.title}
                        </p>
                      </div>
                    ))}
                  </div>
                </AccordionItem>
                <AccordionItem
                  title="Inactive"
                  tooltipLabel={CAPABILITY_STATUS_TOOLTIPS.Inactive}
                  tooltipId="drawer-cap-inactive-tooltip"
                  defaultExpanded
                >
                  <div className="flex flex-col gap-3">
                    {getInactiveCapabilities(status).map((cap) => (
                      <div key={cap.id} className="flex items-center gap-2 min-w-0">
                        <span className="shrink-0 flex items-center justify-center" aria-hidden>
                          <InactiveIcon />
                        </span>
                        <p className="font-normal text-[14px] leading-5 tracking-[-0.15px] text-subdued min-w-0 truncate">
                          {cap.title}
                        </p>
                      </div>
                    ))}
                  </div>
                </AccordionItem>
              </Accordion>
            </div>
          ) : (
            <div className="flex flex-col gap-6 shrink-0" data-name="Profile sections">
              {/* Account information — no Edit button per design; Account risk block when showAccountRisk (Figma 1966:24837) */}
              <div className="flex flex-col gap-3 shrink-0">
                <SectionHeader title="Account information" size="small" />
                <PropertyList orientation="horizontal">
                  <PropertyListItem label="ID" value={ACCOUNT_INFORMATION.id} />
                  {showAccountRisk && accountId && (
                    <PropertyListItem
                      label="Account risk"
                      value={
                        <>
                          <p className="font-label-medium leading-5 tracking-[-0.15px]" style={{ color: 'var(--color-feedback-critical-on)' }}>
                            High
                          </p>
                          <Link
                            to={`/network/${accountId}/risk-analysis`}
                            className="font-label-medium text-subdued underline hover:text-default hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary rounded-[length:var(--radius-xsmall)] w-fit"
                            onClick={onClose}
                          >
                            View risk analysis
                          </Link>
                        </>
                      }
                    />
                  )}
                  <PropertyListItem label="Type" value={ACCOUNT_INFORMATION.type} />
                  <PropertyListItem label="Terms acceptance" value={ACCOUNT_INFORMATION.termsAcceptance} />
                  <PropertyListItem label="Terms agreement type" value={ACCOUNT_INFORMATION.termsAgreementType} />
                  <PropertyListItem label="Dashboard access" value={ACCOUNT_INFORMATION.dashboardAccess} />
                  <PropertyListItem label="Negative balance liability" value={ACCOUNT_INFORMATION.negativeBalanceLiability} />
                  <PropertyListItem label="Requirement collection" value={ACCOUNT_INFORMATION.requirementCollection} />
                  <PropertyListItem label="Fee payer" value={ACCOUNT_INFORMATION.feePayer} />
                </PropertyList>
              </div>
              <div className="flex flex-col gap-3 shrink-0">
                <SectionHeader
                  title="Contact information"
                  size="small"
                  onAction={onOpenEdit ? () => onOpenEdit('contact') : undefined}
                  actionLabel="Edit"
                  actionIcon={<EditIcon size={12} />}
                  actionVariant="ghost"
                  tooltipPlacement="bottom"
                />
                <PropertyList orientation="horizontal">
                  <PropertyListItem label="Doing business as" value={CONTACT_INFORMATION.doingBusinessAs} />
                  <PropertyListItem label="Email" value={CONTACT_INFORMATION.email} />
                  <PropertyListItem label="Website" value={CONTACT_INFORMATION.website} />
                  <PropertyListItem label="Privacy policy" value={CONTACT_INFORMATION.privacyPolicy} />
                  <PropertyListItem label="Support phone number" value={CONTACT_INFORMATION.supportPhoneNumber} />
                </PropertyList>
              </div>
              <div className="flex flex-col gap-3 shrink-0">
                <SectionHeader
                  title="Business details"
                  size="small"
                  onAction={onOpenEdit ? () => onOpenEdit('business') : undefined}
                  actionLabel="Edit"
                  actionIcon={<EditIcon size={12} />}
                  actionVariant="ghost"
                  tooltipPlacement="bottom"
                />
                <PropertyList orientation="horizontal">
                  <PropertyListItem label="Statement descriptor" value={BUSINESS_DETAILS.statementDescriptor} />
                  <PropertyListItem label="Country" value={BUSINESS_DETAILS.country} />
                  <PropertyListItem label="Business type" value={BUSINESS_DETAILS.businessType} />
                  <PropertyListItem label="Industry" value={BUSINESS_DETAILS.industry} />
                  <PropertyListItem label="MCC" value={BUSINESS_DETAILS.mcc} />
                </PropertyList>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return createPortal(drawer, document.body)
}
