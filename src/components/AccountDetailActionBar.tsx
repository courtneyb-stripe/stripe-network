/**
 * AccountDetailActionBar — Figma Home actions (node 2:6375) + header trailing buttons (250:142685).
 * Payouts/Payments row; Move money, Settings, Profile, More in page header trailing.
 * Label tooltips (Payouts/Payments) use Figma 13:6299 (Plain Tooltip). Use previous design (11:5804) for instructional copy.
 */

import { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AccountHubIconWell12,
  AccountHubMoreIcon,
  AccountHubMoveMoneyIcon,
  AccountHubProfileIcon,
  AccountHubSettingsIcon,
} from '../icons/accountHubHeader/AccountHubHeaderIcons'
import { Icon } from '../icons/SailIcons'
import ActionsRequiredModal from './ActionsRequiredModal'
import type { ActionsRequiredFilter } from './ActionsRequiredModal'

/** Figma `.action-menu-create` (node 6244:79297) — order, labels, Sail icon keys. */
const MOVE_MONEY_MENU_ITEMS = [
  { label: 'Transfer', iconName: 'convert' },
  { label: 'Send', iconName: 'send' },
  { label: 'Request', iconName: 'invoice' },
  { label: 'Deposit', iconName: 'topup' },
  { label: 'Issue refund', iconName: 'refund' },
] as const

const MOVE_MONEY_MENU_SHADOW =
  'shadow-[0px_15px_35px_rgba(48,49,61,0.08),0px_5px_15px_rgba(0,0,0,0.12)]'

/** Figma 250:142685 — header trailing pills (well fill, 32×h, 16px radius, 4px icon–label, 8px between controls). */
const HEADER_MAIN_ACTION_PILL =
  'h-8 min-h-8 max-h-8 border-0 !rounded-2xl !bg-[#e3eaf0] shadow-none hover:!bg-neutral-50 !gap-1 !px-0 !py-0 leading-5 tracking-[-0.15px] text-default'
const HEADER_MAIN_ACTION_PILL_INSET = '!pl-2 !pr-3'

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
import SignalGroup from './SignalGroup'
import type { ProfileDrawerTabId } from './AccountDrawer'
import AccountHeaderMoreActionsMenu from './AccountHeaderMoreActionsMenu'
import { IconButton } from './IconButton'
import { ViewChip } from './listView/ViewChip'
import type { AccountConfig } from '../data/accountConfigs'
import CapabilityStatusIcon from '../icons/CapabilityStatusIcon'
import { usePrototypeOptional } from '../context/PrototypeContext'
import {
  CAPABILITY_GROUP_DISPLAY_LABELS,
  HEADER_CAPABILITY_ACTIVE_TOOLTIP,
  HEADER_EXTRA_ACTIVE_CAPABILITY_ORDER,
  formatBillingProductsTooltip,
  type AccountRoleId,
  type BillingFlavor,
  type CapabilityGroupId,
  type CapabilityStatus,
} from '../data/configMatrix'
import { resolveCapabilityGroups, signalGroupsForConfigureModal } from '../data/uadVisibility'
import { deriveAccountHeaderMainChrome } from '../data/accountHeaderActions'
import { parseGutterBleed } from '../utils/gutterBleed'

/**
 * Title for capability side panel — `panelId` matches chip keys (`payments`, `payouts`, `billing`, `extra:treasury`, …).
 */
export function getHeaderCapabilityPanelTitle(
  panelId: string,
  options?: { billingAsSubscriptions?: boolean }
): string {
  if (panelId === 'payments') return 'Payments'
  if (panelId === 'payouts') return 'Payouts'
  if (panelId === 'billing') return options?.billingAsSubscriptions ? 'Subscriptions' : 'Billing'
  if (panelId.startsWith('extra:')) {
    const gid = panelId.slice('extra:'.length) as CapabilityGroupId
    return CAPABILITY_GROUP_DISPLAY_LABELS[gid]
  }
  return 'Capability'
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

/** Figma 6269:112640–668 — subtitle row on hub capability cards. */
function capabilityHeaderSubtitle(
  capability: CapabilityStatus | undefined,
  isRestricted: boolean
): string {
  if (capability === 'active') return 'All active'
  if (capability === 'pausing_soon') return 'Some pause soon'
  if (capability === 'limited' || capability === 'paused') return 'Some paused'
  if (isRestricted) return 'Some paused'
  return 'All active'
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
  /** Show Settings in hub header. Merchant / merchant-template accounts only unless overridden. */
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
    showSettings: showPayoutsAndPayments,
    showSubscriptions: true,
  }
}

