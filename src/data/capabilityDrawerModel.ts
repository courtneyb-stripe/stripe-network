/**
 * Structured capability lists for the Account “Capabilities” side panel (Figma 249:142275).
 * Mirrors `PaymentsPopoverPanel` status splits; the drawer lists full granular labels (popovers may use +N overflow chips).
 */

import {
  BILLING_FLAVOR_ORDER,
  CAPABILITY_GROUP_DISPLAY_LABELS,
  CAPABILITY_GROUP_DISPLAY_ORDER,
  DEFAULT_FINANCING_POPOVER,
  FINANCIAL_ACCOUNTS_POPOVER_CHIPS,
  financingPopoverChipLabels,
  HEADER_EXTRA_ACTIVE_CAPABILITY_ORDER,
  type BillingFlavor,
  type CapabilityGroupId,
  type CapabilityStatus,
  type FinancingProductSelection,
  signalPopoverSingleCapabilityRow,
  TRANSFERS_GROUP_POPOVER_CHIPS,
  type SignalPopoverPanelVariant,
} from './configMatrix'
import {
  canConfigurePayoutSchedule,
  resolveCapabilityGroups,
  signalGroupsForConfigureModal,
} from './uadVisibility'
import type { PrototypeState } from '../context/PrototypeContext'

/** Subset of action-bar flags used to decide which drawer rows match visible chips. */
export type CapabilityDrawerActionBarVisibility = {
  showPayouts?: boolean
  showPayments?: boolean
  showSubscriptions?: boolean
}

const BILLING_CHIP_LABEL: Record<BillingFlavor, string> = {
  invoicing: 'Invoices',
  subscriptions: 'Subscriptions',
  metered_billing: 'Metered billing',
}

const PAYMENT_METHOD_CHIPS = [
  'Affirm payments',
  'Bancontact payments',
  'Card payments',
  'Cash App Pay payments',
  'EPS payments',
  'Klarna payments',
] as const

const PAYMENT_METHOD_CHIPS_LIMITED_ACTIVE = [
  'Affirm payments',
  'Bancontact payments',
  'Card payments',
  'Cash App Pay payments',
  'EPS payments',
  'Klarna payments',
  'Samsung Pay payments',
  'PAYCO payments',
] as const

const PAUSING_SOON_PAYMENTS_LABEL = 'Amazon Pay payments'
const ZIP_PAUSED_LABEL = 'Zip payments'
const PAYOUTS_CHIPS = ['Payouts'] as const
const CARD_ISSUING_CHIPS = [CAPABILITY_GROUP_DISPLAY_LABELS.issuing] as const
const FINANCING_LOAN_LINE = 'Loan •••• 7809'
const FA_PAUSED_LABEL = 'Cross-border transfers'
const TRANSFERS_PAUSED_LABEL = 'Inbound transfers'
const ISSUING_PAUSED_LABEL = 'Physical cards'

/**
 * Drawer lists every granular payment method (popover uses comma list + "+13" overflow chip).
 * Keep labels in the same product language as `PAYMENT_METHOD_CHIPS` / Payments popover.
 */
const PAYMENTS_DRAWER_EXTRA_LABELS = [
  'Amazon Pay payments',
  'Apple Pay payments',
  'Google Pay payments',
  'Link payments',
  'ACH Direct Debit payments',
  'SEPA Debit payments',
  'Afterpay payments',
  'Clearpay payments',
  'Alipay payments',
  'WeChat Pay payments',
  'PayPal payments',
  'Union Pay payments',
  'Revolut Pay payments',
] as const

/** Treasury drawer: three capabilities implied by FA popover’s "+3" overflow chip. */
const FINANCIAL_ACCOUNTS_DRAWER_OVERFLOW_LABELS = [
  'Inbound ACH',
  'Outbound ACH',
  'Wire transfers',
] as const

export type CapabilityDrawerGranularSection = {
  sectionStatus: CapabilityStatus
  labels: string[]
}

export type CapabilityDrawerGroupRow = {
  panelId: string
  groupId: CapabilityGroupId
  title: string
  headerStatus: CapabilityStatus
  totalCount: number
  sections: CapabilityDrawerGranularSection[]
}

