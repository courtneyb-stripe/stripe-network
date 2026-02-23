/**
 * AccountDetailActionBar — Figma Home actions (node 2:6375).
 * Payouts, Payments, Move money (with dropdown), More, Expand, Settings.
 * Label tooltips (Payouts/Payments) use Figma 13:6299 (Plain Tooltip). Use previous design (11:5804) for instructional copy.
 */

import { useState, useRef, useEffect } from 'react'
import {
  ACTIONS_REQUIRED_LIST,
  filterActionsRequired,
  getImpactsDisplayString,
  getImpactsDisplayParts,
  getImpactsTooltipLabel,
  getImpactsMoreTooltipLabel,
  type ImpactsFilter,
} from '../data/actionsRequired'
import { ActionRequiredDescriptionRow } from './ActionRequiredDescriptionRow'
import { List, ListItem } from './List'
import { Icon } from '../icons/SailIcons'
import { ConvertIcon } from '../icons/ConvertIcon'
import { RightArrowIcon } from './metrics/MetricCard'
import ActionsRequiredModal from './ActionsRequiredModal'
import type { ActionsRequiredFilter } from './ActionsRequiredModal'
import SettingsModal from './SettingsModal'

/** One required action item for dropdown — Figma 17-7459 / .action-payment-item. No row icon (kept simple). */
export type RequiredAction = {
  id: string
  title: string
  dueDate: Date
  impacts: string
  impactsFilter: ImpactsFilter
}

function getDaysPastDue(due: Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(due)
  d.setHours(0, 0, 0, 0)
  const diff = today.getTime() - d.getTime()
  return Math.max(0, Math.floor(diff / (24 * 60 * 60 * 1000)))
}

/** Payouts dropdown: first few actions that impact payouts (matches modal "Impacts payouts"). No row icon. */
const REQUIRED_ACTIONS_PAYOUTS: RequiredAction[] = filterActionsRequired('payouts')
  .slice(0, 3)
  .map((a) => ({
    id: a.id,
    title: a.title,
    dueDate: a.dueDate,
    impacts: getImpactsDisplayString(a),
    impactsFilter: a.impactsFilter,
  }))

/** Payments dropdown: first few actions that impact payments (matches modal "Impacts payments"). No row icon. */
const REQUIRED_ACTIONS_PAYMENTS: RequiredAction[] = filterActionsRequired('payments')
  .slice(0, 3)
  .map((a) => ({
    id: a.id,
    title: a.title,
    dueDate: a.dueDate,
    impacts: getImpactsDisplayString(a),
    impactsFilter: a.impactsFilter,
  }))

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
  /** When provided, actions-required modal is controlled by parent. Pass filter to open with that view (e.g. 'payouts' from Payouts dropdown). */
  actionsModalOpen?: boolean
  actionsModalInitialFilter?: ActionsRequiredFilter
  onOpenActionsModal?: (filter?: ActionsRequiredFilter) => void
  onCloseActionsModal?: () => void
  /** When provided, Settings icon opens parent-controlled Settings modal (e.g. for deep link from profile Edit). */
  onOpenSettings?: () => void
}

