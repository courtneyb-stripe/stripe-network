/**
 * PrototypeFloatie — Configure account modal (UAD composition). Trigger lives on AccountDetail.
 */

import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import ChevronDownIcon from '../icons/ChevronDownIcon'
import { Icon } from '../icons/SailIcons'
import { PillBadge } from './PillBadge'
import { usePrototypeOptional } from '../context/PrototypeContext'
import {
  CAPABILITY_GROUP_DISPLAY_LABELS,
  CAPABILITY_GROUP_DISPLAY_ORDER,
  CAPABILITY_GROUP_SINGLE_SIGNAL,
  COMPLIANCE_ROLES,
  CONFIGURE_ROLE_DISPLAY_LABELS,
  CONFIGURE_ROLE_PILL_ORDER,
  ROLE_AUTO_SELECT,
  SIGNAL_GROUP_DEFAULTS,
  type AccountRoleId,
  type BillingFlavor,
  type CapabilityGroupId,
  type CapabilityStatus,
  type RelationshipFlags,
  type RiskLevel,
} from '../data/configMatrix'
import {
  canConfigurePayoutSchedule,
  capabilityGroupsWithStatus,
  deriveAccountStatus,
  resolveCapabilityGroups,
  signalGroupsForConfigureModal,
} from '../data/uadVisibility'
import {
  replacePrototypeUrlSearch,
  serializePrototypeStateToSearchString,
} from '../data/prototypeUrlState'

const ROLE_LABELS = CONFIGURE_ROLE_DISPLAY_LABELS

/** Role pill order */
const PILL_ROLE_ORDER = CONFIGURE_ROLE_PILL_ORDER

/** Real borders only (no inset box-shadow) — same 2px box on every pill; only `border-color` changes. Avoids WebKit/subpixel glitches that can hit one chip in a row. */
const ROLE_PILL_BASE =
  'relative shrink-0 rounded-[8px] border-2 border-solid bg-white px-3 py-2 font-label-medium text-[14px] leading-5 tracking-[-0.15px] transition-[color,border-color] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-action-primary)]'

const CAPABILITY_GROUP_LABELS = CAPABILITY_GROUP_DISPLAY_LABELS

const CAPABILITY_STATUS_OPTIONS: { id: CapabilityStatus; label: string }[] = [
  { id: 'active', label: 'Active' },
  { id: 'pausing_soon', label: 'Pausing Soon' },
  { id: 'limited', label: 'Limited' },
  { id: 'paused', label: 'Paused' },
]

function capabilityStatusOptionsForGroup(
  groupId: CapabilityGroupId
): { id: CapabilityStatus; label: string }[] {
  if (CAPABILITY_GROUP_SINGLE_SIGNAL.has(groupId)) {
    return CAPABILITY_STATUS_OPTIONS.filter((o) => o.id !== 'limited')
  }
  return CAPABILITY_STATUS_OPTIONS
}

function normalizeCapabilityStatusesForDraft(
  src: Record<CapabilityGroupId, CapabilityStatus>
): Record<CapabilityGroupId, CapabilityStatus> {
  const next = { ...src }
  for (const g of CAPABILITY_GROUP_SINGLE_SIGNAL) {
    if (next[g] === 'limited') next[g] = 'active'
  }
  return next
}

const CAPABILITY_GROUP_ORDER = CAPABILITY_GROUP_DISPLAY_ORDER

const SELECT_FIELD =
  'w-full rounded-[8px] border border-neutral-100 bg-surface py-2 pl-[12px] pr-[32px] text-[14px] leading-5 text-default shadow-none appearance-none focus:border-action-primary focus:outline-none focus:ring-1 focus:ring-action-primary [color-scheme:light]'

const GROUP_SUBHEAD_CLASS = 'text-[13px] font-medium leading-5 text-subdued'

/**
 * When false, Configure hides most product-detail prototype toggles (payout schedule, billing/subs,
 * financial accounts, capital, card program). Payment method on file + expired stay visible for
 * Merchant (Payments) and Customer (relationship Payments row). Capability group status dropdowns stay.
 */