function totalLabelCount(sections: CapabilityDrawerGranularSection[]): number {
  return sections.reduce((n, s) => n + s.labels.length, 0)
}

function panelIdForGroup(groupId: CapabilityGroupId): string {
  if (groupId === 'payments') return 'payments'
  if (groupId === 'payouts') return 'payouts'
  if (groupId === 'billing') return 'billing'
  return `extra:${groupId}`
}

function signalVariantForGroup(groupId: CapabilityGroupId): SignalPopoverPanelVariant {
  switch (groupId) {
    case 'payments':
      return 'payments'
    case 'payouts':
      return 'payouts'
    case 'transfers':
      return 'transfers'
    case 'treasury':
      return 'financialAccounts'
    case 'capital':
      return 'financing'
    case 'issuing':
      return 'cardIssuing'
    case 'billing':
      return 'billing'
  }
}

function pausedGranularLine(
  variant: SignalPopoverPanelVariant,
  isPayouts: boolean,
  isFinancialAccounts: boolean,
  isFinancing: boolean,
  isCardIssuing: boolean,
  isTransfers: boolean
): string {
  if (isPayouts) return 'Instant payouts'
  if (isFinancialAccounts) return FA_PAUSED_LABEL
  if (isFinancing) return FINANCING_LOAN_LINE
  if (isCardIssuing) return ISSUING_PAUSED_LABEL
  if (isTransfers) return TRANSFERS_PAUSED_LABEL
  return ZIP_PAUSED_LABEL
}

function activeMethodLabels(
  variant: SignalPopoverPanelVariant,
  financingProducts: FinancingProductSelection
): readonly string[] {
  const isPayouts = variant === 'payouts'
  const isTransfers = variant === 'transfers'
  const isFinancialAccounts = variant === 'financialAccounts'
  const isFinancing = variant === 'financing'
  const isCardIssuing = variant === 'cardIssuing'
  if (isPayouts) return PAYOUTS_CHIPS
  if (isTransfers) return TRANSFERS_GROUP_POPOVER_CHIPS
  if (isFinancialAccounts) return FINANCIAL_ACCOUNTS_POPOVER_CHIPS
  if (isFinancing) return financingPopoverChipLabels(financingProducts)
  if (isCardIssuing) return CARD_ISSUING_CHIPS
  return PAYMENT_METHOD_CHIPS
}

function sortPaymentGranularLabels(labels: readonly string[]): string[] {
  return [...labels].sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }))
}

function allPaymentsDrawerLabels(base: readonly string[]): string[] {
  const out = [...base]
  for (const x of PAYMENTS_DRAWER_EXTRA_LABELS) {
    if (!out.includes(x)) out.push(x)
  }
  return sortPaymentGranularLabels(out)
}

function allFinancialAccountsDrawerLabels(base: readonly string[]): string[] {
  return [...base, ...FINANCIAL_ACCOUNTS_DRAWER_OVERFLOW_LABELS]
}

type BuildSectionsCtx = {
  variant: SignalPopoverPanelVariant
  status: CapabilityStatus
  financingProducts: FinancingProductSelection
  billingFlavors: Set<BillingFlavor>
  paymentsCustomerOnly: boolean
  hasPaymentMethodOnFile: boolean
  billingCustomerOnly: boolean
  billingOmitCapabilitySection: boolean
}

function buildBillingSections(ctx: BuildSectionsCtx): CapabilityDrawerGranularSection[] {
  const { billingFlavors, status, billingCustomerOnly, billingOmitCapabilitySection } = ctx
  if (billingCustomerOnly || billingOmitCapabilitySection) {
    return [{ sectionStatus: 'active', labels: ['Subscriptions'] }]
  }
  const ordered = BILLING_FLAVOR_ORDER.filter((id) => billingFlavors.has(id)).map(
    (id) => BILLING_CHIP_LABEL[id]
  )
  return [{ sectionStatus: status, labels: ordered }]
}

