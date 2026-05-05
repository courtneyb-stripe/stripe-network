/**
 * AccountDetailActionBar — Figma Home actions (node 2:6375).
 * Payouts, Payments, Move money (with dropdown), More, Expand, Settings.
 * Label tooltips (Payouts/Payments) use Figma 13:6299 (Plain Tooltip). Use previous design (11:5804) for instructional copy.
 */

import { useState, useRef, useEffect, useMemo, useCallback, useLayoutEffect } from 'react'
import type { RefObject } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../icons/SailIcons'
import { ConvertIcon } from '../icons/ConvertIcon'
import ActionsRequiredModal from './ActionsRequiredModal'
import type { ActionsRequiredFilter } from './ActionsRequiredModal'

const MOVE_MONEY_OPTIONS = [
  'Send funds',
  'Add funds',
  'Transfer funds',
  'Create payment',
  'Issue refund',
] as const

const iconDefault = 'var(--color-icon-default)'

/** Red circle with white X — paused state (Icon/Feedback Critical). */
function PausedCircleIcon({ size = 12 }: { size?: number }) {
  return (
    <span className="shrink-0 inline-flex" aria-hidden>
      <svg width={size} height={size} viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="6" cy="6" r="6" fill="var(--color-icon-feedback-critical)" />
        <path d="M4 4l4 4M8 4l-4 4" stroke="white" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    </span>
  )
}

import { ActionButton } from './ActionButton'
import HeaderSignalGroupButton from './HeaderSignalGroupButton'
import SignalGroup from './SignalGroup'
import SignalGroupPopover, { SIGNAL_GROUP_POPOVER_ANCHOR_GAP_PX } from './SignalGroupPopover'
import PaymentsPopoverPanel, {
  SIGNAL_GROUP_POPOVER_INNER_CLASS,
  SIGNAL_GROUP_POPOVER_SHELL_CLASS,
} from './PaymentsPopoverPanel'
import type { ProfileDrawerTabId } from './AccountDrawer'
import { IconButton } from './IconButton'
import type { AccountConfig } from '../data/accountConfigs'
import CapabilityStatusIcon from '../icons/CapabilityStatusIcon'
import { usePrototypeOptional } from '../context/PrototypeContext'
import {
  CAPABILITY_GROUP_DISPLAY_LABELS,
  DEFAULT_FINANCING_POPOVER,
  HEADER_CAPABILITY_ACTIVE_TOOLTIP,
  HEADER_EXTRA_ACTIVE_CAPABILITY_ORDER,
  formatBillingProductsTooltip,
  type BillingFlavor,
  type CapabilityGroupId,
  type CapabilityStatus,
} from '../data/configMatrix'
import {
  payoutsPopoverLowerWellForRoles,
  resolveCapabilityGroups,
  signalGroupsForConfigureModal,
} from '../data/uadVisibility'
import { parseGutterBleed } from '../utils/gutterBleed'

function signalPopoverHeading(popoverId: string, billingAsSubscriptions?: boolean): string {
  if (popoverId === 'payments') return 'Payments'
  if (popoverId === 'payouts') return 'Payouts'
  if (popoverId === 'billing') return billingAsSubscriptions ? 'Subscriptions' : 'Billing'
  if (popoverId.startsWith('extra:')) {
    const gid = popoverId.slice('extra:'.length) as CapabilityGroupId
    return CAPABILITY_GROUP_DISPLAY_LABELS[gid]
  }
  return ''
}

const PAYOUTS_TOOLTIP_BY_CAPABILITY: Record<CapabilityStatus, string> = {
  active: 'Payouts are active for this account.',
  pausing_soon: 'Payouts will be paused soon — view actions required.',
  limited: 'Payouts partially paused — view actions required.',
  paused: 'Payouts paused — view actions required.',
}

const PAYMENTS_TOOLTIP_BY_CAPABILITY: Record<CapabilityStatus, string> = {
  active: 'Payments are active for this account.',
  pausing_soon: 'Payments will be paused soon — view actions required.',
  limited: 'Payments partially paused — view actions required.',
  paused: 'Payments paused — view actions required.',
}

/** Visibility flags for action bar. When not passed, all actions are shown (backward compatible). Derive from config/status/products for customer vs merchant. */
export type ActionBarVisibility = {
  /** Show Payouts button (and restricted dropdown when status is restricted). Driven by config.showPayouts. */
  showPayouts?: boolean
  /** Show Payments button (and restricted dropdown when status is restricted). Driven by config.showCollectedFees. */
  showPayments?: boolean
  /** Show Move money button + dropdown. Driven by config.sections includes moneyMovement. */
  showMoveMoney?: boolean
  /** Show More (overflow) icon. Default true. */
  showMore?: boolean
  /** Show Expand (account details drawer) icon. Default true. */
  showExpand?: boolean
  /** Show Settings icon. Default true. */
  showSettings?: boolean
  /** When true, a third ghost slot may show “Billing” if prototype billing is enabled. Default true. */
  showSubscriptions?: boolean
}