const SHOW_CONFIGURE_PRODUCT_DETAIL_TOGGLES = false

/** Muted body copy (configure empty-state hints). */
const PLACEHOLDER_BODY_CLASS =
  'm-0 max-w-[400px] text-[13px] font-normal leading-5 text-[color:var(--color-text-subdued,#687385)]'

const SECTION_HEADING_CLASS =
  'm-0 px-4 pt-4 font-label-medium-emphasized text-[14px] leading-5 tracking-[-0.15px] text-default'

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

/** Storer implies Recipient — keep invariant when loading draft roles. */
function ensureStorerRequiresRecipient(roles: ReadonlySet<AccountRoleId>): Set<AccountRoleId> {
  const next = new Set(roles)
  if (next.has('storer')) next.add('recipient')
  return next
}

/** Issuer is not a selectable pill; Card Issuing is tied to Card issuer only — strip legacy issuer from role sets. */
function rolesForPrototypeUi(roles: ReadonlySet<AccountRoleId>): Set<AccountRoleId> {
  const next = ensureStorerRequiresRecipient(new Set(roles))
  next.delete('issuer')
  return ensureStorerRequiresRecipient(next)
}

function cloneCapabilityStatuses(
  src: Record<CapabilityGroupId, CapabilityStatus>
): Record<CapabilityGroupId, CapabilityStatus> {
  return { ...src }
}

