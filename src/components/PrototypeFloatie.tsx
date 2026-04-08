/**
 * PrototypeFloatie — Configure account modal (UAD composition). Trigger lives on AccountDetail.
 */

import { Fragment, useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import ChevronDownIcon from '../icons/ChevronDownIcon'
import { Icon } from '../icons/SailIcons'
import { PillBadge } from './PillBadge'
import { usePrototypeOptional } from '../context/PrototypeContext'
import {
  BILLING_FLAVOR_LABELS,
  COMPLIANCE_ROLES,
  type AccountRoleId,
  type BillingFlavor,
  type CapabilityGroupId,
  type CapabilityStatus,
  type RelationshipFlags,
  type RiskLevel,
} from '../data/configMatrix'
import {
  capabilityGroupsWithStatus,
  deriveAccountStatus,
  resolveCapabilityGroups,
} from '../data/uadVisibility'

const ROLE_LABELS: Record<AccountRoleId, string> = {
  merchant: 'Merchant',
  customer: 'Customer',
  recipient: 'Recipient',
  storer: 'Storer',
  borrower: 'Borrower',
  issuer: 'Issuer',
}

/** Figma row order: Merchant, Customer, Recipient, Storer, Borrower, Issuer */
const PILL_ROLE_ORDER: AccountRoleId[] = [
  'merchant',
  'customer',
  'recipient',
  'storer',
  'borrower',
  'issuer',
]

const CAPABILITY_GROUP_LABELS: Record<CapabilityGroupId, string> = {
  payments: 'Payments',
  payouts: 'Payouts',
  transfers: 'Transfers',
  billing: 'Billing',
  treasury: 'Treasury',
  capital: 'Capital',
  issuing: 'Issuing',
}

const CAPABILITY_STATUS_OPTIONS: { id: CapabilityStatus; label: string }[] = [
  { id: 'active', label: 'Active' },
  { id: 'pausing_soon', label: 'Pausing Soon' },
  { id: 'limited', label: 'Limited' },
  { id: 'paused', label: 'Paused' },
]

const CAPABILITY_GROUP_ORDER: CapabilityGroupId[] = [
  'payments',
  'payouts',
  'transfers',
  'billing',
  'treasury',
  'capital',
  'issuing',
]

const SELECT_FIELD =
  'w-full rounded-[8px] border border-neutral-100 bg-surface py-2 pl-[12px] pr-[32px] text-[14px] leading-5 text-default shadow-none appearance-none focus:border-action-primary focus:outline-none focus:ring-1 focus:ring-action-primary [color-scheme:light]'

const BILLING_FLAVOR_OPTIONS: { id: BillingFlavor; label: string }[] = [
  { id: 'invoicing', label: BILLING_FLAVOR_LABELS.invoicing },
  { id: 'subscriptions', label: BILLING_FLAVOR_LABELS.subscriptions },
  { id: 'metered_billing', label: BILLING_FLAVOR_LABELS.metered_billing },
]

const RISK_LEVEL_OPTIONS: { id: RiskLevel; label: string }[] = [
  { id: 'low', label: 'Low' },
  { id: 'elevated', label: 'Elevated' },
  { id: 'high', label: 'High' },
]

const DEFAULT_RELATIONSHIP_DRAFT: RelationshipFlags = {
  hasActiveSubscriptions: false,
  hasIssuedCard: false,
  expiredPaymentMethod: false,
}

function hasComplianceRole(roles: Set<AccountRoleId>): boolean {
  return [...roles].some((r) => COMPLIANCE_ROLES.includes(r))
}

function cloneRoleSet(roles: ReadonlySet<AccountRoleId>): Set<AccountRoleId> {
  return new Set(roles)
}

function cloneCapabilityStatuses(
  src: Record<CapabilityGroupId, CapabilityStatus>
): Record<CapabilityGroupId, CapabilityStatus> {
  return { ...src }
}

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

function CharcoalSwitch({
  checked,
  onChange,
  id,
  className = '',
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  id: string
  className?: string
}) {
  return (
    <label
      htmlFor={id}
      className={`relative inline-flex h-5 w-8 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-within:ring-2 focus-within:ring-action-primary focus-within:ring-offset-1${className ? ` ${className}` : ''}`}
      role="presentation"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
        role="switch"
        aria-checked={checked}
      />
      <span className="block h-5 w-8 rounded-full bg-neutral-100 transition-colors peer-checked:bg-[#1a1d21]" />
      <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-3" />
    </label>
  )
}

type PrototypeFloatieProps = {
  open: boolean
  onClose: () => void
}

export default function PrototypeFloatie({ open, onClose }: PrototypeFloatieProps) {
  const prototype = usePrototypeOptional()

  const [pendingRoles, setPendingRoles] = useState<Set<AccountRoleId>>(() => new Set())
  const [pendingBilling, setPendingBilling] = useState(false)
  const [pendingBillingFlavors, setPendingBillingFlavors] = useState<Set<BillingFlavor>>(
    () => new Set()
  )
  const [draftCapabilityStatuses, setDraftCapabilityStatuses] = useState<
    Record<CapabilityGroupId, CapabilityStatus>
  >(() => ({} as Record<CapabilityGroupId, CapabilityStatus>))
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [pendingRiskLevel, setPendingRiskLevel] = useState<RiskLevel>('low')
  const [draftRelationship, setDraftRelationship] = useState<RelationshipFlags>(
    () => ({ ...DEFAULT_RELATIONSHIP_DRAFT })
  )

  useEffect(() => {
    if (!open) {
      setAdvancedOpen(false)
      return
    }
    if (!prototype) return
    setPendingRoles(cloneRoleSet(prototype.activeRoles))
    setPendingBilling(prototype.hasBilling)
    setPendingBillingFlavors(new Set(prototype.billingFlavors))
    setDraftCapabilityStatuses(cloneCapabilityStatuses(prototype.capabilityStatuses))
    setPendingRiskLevel(prototype.riskLevel)
    setDraftRelationship({ ...prototype.relationship })
  }, [open, prototype])

  const resolvedGroups = useMemo(() => {
    const g = resolveCapabilityGroups(pendingRoles, pendingBilling)
    return [...g].sort(
      (a, b) => CAPABILITY_GROUP_ORDER.indexOf(a) - CAPABILITY_GROUP_ORDER.indexOf(b)
    )
  }, [pendingRoles, pendingBilling])

  /** Compliance capabilities with status dropdowns (excludes billing — toggle only). */
  const statusCapabilityGroups = useMemo(
    () => capabilityGroupsWithStatus(resolvedGroups),
    [resolvedGroups]
  )

  const capabilityStatusesForDerive = useMemo(() => {
    const out = { ...draftCapabilityStatuses } as Record<CapabilityGroupId, CapabilityStatus>
    for (const g of statusCapabilityGroups) {
      if (out[g] == null) out[g] = 'active'
    }
    return out
  }, [draftCapabilityStatuses, statusCapabilityGroups])

  const derivedStatus = useMemo(
    () => deriveAccountStatus(capabilityStatusesForDerive, resolvedGroups),
    [capabilityStatusesForDerive, resolvedGroups]
  )

  const showComplianceSections = hasComplianceRole(pendingRoles)
  const showBillingToggle = pendingRoles.has('merchant')

  const updateDisabled =
    prototype == null ||
    pendingRoles.size === 0 ||
    (pendingBilling && pendingBillingFlavors.size === 0)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [open, onClose])

  const togglePendingRole = (id: AccountRoleId) => {
    setPendingRoles((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        if (next.size <= 1) return prev
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const setDraftStatus = (groupId: CapabilityGroupId, status: CapabilityStatus) => {
    setDraftCapabilityStatuses((prev) => ({ ...prev, [groupId]: status }))
  }

  const handleCancel = () => {
    onClose()
  }

  const handleUpdate = () => {
    if (!prototype || pendingRoles.size === 0) return
    if (pendingBilling && pendingBillingFlavors.size === 0) return
    prototype.applyActiveRoles(new Set(pendingRoles))
    prototype.setHasBilling(pendingBilling)
    prototype.setBillingFlavors(pendingBilling ? new Set(pendingBillingFlavors) : new Set())
    for (const g of capabilityGroupsWithStatus(
      resolveCapabilityGroups(pendingRoles, pendingBilling)
    )) {
      prototype.setCapabilityStatus(g, draftCapabilityStatuses[g] ?? 'active')
    }
    prototype.setRiskLevel(pendingRiskLevel)
    prototype.setRelationship({ ...draftRelationship })
    onClose()
  }

  const accountStatusBadge = (() => {
    if (derivedStatus === null) return null
    if (derivedStatus === 'restricted') {
      return <PillBadge label="Restricted" variant="critical" />
    }
    if (derivedStatus === 'restricted_soon') {
      return <PillBadge label="Restricted soon" variant="attention" />
    }
    return <PillBadge label="Enabled" variant="success" />
  })()

  if (!open) return null

  const hasContext = prototype != null

  const modal = (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-6"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="absolute inset-0 bg-[rgba(26,27,37,0.45)]" aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="configure-modal-title"
        className="relative z-[1] flex h-[min(90vh,640px)] w-full max-w-[640px] flex-col overflow-hidden rounded-[8px] bg-surface shadow-[0px_15px_35px_rgba(48,49,61,0.08),0px_5px_15px_rgba(0,0,0,0.12)]"
        data-name="PrototypeConfigureModal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 flex-col gap-4 border-b border-neutral-100 p-4">
          <div className="flex items-start gap-1">
            <h2
              id="configure-modal-title"
              className="min-h-[28px] flex-1 font-label-medium-emphasized text-[16px] leading-6 tracking-[-0.31px] text-default"
            >
              Configure account
            </h2>
            <button
              type="button"
              onClick={handleCancel}
              className="flex size-7 shrink-0 items-center justify-center rounded-[6px] text-icon-default transition-colors hover:bg-offset focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary"
              aria-label="Close"
            >
              <CloseIcon size={12} />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
          {!hasContext ? (
            <p className="px-4 pb-4 text-[14px] leading-5 text-subdued">
              Unavailable. Refresh the page.
            </p>
          ) : (
            <>
              <div className="flex flex-nowrap gap-2 overflow-x-auto p-4">
                {PILL_ROLE_ORDER.map((id) => {
                  const selected = pendingRoles.has(id)
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => togglePendingRole(id)}
                      className={`relative shrink-0 rounded-[8px] px-3 py-2 text-[14px] leading-5 tracking-[-0.15px] shadow-none transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary ${
                        selected
                          ? 'border-2 border-[#353a44] bg-white font-label-medium-emphasized text-default'
                          : 'border border-neutral-50 bg-white font-label-medium text-subdued'
                      }`}
                    >
                      {ROLE_LABELS[id]}
                    </button>
                  )
                })}
              </div>

              {showComplianceSections && (
                <>
                  <p className="m-0 px-4 py-2 font-label-medium-emphasized text-[14px] leading-5 tracking-[-0.15px] text-subdued">
                    Capability status
                  </p>
                  {statusCapabilityGroups.map((groupId, i) => (
                    <Fragment key={groupId}>
                      <label
                        htmlFor={`configure-cap-${groupId}`}
                        className={`mb-1 block px-4 font-label-medium text-[14px] leading-5 tracking-[-0.15px] text-default ${i === 0 ? 'pt-0' : 'pt-2'}`}
                      >
                        {CAPABILITY_GROUP_LABELS[groupId]}
                      </label>
                      <span className="relative mx-4 mb-2 block max-w-[240px]">
                        <select
                          id={`configure-cap-${groupId}`}
                          value={draftCapabilityStatuses[groupId] ?? 'active'}
                          onChange={(e) =>
                            setDraftStatus(groupId, e.target.value as CapabilityStatus)
                          }
                          className={SELECT_FIELD}
                        >
                          {CAPABILITY_STATUS_OPTIONS.map((o) => (
                            <option key={o.id} value={o.id}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDownIcon
                          size={8}
                          fill="var(--color-icon-subdued)"
                          className="pointer-events-none absolute right-[12px] top-1/2 -translate-y-1/2"
                          aria-hidden
                        />
                      </span>
                    </Fragment>
                  ))}
                  {showBillingToggle && (
                    <>
                      <span className="flex max-w-[240px] items-start gap-2 px-4 py-2">
                        <CharcoalSwitch
                          id="configure-uses-billing"
                          checked={pendingBilling}
                          onChange={(on) => {
                            setPendingBilling(on)
                            if (!on) setPendingBillingFlavors(new Set())
                          }}
                          className="mt-px"
                        />
                        <label
                          htmlFor="configure-uses-billing"
                          className="cursor-pointer font-label-medium text-[14px] leading-5 tracking-[-0.15px] text-default"
                        >
                          Uses Billing
                        </label>
                      </span>
                      {pendingBilling && (
                        <div
                          className="flex flex-wrap items-start gap-x-5 gap-y-2 pb-2 pl-[58px] pr-4"
                          role="group"
                          aria-label="Billing flavors"
                        >
                          {BILLING_FLAVOR_OPTIONS.map(({ id: flavorId, label }) => (
                            <label
                              key={flavorId}
                              className="flex cursor-pointer items-start gap-2 font-label-medium text-[14px] leading-5 tracking-[-0.15px] text-default"
                            >
                              <input
                                type="checkbox"
                                checked={pendingBillingFlavors.has(flavorId)}
                                onChange={() => {
                                  setPendingBillingFlavors((prev) => {
                                    const next = new Set(prev)
                                    if (next.has(flavorId)) next.delete(flavorId)
                                    else next.add(flavorId)
                                    return next
                                  })
                                }}
                                className="mt-[3px] h-3.5 w-3.5 shrink-0 rounded-[4px] border border-neutral-100 text-action-primary focus:ring-action-primary"
                              />
                              {label}
                            </label>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              {showComplianceSections && accountStatusBadge != null && (
                <>
                  <p className="m-0 px-4 pt-4 font-label-medium-emphasized text-[14px] leading-5 tracking-[-0.15px] text-default">
                    Account status
                  </p>
                  <span className="mx-4 mb-4 mt-1 inline-flex flex-wrap items-center gap-1">
                    {accountStatusBadge}
                    {pendingRiskLevel === 'elevated' && (
                      <PillBadge label="Elevated risk" variant="attention" />
                    )}
                    {pendingRiskLevel === 'high' && (
                      <PillBadge label="High risk" variant="critical" />
                    )}
                  </span>
                </>
              )}

              {advancedOpen && (
                <div
                  id="configure-advanced-panel"
                  className="border-t border-neutral-100 px-4 pb-4 pt-4"
                  role="region"
                  aria-label="Advanced settings"
                >
                  <div className="flex max-w-[240px] flex-col gap-1 py-2">
                    <label
                      htmlFor="configure-risk-level"
                      className="font-label-medium text-[14px] leading-5 tracking-[-0.15px] text-default"
                    >
                      Risk level
                    </label>
                    <span className="relative block w-full max-w-[240px]">
                      <select
                        id="configure-risk-level"
                        value={pendingRiskLevel}
                        onChange={(e) => setPendingRiskLevel(e.target.value as RiskLevel)}
                        className={SELECT_FIELD}
                      >
                        {RISK_LEVEL_OPTIONS.map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDownIcon
                        size={8}
                        fill="var(--color-icon-subdued)"
                        className="pointer-events-none absolute right-[12px] top-1/2 -translate-y-1/2"
                        aria-hidden
                      />
                    </span>
                  </div>

                  <p className="m-0 px-0 py-2 font-label-medium-emphasized text-[14px] leading-5 tracking-[-0.15px] text-subdued">
                    Relationship with your Platform
                  </p>
                  <div className="flex flex-col gap-0">
                    <span className="flex max-w-[min(100%,400px)] items-start gap-2 px-0 py-2">
                      <CharcoalSwitch
                        id="configure-rel-subs"
                        checked={draftRelationship.hasActiveSubscriptions}
                        onChange={(v) =>
                          setDraftRelationship((r) => ({ ...r, hasActiveSubscriptions: v }))
                        }
                        className="mt-px"
                      />
                      <label
                        htmlFor="configure-rel-subs"
                        className="cursor-pointer font-label-medium text-[14px] leading-5 tracking-[-0.15px] text-default"
                      >
                        Has active subscriptions with Platform
                      </label>
                    </span>
                    <span className="flex max-w-[min(100%,400px)] items-start gap-2 px-0 py-2">
                      <CharcoalSwitch
                        id="configure-rel-card"
                        checked={draftRelationship.hasIssuedCard}
                        onChange={(v) =>
                          setDraftRelationship((r) => ({ ...r, hasIssuedCard: v }))
                        }
                        className="mt-px"
                      />
                      <label
                        htmlFor="configure-rel-card"
                        className="cursor-pointer font-label-medium text-[14px] leading-5 tracking-[-0.15px] text-default"
                      >
                        Has issued card with Platform
                      </label>
                    </span>
                    <span className="flex max-w-[min(100%,400px)] items-start gap-2 px-0 py-2">
                      <CharcoalSwitch
                        id="configure-rel-expired"
                        checked={draftRelationship.expiredPaymentMethod}
                        onChange={(v) =>
                          setDraftRelationship((r) => ({ ...r, expiredPaymentMethod: v }))
                        }
                        className="mt-px"
                      />
                      <label
                        htmlFor="configure-rel-expired"
                        className="cursor-pointer font-label-medium text-[14px] leading-5 tracking-[-0.15px] text-default"
                      >
                        Expired default payment method with Platform
                      </label>
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-4 border-t border-neutral-100 p-4">
          {hasContext ? (
            <button
              type="button"
              onClick={() => setAdvancedOpen((o) => !o)}
              className="inline-flex items-center gap-1 rounded-[4px] font-label-medium text-[14px] leading-5 text-action-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary"
              aria-expanded={advancedOpen}
              aria-controls={advancedOpen ? 'configure-advanced-panel' : undefined}
            >
              <Icon name="settings" size={12} fill="var(--color-action-primary)" />
              {advancedOpen ? 'Hide advanced settings' : 'Show advanced settings'}
            </button>
          ) : (
            <span aria-hidden className="min-w-0 shrink" />
          )}
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex h-7 items-center justify-center rounded-[6px] border border-neutral-100 bg-surface px-2 py-1 font-label-medium-emphasized text-[14px] leading-5 text-default shadow-[0px_1px_1px_rgba(26,27,37,0.16)] transition-colors hover:bg-offset focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={updateDisabled}
              onClick={handleUpdate}
              className="inline-flex h-7 items-center justify-center rounded-[6px] border border-[#625afa] bg-[var(--color-icon-action)] px-2 py-1 font-label-medium-emphasized text-[14px] leading-5 text-white shadow-[0px_1px_1px_rgba(20,19,78,0.32)] transition-colors hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