/**
 * Derive action bar visibility from account config.
 * - Every account with merchant config shows Payouts and Payments status (when enabled, both show as enabled).
 * - Customer/borrower configs: no Payouts, Payments, Move money.
 * - Status (enabled/restricted): only affects how Payouts/Payments look (ghost vs restricted), not whether they show.
 * - High risk (Radar rule matches): options.isRadarRuleMatch is passed for future use.
 * - Products (FA, multi-currency FA, Loans): options.products can override when available.
 */
export function getActionBarVisibility(
  config: AccountConfig,
  options?: { hasMerchantConfig?: boolean; isRadarRuleMatch?: boolean; products?: { financialAccounts?: boolean; financialAccountsMultiCurrency?: boolean; loans?: boolean } }
): ActionBarVisibility {
  const hasMoneyMovement = config.sections.includes('moneyMovement')
  const showPayoutsAndPayments = options?.hasMerchantConfig === true || config.showPayouts || config.showCollectedFees
  return {
    showPayouts: showPayoutsAndPayments,
    showPayments: showPayoutsAndPayments,
    showMoveMoney: hasMoneyMovement,
    showMore: true,
    showExpand: true,
    showSettings: true,
    showSubscriptions: true,
  }
}

type AccountDetailActionBarProps = {
  /** When 'restricted', Payouts/Payments use Figma 17-7488 variant (red X icon, offset bg, chevron). Undefined = customer-only (no status). */
  status?: 'enabled' | 'restricted' | 'restricted_soon' | undefined
  /** Which actions to show. When omitted, all actions shown. Pass result of getActionBarVisibility(config) for config-driven detail (e.g. customer vs merchant). */
  visibility?: ActionBarVisibility
  /** Opens the account Profile drawer; optional tab (default Details). */
  onOpenAccountDrawer?: (opts?: { profileTab?: ProfileDrawerTabId }) => void
  /** Account id so actions-required modal rows open detail in new tab. */
  accountId?: string
  /** Account name shown above "Needs Attention" in the modal (match Settings). */
  accountName?: string
  /** When provided, actions-required modal is controlled by parent. Pass filter to open with that view (e.g. 'payouts' from Payouts dropdown). */
  actionsModalOpen?: boolean
  actionsModalInitialFilter?: ActionsRequiredFilter
  /** When opening from paused Payouts/Payments, pass 'actions' so segment is Actions required. */
  actionsModalInitialSegment?: 'blocking' | 'actions'
  /** When opening from sidebar list item click, pass that action's id to show in modal. */
  actionsModalInitialSelectedActionId?: string
  onOpenActionsModal?: (filter?: ActionsRequiredFilter, initialSegment?: 'blocking' | 'actions') => void
  onCloseActionsModal?: () => void
  /** When provided, Settings icon opens parent-controlled Settings modal (e.g. for deep link from profile Edit). */
  onOpenSettings?: () => void
  /** Legacy prop; signal group chips no longer navigate to Settings (popover instead). */
  onOpenSettingsSection?: (sectionId: string) => void
  /**
   * When set, the 1px rule below the signal chip row spans the same horizontal bleed as the page header
   * (e.g. `-mx-6 px-6` with AccountDetail root `px-6`). Figma: hairline under `header/signal-group-row` (112:49522),
   * Home actions frame 2:6375 — same `neutral-50` as TabBar divider.
   */
  signalRowBorderBleedClassName?: string
}

