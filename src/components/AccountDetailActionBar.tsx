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

/** Red circle with white X — Figma cancelCircleFilled / Icon/Feedback Critical (#E61947). For restricted Payouts/Payments. */
function RestrictedCircleIcon({ size = 12 }: { size?: number }) {
  return (
    <span className="shrink-0 inline-flex" aria-hidden>
      <svg width={size} height={size} viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="6" cy="6" r="6" fill="var(--color-icon-feedback-critical)" />
        <path
          d="M4 4l4 4M8 4l-4 4"
          stroke="white"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
      </svg>
    </span>
  )
}

import { ActionButton } from './ActionButton'
import { IconButton } from './IconButton'
import LabelTooltip from './LabelTooltip'
import type { AccountConfig } from '../data/accountConfigs'

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
}

/**
 * Derive action bar visibility from account config.
 * - Configuration (customer vs merchant): customer has showPayouts/showCollectedFees false and no moneyMovement section → no Payouts, Payments, Move money.
 * - Status (enabled/restricted): only affects how Payouts/Payments look (outline vs restricted dropdown), not whether they show; pass status to the bar separately.
 * - High risk (Radar rule matches): options.isRadarRuleMatch is passed for future use (e.g. show/hide certain actions or risk-specific CTAs).
 * - Products (FA, multi-currency FA, Loans): options.products can override or narrow visibility when available (e.g. showMoveMoney only when financialAccounts true).
 */
export function getActionBarVisibility(config: AccountConfig, _options?: { isRadarRuleMatch?: boolean; products?: { financialAccounts?: boolean; financialAccountsMultiCurrency?: boolean; loans?: boolean } }): ActionBarVisibility {
  const hasMoneyMovement = config.sections.includes('moneyMovement')
  return {
    showPayouts: config.showPayouts,
    showPayments: config.showCollectedFees,
    showMoveMoney: hasMoneyMovement,
    showMore: true,
    showExpand: true,
    showSettings: true,
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
  onOpenActionsModal?: (filter?: ActionsRequiredFilter) => void
  onCloseActionsModal?: () => void
  /** When provided, Settings icon opens parent-controlled Settings modal (e.g. for deep link from profile Edit). */
  onOpenSettings?: () => void
}

/** Restricted Payouts/Payments button — click opens Actions required full page (no dropdown, no chevron). */
function RestrictedActionButton({
  label,
  tooltipLabel,
  tooltipId,
  onClick,
}: {
  label: string
  tooltipLabel: string
  tooltipId: string
  onClick: () => void
}) {
  return (
    <ActionButton
      label={tooltipLabel}
      tooltipId={tooltipId}
      variant="standard"
      showChevron={false}
      onClick={onClick}
    >
      <RestrictedCircleIcon size={12} />
      {label}
    </ActionButton>
  )
}

/** Payouts/Payments for header: ghost style when enabled, restricted style when restricted. Rendered upper right on same baseline as page heading. */
export function AccountDetailHeaderStatusButtons({
  showPayouts,
  showPayments,
  status,
  onOpenActionsModal,
}: {
  showPayouts: boolean
  showPayments: boolean
  status?: 'enabled' | 'restricted' | 'restricted_soon' | undefined
  onOpenActionsModal?: (filter?: ActionsRequiredFilter) => void
}) {
  const isRestricted = status === 'restricted'
  if (!showPayouts && !showPayments) return null
  return (
    <div className={`flex items-center ${isRestricted ? 'gap-[8px]' : 'gap-0'}`}>
      {showPayouts && (isRestricted ? (
        <RestrictedActionButton
          label="Payouts"
          tooltipLabel="Payouts paused"
          tooltipId="payouts-tooltip"
          onClick={() => onOpenActionsModal?.('payouts')}
        />
      ) : (
        <ActionButton label="Payouts are enabled for this account." tooltipId="payouts-tooltip" variant="ghost">
          <Icon name="checkCircleFilled" size={12} fill={iconSuccess} />
          Payouts
        </ActionButton>
      ))}
      {showPayments && (isRestricted ? (
        <RestrictedActionButton
          label="Payments"
          tooltipLabel="Payments paused"
          tooltipId="payments-tooltip"
          onClick={() => onOpenActionsModal?.('payments')}
        />
      ) : (
        <ActionButton label="Payments are enabled for this account." tooltipId="payments-tooltip" variant="ghost">
          <Icon name="checkCircleFilled" size={12} fill={iconSuccess} />
          Payments
        </ActionButton>
      ))}
    </div>
  )
}

/** When visibility is omitted, show all. Otherwise respect each flag (undefined = show). */
function useVisibility(visibility: ActionBarVisibility | undefined) {
  return {
    showPayouts: visibility?.showPayouts !== false,
    showPayments: visibility?.showPayments !== false,
    showMoveMoney: visibility?.showMoveMoney !== false,
    showMore: visibility?.showMore !== false,
    showExpand: visibility?.showExpand !== false,
    showSettings: visibility?.showSettings !== false,
  }
}

export default function AccountDetailActionBar({
  status,
  visibility,
  onOpenAccountDrawer,
  accountId,
  accountName,
  actionsModalOpen: controlledActionsModalOpen,
  actionsModalInitialFilter,
  onOpenActionsModal: controlledOnOpen,
  onCloseActionsModal: controlledOnClose,
  onOpenSettings: onOpenSettingsProp,
}: AccountDetailActionBarProps) {
  const navigate = useNavigate()
  const v = useVisibility(visibility)
  const [moveMoneyOpen, setMoveMoneyOpen] = useState(false)
  const [internalActionsModalOpen, setInternalActionsModalOpen] = useState(false)
  const [internalActionsModalFilter, setInternalActionsModalFilter] = useState<ActionsRequiredFilter>('all')
  const openSettings =
    onOpenSettingsProp ??
    (accountId ? () => navigate(`/network/${accountId}/settings`) : () => {})
  const isControlled = controlledOnOpen != null && controlledOnClose != null
  const actionsModalOpen = isControlled ? (controlledActionsModalOpen ?? false) : internalActionsModalOpen
  const openActionsModal = isControlled
    ? (filter?: ActionsRequiredFilter) => controlledOnOpen!(filter)
    : (filter?: ActionsRequiredFilter) => {
        setInternalActionsModalFilter(filter ?? 'all')
        setInternalActionsModalOpen(true)
      }
  const closeActionsModal = isControlled ? controlledOnClose! : () => setInternalActionsModalOpen(false)
  const moveMoneyRef = useRef<HTMLDivElement>(null)

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
                      // TODO: handle action (e.g. navigate or callback)
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
      <ActionsRequiredModal
        open={actionsModalOpen}
        onClose={closeActionsModal}
        accountId={accountId}
        accountName={accountName}
        initialFilter={isControlled ? (actionsModalInitialFilter ?? 'all') : internalActionsModalFilter}
      />
    </div>
  )
}