function buildNonBillingSections(ctx: BuildSectionsCtx): CapabilityDrawerGranularSection[] {
  const { variant, status, financingProducts, paymentsCustomerOnly, hasPaymentMethodOnFile } = ctx

  if (variant === 'payments' && paymentsCustomerOnly) {
    return [
      {
        sectionStatus: 'active',
        labels: hasPaymentMethodOnFile ? ['Payment method on file'] : [],
      },
    ]
  }

  const isPayouts = variant === 'payouts'
  const isTransfers = variant === 'transfers'
  const isFinancialAccounts = variant === 'financialAccounts'
  const isFinancing = variant === 'financing'
  const isCardIssuing = variant === 'cardIssuing'
  const isPayments = variant === 'payments'

  const singleCap = signalPopoverSingleCapabilityRow(variant)
  const effectiveLimited = status === 'limited' && !singleCap

  const activeLabels = [...activeMethodLabels(variant, financingProducts)]
  const pausedLine = pausedGranularLine(
    variant,
    isPayouts,
    isFinancialAccounts,
    isFinancing,
    isCardIssuing,
    isTransfers
  )

  const showPayOverflow = isPayments
  const showFaOverflow = isFinancialAccounts

  if (effectiveLimited && !isPayments) {
    return [
      { sectionStatus: 'paused', labels: [pausedLine] },
      {
        sectionStatus: 'active',
        labels: showFaOverflow
          ? allFinancialAccountsDrawerLabels(activeLabels)
          : [...activeLabels],
      },
    ]
  }

  if (effectiveLimited && isPayments) {
    return [
      { sectionStatus: 'paused', labels: [ZIP_PAUSED_LABEL] },
      { sectionStatus: 'pausing_soon', labels: [PAUSING_SOON_PAYMENTS_LABEL] },
      {
        sectionStatus: 'active',
        labels: showPayOverflow
          ? allPaymentsDrawerLabels([...PAYMENT_METHOD_CHIPS_LIMITED_ACTIVE])
          : sortPaymentGranularLabels(PAYMENT_METHOD_CHIPS_LIMITED_ACTIVE),
      },
    ]
  }

  if (status === 'paused') {
    if (isPayments) {
      return [
        { sectionStatus: 'paused', labels: [ZIP_PAUSED_LABEL] },
        {
          sectionStatus: 'active',
          labels: showPayOverflow
            ? allPaymentsDrawerLabels([...PAYMENT_METHOD_CHIPS])
            : sortPaymentGranularLabels(PAYMENT_METHOD_CHIPS),
        },
      ]
    }
    if (singleCap) {
      return [{ sectionStatus: 'paused', labels: [...activeLabels] }]
    }
    return [
      { sectionStatus: 'paused', labels: [pausedLine] },
      {
        sectionStatus: 'active',
        labels: showFaOverflow
          ? allFinancialAccountsDrawerLabels(activeLabels)
          : [...activeLabels],
      },
    ]
  }

  if (status === 'pausing_soon') {
    if (isPayments) {
      return [
        { sectionStatus: 'pausing_soon', labels: [PAUSING_SOON_PAYMENTS_LABEL] },
        {
          sectionStatus: 'active',
          labels: showPayOverflow
            ? allPaymentsDrawerLabels([...PAYMENT_METHOD_CHIPS])
            : sortPaymentGranularLabels(PAYMENT_METHOD_CHIPS),
        },
      ]
    }
    if (singleCap) {
      return [{ sectionStatus: 'pausing_soon', labels: [...activeLabels] }]
    }
    return [
      { sectionStatus: 'pausing_soon', labels: [pausedLine] },
      {
        sectionStatus: 'active',
        labels: showFaOverflow
          ? allFinancialAccountsDrawerLabels(activeLabels)
          : [...activeLabels],
      },
    ]
  }

  const homogenousActive = (): CapabilityDrawerGranularSection[] => {
    if (showPayOverflow) {
      return [{ sectionStatus: status, labels: allPaymentsDrawerLabels(activeLabels) }]
    }
    if (showFaOverflow) {
      return [{ sectionStatus: status, labels: allFinancialAccountsDrawerLabels(activeLabels) }]
    }
    return [{ sectionStatus: status, labels: [...activeLabels] }]
  }

  return homogenousActive()
}

