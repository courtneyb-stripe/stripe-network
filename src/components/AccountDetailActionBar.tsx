/**
 * AccountDetailActionBar — Figma Home actions (node 2:6375).
 * Payouts, Payments, Move money (with dropdown), More, Expand, Settings.
 * Label tooltips (Payouts/Payments) use Figma 13:6299 (Plain Tooltip). Use previous design (11:5804) for instructional copy.
 */

import { useState, useRef, useEffect } from 'react'
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

const iconSuccess = '#2B8700' // Figma Icon/Feedback Success
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
import { IconButton } from './IconButton'
import type { AccountConfig } from '../data/accountConfigs'
import CapabilityStatusIcon from '../icons/CapabilityStatusIcon'
import { usePrototypeOptional } from '../context/PrototypeContext'
import { formatBillingProductsTooltip, type CapabilityStatus } from '../data/configMatrix'

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
  /** Opens the account details drawer (same as expand in sidebar). */
  onOpenAccountDrawer?: () => void
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
  /** When provided, status buttons (enabled) open Settings to this section (e.g. configurations). */
  onOpenSettingsSection?: (sectionId: string) => void
}

/** Payouts/Payments/Billing: always ghost, same placement. Billing is always shown as enabled (no compliance status). Payouts/Payments: enabled → Settings; restricted → Actions required (filtered). */
export function AccountDetailHeaderStatusButtons({
  showPayouts,
  showPayments,
  showBilling,
  status,
  onOpenSettingsSection,
  onOpenActionsModal,
}: {
  showPayouts: boolean
  showPayments: boolean
  /** True when prototype “Uses billing” is on (third chip). */
  showBilling?: boolean
  status?: 'enabled' | 'restricted' | 'restricted_soon' | undefined
  /** When enabled, status buttons open Settings to this section (e.g. configurations). */
  onOpenSettingsSection?: (sectionId: string) => void
  /** When restricted, status buttons open Actions required modal with this filter. */
  onOpenActionsModal?: (filter?: ActionsRequiredFilter) => void
}) {
  const prototype = usePrototypeOptional()
  const isRestricted = status === 'restricted' || status === 'restricted_soon'
  const showBillingChip = showBilling === true
  if (!showPayouts && !showPayments && !showBillingChip) return null
  const openEnabled = () => onOpenSettingsSection?.('configurations')

  const payoutsCapability = prototype?.capabilityStatuses.payouts
  const paymentsCapability = prototype?.capabilityStatuses.payments

  const payoutsNeedsAttention =
    payoutsCapability != null ? payoutsCapability !== 'active' : isRestricted
  const paymentsNeedsAttention =
    paymentsCapability != null ? paymentsCapability !== 'active' : isRestricted

  return (
    <div className="flex items-center gap-0">
      {showPayouts && (
        <ActionButton
          label={
            payoutsCapability != null
              ? PAYOUTS_TOOLTIP_BY_CAPABILITY[payoutsCapability]
              : isRestricted
                ? 'Payouts paused — view actions required'
                : 'Payouts are active for this account.'
          }
          tooltipId="payouts-tooltip"
          tooltipPlacement="bottom"
          variant="ghost"
          onClick={payoutsNeedsAttention ? () => onOpenActionsModal?.('payouts') : openEnabled}
        >
          {payoutsCapability != null ? (
            <CapabilityStatusIcon status={payoutsCapability} />
          ) : isRestricted ? (
            <PausedCircleIcon size={12} />
          ) : (
            <Icon name="checkCircleFilled" size={12} fill={iconSuccess} />
          )}
          Payouts
        </ActionButton>
      )}
      {showPayments && (
        <ActionButton
          label={
            paymentsCapability != null
              ? PAYMENTS_TOOLTIP_BY_CAPABILITY[paymentsCapability]
              : isRestricted
                ? 'Payments paused — view actions required'
                : 'Payments are active for this account.'
          }
          tooltipId="payments-tooltip"
          tooltipPlacement="bottom"
          variant="ghost"
          onClick={paymentsNeedsAttention ? () => onOpenActionsModal?.('payments') : openEnabled}
        >
          {paymentsCapability != null ? (
            <CapabilityStatusIcon status={paymentsCapability} />
          ) : isRestricted ? (
            <PausedCircleIcon size={12} />
          ) : (
            <Icon name="checkCircleFilled" size={12} fill={iconSuccess} />
          )}
          Payments
        </ActionButton>
      )}
      {showBillingChip && (
        <ActionButton
          label={formatBillingProductsTooltip(prototype?.billingFlavors ?? new Set())}
          tooltipId="billing-products-tooltip"
          tooltipPlacement="bottom"
          variant="ghost"
          onClick={openEnabled}
        >
          <Icon name="checkCircleFilled" size={12} fill={iconSuccess} />
          Billing
        </ActionButton>
      )}
    </div>
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
  onOpenAccountDrawer?: () => void
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
            showChevron
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
          variant="standard"
          onClick={openSettings}
        >
          <Icon name="settings" size={12} fill={iconDefault} />
          Settings
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
          onClick={onOpenAccountDrawer}
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
  onOpenAccountDrawer: _onOpenAccountDrawer,
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

  const showStatus = v.showPayouts || v.showPayments || showBillingButton
  return (
    <>
      {showStatus && (
        <div
          className="-ml-3 flex flex-wrap items-center gap-[8px]"
          data-name="Payouts Payments Billing row"
        >
          <AccountDetailHeaderStatusButtons
            showPayouts={v.showPayouts}
            showPayments={v.showPayments}
            showBilling={showBillingButton}
            status={status}
            onOpenSettingsSection={onOpenSettingsSection}
            onOpenActionsModal={openActionsModal}
          />
        </div>
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
