/**
 * Account drawer — Figma 16:6868.
 * Half-screen panel docked 16px from right, top, and bottom. No scrim.
 * Close via X button or click outside panel.
 */

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ExternalLinkIcon } from '../icons/ExternalLinkIcon'
import ChevronDownIcon from '../icons/ChevronDownIcon'
import CapabilityStatusIcon from '../icons/CapabilityStatusIcon'
import type { AccountStatusKind } from './AccountDetailsSidebar'
import { IconButton } from './IconButton'
import { PillBadge } from './PillBadge'
import { CAPABILITY_STATUS_DISPLAY_LABELS } from '../data/configMatrix'
import type { CapabilityDrawerGroupRow } from '../data/capabilityDrawerModel'

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
  /** Unified “Capabilities” side panel (Figma 249:142275) — accordion per signal group. */
  variant?: 'account' | 'payment-details' | 'invoice-details' | 'product-details' | 'capability-group'
  /** When `variant` is `capability-group`, rows from prototype (empty → skeleton). */
  capabilityDrawerGroups?: CapabilityDrawerGroupRow[]
  /** Accordion to expand and scroll into view (matches chip `panelId`). */
  capabilityDrawerFocusedPanelId?: string | null
  /** Called when Edit is clicked (Account profile / Business representatives in Settings). */
  onOpenEdit?: (section: ProfileEditSection) => void
  /** Called when Edit is clicked on Capabilities section header. Opens Settings modal to Capabilities. */
  onOpenCapabilitiesEdit?: () => void
  /**
   * Legacy: profile drawer no longer has tabs; value is ignored.
   * Kept so call sites (e.g. `openAccountDrawer({ profileTab })`) stay type-stable.
   */
  initialProfileTabId?: ProfileDrawerTabId
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

/** Placeholder rows for header capability group side panel (prototype). */
const CAPABILITY_GROUP_DETAIL_SKELETON_LABELS = [
  'Status',
  'Requirements',
  'Capabilities',
  'Products',
  'Last reviewed',
  'Support',
] as const

/** Details tab — placeholder rows until profile data is wired (matches Capabilities panel density). */
const PROFILE_DETAIL_SKELETON_LABELS = [
  'Account ID',
  'Type',
  'Terms acceptance',
  'Dashboard access',
  'Email',
  'Doing business as',
  'Country',
  'Business type',
  'Industry',
  'MCC',
] as const

export type ProfileDrawerTabId = 'details' | 'configurations' | 'capabilities'

const OBJECT_DETAIL_PAGE_URL =
  'data:text/html;charset=utf-8,' +
  encodeURIComponent('<!DOCTYPE html><html><body><p>[object detail page]</p></body></html>')

function CapabilityGranularChip({ children }: { children: string }) {
  return (
    <span className="inline-flex max-w-full items-center rounded-full py-0.5 pl-0.5 pr-2 font-label-medium leading-5 text-[#50617a]">
      {children}
    </span>
  )
}