function buildSectionsForGroup(
  groupId: CapabilityGroupId,
  prototype: PrototypeState
): CapabilityDrawerGranularSection[] {
  const variant = signalVariantForGroup(groupId)
  const status = prototype.capabilityStatuses[groupId] ?? 'active'

  const paymentsCustomerOnly =
    prototype.activeRoles.size === 1 && prototype.activeRoles.has('customer')
  const recipientOnly =
    prototype.activeRoles.size === 1 && prototype.activeRoles.has('recipient')
  const billingCustomerOnly = paymentsCustomerOnly || recipientOnly

  const billingUsesFlavors = prototype.billingFlavors
  const billingOmitCapabilitySection =
    !billingUsesFlavors.has('invoicing') &&
    !billingUsesFlavors.has('metered_billing') &&
    !billingUsesFlavors.has('subscriptions') &&
    (billingCustomerOnly || prototype.relationship.hasActiveSubscriptions)

  const ctx: BuildSectionsCtx = {
    variant,
    status,
    financingProducts: prototype.financingProducts ?? DEFAULT_FINANCING_POPOVER,
    billingFlavors: prototype.billingFlavors,
    paymentsCustomerOnly,
    hasPaymentMethodOnFile: prototype.hasPaymentMethodOnFile,
    billingCustomerOnly,
    billingOmitCapabilitySection,
  }

  if (groupId === 'billing') {
    return buildBillingSections(ctx)
  }
  return buildNonBillingSections(ctx)
}

function billingTitle(prototype: PrototypeState): string {
  const paymentsCustomerOnly =
    prototype.activeRoles.size === 1 && prototype.activeRoles.has('customer')
  const recipientOnly =
    prototype.activeRoles.size === 1 && prototype.activeRoles.has('recipient')
  if (paymentsCustomerOnly || recipientOnly) return 'Subscriptions'
  return CAPABILITY_GROUP_DISPLAY_LABELS.billing
}

/**
 * Rows for every header-eligible capability group (prototype roles + billing), in chip order.
 */
export function buildCapabilityDrawerGroupRows(
  prototype: PrototypeState,
  visibility: CapabilityDrawerActionBarVisibility
): CapabilityDrawerGroupRow[] {
  const modalGroupSet = new Set(signalGroupsForConfigureModal(prototype.activeRoles))
  const resolved = new Set(resolveCapabilityGroups(prototype.activeRoles, prototype.billingEnabled))

  const billingChipUsesExplicitBillingOnly =
    (prototype.activeRoles.size === 1 && prototype.activeRoles.has('customer')) ||
    prototype.activeRoles.has('recipient') ||
    prototype.activeRoles.has('gp_recipient')
  const showBillingChip =
    visibility.showSubscriptions !== false &&
    (billingChipUsesExplicitBillingOnly
      ? prototype.hasBilling
      : prototype.hasBilling || prototype.relationship.hasActiveSubscriptions)

  const showPayments = Boolean(visibility.showPayments && modalGroupSet.has('payments'))
  const showPayouts = Boolean(visibility.showPayouts && modalGroupSet.has('payouts'))

  const extraChipIds = HEADER_EXTRA_ACTIVE_CAPABILITY_ORDER.filter((id) => modalGroupSet.has(id))

  const orderedIds: CapabilityGroupId[] = []
  if (showPayments) orderedIds.push('payments')
  if (showPayouts) orderedIds.push('payouts')
  if (showBillingChip && resolved.has('billing')) orderedIds.push('billing')
  for (const id of CAPABILITY_GROUP_DISPLAY_ORDER) {
    if (id === 'payments' || id === 'payouts' || id === 'billing') continue
    if (!resolved.has(id)) continue
    if (!extraChipIds.includes(id)) continue
    orderedIds.push(id)
  }

  return orderedIds.map((groupId) => {
    const sections = buildSectionsForGroup(groupId, prototype)
    const title =
      groupId === 'billing' ? billingTitle(prototype) : CAPABILITY_GROUP_DISPLAY_LABELS[groupId]
    const headerStatus = prototype.capabilityStatuses[groupId] ?? 'active'

    return {
      panelId: panelIdForGroup(groupId),
      groupId,
      title,
      headerStatus,
      totalCount: totalLabelCount(sections),
      sections,
    }
  })
}