/** Actions required dropdown — small section header, list, then "N of total" link at bottom. */
function ActionsRequiredDropdown({
  open,
  onClose,
  actions,
  anchorRef,
  onViewAllClick,
}: {
  open: boolean
  onClose: () => void
  actions: RequiredAction[]
  anchorRef: React.RefObject<HTMLDivElement | null>
  /** Opens the fullscreen Actions required modal. */
  onViewAllClick?: () => void
}) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      const anchor = anchorRef.current
      const panel = panelRef.current
      const target = e.target as Node
      if (anchor?.contains(target) || panel?.contains(target)) return
      onClose()
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, onClose, anchorRef])

  if (!open) return null

  return (
    <div
      ref={panelRef}
      className="absolute left-0 top-full z-20 mt-1 min-w-[320px] w-max max-w-[90vw] rounded-[12px] border border-neutral-100 bg-surface p-2 shadow-[0px_15px_35px_0px_rgba(48,49,61,0.08),0px_5px_15px_0px_rgba(0,0,0,0.12)]"
      data-name=".action-menu-refund-list"
      data-node-id="17:7305"
    >
      <div className="flex flex-col gap-4 w-max min-w-full px-2" data-name="List" data-node-id="17:7307">
        <List
          aria-label="Actions required"
          className="[&>li]:min-w-[max-content] !px-0"
          variant="noDividers"
          onAction={(id) => {
            onViewAllClick?.()
            onClose()
          }}
        >
          {actions.map((action) => {
            const daysPastDue = getDaysPastDue(action.dueDate)
            const pastDueText = `${daysPastDue} days past due`
            const fullAction = ACTIONS_REQUIRED_LIST.find((a) => a.id === action.id)
            const impactsBase = fullAction ? getImpactsDisplayParts(fullAction).base : action.impacts
            const impactsMore = fullAction ? getImpactsDisplayParts(fullAction).more : undefined
            const mainTooltipLabel = fullAction ? getImpactsTooltipLabel(fullAction) : action.impacts
            const moreTooltipLabel = fullAction ? getImpactsMoreTooltipLabel(fullAction) : ''
            return (
              <ListItem
                key={action.id}
                id={action.id}
                icon={
                  <Icon
                    name="identityVerification"
                    size={16}
                    fill="var(--color-icon-subdued)"
                  />
                }
                title={action.title}
                trailingContent={
                  <span
                    className="opacity-0 transition-opacity duration-150 group-hover/row:opacity-100 pr-2"
                    aria-hidden
                  >
                    <RightArrowIcon size={12} fill="var(--color-icon-subdued)" />
                  </span>
                }
                children={
                  <ActionRequiredDescriptionRow
                    impactsBase={impactsBase}
                    impactsMore={impactsMore}
                    mainTooltipLabel={mainTooltipLabel}
                    moreTooltipLabel={impactsMore ? moreTooltipLabel : undefined}
                    tooltipId={`actions-dropdown-impacts-${action.id}`}
                    pastDueText={pastDueText}
                    singleLine
                  />
                }
              />
            )
          })}
        </List>
      </div>
    </div>
  )
}