/**
 * When prototype (Configure) is present, allow Move money if account config already does
 * **or** any role implies balance / payout / FA-style money movement (merchant, recipient,
 * gp_recipient, storer). Customer-only roles keep header Move money off unless `config`
 * already included `moneyMovement`.
 */
export function applyPrototypeActionBarVisibility(
  visibility: ActionBarVisibility,
  prototype: { activeRoles: ReadonlySet<AccountRoleId> } | null | undefined
): ActionBarVisibility {
  if (prototype == null) return visibility
  const { activeRoles: roles } = prototype
  const showMoveMoneyFromRoles =
    roles.has('merchant') ||
    roles.has('recipient') ||
    roles.has('gp_recipient') ||
    roles.has('storer')
  return {
    ...visibility,
    showMoveMoney: Boolean(visibility.showMoveMoney) || showMoveMoneyFromRoles,
    /** Configure drives hub chrome; Settings follows merchant role only. */
    showSettings: roles.has('merchant'),
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
  /** Legacy prop; Settings deep link from header. */
  onOpenSettingsSection?: (sectionId: string) => void
  /** Opens right-hand capability panel (skeleton); `panelId` is `payments` | `payouts` | `billing` | `extra:${CapabilityGroupId}`. */
  onOpenCapabilityPanel?: (panelId: string) => void
  /**
   * When set, the 1px rule below the signal chip row spans the same horizontal bleed as the page header
   * (e.g. `-mx-6 px-6` with AccountDetail root `px-6`). Figma: hairline under `header/signal-group-row` (112:49522),
   * Home actions frame 2:6375 — same `neutral-50` as TabBar divider.
   */
  signalRowBorderBleedClassName?: string
  /** When true, signal row sits inside Account hub chrome — no horizontal bleed, rule, or vertical padding (parent supplies border + gap). */
  embedInHubHeader?: boolean
}

/** Header capability chips — no hover popovers; click opens capability side panel when handler is set. */
export function AccountDetailHeaderStatusButtons({
  showPayouts,
  showPayments,
  showBilling,
  extraActiveCapabilityChips = [],
  status,
  onOpenActionsModal,
  onOpenCapabilityPanel,
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
  onOpenActionsModal?: (filter?: ActionsRequiredFilter, initialSegment?: 'blocking' | 'actions') => void
  onOpenCapabilityPanel?: (panelId: string) => void
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

  const payoutsCapability = prototype?.capabilityStatuses.payouts
  const paymentsCapability = prototype?.capabilityStatuses.payments

  /** Click opens Actions required whenever the cap is not fully active (limited / pausing soon / paused). */
  const signalClickOpensActionsModal = (c: CapabilityStatus | undefined) =>
    c != null ? c !== 'active' : isRestricted

  const payoutsNeedsAttention = signalClickOpensActionsModal(payoutsCapability)
  /** Expired default PM does not surface as a Payments chip dot — only under Needs Attention → Blocking issues. */
  const paymentsNeedsAttention = signalClickOpensActionsModal(paymentsCapability)

  const billingUsesFlavors = prototype?.billingFlavors ?? new Set<BillingFlavor>()
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

  const openCapabilityOrFallback = (panelId: string, openModal: () => void) => {
    if (onOpenCapabilityPanel) {
      onOpenCapabilityPanel(panelId)
      return
    }
    openModal()
  }

  return (
    <>
      {showPayments && (
        <ViewChip
          visualVariant="headerCard"
          label="Payments"
          subtitle={capabilityHeaderSubtitle(
            paymentsCapability,
            isRestricted && paymentsCapability == null
          )}
          active={false}
          accessibilityLabel={
            paymentsCapability != null
              ? PAYMENTS_TOOLTIP_BY_CAPABILITY[paymentsCapability]
              : isRestricted
                ? 'Payments paused — view actions required'
                : 'Payments are active for this account.'
          }
          statusIcon={
            paymentsCapability != null ? (
              <CapabilityStatusIcon status={paymentsCapability} />
            ) : isRestricted ? (
              <PausedCircleIcon size={12} />
            ) : (
              <CapabilityStatusIcon status="active" />
            )
          }
          onClick={() =>
            openCapabilityOrFallback('payments', () => {
              if (paymentsNeedsAttention) {
                onOpenActionsModal?.('payments', 'actions')
              }
            })
          }
        />
      )}
      {showPayouts && (
        <ViewChip
          visualVariant="headerCard"
          label="Payouts"
          subtitle={capabilityHeaderSubtitle(payoutsCapability, isRestricted && payoutsCapability == null)}
          active={false}
          accessibilityLabel={
            payoutsCapability != null
              ? PAYOUTS_TOOLTIP_BY_CAPABILITY[payoutsCapability]
              : isRestricted
                ? 'Payouts paused — view actions required'
                : 'Payouts are active for this account.'
          }
          statusIcon={
            payoutsCapability != null ? (
              <CapabilityStatusIcon status={payoutsCapability} />
            ) : isRestricted ? (
              <PausedCircleIcon size={12} />
            ) : (
              <CapabilityStatusIcon status="active" />
            )
          }
          onClick={() =>
            openCapabilityOrFallback('payouts', () => {
              if (payoutsNeedsAttention) onOpenActionsModal?.('payouts', 'actions')
            })
          }
        />
      )}
      {showBillingChip && (
        <ViewChip
          visualVariant="headerCard"
          label={billingMinimalPopover ? 'Subscriptions' : 'Billing'}
          subtitle={capabilityHeaderSubtitle(
            prototype?.capabilityStatuses.billing,
            false
          )}
          active={false}
          accessibilityLabel={formatBillingProductsTooltip(billingUsesFlavors)}
          statusIcon={
            <CapabilityStatusIcon
              status={prototype?.capabilityStatuses.billing ?? 'active'}
            />
          }
          onClick={() =>
            openCapabilityOrFallback('billing', () => {
              if (billingNeedsComplianceClick) onOpenActionsModal?.('all', 'actions')
            })
          }
        />
      )}
      {extraActiveCapabilityChips.map((groupId) => {
        const panelId = `extra:${groupId}`
        const extraCapability = prototype?.capabilityStatuses[groupId]
        const extraNeedsAttention = signalClickOpensActionsModal(extraCapability)
        const tooltip =
          HEADER_CAPABILITY_ACTIVE_TOOLTIP[groupId] ??
          `${CAPABILITY_GROUP_DISPLAY_LABELS[groupId]} are active for this account.`
        return (
          <ViewChip
            key={groupId}
            visualVariant="headerCard"
            label={CAPABILITY_GROUP_DISPLAY_LABELS[groupId]}
            subtitle={capabilityHeaderSubtitle(extraCapability, false)}
            active={false}
            accessibilityLabel={tooltip}
            statusIcon={
              <CapabilityStatusIcon
                status={prototype?.capabilityStatuses[groupId] ?? 'active'}
              />
            }
            onClick={() =>
              openCapabilityOrFallback(panelId, () => {
                if (extraNeedsAttention) onOpenActionsModal?.('all', 'actions')
              })
            }
          />
        )
      })}
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

/** Move money, Settings, Profile, More — Figma 250:142685; for header trailing. */
export function AccountDetailMainActions({
  visibility,
  onOpenAccountDrawer,
  accountId,
  onOpenSettings: onOpenSettingsProp,
  merchantNameForMenu,
  /** When false, overflow renders as non-interactive chrome (non-merchant hubs). Default true. */
  overflowInteractive = true,
  /** When set (e.g. customer-only mock without floatie), drives header actions without prototype. */
  headerChromeOverride,
}: {
  visibility?: ActionBarVisibility
  onOpenAccountDrawer?: (opts?: { profileTab?: ProfileDrawerTabId }) => void
  accountId?: string
  onOpenSettings?: () => void
  /** Shown after “View dashboard as ” in More actions menu (Figma 252:142762). */
  merchantNameForMenu?: string
  overflowInteractive?: boolean
  headerChromeOverride?: ReturnType<typeof deriveAccountHeaderMainChrome>
}) {
  const navigate = useNavigate()
  const prototype = usePrototypeOptional()
  const v = useVisibility(visibility)
  const activeRolesKey = prototype ? [...prototype.activeRoles].sort().join(',') : ''
  const headerChrome = useMemo(() => {
    if (prototype) return deriveAccountHeaderMainChrome(prototype.activeRoles)
    return headerChromeOverride ?? null
  }, [prototype, activeRolesKey, headerChromeOverride])

  const showMoveMoneyRegion =
    headerChrome != null
      ? headerChrome.showMoveMoney
      : v.showMoveMoney
  const moveMoneyMenuItems =
    headerChrome != null ? headerChrome.moveMoneyItems : [...MOVE_MONEY_MENU_ITEMS]

  const moreMenuInteractive = overflowInteractive && (headerChrome?.moreMenuInteractive ?? true)

  const showSettingsRegion =
    headerChrome != null ? headerChrome.showSettings : v.showSettings

  const [moveMoneyOpen, setMoveMoneyOpen] = useState(false)
  const moveMoneyRef = useRef<HTMLDivElement>(null)
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)
  const moreMenuRef = useRef<HTMLDivElement>(null)
  const dashboardAsName = merchantNameForMenu ?? 'this merchant'
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

  useEffect(() => {
    if (!moveMoneyOpen) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setMoveMoneyOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [moveMoneyOpen])

  useEffect(() => {
    if (!moreMenuOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setMoreMenuOpen(false)
      }
    }
    const t = window.setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 0)
    return () => {
      clearTimeout(t)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [moreMenuOpen])

  useEffect(() => {
    if (!moreMenuOpen) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setMoreMenuOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [moreMenuOpen])

  return (
    <div
      className="flex flex-wrap items-center justify-end gap-2"
      data-name="Buttons"
      data-node-id="6269:112625"
    >
      {headerChrome?.showCreate && (
        <ActionButton
          label="Create"
          tooltipId="actionbar-create-tooltip"
          variant="standard"
          className={`${HEADER_MAIN_ACTION_PILL} ${HEADER_MAIN_ACTION_PILL_INSET}`}
          onClick={(e) => e.stopPropagation()}
        >
          <AccountHubIconWell12>
            <Icon name="add" size={12} fill="currentColor" className="shrink-0" aria-hidden />
          </AccountHubIconWell12>
          Create
        </ActionButton>
      )}
      {headerChrome?.showRefundStandalone && (
        <ActionButton
          label="Refund"
          tooltipId="actionbar-refund-standalone-tooltip"
          variant="standard"
          className={`${HEADER_MAIN_ACTION_PILL} ${HEADER_MAIN_ACTION_PILL_INSET}`}
          onClick={(e) => e.stopPropagation()}
        >
          <AccountHubIconWell12>
            <Icon name="refund" size={12} fill="currentColor" className="shrink-0" aria-hidden />
          </AccountHubIconWell12>
          Refund
        </ActionButton>
      )}
      {headerChrome?.showSendMoneyStandalone && (
        <ActionButton
          label="Send money"
          tooltipId="actionbar-send-money-tooltip"
          variant="standard"
          className={`${HEADER_MAIN_ACTION_PILL} ${HEADER_MAIN_ACTION_PILL_INSET}`}
          onClick={(e) => e.stopPropagation()}
        >
          <AccountHubIconWell12>
            <Icon name="send" size={12} fill="currentColor" className="shrink-0" aria-hidden />
          </AccountHubIconWell12>
          Send money
        </ActionButton>
      )}
      {showMoveMoneyRegion && (
        <div
          className={moveMoneyOpen ? 'relative z-[200]' : 'relative'}
          ref={moveMoneyRef}
        >
          <ActionButton
            label="Move money"
            tooltipId="actionbar-move-money-tooltip"
            variant="standard"
            className={`${HEADER_MAIN_ACTION_PILL} ${HEADER_MAIN_ACTION_PILL_INSET}`}
            onClick={(e) => {
              e.stopPropagation()
              setMoveMoneyOpen((o) => !o)
            }}
            aria-haspopup="menu"
            aria-expanded={moveMoneyOpen}
          >
            <AccountHubIconWell12>
              <AccountHubMoveMoneyIcon />
            </AccountHubIconWell12>
            Move money
          </ActionButton>
          {moveMoneyOpen && (
            <div
              className={`absolute left-0 top-full z-[200] mt-1 flex min-w-[272px] max-w-[min(100vw-2rem,320px)] flex-col gap-0 rounded-[12px] border border-neutral-100 bg-surface p-1 ${MOVE_MONEY_MENU_SHADOW}`}
              role="menu"
              data-name=".action-menu-create"
              data-node-id="6244:79297"
            >
              {moveMoneyMenuItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  className="group flex w-full shrink-0 items-center gap-2 rounded-[8px] p-2 text-left font-label-medium-emphasized text-default transition-colors hover:bg-brand-25 focus:bg-brand-25 focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-inset"
                  data-name=".action-list-item"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    setMoveMoneyOpen(false)
                  }}
                >
                  <span
                    className="flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-xsmall)] bg-offset text-icon-default transition-colors group-hover:bg-brand-100 group-hover:text-icon-action"
                    aria-hidden
                  >
                    <Icon
                      name={item.iconName}
                      size={16}
                      fill="currentColor"
                      className="shrink-0"
                    />
                  </span>
                  <span className="flex min-w-0 max-h-8 flex-1 flex-col justify-center leading-5 tracking-[-0.15px] transition-colors group-hover:text-action-primary">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {showSettingsRegion && (
        <ActionButton
          label="Manage settings"
          tooltipId="actionbar-settings-tooltip"
          variant="standard"
          className={`${HEADER_MAIN_ACTION_PILL} ${HEADER_MAIN_ACTION_PILL_INSET}`}
          onClick={openSettings}
        >
          <AccountHubIconWell12>
            <AccountHubSettingsIcon />
          </AccountHubIconWell12>
          Settings
        </ActionButton>
      )}
      {v.showExpand && (
        <ActionButton
          label="View profile"
          tooltipId="actionbar-account-drawer-tooltip"
          variant="standard"
          className={`${HEADER_MAIN_ACTION_PILL} ${HEADER_MAIN_ACTION_PILL_INSET}`}
          onClick={() => onOpenAccountDrawer?.({ profileTab: 'details' })}
        >
          <AccountHubIconWell12>
            <AccountHubProfileIcon />
          </AccountHubIconWell12>
          View profile
        </ActionButton>
      )}
      {v.showMore &&
        (moreMenuInteractive ? (
          <div className={moreMenuOpen ? 'relative z-[200]' : 'relative'} ref={moreMenuRef}>
            <IconButton
              label="More actions"
              tooltipId="actionbar-more-tooltip"
              roundedFull
              className={`${HEADER_MAIN_ACTION_PILL} !px-2`}
              onClick={(e) => {
                e.stopPropagation()
                setMoreMenuOpen((open) => !open)
              }}
              aria-haspopup="menu"
              aria-expanded={moreMenuOpen}
            >
              <span className="inline-flex size-4 shrink-0 items-center justify-center text-icon-default" aria-hidden>
                <AccountHubMoreIcon />
              </span>
            </IconButton>
            {moreMenuOpen && (
              <AccountHeaderMoreActionsMenu
                merchantName={dashboardAsName}
                onClose={() => setMoreMenuOpen(false)}
              />
            )}
          </div>
        ) : (
          <IconButton
            label="More actions (preview)"
            tooltipId="actionbar-more-display-tooltip"
            variant="display"
            roundedFull
            className={`${HEADER_MAIN_ACTION_PILL} !px-2`}
          >
            <span className="inline-flex size-4 shrink-0 items-center justify-center text-icon-subdued" aria-hidden>
              <AccountHubMoreIcon />
            </span>
          </IconButton>
        ))}
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
  onOpenCapabilityPanel,
  signalRowBorderBleedClassName,
  embedInHubHeader = false,
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
  /** Prototype roles: Payments / Payouts chips intersect `resolveCapabilityGroups` (Customer does not add groups). */
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
      {/* Billing header chip hidden for now; restore showBilling={showBillingButton} when ready. */}
      <AccountDetailHeaderStatusButtons
        showPayouts={signalChipsFromRoles.payouts}
        showPayments={signalChipsFromRoles.payments}
        showBilling={false}
        extraActiveCapabilityChips={extraActiveCapabilityChips}
        status={status}
        onOpenActionsModal={openActionsModal}
        onOpenCapabilityPanel={onOpenCapabilityPanel}
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
        (embedInHubHeader ? (
          <div data-name="header/signal-group-row">{signalRowWithDivider}</div>
        ) : signalRowBleed ? (
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