function isCustomerOnly(roles: ReadonlySet<AccountRoleId>): boolean {
  return roles.size === 1 && roles.has('customer')
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
  const [advancedPanelOpen, setAdvancedPanelOpen] = useState(false)
  const [pendingRiskLevel, setPendingRiskLevel] = useState<RiskLevel>('low')
  const [draftRelationship, setDraftRelationship] = useState<RelationshipFlags>(
    () => ({ ...DEFAULT_RELATIONSHIP_DRAFT })
  )
  const [draftPaymentMethodOnFile, setDraftPaymentMethodOnFile] = useState(true)
  const [draftPayoutSchedule, setDraftPayoutSchedule] = useState(true)
  const [draftFinancialAccounts, setDraftFinancialAccounts] = useState(true)
  const [draftBusinessFinancing, setDraftBusinessFinancing] = useState(true)
  const [draftFinancingLoan, setDraftFinancingLoan] = useState(true)
  const [draftFinancingCashAdvance, setDraftFinancingCashAdvance] = useState(false)
  const [draftParticipatesCardProgram, setDraftParticipatesCardProgram] = useState(false)
  const [draftTaxCapabilityStatus, setDraftTaxCapabilityStatus] = useState<CapabilityStatus>('active')

  /**
   * Stable snapshot of prototype fields we hydrate from — NOT the context object identity.
   * The Provider `value` object changes whenever any field updates; depending on `prototype`
   * in useEffect re-ran the sync on every context churn and caused a setState loop / stuck tab.
   */
  const prototypeSyncKey = prototype
    ? [
        [...prototype.activeRoles].sort().join(','),
        String(prototype.hasBilling),
        [...prototype.billingFlavors].sort().join(','),
        prototype.riskLevel,
        JSON.stringify(prototype.relationship),
        JSON.stringify(prototype.capabilityStatuses),
        prototype.taxCapabilityStatus,
        String(prototype.hasPaymentMethodOnFile),
        String(prototype.hasPayoutSchedule),
        String(prototype.hasFinancialAccounts),
      ].join('|')
    : ''

  const pendingRolesKey = [...pendingRoles].sort().join(',')

  useEffect(() => {
    if (!open) {
      setAdvancedPanelOpen(false)
      return
    }
    if (!prototype) return
    setPendingRoles(rolesForPrototypeUi(prototype.activeRoles))
    setPendingBilling(prototype.hasBilling)
    setPendingBillingFlavors(new Set(prototype.billingFlavors))
    setDraftCapabilityStatuses(
      normalizeCapabilityStatusesForDraft(cloneCapabilityStatuses(prototype.capabilityStatuses))
    )
    setPendingRiskLevel(prototype.riskLevel)
    setDraftRelationship({ ...prototype.relationship })
    setDraftPaymentMethodOnFile(prototype.hasPaymentMethodOnFile)
    setDraftPayoutSchedule(prototype.hasPayoutSchedule)
    setDraftFinancialAccounts(prototype.hasFinancialAccounts)
    const financingOn = !!SIGNAL_GROUP_DEFAULTS.borrower?.hasBusinessFinancing
    setDraftBusinessFinancing(financingOn)
    setDraftFinancingLoan(prototype.financingProducts.loan)
    setDraftFinancingCashAdvance(prototype.financingProducts.cashAdvance)
    setDraftParticipatesCardProgram(prototype.activeRoles.has('card_holder'))
    setDraftTaxCapabilityStatus(prototype.taxCapabilityStatus)
    // prototype intentionally omitted from deps — see prototypeSyncKey note above
  }, [open, prototypeSyncKey])

  useEffect(() => {
    if (!open) return
    if (pendingRoles.has('card_holder')) setDraftParticipatesCardProgram(true)
    else setDraftParticipatesCardProgram(false)
  }, [open, pendingRolesKey])

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
  /** Inserts a Payments row (PM toggles, optional status) when Customer is on without Merchant. */
  const configureGroupKeys = useMemo((): CapabilityGroupId[] => {
    const base = signalGroupsForConfigureModal(pendingRoles)
    if (pendingRoles.has('customer') && !pendingRoles.has('merchant') && !base.includes('payments')) {
      return ['payments', ...base]
    }
    return base
  }, [pendingRolesKey])
  const customerOnly = useMemo(() => isCustomerOnly(pendingRoles), [pendingRoles])

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
        if (id === 'recipient' && next.has('storer')) return prev
        if (next.size <= 1) return prev
        next.delete(id)
      } else {
        next.add(id)
        const auto = ROLE_AUTO_SELECT[id]
        if (auto) {
          for (const r of auto) next.add(r)
        }
      }
      return ensureStorerRequiresRecipient(next)
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
    const rolesToApply = rolesForPrototypeUi(pendingRoles)
    prototype.applyActiveRoles(rolesToApply)
    prototype.setHasBilling(pendingBilling)
    prototype.setBillingFlavors(pendingBilling ? new Set(pendingBillingFlavors) : new Set())
    for (const g of capabilityGroupsWithStatus(
      resolveCapabilityGroups(rolesToApply, pendingBilling)
    )) {
      let s = draftCapabilityStatuses[g] ?? 'active'
      if (CAPABILITY_GROUP_SINGLE_SIGNAL.has(g) && s === 'limited') s = 'active'
      prototype.setCapabilityStatus(g, s)
    }
    prototype.setRiskLevel(pendingRiskLevel)
    const relationshipApplied = {
      ...draftRelationship,
      expiredPaymentMethod: draftPaymentMethodOnFile ? draftRelationship.expiredPaymentMethod : false,
    }
    prototype.setRelationship(relationshipApplied)
    prototype.setFinancingProducts({
      loan: draftFinancingLoan,
      cashAdvance: draftFinancingCashAdvance,
    })
    prototype.setHasPaymentMethodOnFile(draftPaymentMethodOnFile)
    prototype.setHasPayoutSchedule(
      canConfigurePayoutSchedule(rolesToApply) ? draftPayoutSchedule : false
    )
    prototype.setHasFinancialAccounts(draftFinancialAccounts)
    prototype.setTaxCapabilityStatus(draftTaxCapabilityStatus)

    const resolvedCaps = capabilityGroupsWithStatus(
      resolveCapabilityGroups(rolesToApply, pendingBilling)
    )
    const capabilityStatusesSnapshot = {} as Record<CapabilityGroupId, CapabilityStatus>
    for (const g of resolvedCaps) {
      let s = draftCapabilityStatuses[g] ?? 'active'
      if (CAPABILITY_GROUP_SINGLE_SIGNAL.has(g) && s === 'limited') s = 'active'
      capabilityStatusesSnapshot[g] = s
    }

    replacePrototypeUrlSearch(
      serializePrototypeStateToSearchString({
        activeRoles: rolesToApply,
        capabilityStatuses: capabilityStatusesSnapshot,
        riskLevel: pendingRiskLevel,
        billingEnabled: pendingBilling,
        billingFlavors: pendingBilling ? new Set(pendingBillingFlavors) : new Set(),
        hasPaymentMethodOnFile: draftPaymentMethodOnFile,
        hasPayoutSchedule: canConfigurePayoutSchedule(rolesToApply) ? draftPayoutSchedule : false,
        hasFinancialAccounts: draftFinancialAccounts,
        financingProducts: {
          loan: draftFinancingLoan,
          cashAdvance: draftFinancingCashAdvance,
        },
        relationship: relationshipApplied,
      })
    )

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

  const renderCapabilityStatus = (groupId: CapabilityGroupId) => {
    const options = capabilityStatusOptionsForGroup(groupId)
    const raw = draftCapabilityStatuses[groupId] ?? 'active'
    const value =
      CAPABILITY_GROUP_SINGLE_SIGNAL.has(groupId) && raw === 'limited' ? 'active' : raw
    return (
    <div className="flex flex-col gap-1">
      <span className="text-[12px] leading-4 text-subdued">Capability group status</span>
      <span className="relative block w-full">
        <select
          id={`configure-cap-${groupId}`}
          value={value}
          onChange={(e) => setDraftStatus(groupId, e.target.value as CapabilityStatus)}
          className={SELECT_FIELD}
        >
          {options.map((o) => (
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
    )
  }

  const renderTaxCapabilityStatus = () => (
    <div className="flex w-full max-w-[240px] flex-col gap-1">
      <span className="text-[12px] leading-4 text-subdued">Tax capability group status</span>
      <span className="relative block w-full">
        <select
          id="configure-tax-capability"
          value={draftTaxCapabilityStatus}
          onChange={(e) => setDraftTaxCapabilityStatus(e.target.value as CapabilityStatus)}
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
    </div>
  )

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
        className="relative z-[1] flex h-[min(90vh,720px)] w-full max-w-[720px] flex-col overflow-hidden rounded-[8px] bg-surface shadow-[0px_15px_35px_rgba(48,49,61,0.08),0px_5px_15px_rgba(0,0,0,0.12)]"
        data-name="PrototypeConfigureModal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 flex-col gap-4 border-b border-neutral-100 p-4">
          <div className="flex items-center gap-1">
            <h2
              id="configure-modal-title"
              className="flex min-h-[28px] flex-1 items-center align-middle font-label-medium-emphasized text-[16px] !leading-[22px] tracking-[-0.31px] text-default"
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
                      data-state={selected ? 'selected' : 'default'}
                      onClick={() => togglePendingRole(id)}
                      className={`${ROLE_PILL_BASE} ${selected ? 'border-default text-default' : 'border-neutral-50 text-subdued'}`}
                    >
                      {ROLE_LABELS[id]}
                    </button>
                  )
                })}
              </div>

              {configureGroupKeys.length > 0 && (
                <div className="flex flex-col">
                    {configureGroupKeys.map((groupId) => (
                      <div
                        key={groupId}
                        className="border-b border-neutral-100 px-4 py-4 last:border-b-0"
                      >
                        <h3 className={GROUP_SUBHEAD_CLASS}>{CAPABILITY_GROUP_LABELS[groupId]}</h3>
                        <div className="mt-4 flex max-w-[240px] flex-col gap-3">
                          {groupId === 'payments' && (
                            <>
                              {customerOnly ? (
                                <p className={PLACEHOLDER_BODY_CLASS}>
                                  Customer configuration doesn&apos;t have any backing capabilities.
                                </p>
                              ) : null}
                              {pendingRoles.has('merchant') ? renderCapabilityStatus('payments') : null}
                              <span className="flex items-start gap-2">
                                <CharcoalSwitch
                                  id="configure-payments-pm"
                                  checked={draftPaymentMethodOnFile}
                                  onChange={(on) => {
                                    setDraftPaymentMethodOnFile(on)
                                    if (!on) {
                                      setDraftRelationship((r) => ({ ...r, expiredPaymentMethod: false }))
                                    }
                                  }}
                                  className="mt-px"
                                />
                                <label
                                  htmlFor="configure-payments-pm"
                                  className="cursor-pointer font-label-medium text-[14px] leading-5 tracking-[-0.15px] text-default"
                                >
                                  Has payment method on file
                                </label>
                              </span>
                              {draftPaymentMethodOnFile ? (
                                <label
                                  htmlFor="configure-payments-pm-expired"
                                  className="ml-10 flex w-max max-w-full cursor-pointer items-center gap-2 whitespace-nowrap font-label-medium text-[14px] leading-5 tracking-[-0.15px] text-default"
                                >
                                  <input
                                    id="configure-payments-pm-expired"
                                    type="checkbox"
                                    checked={draftRelationship.expiredPaymentMethod}
                                    onChange={(e) =>
                                      setDraftRelationship((r) => ({
                                        ...r,
                                        expiredPaymentMethod: e.target.checked,
                                      }))
                                    }
                                    className="h-3.5 w-3.5 shrink-0 rounded-[4px] border border-neutral-100 text-action-primary focus:ring-action-primary"
                                  />
                                  Default payment method is expired
                                </label>
                              ) : null}
                            </>
                          )}
                          {groupId === 'payouts' && (
                            <>
                              {renderCapabilityStatus('payouts')}
                              {SHOW_CONFIGURE_PRODUCT_DETAIL_TOGGLES &&
                              canConfigurePayoutSchedule(pendingRoles) ? (
                                <span className="flex items-start gap-2">
                                  <CharcoalSwitch
                                    id="configure-payouts-schedule"
                                    checked={draftPayoutSchedule}
                                    onChange={setDraftPayoutSchedule}
                                    className="mt-px"
                                  />
                                  <label
                                    htmlFor="configure-payouts-schedule"
                                    className="cursor-pointer font-label-medium text-[14px] leading-5 tracking-[-0.15px] text-default"
                                  >
                                    Has payout schedule
                                  </label>
                                </span>
                              ) : null}
                            </>
                          )}
                          {groupId === 'transfers' && renderCapabilityStatus('transfers')}
                          {groupId === 'treasury' && (
                            <>
                              {renderCapabilityStatus('treasury')}
                              {SHOW_CONFIGURE_PRODUCT_DETAIL_TOGGLES ? (
                                <span className="flex items-start gap-2">
                                  <CharcoalSwitch
                                    id="configure-treasury-fa"
                                    checked={draftFinancialAccounts}
                                    onChange={setDraftFinancialAccounts}
                                    className="mt-px"
                                  />
                                  <label
                                    htmlFor="configure-treasury-fa"
                                    className="cursor-pointer font-label-medium text-[14px] leading-5 tracking-[-0.15px] text-default"
                                  >
                                    Has Financial accounts
                                  </label>
                                </span>
                              ) : null}
                            </>
                          )}
                          {groupId === 'capital' && (
                            <>
                              {renderCapabilityStatus('capital')}
                              {SHOW_CONFIGURE_PRODUCT_DETAIL_TOGGLES ? (
                                <>
                                  <span className="flex items-start gap-2">
                                    <CharcoalSwitch
                                      id="configure-capital-fin"
                                      checked={draftBusinessFinancing}
                                      onChange={setDraftBusinessFinancing}
                                      className="mt-px"
                                    />
                                    <label
                                      htmlFor="configure-capital-fin"
                                      className="cursor-pointer font-label-medium text-[14px] leading-5 tracking-[-0.15px] text-default"
                                    >
                                      Has Capital
                                    </label>
                                  </span>
                                  {draftBusinessFinancing && (
                                    <div
                                      className="ml-4 flex flex-col gap-3 border-l border-neutral-100 pl-4"
                                      role="group"
                                      aria-label="Capital product types"
                                    >
                                      <label className="flex cursor-pointer items-start gap-2 font-label-medium text-[14px] leading-5 tracking-[-0.15px] text-default">
                                        <input
                                          type="checkbox"
                                          checked={draftFinancingLoan}
                                          onChange={() => setDraftFinancingLoan((v) => !v)}
                                          className="mt-[3px] h-3.5 w-3.5 shrink-0 rounded-[4px] border border-neutral-100 text-action-primary focus:ring-action-primary"
                                        />
                                        Loan
                                      </label>
                                      <label className="flex cursor-pointer items-start gap-2 font-label-medium text-[14px] leading-5 tracking-[-0.15px] text-default">
                                        <input
                                          type="checkbox"
                                          checked={draftFinancingCashAdvance}
                                          onChange={() => setDraftFinancingCashAdvance((v) => !v)}
                                          className="mt-[3px] h-3.5 w-3.5 shrink-0 rounded-[4px] border border-neutral-100 text-action-primary focus:ring-action-primary"
                                        />
                                        Cash advance
                                      </label>
                                    </div>
                                  )}
                                </>
                              ) : null}
                            </>
                          )}
                          {groupId === 'issuing' && (
                            <>
                              {renderCapabilityStatus('issuing')}
                              {SHOW_CONFIGURE_PRODUCT_DETAIL_TOGGLES ? (
                                <span className="flex items-start gap-2">
                                  <CharcoalSwitch
                                    id="configure-issuing-card"
                                    checked={draftParticipatesCardProgram}
                                    onChange={setDraftParticipatesCardProgram}
                                    className="mt-px"
                                  />
                                  <label
                                    htmlFor="configure-issuing-card"
                                    className="cursor-pointer font-label-medium text-[14px] leading-5 tracking-[-0.15px] text-default"
                                  >
                                    Participates in card program
                                  </label>
                                </span>
                              ) : null}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {!customerOnly && showComplianceSections && accountStatusBadge != null && (
                <>
                  <p className={`${SECTION_HEADING_CLASS} pb-2`}>Account status</p>
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

              {advancedPanelOpen && (
                <div
                  id="configure-advanced-settings-panel"
                  className="border-t border-neutral-100 px-4 pb-4 pt-4"
                  role="region"
                  aria-label="Advanced settings"
                >
                  <div className="flex min-w-0 flex-col gap-6">
                    {showComplianceSections ? renderTaxCapabilityStatus() : null}
                    <div className="flex max-w-[240px] flex-col gap-1">
                      <label
                        htmlFor="configure-risk-level"
                        className="font-label-medium text-[14px] leading-5 tracking-[-0.15px] text-default"
                      >
                        Risk
                      </label>
                      <span className="relative block w-full">
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
              onClick={() => setAdvancedPanelOpen((o) => !o)}
              className="inline-flex items-center gap-1 rounded-[4px] font-label-medium text-[14px] leading-5 text-action-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary"
              aria-expanded={advancedPanelOpen}
              aria-controls={
                advancedPanelOpen ? 'configure-advanced-settings-panel' : undefined
              }
            >
              <Icon name="settings" size={12} fill="var(--color-action-primary)" />
              {advancedPanelOpen ? 'Hide advanced' : 'Advanced'}
            </button>
          ) : (
            <span aria-hidden className="min-w-0 shrink" />
          )}
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex h-7 items-center justify-center rounded-[6px] border border-neutral-100 bg-surface px-2 py-1 font-label-medium-emphasized text-[14px] leading-5 text-default transition-colors hover:bg-offset focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={updateDisabled}
              onClick={handleUpdate}
              className="inline-flex h-7 items-center justify-center rounded-[6px] border border-[#625afa] bg-[var(--color-icon-action)] px-2 py-1 font-label-medium-emphasized text-[14px] leading-5 text-white transition-colors hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary disabled:cursor-not-allowed disabled:opacity-40"
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