/** Restricted Payouts/Payments button with actions-required dropdown — Figma 17-7488 + 17-7305. */
function RestrictedActionButtonWithDropdown({
  label,
  tooltipLabel,
  tooltipId,
  actions,
  dropdownOpen,
  onDropdownToggle,
  onDropdownClose,
  onViewAllClick,
  wrapperRef,
}: {
  label: string
  tooltipLabel: string
  tooltipId: string
  actions: RequiredAction[]
  dropdownOpen: boolean
  onDropdownToggle: () => void
  onDropdownClose: () => void
  onViewAllClick?: () => void
  wrapperRef: React.RefObject<HTMLDivElement | null>
}) {
  return (
    <div className="relative inline-block" ref={wrapperRef}>
      <ActionButton
        label={tooltipLabel}
        tooltipId={tooltipId}
        variant="standard"
        showChevron
        onClick={onDropdownToggle}
        aria-expanded={dropdownOpen}
        aria-haspopup="dialog"
      >
        <RestrictedCircleIcon size={12} />
        {label}
      </ActionButton>
      <ActionsRequiredDropdown
        open={dropdownOpen}
        onClose={onDropdownClose}
        actions={actions}
        anchorRef={wrapperRef}
        onViewAllClick={onViewAllClick}
      />
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
  actionsModalOpen: controlledActionsModalOpen,
  actionsModalInitialFilter,
  onOpenActionsModal: controlledOnOpen,
  onCloseActionsModal: controlledOnClose,
  onOpenSettings: onOpenSettingsProp,
}: AccountDetailActionBarProps) {
  const v = useVisibility(visibility)
  const [moveMoneyOpen, setMoveMoneyOpen] = useState(false)
  const [actionsDropdownOpen, setActionsDropdownOpen] = useState<'payouts' | 'payments' | null>(null)
  const [internalActionsModalOpen, setInternalActionsModalOpen] = useState(false)
  const [internalSettingsModalOpen, setInternalSettingsModalOpen] = useState(false)
  const settingsModalOpen = onOpenSettingsProp != null ? false : internalSettingsModalOpen
  const openSettings = onOpenSettingsProp ?? (() => setInternalSettingsModalOpen(true))
  const isControlled = controlledOnOpen != null && controlledOnClose != null
  const actionsModalOpen = isControlled ? (controlledActionsModalOpen ?? false) : internalActionsModalOpen
  const openActionsModal = isControlled
    ? (filter?: ActionsRequiredFilter) => controlledOnOpen!(filter)
    : () => setInternalActionsModalOpen(true)
  const closeActionsModal = isControlled ? controlledOnClose! : () => setInternalActionsModalOpen(false)
  const moveMoneyRef = useRef<HTMLDivElement>(null)
  const payoutsDropdownRef = useRef<HTMLDivElement>(null)
  const paymentsDropdownRef = useRef<HTMLDivElement>(null)
  const isRestricted = status === 'restricted' // customer-only (status undefined) → not restricted

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

  const bothGhost = v.showPayouts && v.showPayments && !isRestricted

  return (
    <div
      className="flex flex-wrap items-center gap-[8px]"
      data-name="Home actions"
      data-node-id="2:6375"
    >
      {bothGhost ? (
        <div className="flex items-center gap-0">
          <ActionButton label="Payouts are enabled for this account." tooltipId="payouts-tooltip" variant="ghost" labelDottedTooltip>
            <Icon name="checkCircleFilled" size={12} fill={iconSuccess} />
            Payouts
          </ActionButton>
          <ActionButton label="Payments are enabled for this account." tooltipId="payments-tooltip" variant="ghost" labelDottedTooltip>
            <Icon name="checkCircleFilled" size={12} fill={iconSuccess} />
            Payments
          </ActionButton>
        </div>
      ) : (
        <>
          {v.showPayouts && (isRestricted ? (
            <RestrictedActionButtonWithDropdown
              label="Payouts"
              tooltipLabel="Payouts paused"
              tooltipId="payouts-tooltip"
              actions={REQUIRED_ACTIONS_PAYOUTS}
              dropdownOpen={actionsDropdownOpen === 'payouts'}
              onDropdownToggle={() => setActionsDropdownOpen((o) => (o === 'payouts' ? null : 'payouts'))}
              onDropdownClose={() => setActionsDropdownOpen(null)}
              onViewAllClick={() => openActionsModal('payouts')}
              wrapperRef={payoutsDropdownRef}
            />
          ) : (
            <ActionButton label="Payouts are enabled for this account." tooltipId="payouts-tooltip" variant="ghost" labelDottedTooltip>
              <Icon name="checkCircleFilled" size={12} fill={iconSuccess} />
              Payouts
            </ActionButton>
          ))}
          {v.showPayments && (isRestricted ? (
            <RestrictedActionButtonWithDropdown
              label="Payments"
              tooltipLabel="Payments paused"
              tooltipId="payments-tooltip"
              actions={REQUIRED_ACTIONS_PAYMENTS}
              dropdownOpen={actionsDropdownOpen === 'payments'}
              onDropdownToggle={() => setActionsDropdownOpen((o) => (o === 'payments' ? null : 'payments'))}
              onDropdownClose={() => setActionsDropdownOpen(null)}
              onViewAllClick={() => openActionsModal('payments')}
              wrapperRef={paymentsDropdownRef}
            />
          ) : (
            <ActionButton label="Payments are enabled for this account." tooltipId="payments-tooltip" variant="ghost" labelDottedTooltip>
              <Icon name="checkCircleFilled" size={12} fill={iconSuccess} />
              Payments
            </ActionButton>
          ))}
        </>
      )}
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
      {v.showSettings && (
        <IconButton
          label="Settings"
          tooltipId="actionbar-settings-tooltip"
          roundedFull
          onClick={openSettings}
        >
          <Icon name="settings" size={12} fill={iconDefault} />
        </IconButton>
      )}
      <ActionsRequiredModal
        open={actionsModalOpen}
        onClose={closeActionsModal}
        accountId={accountId}
        initialFilter={actionsModalInitialFilter ?? 'all'}
      />
      {onOpenSettingsProp == null && (
        <SettingsModal open={settingsModalOpen} onClose={() => setInternalSettingsModalOpen(false)} />
      )}
    </div>
  )
}