export default function AccountDrawer({
  open,
  onClose,
  status,
  showAccountRisk = false,
  accountId,
  variant = 'account',
  onOpenEdit,
  onOpenCapabilitiesEdit,
  initialProfileTabId: _initialProfileTabId,
  capabilityDrawerGroups = [],
  capabilityDrawerFocusedPanelId = null,
}: AccountDrawerProps) {
  void _initialProfileTabId
  const [expandedCapabilityPanelIds, setExpandedCapabilityPanelIds] = useState<Set<string>>(
    () => new Set()
  )
  const capabilityScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open || variant !== 'capability-group') return
    if (capabilityDrawerFocusedPanelId != null) {
      setExpandedCapabilityPanelIds((prev) => {
        const next = new Set(prev)
        next.add(capabilityDrawerFocusedPanelId)
        return next
      })
    }
  }, [open, variant, capabilityDrawerFocusedPanelId])

  useLayoutEffect(() => {
    if (!open || variant !== 'capability-group' || capabilityDrawerFocusedPanelId == null) return
    requestAnimationFrame(() => {
      document
        .getElementById(`capability-drawer-section-${capabilityDrawerFocusedPanelId}`)
        ?.scrollIntoView({ block: 'start', behavior: 'smooth' })
    })
  }, [open, variant, capabilityDrawerFocusedPanelId, expandedCapabilityPanelIds])
  const isPaymentDetails = variant === 'payment-details'
  const isInvoiceDetails = variant === 'invoice-details'
  const isProductDetails = variant === 'product-details'
  const isCapabilityGroupDetails = variant === 'capability-group'
  const isProfilePanel = variant === 'account'
  const isAccountProfileLayout = isCapabilityGroupDetails || isProfilePanel
  const isDetailsVariant =
    isPaymentDetails || isInvoiceDetails || isProductDetails || isCapabilityGroupDetails
  const showObjectDetailLink = isPaymentDetails || isInvoiceDetails || isProductDetails
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
  const title = isCapabilityGroupDetails
    ? 'Capabilities'
    : isProductDetails
      ? 'Product details'
      : isInvoiceDetails
        ? 'Invoice details'
        : isPaymentDetails
          ? 'Payment details'
          : 'Account profile'
  const ariaLabel = isCapabilityGroupDetails
    ? 'Capabilities'
    : isProductDetails
      ? 'Product details'
      : isInvoiceDetails
        ? 'Invoice details'
        : isPaymentDetails
          ? 'Payment details'
          : 'Account profile'

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
        className={`fixed right-4 top-4 bottom-4 w-[50%] min-w-[320px] max-w-[560px] flex flex-col overflow-hidden rounded-[16px] bg-surface py-5 shadow-[0px_50px_100px_0px_rgba(48,49,61,0.08),0px_15px_35px_0px_rgba(48,49,61,0.08),0px_5px_15px_0px_rgba(0,0,0,0.12)] ${
          isAccountProfileLayout ? 'px-4' : 'px-6'
        }`}
        data-name="baby/card/prop-list_vertical"
        data-node-id={isAccountProfileLayout ? '249:142481' : '16:6869'}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`flex shrink-0 w-full items-center justify-between gap-2 pb-4 ${isAccountProfileLayout ? 'px-2' : ''}`}
          data-node-id={isAccountProfileLayout ? '249:142678' : '16:6870'}
        >
          <div className="flex min-w-0 flex-1 items-center gap-1.5" data-node-id="16:6965">
            <p
              className={`shrink-0 font-semibold tracking-0 text-default ${
                isAccountProfileLayout
                  ? 'text-[20px] leading-7'
                  : 'text-[18px] leading-[26px]'
              }`}
            >
              {title}
            </p>
            {badge}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {isProfilePanel && onOpenEdit != null && (
              <button
                type="button"
                className="inline-flex min-h-7 shrink-0 items-center justify-center gap-1.5 rounded-md border border-neutral-100 bg-surface px-2 py-1 font-label-medium-emphasized text-default transition-colors hover:bg-offset focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2"
                onClick={() => onOpenEdit('contact')}
              >
                Edit
              </button>
            )}
            {isCapabilityGroupDetails && onOpenCapabilitiesEdit != null && (
              <button
                type="button"
                className="inline-flex min-h-7 shrink-0 items-center justify-center gap-1.5 rounded-md border border-neutral-100 bg-surface px-2 py-1 font-label-medium-emphasized text-default transition-colors hover:bg-offset focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2"
                onClick={() => {
                  onOpenCapabilitiesEdit()
                }}
              >
                Edit
              </button>
            )}
            {!isProfilePanel && showObjectDetailLink && (
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
        {/* Content */}
        <div
          ref={isCapabilityGroupDetails ? capabilityScrollRef : undefined}
          className={`flex min-h-0 flex-1 flex-col overflow-auto ${isAccountProfileLayout ? 'gap-2' : 'gap-4'}`}
          data-name="Subs"
          data-node-id={isAccountProfileLayout ? '249:142489' : '16:6880'}
        >
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
          ) : isCapabilityGroupDetails ? (
            capabilityDrawerGroups.length === 0 ? (
              <div className="flex flex-col gap-3 shrink-0" data-name="Capability group placeholder">
                {CAPABILITY_GROUP_DETAIL_SKELETON_LABELS.map((label) => (
                  <SkeletonPropRow key={label} label={label} />
                ))}
              </div>
            ) : (
              <div className="flex min-w-0 flex-col gap-2" data-name="Grid" data-node-id="249:142490">
                {capabilityDrawerGroups.map((row) => {
                  const expanded = expandedCapabilityPanelIds.has(row.panelId)
                  const sectionsWithLabels = row.sections.filter(
                    (s) => s.labels.length > 0
                  )
                  const distinctSectionStatuses = new Set(
                    sectionsWithLabels.map((s) => s.sectionStatus)
                  )
                  const capabilitySectionStatusMixed =
                    distinctSectionStatuses.size > 1

                  return (
                    <div
                      key={row.panelId}
                      id={`capability-drawer-section-${row.panelId}`}
                      className="flex min-w-0 flex-col"
                    >
                      <button
                        type="button"
                        className="flex w-full min-w-0 items-center gap-2 rounded-md py-1 pl-2 pr-1 text-left transition-colors hover:bg-offset"
                        aria-expanded={expanded}
                        data-name="PresetList item"
                        data-node-id="249:142491"
                        onClick={() =>
                          setExpandedCapabilityPanelIds((prev) => {
                            const next = new Set(prev)
                            if (next.has(row.panelId)) next.delete(row.panelId)
                            else next.add(row.panelId)
                            return next
                          })
                        }
                      >
                        <span className="inline-flex shrink-0" aria-hidden>
                          <CapabilityStatusIcon status={row.headerStatus} size={12} />
                        </span>
                        <span className="min-w-0 flex-1 font-semibold text-[16px] leading-6 tracking-[-0.31px] text-default">
                          {row.title}
                          {row.totalCount > 0 ? (
                            <span className="font-normal text-[14px] leading-5 tracking-[-0.15px] text-[#50617a]">
                              {' '}
                              {row.totalCount}
                            </span>
                          ) : null}
                        </span>
                        <span
                          className="flex h-8 w-4 shrink-0 items-center justify-center text-icon-subdued"
                          aria-hidden
                          data-name="Container"
                        >
                          <ChevronDownIcon
                            size={8}
                            fill="currentColor"
                            className={`shrink-0 transition-transform ${expanded ? '' : 'rotate-[-90deg]'}`}
                          />
                        </span>
                      </button>
                      {expanded ? (
                        <div
                          className="flex min-w-0 flex-col gap-3 pt-1 pl-2 pr-4"
                          data-name="Property List item"
                          data-node-id="249:142496"
                        >
                          {row.sections.every((s) => s.labels.length === 0) ? (
                            <p className="m-0 pl-5 font-label-small leading-4 text-subdued">
                              No capability items for this group.
                            </p>
                          ) : (
                            row.sections.map((section, sidx) => {
                              if (section.labels.length === 0) return null
                              const showSectionStatusRow =
                                capabilitySectionStatusMixed ||
                                section.sectionStatus !== row.headerStatus
                              return (
                                <div
                                  key={`${row.panelId}-${section.sectionStatus}-${sidx}`}
                                  className="flex flex-col gap-1"
                                >
                                  {showSectionStatusRow ? (
                                    <div className="flex items-center gap-2">
                                      <span className="inline-flex shrink-0" aria-hidden>
                                        <CapabilityStatusIcon
                                          status={section.sectionStatus}
                                          size={12}
                                        />
                                      </span>
                                      <p className="m-0 min-w-0 flex-1 truncate font-label-medium-emphasized text-[14px] leading-5 tracking-[-0.15px] text-default">
                                        {
                                          CAPABILITY_STATUS_DISPLAY_LABELS[
                                            section.sectionStatus
                                          ]
                                        }
                                      </p>
                                    </div>
                                  ) : null}
                                  <div className="flex flex-col items-start gap-1 pl-5">
                                    {section.labels.map((label, li) => (
                                      <CapabilityGranularChip
                                        key={`${row.panelId}-${section.sectionStatus}-${sidx}-${li}`}
                                      >
                                        {label}
                                      </CapabilityGranularChip>
                                    ))}
                                  </div>
                                </div>
                              )
                            })
                          )}
                        </div>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            )
          ) : (
            <div className="flex flex-col gap-3 shrink-0" data-name="Account profile placeholder">
              {PROFILE_DETAIL_SKELETON_LABELS.map((label) => (
                <SkeletonPropRow key={label} label={label} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return createPortal(drawer, document.body)
}