/** Payouts/Payments/Billing: always ghost, same placement. Billing is always shown as enabled (no compliance status). Payouts/Payments: enabled → popover; restricted → Actions required (filtered). */
export function AccountDetailHeaderStatusButtons({
  showPayouts,
  showPayments,
  showBilling,
  extraActiveCapabilityChips = [],
  status,
  onOpenSettingsSection,
  onOpenActionsModal,
  onOpenAccountDrawer,
  pillRowRef,
}: {
  showPayouts: boolean
  showPayments: boolean
  /** True when prototype shows the Billing chip (Uses billing and/or active subscriptions with platform). */
  showBilling?: boolean
  /**
   * Resolved capability groups (excl. payments/payouts/billing) for the current roles — same
   * eligibility as Configure. Shown as ghost chips after Billing; per-group status only affects
   * the leading status icon (and account badge via `deriveAccountStatus`), not chip visibility.
   */
  extraActiveCapabilityChips?: CapabilityGroupId[]
  status?: 'enabled' | 'restricted' | 'restricted_soon' | undefined
  onOpenSettingsSection?: (sectionId: string) => void
  /** When restricted, status buttons open Actions required modal with this filter. */
  onOpenActionsModal?: (filter?: ActionsRequiredFilter, initialSegment?: 'blocking' | 'actions') => void
  /** Opens Profile drawer (e.g. Capabilities tab from payments overflow). */
  onOpenAccountDrawer?: (opts?: { profileTab?: ProfileDrawerTabId }) => void
  /** Inner `header/signal-group-row` ref — shared popover Y + outside-click guard. */
  pillRowRef: RefObject<HTMLDivElement | null>
}) {
  const prototype = usePrototypeOptional()
  const isRestricted = status === 'restricted' || status === 'restricted_soon'
  const showBillingChip = showBilling === true
  if (
    !showPayouts &&
    !showPayments &&
    !showBillingChip &&
    extraActiveCapabilityChips.length === 0
  ) {
    return null
  }

  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null)
  const [popoverX, setPopoverX] = useState(0)
  const [popoverTop, setPopoverTop] = useState(0)
  const paymentsRef = useRef<HTMLButtonElement>(null)
  const payoutsRef = useRef<HTMLButtonElement>(null)
  const billingRef = useRef<HTMLButtonElement>(null)
  const extraRefs = useRef(new Map<CapabilityGroupId, HTMLButtonElement | null>())
  const hoverCloseTimerRef = useRef<number | null>(null)

  const HOVER_CLOSE_MS = 150

  useEffect(() => {
    return () => {
      if (hoverCloseTimerRef.current != null) window.clearTimeout(hoverCloseTimerRef.current)
    }
  }, [])

  const clearPopoverHoverCloseTimer = useCallback(() => {
    if (hoverCloseTimerRef.current != null) {
      window.clearTimeout(hoverCloseTimerRef.current)
      hoverCloseTimerRef.current = null
    }
  }, [])

  const schedulePopoverClose = () => {
    clearPopoverHoverCloseTimer()
    hoverCloseTimerRef.current = window.setTimeout(() => {
      hoverCloseTimerRef.current = null
      setOpenPopoverId(null)
    }, HOVER_CLOSE_MS)
  }

  const updatePopoverPlacementForId = useCallback(
    (id: string) => {
      let el: HTMLElement | null = null
      if (id === 'payments') el = paymentsRef.current
      else if (id === 'payouts') el = payoutsRef.current
      else if (id === 'billing') el = billingRef.current
      else if (id.startsWith('extra:')) {
        el = extraRefs.current.get(id.slice('extra:'.length) as CapabilityGroupId) ?? null
      }
      if (el) setPopoverX(el.getBoundingClientRect().left)
      if (pillRowRef.current) {
        setPopoverTop(
          pillRowRef.current.getBoundingClientRect().bottom + SIGNAL_GROUP_POPOVER_ANCHOR_GAP_PX
        )
      }
    },
    [pillRowRef]
  )

  const openPopoverOnHover = (id: string) => {
    clearPopoverHoverCloseTimer()
    updatePopoverPlacementForId(id)
    setOpenPopoverId(id)
  }

  useLayoutEffect(() => {
    if (openPopoverId == null) return
    updatePopoverPlacementForId(openPopoverId)
  }, [
    openPopoverId,
    showPayments,
    showPayouts,
    showBillingChip,
    extraActiveCapabilityChips,
    updatePopoverPlacementForId,
  ])

  useEffect(() => {
    if (openPopoverId == null) return
    const sync = () => updatePopoverPlacementForId(openPopoverId)
    window.addEventListener('resize', sync)
    window.addEventListener('scroll', sync, true)
    return () => {
      window.removeEventListener('resize', sync)
      window.removeEventListener('scroll', sync, true)
    }
  }, [openPopoverId, updatePopoverPlacementForId])

  const isTargetInsidePillRow = useCallback(
    (node: Node) => pillRowRef.current?.contains(node) ?? false,
    [pillRowRef]
  )

  const payoutsCapability = prototype?.capabilityStatuses.payouts
  const paymentsCapability = prototype?.capabilityStatuses.payments

  /** Click opens Actions required whenever the cap is not fully active (limited / pausing soon / paused). */
  const signalClickOpensActionsModal = (c: CapabilityStatus | undefined) =>
    c != null ? c !== 'active' : isRestricted

  const payoutsNeedsAttention = signalClickOpensActionsModal(payoutsCapability)
  const paymentsNeedsAttention = signalClickOpensActionsModal(paymentsCapability)
  const paymentsExpiredDot = prototype?.relationship?.expiredPaymentMethod === true

  const billingUsesFlavors = prototype?.billingFlavors ?? new Set<BillingFlavor>()
  const showBillingSubscriptionsWell =
    billingUsesFlavors.has('subscriptions') ||
    (prototype?.relationship?.hasActiveSubscriptions ?? false)
  /** Uses billing off but subscriptions well still on — popover is well-only (no status / product line). */
  const billingOmitCapabilitySection =
    !(prototype?.hasBilling ?? false) && showBillingSubscriptionsWell

  const billingCapability = prototype?.capabilityStatuses.billing
  const billingNeedsComplianceClick = signalClickOpensActionsModal(billingCapability)

  const paymentsCustomerOnly =
    prototype?.activeRoles != null &&
    prototype.activeRoles.size === 1 &&
    prototype.activeRoles.has('customer')
  const recipientOnly =
    prototype?.activeRoles != null &&
    prototype.activeRoles.size === 1 &&
    prototype.activeRoles.has('recipient')
  /** Customer-only or Connect recipient-only: billing chip reads “Subscriptions”; grey-well-only popover chrome. */
  const billingMinimalPopover = paymentsCustomerOnly || recipientOnly

  const renderSignalPopoverBody = useCallback(
    (id: string) => {
      const r = prototype?.activeRoles
      const payoutsWellFromRoles = r != null ? payoutsPopoverLowerWellForRoles(r) : undefined
      const resolvedPayoutsLower: 'payoutInformation' | 'external' =
        payoutsWellFromRoles === 'external'
          ? 'external'
          : (prototype?.hasPayoutSchedule ?? false)
            ? 'payoutInformation'
            : 'external'
      const transfersShowPaymentsBalanceWell = resolvedPayoutsLower === 'external'

      switch (id) {
        case 'payments':
          return (
            <PaymentsPopoverPanel
              status={prototype?.capabilityStatuses.payments ?? 'active'}
              paymentsCustomerOnly={paymentsCustomerOnly}
              hasPaymentMethodOnFile={prototype?.hasPaymentMethodOnFile ?? false}
              defaultPaymentMethodExpired={prototype?.relationship?.expiredPaymentMethod ?? false}
              paymentMethodsPlatformLabel="Shopify"
              onViewAllCapabilities={
                onOpenAccountDrawer
                  ? () => {
                      clearPopoverHoverCloseTimer()
                      setOpenPopoverId(null)
                      onOpenAccountDrawer({ profileTab: 'capabilities' })
                    }
                  : undefined
              }
              onEditCapabilities={
                onOpenSettingsSection
                  ? () => {
                      clearPopoverHoverCloseTimer()
                      setOpenPopoverId(null)
                      onOpenSettingsSection('capabilities')
                    }
                  : undefined
              }
            />
          )
        case 'payouts':
          return (
            <PaymentsPopoverPanel
              variant="payouts"
              status={prototype?.capabilityStatuses.payouts ?? 'active'}
              hasPayoutSchedule={prototype?.hasPayoutSchedule ?? false}
              payoutsLowerWell={
                prototype?.activeRoles != null
                  ? payoutsPopoverLowerWellForRoles(prototype.activeRoles)
                  : undefined
              }
              onEditCapabilities={
                onOpenSettingsSection
                  ? () => {
                      clearPopoverHoverCloseTimer()
                      setOpenPopoverId(null)
                      onOpenSettingsSection('capabilities')
                    }
                  : undefined
              }
            />
          )
        case 'extra:treasury':
          return (
            <PaymentsPopoverPanel
              variant="financialAccounts"
              status={prototype?.capabilityStatuses.treasury ?? 'active'}
              hasFinancialAccounts={prototype?.hasFinancialAccounts ?? false}
              financialAccountsPlatformLabel="Shopify"
              onEditCapabilities={
                onOpenSettingsSection
                  ? () => {
                      clearPopoverHoverCloseTimer()
                      setOpenPopoverId(null)
                      onOpenSettingsSection('capabilities')
                    }
                  : undefined
              }
            />
          )
        case 'extra:capital':
          return (
            <PaymentsPopoverPanel
              variant="financing"
              financingProducts={prototype?.financingProducts ?? DEFAULT_FINANCING_POPOVER}
              financingPlatformLabel="Shopify"
              status={prototype?.capabilityStatuses.capital ?? 'active'}
              onEditCapabilities={
                onOpenSettingsSection
                  ? () => {
                      clearPopoverHoverCloseTimer()
                      setOpenPopoverId(null)
                      onOpenSettingsSection('capabilities')
                    }
                  : undefined
              }
            />
          )
        case 'extra:transfers':
          return (
            <PaymentsPopoverPanel
              variant="transfers"
              status={prototype?.capabilityStatuses.transfers ?? 'active'}
              transfersShowPaymentsBalanceWell={transfersShowPaymentsBalanceWell}
              onEditCapabilities={
                onOpenSettingsSection
                  ? () => {
                      clearPopoverHoverCloseTimer()
                      setOpenPopoverId(null)
                      onOpenSettingsSection('capabilities')
                    }
                  : undefined
              }
            />
          )
        case 'extra:issuing':
          return (
            <PaymentsPopoverPanel
              variant="cardIssuing"
              cardIssuingPlatformLabel="Shopify"
              status={prototype?.capabilityStatuses.issuing ?? 'active'}
              onEditCapabilities={
                onOpenSettingsSection
                  ? () => {
                      clearPopoverHoverCloseTimer()
                      setOpenPopoverId(null)
                      onOpenSettingsSection('capabilities')
                    }
                  : undefined
              }
            />
          )
        case 'billing':
          return (
            <PaymentsPopoverPanel
              variant="billing"
              status={prototype?.capabilityStatuses.billing ?? 'active'}
              billingFlavors={billingUsesFlavors}
              showBillingSubscriptionsWell={showBillingSubscriptionsWell}
              billingOmitCapabilitySection={billingOmitCapabilitySection}
              billingCustomerOnly={billingMinimalPopover}
              billingSubscriptionsPlatformLabel="Shopify"
            />
          )
        default:
          if (id.startsWith('extra:')) {
            const heading = signalPopoverHeading(id)
            return (
              <div className={SIGNAL_GROUP_POPOVER_SHELL_CLASS}>
                <div className={SIGNAL_GROUP_POPOVER_INNER_CLASS}>
                  <h3 className="m-0 font-label-medium text-[14px] leading-5 text-default">{heading}</h3>
                  <p className="m-0 mt-1 font-label-small leading-4 text-[#50617a]">Popover content coming soon</p>
                </div>
              </div>
            )
          }
          return null
      }
    },
    [
      paymentsCustomerOnly,
      billingMinimalPopover,
      recipientOnly,
      prototype?.activeRoles,
      prototype?.capabilityStatuses,
      prototype?.financingProducts,
      prototype?.hasPaymentMethodOnFile,
      prototype?.hasPayoutSchedule,
      prototype?.activeRoles,
      prototype?.hasFinancialAccounts,
      prototype?.billingFlavors,
      prototype?.relationship?.hasActiveSubscriptions,
      prototype?.relationship?.expiredPaymentMethod,
      prototype?.hasBilling,
      showBillingSubscriptionsWell,
      billingOmitCapabilitySection,
      onOpenAccountDrawer,
      onOpenSettingsSection,
      clearPopoverHoverCloseTimer,
    ]
  )

  return (
    <>
      {showPayments && (
        <span className="relative inline-flex shrink-0">
          <HeaderSignalGroupButton
            ref={paymentsRef}
            tooltipLabel={
              paymentsCapability != null
                ? PAYMENTS_TOOLTIP_BY_CAPABILITY[paymentsCapability]
                : isRestricted
                  ? 'Payments paused — view actions required'
                  : 'Payments are active for this account.'
            }
            tooltipId="payments-tooltip"
            aria-expanded={openPopoverId === 'payments'}
            onMouseEnter={() => openPopoverOnHover('payments')}
            onMouseLeave={schedulePopoverClose}
            onClick={
              paymentsNeedsAttention
                ? () => {
                    setOpenPopoverId(null)
                    onOpenActionsModal?.('payments', 'actions')
                  }
                : paymentsExpiredDot
                  ? () => {
                      setOpenPopoverId(null)
                      onOpenActionsModal?.('payments')
                    }
                  : undefined
            }
            leading={
              paymentsCapability != null ? (
                <CapabilityStatusIcon status={paymentsCapability} />
              ) : isRestricted ? (
                <PausedCircleIcon size={12} />
              ) : (
                <CapabilityStatusIcon status="active" />
              )
            }
          >
            Payments
          </HeaderSignalGroupButton>
          {paymentsExpiredDot ? (
            <span
              className="pointer-events-none absolute -right-0.5 -top-0.5 size-2 rounded-full bg-[var(--color-icon-feedback-critical)] ring-2 ring-surface"
              aria-hidden
            />
          ) : null}
        </span>
      )}
      {showPayouts && (
        <HeaderSignalGroupButton
          ref={payoutsRef}
          tooltipLabel={
            payoutsCapability != null
              ? PAYOUTS_TOOLTIP_BY_CAPABILITY[payoutsCapability]
              : isRestricted
                ? 'Payouts paused — view actions required'
                : 'Payouts are active for this account.'
          }
          tooltipId="payouts-tooltip"
          aria-expanded={openPopoverId === 'payouts'}
          onMouseEnter={() => openPopoverOnHover('payouts')}
          onMouseLeave={schedulePopoverClose}
          onClick={
            payoutsNeedsAttention
              ? () => {
                  setOpenPopoverId(null)
                  onOpenActionsModal?.('payouts', 'actions')
                }
              : undefined
          }
          leading={
            payoutsCapability != null ? (
              <CapabilityStatusIcon status={payoutsCapability} />
            ) : isRestricted ? (
              <PausedCircleIcon size={12} />
            ) : (
              <CapabilityStatusIcon status="active" />
            )
          }
        >
          Payouts
        </HeaderSignalGroupButton>
      )}
      {showBillingChip && (
        <HeaderSignalGroupButton
          ref={billingRef}
          tooltipLabel={formatBillingProductsTooltip(billingUsesFlavors)}
          tooltipId="billing-products-tooltip"
          aria-expanded={openPopoverId === 'billing'}
          onMouseEnter={() => openPopoverOnHover('billing')}
          onMouseLeave={schedulePopoverClose}
          onClick={
            billingNeedsComplianceClick
              ? () => {
                  setOpenPopoverId(null)
                  onOpenActionsModal?.('all', 'actions')
                }
              : undefined
          }
          leading={
            <CapabilityStatusIcon
              status={prototype?.capabilityStatuses.billing ?? 'active'}
            />
          }
        >
          {billingMinimalPopover ? 'Subscriptions' : 'Billing'}
        </HeaderSignalGroupButton>
      )}
      {extraActiveCapabilityChips.map((groupId) => {
        const popoverKey = `extra:${groupId}`
        const extraCapability = prototype?.capabilityStatuses[groupId]
        const extraNeedsAttention = signalClickOpensActionsModal(extraCapability)
        const tooltip =
          HEADER_CAPABILITY_ACTIVE_TOOLTIP[groupId] ??
          `${CAPABILITY_GROUP_DISPLAY_LABELS[groupId]} are active for this account.`
        return (
          <HeaderSignalGroupButton
            key={groupId}
            ref={(el) => {
              if (el) extraRefs.current.set(groupId, el)
              else extraRefs.current.delete(groupId)
            }}
            tooltipLabel={tooltip}
            tooltipId={`header-cap-${groupId}-tooltip`}
            aria-expanded={openPopoverId === popoverKey}
            onMouseEnter={() => openPopoverOnHover(popoverKey)}
            onMouseLeave={schedulePopoverClose}
            onClick={
              extraNeedsAttention
                ? () => {
                    setOpenPopoverId(null)
                    onOpenActionsModal?.('all', 'actions')
                  }
                : undefined
            }
            leading={
              <CapabilityStatusIcon
                status={prototype?.capabilityStatuses[groupId] ?? 'active'}
              />
            }
          >
            {CAPABILITY_GROUP_DISPLAY_LABELS[groupId]}
          </HeaderSignalGroupButton>
        )
      })}
      <SignalGroupPopover
        open={openPopoverId != null}
        onClose={() => {
          clearPopoverHoverCloseTimer()
          setOpenPopoverId(null)
        }}
        onPointerEnter={clearPopoverHoverCloseTimer}
        onPointerLeave={schedulePopoverClose}
        title={
          openPopoverId != null
            ? signalPopoverHeading(
                openPopoverId,
                billingMinimalPopover && openPopoverId === 'billing'
              )
            : ''
        }
        activeContentId={openPopoverId}
        renderBody={renderSignalPopoverBody}
        sharedPlacement={
          openPopoverId != null ? { translateX: popoverX, top: popoverTop } : null
        }
        isTargetInsidePillRow={isTargetInsidePillRow}
      />
    </>
  )
}

