/**
 * Account hub header primary actions (Create / Refund / Send money / Move money) from Configure roles.
 * Spec: customer-only vs paired MM; recipient-only Send money; role-specific Move money menus.
 */

import type { AccountRoleId } from './configMatrix'

export type MoveMoneyMenuItem = {
  label: string
  iconName: string
}

export type AccountHeaderMainChrome = {
  showCreate: boolean
  showRefundStandalone: boolean
  showSendMoneyStandalone: boolean
  showMoveMoney: boolean
  moveMoneyItems: MoveMoneyMenuItem[]
  /** Merchant hub only — matches Configure role outline (non-merchant hubs omit Settings). */
  showSettings: boolean
  /** Overflow opens menu only for merchant role (prototype). */
  moreMenuInteractive: boolean
}

function pushUniqueItem(items: MoveMoneyMenuItem[], item: MoveMoneyMenuItem) {
  if (!items.some((i) => i.label === item.label)) items.push(item)
}

/** Non-relationship roles that imply money-movement affordances in the hub header. */
function collectRoleMoveMoneyItems(roles: ReadonlySet<AccountRoleId>): MoveMoneyMenuItem[] {
  const hasMerchant = roles.has('merchant')
  const hasRecipient = roles.has('recipient')
  const hasGp = roles.has('gp_recipient')
  const hasStorer = roles.has('storer')
  const hasIssuer = roles.has('issuer')
  const hasCardHolder = roles.has('card_holder')

  const items: MoveMoneyMenuItem[] = []

  if (hasMerchant) {
    pushUniqueItem(items, { label: 'Send', iconName: 'send' })
    pushUniqueItem(items, { label: 'Request', iconName: 'invoice' })
  }
  /** Recipient alone adds Send; folded under Treasury when Storer is active (no separate Send). */
  if (hasRecipient && !hasMerchant && !hasStorer) {
    pushUniqueItem(items, { label: 'Send', iconName: 'send' })
  }
  if (hasStorer) {
    pushUniqueItem(items, { label: 'Transfer', iconName: 'convert' })
    pushUniqueItem(items, { label: 'Deposit', iconName: 'topup' })
  }
  /** GP rails — same primary affordance as recipient outbound sends (“Send”). */
  if (hasGp) {
    pushUniqueItem(items, { label: 'Send', iconName: 'send' })
  }
  /** Card issuing — inbound Deposit + outbound Send (same rail as payout sends elsewhere). */
  if (hasIssuer || hasCardHolder) {
    pushUniqueItem(items, { label: 'Deposit', iconName: 'topup' })
    pushUniqueItem(items, { label: 'Send', iconName: 'send' })
  }

  return items
}

/**
 * Derive header chrome from applied Configure roles (`PrototypeContext.activeRoles`).
 */
export function deriveAccountHeaderMainChrome(roles: ReadonlySet<AccountRoleId>): AccountHeaderMainChrome {
  const hasCustomer = roles.has('customer')
  const hasMerchant = roles.has('merchant')
  const hasRecipient = roles.has('recipient')
  const hasGp = roles.has('gp_recipient')
  const hasStorer = roles.has('storer')
  const hasIssuer = roles.has('issuer')
  const hasCardHolder = roles.has('card_holder')

  const moreMenuInteractive = hasMerchant

  const customerOnly = roles.size === 1 && hasCustomer
  if (customerOnly) {
    return {
      showCreate: true,
      showRefundStandalone: true,
      showSendMoneyStandalone: false,
      showMoveMoney: false,
      moveMoneyItems: [],
      showSettings: false,
      moreMenuInteractive,
    }
  }

  const recipientStandalone =
    hasRecipient &&
    !hasCustomer &&
    !hasMerchant &&
    !hasStorer &&
    !hasGp &&
    !hasIssuer &&
    !hasCardHolder

  if (recipientStandalone) {
    return {
      showCreate: false,
      showRefundStandalone: false,
      showSendMoneyStandalone: true,
      showMoveMoney: false,
      moveMoneyItems: [],
      showSettings: false,
      moreMenuInteractive,
    }
  }

  const roleItems = collectRoleMoveMoneyItems(roles)

  const hasMmRole =
    hasMerchant ||
    hasRecipient ||
    hasGp ||
    hasStorer ||
    hasIssuer ||
    hasCardHolder

  const customerPairedWithMm = hasCustomer && hasMmRole

  let moveMoneyItems: MoveMoneyMenuItem[] = [...roleItems]
  let showRefundStandalone = false

  if (customerPairedWithMm) {
    if (moveMoneyItems.length >= 1) {
      moveMoneyItems = [...moveMoneyItems, { label: 'Issue refund', iconName: 'refund' }]
    } else {
      showRefundStandalone = true
    }
  }

  const showMoveMoney = moveMoneyItems.length > 0

  return {
    showCreate: false,
    showRefundStandalone,
    showSendMoneyStandalone: false,
    showMoveMoney,
    moveMoneyItems,
    showSettings: hasMerchant,
    moreMenuInteractive,
  }
}
