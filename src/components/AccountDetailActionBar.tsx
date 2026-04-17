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
import PaymentsPopoverPanel from './PaymentsPopoverPanel'
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
  type CapabilityGroupId,
  type CapabilityStatus,
} from '../data/configMatrix'
import { signalGroupsForConfigureModal } from '../data/uadVisibility'

function signalPopoverHeading(popoverId: string): string {
  if (popoverId === 'payments') return 'Payments'
  if (popoverId === 'payouts') return 'Payouts'
  if (popoverId === 'billing') return 'Billing'
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
  onOpenActionsModal?: (filter?: ActionsRequiredFilter) => void
  onCloseActionsModal?: () => void
  /** When provided, Settings icon opens parent-controlled Settings modal (e.g. for deep link from profile Edit). */
  onOpenSettings?: () => void
  /** Legacy prop; signal group chips no longer navigate to Settings (popover instead). */
  onOpenSettingsSection?: (sectionId: string) => void
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
  /** True when prototype “Uses billing” is on (third chip). */
  showBilling?: boolean
  /**
   * Resolved capability groups (excl. payments/payouts/billing) whose compliance status is Active
   * in the configure modal — shown as additional ghost chips after Billing.
   */
  extraActiveCapabilityChips?: CapabilityGroupId[]
  status?: 'enabled' | 'restricted' | 'restricted_soon' | undefined
  onOpenSettingsSection?: (sectionId: string) => void
  /** When restricted, status buttons open Actions required modal with this filter. */
  onOpenActionsModal?: (filter?: ActionsRequiredFilter) => void
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

  /** Open Actions required instead of popover only for paused / pausing soon; limited is still “active” for account flows. */
  const signalOpensActionsModal = (c: CapabilityStatus | undefined) =>
    c != null ? c === 'paused' || c === 'pausing_soon' : isRestricted

  const payoutsNeedsAttention = signalOpensActionsModal(payoutsCapability)
  const paymentsNeedsAttention = signalOpensActionsModal(paymentsCapability)

  const renderSignalPopoverBody = useCallback(
    (id: string) => {
      switch (id) {
        case 'payments':
          return (
            <PaymentsPopoverPanel
              status={prototype?.capabilityStatuses.payments ?? 'active'}
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
        case 'extra:issuing':
          return (
            <PaymentsPopoverPanel
              variant="cardIssuing"
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
            <>
              <h3 className="m-0 font-label-medium-emphasized text-[14px] leading-5 text-default">Billing</h3>
              <p className="mb-0 mt-2 font-label-medium text-[14px] leading-5 text-subdued">
                Popover content coming soon
              </p>
            </>
          )
        default:
          if (id.startsWith('extra:')) {
            const heading = signalPopoverHeading(id)
            return (
              <>
                <h3 className="m-0 font-label-medium-emphasized text-[14px] leading-5 text-default">{heading}</h3>
                <p className="mb-0 mt-2 font-label-medium text-[14px] leading-5 text-subdued">
                  Popover content coming soon
                </p>
              </>
            )
          }
          return null
      }
    },
    [
      prototype?.capabilityStatuses,
      prototype?.financingProducts,
      onOpenAccountDrawer,
      onOpenSettingsSection,
      clearPopoverHoverCloseTimer,
    ]
  )

  return (
    <>
      {showPayments && (
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
          onMouseEnter={
            paymentsNeedsAttention ? undefined : () => openPopoverOnHover('payments')
          }
          onMouseLeave={paymentsNeedsAttention ? undefined : schedulePopoverClose}
          onClick={
            paymentsNeedsAttention
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
          onMouseEnter={
            payoutsNeedsAttention ? undefined : () => openPopoverOnHover('payouts')
          }
          onMouseLeave={payoutsNeedsAttention ? undefined : schedulePopoverClose}
          onClick={
            payoutsNeedsAttention
              ? () => {
                  setOpenPopoverId(null)
                  onOpenActionsModal?.('payouts')
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
          tooltipLabel={formatBillingProductsTooltip(prototype?.billingFlavors ?? new Set())}
          tooltipId="billing-products-tooltip"
          aria-expanded={openPopoverId === 'billing'}
          onMouseEnter={() => openPopoverOnHover('billing')}
          onMouseLeave={schedulePopoverClose}
          leading={
            <CapabilityStatusIcon
              status={prototype?.capabilityStatuses.billing ?? 'active'}
            />
          }
        >
          Billing
        </HeaderSignalGroupButton>
      )}
      {extraActiveCapabilityChips.map((groupId) => {
        const popoverKey = `extra:${groupId}`
        const extraCapability = prototype?.capabilityStatuses[groupId]
        const extraNeedsAttention = signalOpensActionsModal(extraCapability)
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
            onMouseEnter={
              extraNeedsAttention ? undefined : () => openPopoverOnHover(popoverKey)
            }
            onMouseLeave={extraNeedsAttention ? undefined : schedulePopoverClose}
            onClick={
              extraNeedsAttention
                ? () => {
                    setOpenPopoverId(null)
                    onOpenActionsModal?.('all')
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
        title={openPopoverId != null ? signalPopoverHeading(openPopoverId) : ''}
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
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [moveMoneyOpen])

  return (
    <div
      className="flex flex-wrap items-center gap-[8px]"
      data-name="Home actions"
      data-node-id="2:6375"
    >
      {v.showMoveMoney && (
        <div className="relative" ref={moveMoneyRef}>
          <ActionButton
            label="Move money"
            tooltipId="actionbar-move-money-tooltip"
            variant="standard"
            onClick={() => setMoveMoneyOpen((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={moveMoneyOpen}
          >
            <ConvertIcon size={12} fill={iconDefault} />
            Move money
          </ActionButton>
          {moveMoneyOpen && (
            <ul
              className="absolute left-0 top-full z-20 mt-1 min-w-[180px] rounded-[length:var(--radius-small)] border border-neutral-100 bg-surface py-1 shadow-[0_2px_5px_rgba(64,68,82,0.08),0_3px_9px_rgba(64,68,82,0.08)]"
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
          onClick={openSettings}
        >
          <Icon name="settings" size={12} fill={iconDefault} />
        </ActionButton>
      )}
      {v.showMore && (
        <IconButton label="More actions" tooltipId="actionbar-more-tooltip" roundedFull>
          <Icon name="more" size={12} fill={iconDefault} />
        </IconButton>
      )}
      {v.showExpand && (
        <IconButton
          label="View account details"
          tooltipId="actionbar-account-drawer-tooltip"
          roundedFull
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
}: AccountDetailActionBarProps) {
  const prototype = usePrototypeOptional()
  const v = useVisibility(visibility)
  const showBillingButton = Boolean(prototype?.hasBilling && v.showSubscriptions)

  const activeRolesKey = prototype ? [...prototype.activeRoles].sort().join(',') : ''
  const capabilityStatusKey = prototype ? JSON.stringify(prototype.capabilityStatuses) : ''
  const extraActiveCapabilityChips = useMemo(() => {
    if (!prototype) return []
    /** Same visibility as configure modal — Transfers hidden when Storer rolls up to Financial accounts. */
    const modalGroupSet = new Set(signalGroupsForConfigureModal(prototype.activeRoles))
    return HEADER_EXTRA_ACTIVE_CAPABILITY_ORDER.filter((id) => {
      if (!modalGroupSet.has(id)) return false
      const s = prototype.capabilityStatuses[id]
      return s === 'active' || s === 'limited'
    })
  }, [activeRolesKey, capabilityStatusKey])

  const [internalActionsModalOpen, setInternalActionsModalOpen] = useState(false)
  const [internalActionsModalFilter, setInternalActionsModalFilter] = useState<ActionsRequiredFilter>('all')
  const isControlled = controlledOnOpen != null && controlledOnClose != null
  const actionsModalOpen = isControlled ? (controlledActionsModalOpen ?? false) : internalActionsModalOpen
  const openActionsModal = isControlled
    ? (filter?: ActionsRequiredFilter) => controlledOnOpen!(filter)
    : (filter?: ActionsRequiredFilter) => {
        setInternalActionsModalFilter(filter ?? 'all')
        setInternalActionsModalOpen(true)
      }
  const closeActionsModal = isControlled ? controlledOnClose! : () => setInternalActionsModalOpen(false)
  /** Default Actions required; pass `blocking` when a flow should open on Blocking issues. */
  const modalInitialSegment = isControlled ? (actionsModalInitialSegment ?? 'actions') : 'actions'

  const showStatus =
    v.showPayouts ||
    v.showPayments ||
    showBillingButton ||
    extraActiveCapabilityChips.length > 0
  const signalPillRowRef = useRef<HTMLDivElement>(null)
  return (
    <>
      {showStatus && (
        <SignalGroup ref={signalPillRowRef}>
          <AccountDetailHeaderStatusButtons
            showPayouts={v.showPayouts}
            showPayments={v.showPayments}
            showBilling={showBillingButton}
            extraActiveCapabilityChips={extraActiveCapabilityChips}
            status={status}
            onOpenSettingsSection={onOpenSettingsSection}
            onOpenActionsModal={openActionsModal}
            onOpenAccountDrawer={onOpenAccountDrawer}
            pillRowRef={signalPillRowRef}
          />
        </SignalGroup>
      )}
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