/** When visibility is omitted, show all. Otherwise respect each flag (undefined = show). */
function useVisibility(visibility: ActionBarVisibility | undefined) {
  return {
    showPayouts: visibility?.showPayouts !== false,
    showPayments: visibility?.showPayments !== false,
    showSubscriptions: visibility?.showSubscriptions !== false,
    showMoveMoney: visibility?.showMoveMoney !== false,
    showMore: visibility?.showMore !== false,
    showExpand: visibility?.showExpand !== false,
    showSettings: visibility?.showSettings !== false,
  }
}

/** Move money, Settings, More, Expand — for use in header trailing (swapped placement). */
export function AccountDetailMainActions({
  visibility,
  onOpenAccountDrawer,
  accountId,
  onOpenSettings: onOpenSettingsProp,
}: {
  visibility?: ActionBarVisibility
  onOpenAccountDrawer?: (opts?: { profileTab?: ProfileDrawerTabId }) => void
  accountId?: string
  onOpenSettings?: () => void
}) {
  const navigate = useNavigate()
  const v = useVisibility(visibility)
  const [moveMoneyOpen, setMoveMoneyOpen] = useState(false)
  const moveMoneyRef = useRef<HTMLDivElement>(null)
  const openSettings =
    onOpenSettingsProp ?? (accountId ? () => navigate(`/network/${accountId}/settings`) : () => {})

  useEffect(() => {
    if (!moveMoneyOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (moveMoneyRef.current && !moveMoneyRef.current.contains(e.target as Node)) {
        setMoveMoneyOpen(false)
      }
    }
    // Defer so the same gesture that opened the menu (mousedown → click) does not see this listener
    // and the opening click is not treated as an outside close.
    const t = window.setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 0)
    return () => {
      clearTimeout(t)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [moveMoneyOpen])

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      data-name="Home actions"
      data-node-id="145:61890"
    >
      {v.showMoveMoney && (
        <div
          className={moveMoneyOpen ? 'relative z-[200]' : 'relative'}
          ref={moveMoneyRef}
        >
          <ActionButton
            label="Move money"
            tooltipId="actionbar-move-money-tooltip"
            variant="standard"
            className="h-8 gap-1 border-0 !bg-[#f4f7fa] !px-2 !py-0 !text-[#273951] shadow-none hover:!bg-neutral-50"
            onClick={(e) => {
              e.stopPropagation()
              setMoveMoneyOpen((o) => !o)
            }}
            aria-haspopup="menu"
            aria-expanded={moveMoneyOpen}
          >
            <ConvertIcon size={12} fill={iconDefault} />
            Move money
          </ActionButton>
          {moveMoneyOpen && (
            <ul
              className="absolute left-0 top-full z-[200] mt-1 min-w-[180px] rounded-[length:var(--radius-small)] border border-neutral-100 bg-surface py-1 shadow-[0_2px_5px_rgba(64,68,82,0.08),0_3px_9px_rgba(64,68,82,0.08)]"
              role="menu"
            >
              {MOVE_MONEY_OPTIONS.map((option) => (
                <li key={option} role="none">
                  <button
                    type="button"
                    role="menuitem"
                    className="w-full px-3 py-2 text-left font-label-medium text-default hover:bg-offset focus:bg-offset focus:outline-none"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      setMoveMoneyOpen(false)
                    }}
                  >
                    {option}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {v.showSettings && (
        <ActionButton
          label="Settings"
          tooltipId="actionbar-settings-tooltip"
          variant="iconOnly"
          className="!rounded-2xl !bg-[#f4f7fa] hover:!bg-neutral-50"
          onClick={openSettings}
        >
          <Icon name="settings" size={12} fill={iconDefault} />
        </ActionButton>
      )}
      {v.showMore && (
        <IconButton
          label="More actions"
          tooltipId="actionbar-more-tooltip"
          className="!rounded-2xl !bg-[#f4f7fa] hover:!bg-neutral-50"
        >
          <Icon name="more" size={12} fill={iconDefault} />
        </IconButton>
      )}
      {v.showExpand && (
        <IconButton
          label="View account details"
          tooltipId="actionbar-account-drawer-tooltip"
          className="!rounded-2xl !bg-[#f4f7fa] hover:!bg-neutral-50"
          onClick={() => onOpenAccountDrawer?.({ profileTab: 'details' })}
        >
          <Icon name="identityVerification" size={12} fill={iconDefault} />
        </IconButton>
      )}
    </div>
  )
}

/** Payouts/Payments row + Actions required modal. Renders in the bar row (below header) when placement is swapped. */
export default function AccountDetailActionBar({
  status,
  visibility,
  onOpenAccountDrawer,
  accountId,
  accountName,
  actionsModalOpen: controlledActionsModalOpen,
  actionsModalInitialFilter,
  actionsModalInitialSegment,
  actionsModalInitialSelectedActionId,
  onOpenActionsModal: controlledOnOpen,
  onCloseActionsModal: controlledOnClose,
  onOpenSettings: _onOpenSettings,
  onOpenSettingsSection,
  signalRowBorderBleedClassName,
}: AccountDetailActionBarProps) {
  const prototype = usePrototypeOptional()
  const v = useVisibility(visibility)
  const billingChipUsesExplicitBillingOnly =
    prototype != null &&
    ((prototype.activeRoles.size === 1 && prototype.activeRoles.has('customer')) ||
      prototype.activeRoles.has('recipient') ||
      prototype.activeRoles.has('gp_recipient'))
  const showBillingButton = Boolean(
    prototype &&
      v.showSubscriptions &&
      (billingChipUsesExplicitBillingOnly
        ? prototype.hasBilling
        : prototype.hasBilling || prototype.relationship.hasActiveSubscriptions)
  )

  const activeRolesKey = prototype ? [...prototype.activeRoles].sort().join(',') : ''
  /** Prototype roles: Payments / Payouts chips intersect `resolveCapabilityGroups` (GP + Customer without Merchant → no Payments). */
  const signalChipsFromRoles = useMemo(() => {
    if (!prototype) {
      return { payments: v.showPayments, payouts: v.showPayouts }
    }
    const groups = new Set(
      resolveCapabilityGroups(prototype.activeRoles, prototype.billingEnabled)
    )
    return {
      payments: v.showPayments && groups.has('payments'),
      payouts: v.showPayouts && groups.has('payouts'),
    }
  }, [prototype, activeRolesKey, v.showPayments, v.showPayouts])
  const extraActiveCapabilityChips = useMemo(() => {
    if (!prototype) return []
    /** Same groups as Configure modal — Transfers omitted when Storer (treasury) is active. */
    const modalGroupSet = new Set(signalGroupsForConfigureModal(prototype.activeRoles))
    return HEADER_EXTRA_ACTIVE_CAPABILITY_ORDER.filter((id) => modalGroupSet.has(id))
  }, [activeRolesKey])

  const [internalActionsModalOpen, setInternalActionsModalOpen] = useState(false)
  const [internalActionsModalFilter, setInternalActionsModalFilter] = useState<ActionsRequiredFilter>('all')
  const isControlled = controlledOnOpen != null && controlledOnClose != null
  const actionsModalOpen = isControlled ? (controlledActionsModalOpen ?? false) : internalActionsModalOpen
  const openActionsModal = isControlled
    ? (filter?: ActionsRequiredFilter, initialSegment?: 'blocking' | 'actions') =>
        controlledOnOpen!(filter, initialSegment)
    : (filter?: ActionsRequiredFilter) => {
        setInternalActionsModalFilter(filter ?? 'all')
        setInternalActionsModalOpen(true)
      }
  const closeActionsModal = isControlled ? controlledOnClose! : () => setInternalActionsModalOpen(false)
  /** Default Actions required; pass `blocking` when a flow should open on Blocking issues. */
  const modalInitialSegment = isControlled ? (actionsModalInitialSegment ?? 'actions') : 'actions'

  const showStatus =
    signalChipsFromRoles.payouts ||
    signalChipsFromRoles.payments ||
    showBillingButton ||
    extraActiveCapabilityChips.length > 0
  const signalPillRowRef = useRef<HTMLDivElement>(null)
  const signalRowBleed = parseGutterBleed(signalRowBorderBleedClassName)

  const signalRowWithDivider = (
    <SignalGroup ref={signalPillRowRef}>
      <AccountDetailHeaderStatusButtons
        showPayouts={signalChipsFromRoles.payouts}
        showPayments={signalChipsFromRoles.payments}
        showBilling={showBillingButton}
        extraActiveCapabilityChips={extraActiveCapabilityChips}
        status={status}
        onOpenSettingsSection={onOpenSettingsSection}
        onOpenActionsModal={openActionsModal}
        onOpenAccountDrawer={onOpenAccountDrawer}
        pillRowRef={signalPillRowRef}
      />
    </SignalGroup>
  )

  return (
    <>
      {/*
        Figma: 1px neutral-50 hairline below the capability chip row (`header/signal-group-row` 112:49522),
        Home actions frame 2:6375 — same token as TabBar divider (`border-neutral-50` / `bg-neutral-50`).
      */}
      {showStatus &&
        (signalRowBleed ? (
          <div className={signalRowBleed.marginClass}>
            <div
              className={`border-b border-neutral-50 py-4 ${signalRowBleed.paddingClass}`}
              data-name="header/signal-group-bottom-rule"
            >
              {signalRowWithDivider}
            </div>
          </div>
        ) : (
          <div className="border-b border-neutral-50 py-4" data-name="header/signal-group-bottom-rule">
            {signalRowWithDivider}
          </div>
        ))}
      <ActionsRequiredModal
        open={actionsModalOpen}
        onClose={closeActionsModal}
        accountId={accountId}
        accountName={accountName}
        initialFilter={isControlled ? (actionsModalInitialFilter ?? 'all') : internalActionsModalFilter}
        initialSegment={modalInitialSegment}
        initialSelectedActionId={actionsModalInitialSelectedActionId}
      />
    </>
  )
}
