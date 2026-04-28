/**
 * Signal group capability popovers — Figma Cursor SRC 128:58207 (shell: border-neutral-50).
 * Payments + PM-on-file, payouts + schedule / external well, transfers + payments-balance well when same GP path as payouts,
 * treasury + financial accounts well (142:61198; FA row mark 142:61212),
 * financing + products well (143:61336), card issuing + cards issued well, billing + subscriptions well (141:61045).
 * Section spacing (gap-3 / gap-1), status headings, comma-separated or muted capability lines.
 * Paused / pausing_soon: Payments keeps paused+active / pausing_soon+active mixes (method pills). Other
 * multi-cap groups use two sections. Payouts / Issuing (one cap): single status row + capability line only.
 * “Limited” split UI applies only when the group can represent multiple sub-capabilities (not Payouts or Issuing alone).
 *
 * Well card rows (PM on file, payouts, treasury) use **flex** — not CSS subgrid — so spacing stays
 * stable when adjusting gaps/padding; subgrid had inconsistent gap/column behavior across engines.
 * Prefer editing `WELL_CARD_FLEX_ROW_CLASS` / `WELL_CARD_STACK_CLASS` for shared well spacing.
 */

import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import {
  BILLING_FLAVOR_ORDER,
  CAPABILITY_GROUP_DISPLAY_LABELS,
  CAPABILITY_STATUS_DISPLAY_LABELS,
  DEFAULT_FINANCING_POPOVER,
  FINANCIAL_ACCOUNTS_POPOVER_CHIPS,
  FINANCIAL_ACCOUNTS_POPOVER_OVERFLOW_EXTRA,
  TRANSFERS_GROUP_POPOVER_CHIPS,
  FINANCING_LOAN_MASKED_ACCOUNT_LINE,
  financingPopoverChipLabels,
  signalPopoverSingleCapabilityRow,
  type BillingFlavor,
  type CapabilityStatus,
  type FinancingProductSelection,
  type SignalPopoverPanelVariant,
} from '../data/configMatrix'
import CapabilityStatusIcon from '../icons/CapabilityStatusIcon'
import { FinancingCashAdvanceMark } from '../icons/FinancingCashAdvanceMark'
import { FinancingLoanMark } from '../icons/FinancingLoanMark'
import { FinancialAccountWellCardMark } from '../icons/FinancialAccountWellCardMark'
import FlagImg, { type FlagCode } from '../icons/FlagImg'
import { Icon } from '../icons/SailIcons'
import { IconButton } from './IconButton'
import LabelTooltip from './LabelTooltip'
import { PillBadge } from './PillBadge'

const iconDefault = 'var(--color-icon-default)'

/** Figma 141:61045 — chip labels (“Invoices” vs matrix “Invoicing”). */
const BILLING_POPOVER_CHIP_LABEL: Record<BillingFlavor, string> = {
  invoicing: 'Invoices',
  subscriptions: 'Subscriptions',
  metered_billing: 'Metered billing',
}

/** Default payments popover list (non-limited and demos). */
const PAYMENT_METHOD_CHIPS = [
  'Affirm payments',
  'Bancontact payments',
  'Card payments',
  'Cash App Pay payments',
  'EPS payments',
  'Klarna payments',
] as const

/**
 * Active capability list when Payments + Limited — Figma 5355:238075 (8 methods + +13).
 * Matches design: Affirm … Klarna, Samsung Pay, PAYCO; overflow indicates additional methods.
 */
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

const MORE_OVERFLOW = 13

/** Figma 5355:238075 — Pausing soon row (single chip). */
const PAUSING_SOON_PAYMENTS_METHOD_LABEL = 'Amazon Pay payments'

const ZIP_PAYMENTS_PAUSED_LABEL = 'Zip payments'

const INSTANT_PAYOUTS_PAUSED_LABEL = 'Instant payouts'

const FINANCIAL_ACCOUNTS_PAUSED_GRANULAR_LABEL = 'Cross-border transfers'

const TRANSFERS_PAUSED_GRANULAR_LABEL = 'Inbound transfers'

const CARD_ISSUING_PAUSED_GRANULAR_LABEL = 'Physical cards'

const PAYOUTS_CAPABILITY_CHIPS = ['Payouts'] as const

const CARD_ISSUING_CAPABILITY_CHIPS = [CAPABILITY_GROUP_DISPLAY_LABELS.issuing] as const

/**
 * Shared shell — Figma 128:58207 (`border-neutral-50` / #ecf1f6).
 *
 * Figma vs this file (composition notes):
 * - Frame padding: SRC root uses `px-4px pb-4px` (here: `p-1 pb-1 pt-0`). Matches.
 * - Capabilities column: Figma child `128:58209` “See all” uses `px-12px` — here `px-3` on the
 *   capabilities block. Matches.
 * - PM “well” `128:58269`: `w-full` under the same frame as “See all”; horizontal inset is **only**
 *   the root frame padding (`px-4px` → here `p-1` on the shell). No extra horizontal padding on the
 *   PM wrapper — well aligns ~4px from the popover border; capabilities stay more inset via `px-3`.
 */
export const SIGNAL_GROUP_POPOVER_SHELL_CLASS =
  'relative w-[360px] max-w-[calc(100vw-24px)] rounded-[16px] border border-neutral-50 bg-surface p-1 pb-1 pt-0 shadow-[0px_15px_35px_0px_rgba(48,49,61,0.08),0px_5px_15px_0px_rgba(0,0,0,0.12)]'

/** Popover shell when only a grey well is shown (customer Payments PM-only; Billing subs-only without Uses billing caps line). 4px inset on all sides. */
const SIGNAL_GROUP_POPOVER_SHELL_GREY_WELL_ONLY_CLASS =
  'relative w-[360px] max-w-[calc(100vw-24px)] rounded-[16px] border border-neutral-50 bg-surface p-1 shadow-[0px_15px_35px_0px_rgba(48,49,61,0.08),0px_5px_15px_0px_rgba(0,0,0,0.12)]'

/** Capabilities column only (12px horizontal; room for settings). PM block is a sibling, not inside this. */
export const SIGNAL_GROUP_POPOVER_INNER_CLASS = 'px-3 pt-4 pr-12 pb-3'

/** Grey well: heading / metadata above stacked cards — 12px inset from well edge (all signal popovers). */
export const SIGNAL_GROUP_WELL_HEADER_INSET_CLASS = 'px-3'
/** Grey well: stacked white cards — 4px inset from well edge (Figma `px-[4px]`). */
export const SIGNAL_GROUP_WELL_CARDS_INSET_CLASS = 'px-1'

/** Stacked white cards inside a grey well — vertical list only; each row lays itself out with flex. */
const WELL_CARD_STACK_CLASS = 'flex w-full min-w-0 flex-col gap-1'

/** Single white card row inside a well (flex; keeps icon / text / trailing columns from overlapping). */
const WELL_CARD_FLEX_ROW_CLASS =
  'flex min-h-10 w-full min-w-0 items-center gap-2 rounded-[8px] border border-neutral-50 bg-surface py-2 pl-2 pr-3'

const BODY_MUTED_CLASS = 'm-0 font-label-small leading-4 text-[#50617a]'

/** Tooltip trigger is wrapped in `display: inline-block`; use that box for line alignment with comma text. */
function overflowLayoutTarget(overEl: HTMLElement): HTMLElement {
  const parent = overEl.parentElement
  if (parent == null) return overEl
  if (getComputedStyle(parent).display !== 'inline-block') return overEl
  if (parent.childElementCount !== 1 || parent.firstElementChild !== overEl) return overEl
  return parent
}

/** True when the overflow chip sits on the same typographic line as the end of `lastLabelEl` (handles wrapped labels). */
function isOverflowOnSameRowAsEndOfLastLabel(
  lastLabelEl: HTMLElement,
  overflowEl: HTMLElement
): boolean {
  const range = document.createRange()
  range.selectNodeContents(lastLabelEl)
  const rects = range.getClientRects()
  if (rects.length === 0) return true
  const lastLine = rects[rects.length - 1]!
  const over = overflowLayoutTarget(overflowEl).getBoundingClientRect()
  const tolerance = 4
  return over.top < lastLine.bottom + tolerance && over.top >= lastLine.top - tolerance
}

/** Figma 5355 Chip row — Label/Small regular, neutral/600; minimal pill (py-[2px], rounded-full). */
function LimitedPaymentsCapabilityPill({ children }: { children: string }) {
  return (
    <div className="flex w-full min-w-0 flex-wrap content-center items-center gap-0.5">
      <span className="inline-flex max-w-full items-center rounded-[999px] py-0.5 pl-0.5 pr-2 font-label-small leading-4 text-[#50617a]">
        {children}
      </span>
    </div>
  )
}

type PaymentsPopoverPanelProps = {
  status: CapabilityStatus
  variant?: SignalPopoverPanelVariant
  financingProducts?: FinancingProductSelection
  /** Financing only: platform name in “Financing with …” well (e.g. Shopify). */
  financingPlatformLabel?: string
  onViewAllCapabilities?: () => void
  /** Edit affordance in popover shell; omitted when `variant` is `billing` (not a capability group). */
  onEditCapabilities?: () => void
  /**
   * When true (Configure account → “Has payment method on file” + Update), appends Figma 5354:237527
   * below the capabilities block (12px gap). Payments variant only; any capability status.
   */
  hasPaymentMethodOnFile?: boolean
  /** Configure → “Default payment method is expired”: default PM row shows Default + Expired badges. */
  defaultPaymentMethodExpired?: boolean
  /** Replaces “[Platform name]” in the payment methods heading (e.g. Shopify). */
  paymentMethodsPlatformLabel?: string
  /**
   * Payouts only: lower grey well when `payoutsLowerWell` is omitted:
   * — `hasPayoutSchedule` → **Payout information** (schedule + destinations).
   * — otherwise → **External accounts** (GP / instant payouts style — destinations only; same cards, no schedule block).
   * Pass **`off`** explicitly to hide any lower well.
   */
  payoutsLowerWell?: 'payoutInformation' | 'external' | 'off'
  /** Financial accounts only: when true (Configure → “Has financial accounts”), show Figma 142:61198 well below capabilities. */
  hasFinancialAccounts?: boolean
  /** Financial accounts well: “Financial accounts with …” platform name (e.g. Shopify). */
  financialAccountsPlatformLabel?: string
  /** Billing only: Configure “Uses billing” product set (capability line in popover). */
  billingFlavors?: ReadonlySet<BillingFlavor>
  /**
   * Billing only: show subscriptions well (Figma 141:61068). When omitted, matches `subscriptions` in `billingFlavors`.
   * Pass true when “Has active subscriptions with Platform” is on but Subscriptions is not checked under Uses billing.
   */
  showBillingSubscriptionsWell?: boolean
  /**
   * Billing only: hide status + product capability line (e.g. Uses billing off while subscriptions well still shows).
   * When omitted, inferred false. When true, popover uses the grey-well-only shell + 4px inset (subscriptions well only).
   */
  billingOmitCapabilitySection?: boolean
  /**
   * Billing variant only: single-role customer or recipient — same layout as customer Payments popover (grey well + 4px inset; no status / product chips).
   */
  billingCustomerOnly?: boolean
  /** Billing well: “Subscriptions with …” platform name (e.g. Shopify). */
  billingSubscriptionsPlatformLabel?: string
  /** Card issuing well: “Cards issued by …” platform name (e.g. Shopify). */
  cardIssuingPlatformLabel?: string
  /**
   * Transfers only: show the payments-balance grey well below the capability list.
   * Same visibility rule as the Payouts “external” path (GP / no schedule). No “External accounts” subheading.
   */
  transfersShowPaymentsBalanceWell?: boolean
  /**
   * Payments variant only: customer-role-only accounts have no merchant capability group — only PM on file.
   * When true, omit comma-separated capability lists (limited/paused mixes, active methods).
   */
  paymentsCustomerOnly?: boolean
}

function VisaBrandMark() {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#1434CB]">
      <span className="text-[11px] font-bold italic tracking-tight text-white">Visa</span>
    </div>
  )
}

function MastercardBrandMark() {
  return (
    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-black">
      <span
        className="absolute left-[7px] top-1/2 h-[14px] w-[14px] -translate-y-1/2 rounded-full bg-[#EB001B]"
        aria-hidden
      />
      <span
        className="absolute right-[7px] top-1/2 h-[14px] w-[14px] -translate-y-1/2 rounded-full bg-[#F79E1B]"
        aria-hidden
      />
    </div>
  )
}

type PaymentMethodOnFileRowProps = {
  brand: 'visa' | 'mastercard'
  line: string
  country: 'US' | 'GB'
  showDefaultBadge?: boolean
  showExpiredBadge?: boolean
}

function PaymentMethodOnFileRow({
  brand,
  line,
  country,
  showDefaultBadge,
  showExpiredBadge,
}: PaymentMethodOnFileRowProps) {
  const flagCode: FlagCode = country === 'US' ? 'US' : 'GB'
  return (
    <div className={WELL_CARD_FLEX_ROW_CLASS}>
      {brand === 'visa' ? <VisaBrandMark /> : <MastercardBrandMark />}
      <p className="min-w-0 flex-1 truncate font-label-medium text-[14px] leading-5 tracking-[-0.15px] text-default">
        {line}
      </p>
      {showDefaultBadge || showExpiredBadge ? (
        <span className="flex shrink-0 items-center gap-1">
          {showDefaultBadge ? (
            <span className="shrink-0 rounded-md bg-[#e3f2fd] px-2 py-0.5 font-label-small leading-4 text-[#1565c0]">
              Default
            </span>
          ) : null}
          {showExpiredBadge ? (
            <span
              className="shrink-0 rounded-md px-2 py-0.5 font-label-small leading-4"
              style={{
                backgroundColor: 'var(--color-feedback-critical-subdued)',
                color: 'var(--color-feedback-critical-on)',
              }}
            >
              Expired
            </span>
          ) : null}
        </span>
      ) : null}
      <div className="min-h-10 w-px shrink-0 self-stretch bg-neutral-50" aria-hidden />
      <div className="flex shrink-0 items-center justify-end gap-1.5">
        <FlagImg code={flagCode} />
        <span className="whitespace-nowrap font-label-small leading-4 text-default">{country}</span>
      </div>
    </div>
  )
}

/** Card issuing popover — issued Visa row (distinct last-four from payment methods on file). */
function CardsIssuedByPlatformWell({ platformLabel }: { platformLabel: string }) {
  return (
    <div
      className="flex w-full flex-col gap-3 rounded-[12px] bg-offset pb-1 pt-3"
      data-name="cards-issued-by-platform"
    >
      <div className={`min-w-0 w-full ${SIGNAL_GROUP_WELL_HEADER_INSET_CLASS}`}>
        <p className="m-0 min-w-0 font-label-medium text-[14px] leading-5 tracking-[-0.15px] text-default">
          Cards issued by {platformLabel}
        </p>
      </div>
      <div className={`${WELL_CARD_STACK_CLASS} ${SIGNAL_GROUP_WELL_CARDS_INSET_CLASS}`}>
        <PaymentMethodOnFileRow brand="visa" line="Visa •••• 4402" country="US" />
      </div>
    </div>
  )
}

/** Figma 128:58269 — payment methods well. */
function PaymentMethodsOnFileSection({
  platformName,
  defaultPaymentMethodExpired,
}: {
  platformName: string
  defaultPaymentMethodExpired?: boolean
}) {
  return (
    <div
      className="flex w-full flex-col gap-3 rounded-[12px] bg-offset pb-1 pt-3"
      data-name="payment-methods-on-file"
      data-node-id="128:58269"
    >
      <div className={`min-w-0 w-full ${SIGNAL_GROUP_WELL_HEADER_INSET_CLASS}`}>
        <p className="m-0 min-w-0 font-label-medium text-[14px] leading-5 tracking-[-0.15px] text-default">
          Payment methods with {platformName}
        </p>
      </div>
      <div className={`${WELL_CARD_STACK_CLASS} ${SIGNAL_GROUP_WELL_CARDS_INSET_CLASS}`}>
        <PaymentMethodOnFileRow
          brand="visa"
          line="Visa •••• 1933"
          country="US"
          showDefaultBadge
          showExpiredBadge={defaultPaymentMethodExpired}
        />
        <PaymentMethodOnFileRow brand="mastercard" line="Mastercard •••• 4280" country="GB" />
      </div>
    </div>
  )
}

function PayoutInfoFieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex w-full min-w-0 items-center gap-4 font-label-small leading-4">
      <p className="w-[124px] shrink-0 text-[#50617a]">{label}</p>
      <p className="min-w-0 flex-1 text-right text-default">{value}</p>
    </div>
  )
}

function PayoutDestinationCard({
  bankLine,
  currencyCode,
  flagCode,
  brandClass,
  initials,
}: {
  bankLine: string
  currencyCode: string
  flagCode: FlagCode
  brandClass: string
  initials: string
}) {
  return (
    <div className={WELL_CARD_FLEX_ROW_CLASS}>
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${brandClass}`}
        aria-hidden
      >
        <span className="text-[10px] font-bold leading-none text-white">{initials}</span>
      </div>
      <p className="min-w-0 flex-1 truncate font-label-medium text-[12px] leading-5 tracking-[-0.15px] text-default">
        {bankLine}
      </p>
      <div className="min-h-10 w-px shrink-0 self-stretch bg-neutral-50" aria-hidden />
      <div className="flex shrink-0 items-center justify-end gap-1.5">
        <FlagImg code={flagCode} />
        <span className="whitespace-nowrap font-label-small leading-4 text-default">{currencyCode}</span>
      </div>
    </div>
  )
}

/** Figma 143:61336 — loans / cash advances with platform (mirrors FA well layout). */
function FinancingWithPlatformWell({
  platformLabel,
  showLoan,
  showCashAdvance,
}: {
  platformLabel: string
  showLoan: boolean
  showCashAdvance: boolean
}) {
  return (
    <div
      className="flex w-full flex-col gap-3 rounded-[12px] bg-offset pb-1 pt-3"
      data-name="financing-with-platform"
      data-node-id="143:61336"
    >
      <div className={`min-w-0 w-full ${SIGNAL_GROUP_WELL_HEADER_INSET_CLASS}`}>
        <p className="m-0 min-w-0 font-label-medium text-[14px] leading-5 tracking-[-0.15px] text-default">
          Capital with {platformLabel}
        </p>
      </div>
      <div className={`${WELL_CARD_STACK_CLASS} ${SIGNAL_GROUP_WELL_CARDS_INSET_CLASS}`}>
        {showLoan ? (
          <div className={WELL_CARD_FLEX_ROW_CLASS}>
            <span className="shrink-0" aria-hidden>
              <FinancingLoanMark />
            </span>
            <p className="min-w-0 flex-1 truncate font-label-medium text-[12px] leading-5 tracking-[-0.15px] text-default">
              {FINANCING_LOAN_MASKED_ACCOUNT_LINE}
            </p>
            <p className="shrink-0 whitespace-nowrap text-right font-label-small leading-4 text-default">
              $125,000.00 available
            </p>
          </div>
        ) : null}
        {showCashAdvance ? (
          <div className={WELL_CARD_FLEX_ROW_CLASS}>
            <span className="shrink-0" aria-hidden>
              <FinancingCashAdvanceMark />
            </span>
            <p className="min-w-0 flex-1 truncate font-label-medium text-[12px] leading-5 tracking-[-0.15px] text-default">
              Cash advances
            </p>
            <p className="shrink-0 whitespace-nowrap text-right font-label-small leading-4 text-default">
              $8,400.00 outstanding
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function FinancialAccountBalanceRow({ accountLine, balance }: { accountLine: string; balance: string }) {
  return (
    <div className={WELL_CARD_FLEX_ROW_CLASS}>
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] bg-offset"
        aria-hidden
        data-node-id="142:61212"
      >
        <FinancialAccountWellCardMark size={16} />
      </div>
      <p className="min-w-0 flex-1 truncate font-label-medium text-[12px] leading-5 tracking-[-0.15px] text-default">
        {accountLine}
      </p>
      <p className="shrink-0 whitespace-nowrap text-right font-label-small leading-4 text-default">{balance}</p>
    </div>
  )
}

/** Figma 142:61198 — savings / checking balances with platform (no divider between label and amount). */
function FinancialAccountsWithPlatformWell({ platformLabel }: { platformLabel: string }) {
  return (
    <div
      className="flex w-full flex-col gap-3 rounded-[12px] bg-offset pb-1 pt-3"
      data-name="financial-accounts-with-platform"
      data-node-id="142:61198"
    >
      <div className={`min-w-0 w-full ${SIGNAL_GROUP_WELL_HEADER_INSET_CLASS}`}>
        <p className="m-0 min-w-0 font-label-medium text-[14px] leading-5 tracking-[-0.15px] text-default">
          Treasury with {platformLabel}
        </p>
      </div>
      <div className={`${WELL_CARD_STACK_CLASS} ${SIGNAL_GROUP_WELL_CARDS_INSET_CLASS}`}>
        <FinancialAccountBalanceRow accountLine="Savings •••• 8008" balance="$4,500.00" />
        <FinancialAccountBalanceRow accountLine="Checking •••• 6755" balance="$808.65" />
      </div>
    </div>
  )
}

const PAYMENTS_BALANCE_LOGO_SRC = '/sections/payment-balance.svg'

/** Transfers popover — one account row; asset `public/sections/payment-balance.svg` (Figma Sections/payment-balance). */
function TransfersPaymentsBalanceWell() {
  return (
    <div
      className="flex w-full flex-col rounded-[12px] bg-offset pb-1 pt-1"
      data-name="transfers-payments-balance"
    >
      <div className={`${WELL_CARD_STACK_CLASS} ${SIGNAL_GROUP_WELL_CARDS_INSET_CLASS}`}>
        <div className={WELL_CARD_FLEX_ROW_CLASS}>
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-[4px]" aria-hidden>
            <img
              src={PAYMENTS_BALANCE_LOGO_SRC}
              alt=""
              width={40}
              height={40}
              className="h-10 w-10"
            />
          </div>
          <p className="min-w-0 flex-1 truncate font-label-medium text-[12px] leading-5 tracking-[-0.15px] text-default">
            Payments balance
          </p>
          <div className="min-h-10 w-px shrink-0 self-stretch bg-neutral-50" aria-hidden />
          <div className="flex shrink-0 items-center justify-end gap-1.5">
            <FlagImg code="US" />
            <span className="whitespace-nowrap font-label-small leading-4 text-default">USD</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/** GP-only or no payout schedule — same destination cards as payout schedule well, no schedule block. */
function ExternalPayoutAccountsWell({ dataName = 'external-payout-accounts' }: { dataName?: string }) {
  return (
    <div
      className="flex w-full flex-col rounded-[12px] bg-offset pb-1 pt-3"
      data-name={dataName}
    >
      <div className={`w-full ${SIGNAL_GROUP_WELL_HEADER_INSET_CLASS}`}>
        <p className="m-0 min-w-0 font-label-medium text-[14px] leading-5 tracking-[-0.15px] text-subdued">
          External accounts
        </p>
      </div>
      <div className={`mt-2 ${WELL_CARD_STACK_CLASS} ${SIGNAL_GROUP_WELL_CARDS_INSET_CLASS}`}>
        <PayoutDestinationCard
          bankLine="Volksbank •••• 3390"
          currencyCode="EUR"
          flagCode="EU"
          brandClass="bg-[#00508d]"
          initials="V"
        />
        <PayoutDestinationCard
          bankLine="TD Ameritrade •••• 4280"
          currencyCode="USD"
          flagCode="US"
          brandClass="bg-[#00b624]"
          initials="TD"
        />
      </div>
    </div>
  )
}

function PayoutInformationWell() {
  return (
    <div
      className="flex w-full flex-col rounded-[12px] bg-offset pb-1 pt-3"
      data-name="payout-information"
      data-node-id="129:59300"
    >
      <div className={`w-full ${SIGNAL_GROUP_WELL_HEADER_INSET_CLASS}`}>
        <p className="m-0 min-w-0 font-label-medium text-[14px] leading-5 tracking-[-0.15px] text-default">
          Payout information
        </p>
      </div>
      <div
        className={`mt-1 flex flex-col gap-2 pb-1 ${SIGNAL_GROUP_WELL_HEADER_INSET_CLASS}`}
      >
        <PayoutInfoFieldRow label="Schedule" value="Weekly Monday — 2 day rolling" />
        <PayoutInfoFieldRow label="Next payout" value="Mar 23, 2026" />
        <PayoutInfoFieldRow label="Statement descriptor" value="TYBX" />
      </div>
      <div className={`mt-2 ${WELL_CARD_STACK_CLASS} ${SIGNAL_GROUP_WELL_CARDS_INSET_CLASS}`}>
        <PayoutDestinationCard
          bankLine="Volksbank •••• 3390"
          currencyCode="EUR"
          flagCode="EU"
          brandClass="bg-[#00508d]"
          initials="V"
        />
        <PayoutDestinationCard
          bankLine="TD Ameritrade •••• 4280"
          currencyCode="USD"
          flagCode="US"
          brandClass="bg-[#00b624]"
          initials="TD"
        />
      </div>
    </div>
  )
}

function BillingSubscriptionRow({
  title,
  badge,
  price,
}: {
  title: string
  badge: ReactNode
  price: string
}) {
  return (
    <div className="flex min-h-14 w-full min-w-0 items-center gap-2 overflow-hidden rounded-[8px] border border-neutral-50 bg-surface px-3 py-2">
      <p className="min-w-0 flex-1 truncate font-label-medium text-[12px] leading-5 tracking-[-0.15px] text-default">
        {title}
      </p>
      <div className="shrink-0">{badge}</div>
      <p className="shrink-0 whitespace-nowrap text-right font-label-small leading-4 text-default">{price}</p>
    </div>
  )
}

/** Figma 141:61068 — subscriptions well under billing popover. */
function BillingSubscriptionsWell({ platformLabel }: { platformLabel: string }) {
  return (
    <div
      className="flex w-full flex-col gap-2 rounded-[12px] bg-offset pb-1 pt-3"
      data-name="billing-subscriptions"
      data-node-id="141:61068"
    >
      <div className={`w-full ${SIGNAL_GROUP_WELL_HEADER_INSET_CLASS}`}>
        <p className="m-0 min-w-0 font-label-medium text-[14px] leading-5 tracking-[-0.15px] text-default">
          Subscriptions with {platformLabel}
        </p>
      </div>
      <div className={`flex flex-col gap-1 ${SIGNAL_GROUP_WELL_CARDS_INSET_CLASS}`}>
        <BillingSubscriptionRow
          title="Website hosting"
          badge={<PillBadge label="Active" variant="success" />}
          price="$24.00"
        />
        <BillingSubscriptionRow
          title="Premium Pro Plan"
          badge={
            <span className="inline-flex rounded-md bg-[#e3f2fd] px-1.5 py-1 font-label-small leading-4 text-[#1565c0]">
              Trial ends on Dec 26
            </span>
          }
          price="$58.50"
        />
      </div>
    </div>
  )
}

function SectionStatusHeading({
  sectionStatus,
  label,
}: {
  sectionStatus: CapabilityStatus
  label: string
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="inline-flex shrink-0" aria-hidden>
        <CapabilityStatusIcon status={sectionStatus} size={12} />
      </span>
      <p className="m-0 min-w-0 flex-1 truncate font-label-medium text-[14px] leading-5 tracking-[-0.15px] text-default">
        {label}
      </p>
    </div>
  )
}

/** Comma-separated capabilities + optional +N pill (payments + treasury overflow). */
function PaymentsCommaMethods({
  labels,
  onViewAllCapabilities,
  showOverflow = true,
  /** When set, +N uses this count instead of payments’ `MORE_OVERFLOW` (+13). */
  overflowExtra,
  viewAllTooltipId = 'payments-popover-view-all-capabilities-tooltip',
}: {
  labels: readonly string[]
  onViewAllCapabilities?: () => void
  showOverflow?: boolean
  overflowExtra?: number
  viewAllTooltipId?: string
}) {
  const plusCount = overflowExtra ?? MORE_OVERFLOW
  const labelsKey = labels.join('\u0000')
  const [visibleCount, setVisibleCount] = useState(labels.length)
  const rootRef = useRef<HTMLParagraphElement>(null)
  const lastLabelRef = useRef<HTMLSpanElement | null>(null)
  const overflowMeasureRef = useRef<HTMLElement | null>(null)
  /** Skip one trim pass after labels change or resize so we measure from a full list first. */
  const skipNextTrimPass = useRef(false)
  /** First labels layout runs trim immediately; later label-set changes need a skip so we measure the full list first. */
  const hasLaidOutLabelsOnce = useRef(false)

  useLayoutEffect(() => {
    if (hasLaidOutLabelsOnce.current) {
      skipNextTrimPass.current = true
    }
    hasLaidOutLabelsOnce.current = true
    setVisibleCount(labels.length)
  }, [labelsKey, labels.length])

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const ro = new ResizeObserver(() => {
      skipNextTrimPass.current = true
      setVisibleCount(labels.length)
    })
    ro.observe(root)
    return () => ro.disconnect()
  }, [labels.length])

  useLayoutEffect(() => {
    if (!showOverflow) return
    if (skipNextTrimPass.current) {
      skipNextTrimPass.current = false
      return
    }
    const overEl = overflowMeasureRef.current
    if (visibleCount === 0 || overEl == null) return
    const lastEl = lastLabelRef.current
    if (lastEl == null) return
    if (isOverflowOnSameRowAsEndOfLastLabel(lastEl, overEl)) return
    setVisibleCount((c) => Math.max(0, c - 1))
  }, [showOverflow, visibleCount, labelsKey, plusCount])

  const visibleLabels = !showOverflow ? [...labels] : labels.slice(0, visibleCount)

  const overflow =
    !showOverflow ? null : onViewAllCapabilities ? (
      <LabelTooltip
        label="View all capabilities"
        tooltipId={viewAllTooltipId}
        placement="bottom"
        variant="dark"
      >
        <button
          ref={(el) => {
            overflowMeasureRef.current = el
          }}
          type="button"
          className="inline-flex h-5 shrink-0 cursor-pointer items-center rounded px-1.5 py-px font-label-small leading-4 text-[#50617a] bg-offset transition-colors hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-action-primary"
          aria-label="View all capabilities"
          onClick={(e) => {
            e.stopPropagation()
            onViewAllCapabilities()
          }}
        >
          +{plusCount}
        </button>
      </LabelTooltip>
    ) : (
      <span
        ref={(el) => {
          overflowMeasureRef.current = el
        }}
        className="inline-flex h-5 shrink-0 items-center rounded px-1.5 py-px font-label-small leading-4 text-[#50617a] bg-offset"
      >
        +{plusCount}
      </span>
    )

  return (
    <p ref={rootRef} className={`${BODY_MUTED_CLASS} w-full min-w-0`}>
      {visibleLabels.map((label, i) => (
        <span key={label} ref={i === visibleLabels.length - 1 ? lastLabelRef : undefined}>
          {i > 0 && ', '}
          {label}
        </span>
      ))}
      {showOverflow && overflow != null && (
        <>
          {' '}
          {overflow}
        </>
      )}
    </p>
  )
}

function pausedGranularLabel(
  isPayouts: boolean,
  isFinancialAccounts: boolean,
  isFinancing: boolean,
  isCardIssuing: boolean,
  isTransfers: boolean
): string {
  if (isPayouts) return INSTANT_PAYOUTS_PAUSED_LABEL
  if (isFinancialAccounts) return FINANCIAL_ACCOUNTS_PAUSED_GRANULAR_LABEL
  if (isFinancing) return FINANCING_LOAN_MASKED_ACCOUNT_LINE
  if (isCardIssuing) return CARD_ISSUING_PAUSED_GRANULAR_LABEL
  if (isTransfers) return TRANSFERS_PAUSED_GRANULAR_LABEL
  return ZIP_PAYMENTS_PAUSED_LABEL
}

export default function PaymentsPopoverPanel({
  status,
  variant = 'payments',
  financingProducts: financingProductsProp,
  financingPlatformLabel = 'Shopify',
  onViewAllCapabilities,
  onEditCapabilities,
  hasPaymentMethodOnFile = false,
  defaultPaymentMethodExpired = false,
  paymentMethodsPlatformLabel = 'Shopify',
  hasPayoutSchedule = false,
  payoutsLowerWell: payoutsLowerWellProp,
  hasFinancialAccounts = false,
  financialAccountsPlatformLabel = 'Shopify',
  billingFlavors: billingFlavorsProp,
  showBillingSubscriptionsWell,
  billingOmitCapabilitySection = false,
  billingCustomerOnly = false,
  billingSubscriptionsPlatformLabel = 'Shopify',
  cardIssuingPlatformLabel = 'Shopify',
  transfersShowPaymentsBalanceWell = false,
  paymentsCustomerOnly = false,
}: PaymentsPopoverPanelProps) {
  const statusLabel = CAPABILITY_STATUS_DISPLAY_LABELS[status]
  const isPayouts = variant === 'payouts'
  const isTransfers = variant === 'transfers'
  const isFinancialAccounts = variant === 'financialAccounts'
  const isFinancing = variant === 'financing'
  const isCardIssuing = variant === 'cardIssuing'
  const isBilling = variant === 'billing'
  const isPayments =
    !isPayouts &&
    !isTransfers &&
    !isFinancialAccounts &&
    !isFinancing &&
    !isCardIssuing &&
    !isBilling
  const payoutsLowerResolved: 'payoutInformation' | 'external' | 'off' = isPayouts
    ? payoutsLowerWellProp != null
      ? payoutsLowerWellProp
      : hasPayoutSchedule
        ? 'payoutInformation'
        : 'external'
    : 'off'
  /** Mirrors `CAPABILITY_GROUP_SINGLE_SIGNAL` in configMatrix (payouts + issuing). */
  const singleCapabilityVariant = signalPopoverSingleCapabilityRow(variant)
  const effectiveLimited = status === 'limited' && !singleCapabilityVariant
  const financingProductsResolved = financingProductsProp ?? DEFAULT_FINANCING_POPOVER
  const showFinancingProductsWell =
    isFinancing && (financingProductsResolved.loan || financingProductsResolved.cashAdvance)

  if (isBilling) {
    const billingFlavors = billingFlavorsProp ?? new Set<BillingFlavor>()
    const orderedFlavors = BILLING_FLAVOR_ORDER.filter((id) => billingFlavors.has(id))
    const showSubsWell =
      showBillingSubscriptionsWell ?? billingFlavors.has('subscriptions')
    const showCapabilitySection = !billingOmitCapabilitySection

    if (billingCustomerOnly || billingOmitCapabilitySection) {
      return (
        <div
          className={SIGNAL_GROUP_POPOVER_SHELL_GREY_WELL_ONLY_CLASS}
          data-name="billing"
          data-node-id="141:61045"
        >
          {showSubsWell ? (
            <BillingSubscriptionsWell platformLabel={billingSubscriptionsPlatformLabel} />
          ) : null}
        </div>
      )
    }

    return (
      <div
        className={SIGNAL_GROUP_POPOVER_SHELL_CLASS}
        data-name="billing"
        data-node-id="141:61045"
      >
        {showCapabilitySection ? (
          <div className={`px-3 pt-4 ${showSubsWell ? 'pb-0' : 'pb-3'}`}>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <span className="inline-flex shrink-0" aria-hidden>
                  <CapabilityStatusIcon status={status} size={12} />
                </span>
                <p className="m-0 min-w-0 flex-1 truncate font-label-medium text-[14px] leading-5 tracking-[-0.15px] text-default">
                  {statusLabel}
                </p>
              </div>
              <PaymentsCommaMethods
                labels={orderedFlavors.map((id) => BILLING_POPOVER_CHIP_LABEL[id])}
                onViewAllCapabilities={undefined}
                showOverflow={false}
                viewAllTooltipId="billing-popover-view-all-capabilities-tooltip"
              />
            </div>
          </div>
        ) : null}

        {showSubsWell ? (
          <div className="mt-3 w-full shrink-0 px-0">
            <BillingSubscriptionsWell platformLabel={billingSubscriptionsPlatformLabel} />
          </div>
        ) : null}
      </div>
    )
  }

  if (isPayments && paymentsCustomerOnly) {
    return (
      <div
        className={SIGNAL_GROUP_POPOVER_SHELL_GREY_WELL_ONLY_CLASS}
        data-name="payments"
        data-node-id="128:58207"
      >
        {hasPaymentMethodOnFile ? (
          <PaymentMethodsOnFileSection
            platformName={paymentMethodsPlatformLabel}
            defaultPaymentMethodExpired={defaultPaymentMethodExpired}
          />
        ) : null}
      </div>
    )
  }

  const dataName = isPayouts
    ? 'payouts'
    : isTransfers
      ? 'transfers'
      : isFinancialAccounts
        ? 'financial-accounts'
        : isFinancing
          ? 'financing'
          : isCardIssuing
            ? 'card-issuing'
            : 'payments'
  const editTooltipId = isPayouts
    ? 'payouts-popover-capabilities-edit-tooltip'
    : isTransfers
      ? 'transfers-popover-capabilities-edit-tooltip'
      : isFinancialAccounts
        ? 'financial-accounts-popover-capabilities-edit-tooltip'
        : isFinancing
          ? 'financing-popover-capabilities-edit-tooltip'
          : isCardIssuing
            ? 'card-issuing-popover-capabilities-edit-tooltip'
            : 'payments-popover-capabilities-edit-tooltip'
  const viewAllTooltipId = isPayouts
    ? 'payouts-popover-view-all-capabilities-tooltip'
    : isTransfers
      ? 'transfers-popover-view-all-capabilities-tooltip'
      : isFinancialAccounts
        ? 'financial-accounts-popover-view-all-capabilities-tooltip'
        : isFinancing
          ? 'financing-popover-view-all-capabilities-tooltip'
          : isCardIssuing
            ? 'card-issuing-popover-view-all-capabilities-tooltip'
            : 'payments-popover-view-all-capabilities-tooltip'

  const activeMethodLabels = isPayouts
    ? PAYOUTS_CAPABILITY_CHIPS
    : isTransfers
      ? TRANSFERS_GROUP_POPOVER_CHIPS
      : isFinancialAccounts
        ? FINANCIAL_ACCOUNTS_POPOVER_CHIPS
        : isFinancing
          ? financingPopoverChipLabels(financingProductsResolved)
          : isCardIssuing
            ? CARD_ISSUING_CAPABILITY_CHIPS
            : PAYMENT_METHOD_CHIPS
  const showCapabilityOverflow =
    !isPayouts && !isTransfers && !isFinancialAccounts && !isFinancing && !isCardIssuing
  /** Treasury lists six capabilities plus a static +3 (not the payments +13). */
  const showFinancialAccountsOverflow = isFinancialAccounts
  const secondaryVariantViewAll =
    isPayouts || isTransfers || isFinancialAccounts || isFinancing || isCardIssuing
      ? undefined
      : onViewAllCapabilities

  /** Payments full panel — Figma Cursor SRC 128:58207; financial accounts legacy node. */
  const shellNodeId = isFinancialAccounts ? '113:49956' : isPayments ? '128:58207' : undefined

  const singleMutedLine = (text: string) => <p className={BODY_MUTED_CLASS}>{text}</p>

  const limitedTwoSection = (
    pausedDataName: string | undefined,
    pausedLabel: string
  ) => (
    <>
      <div className="flex flex-col gap-1" data-name={pausedDataName}>
        <SectionStatusHeading
          sectionStatus="paused"
          label={CAPABILITY_STATUS_DISPLAY_LABELS.paused}
        />
        {singleMutedLine(pausedLabel)}
      </div>

      <div className="flex flex-col gap-1">
        <SectionStatusHeading
          sectionStatus="active"
          label={CAPABILITY_STATUS_DISPLAY_LABELS.active}
        />
        <PaymentsCommaMethods
          labels={activeMethodLabels}
          onViewAllCapabilities={secondaryVariantViewAll}
          showOverflow={showCapabilityOverflow || showFinancialAccountsOverflow}
          overflowExtra={
            isFinancialAccounts ? FINANCIAL_ACCOUNTS_POPOVER_OVERFLOW_EXTRA : undefined
          }
          viewAllTooltipId={viewAllTooltipId}
        />
      </div>
    </>
  )

  const pausingSoonTwoSection = (
    dataName: string | undefined,
    granularLabel: string
  ) => (
    <>
      <div className="flex flex-col gap-1" data-name={dataName}>
        <SectionStatusHeading
          sectionStatus="pausing_soon"
          label={CAPABILITY_STATUS_DISPLAY_LABELS.pausing_soon}
        />
        {singleMutedLine(granularLabel)}
      </div>
      <div className="flex flex-col gap-1">
        <SectionStatusHeading
          sectionStatus="active"
          label={CAPABILITY_STATUS_DISPLAY_LABELS.active}
        />
        <PaymentsCommaMethods
          labels={activeMethodLabels}
          onViewAllCapabilities={secondaryVariantViewAll}
          showOverflow={showCapabilityOverflow || showFinancialAccountsOverflow}
          overflowExtra={
            isFinancialAccounts ? FINANCIAL_ACCOUNTS_POPOVER_OVERFLOW_EXTRA : undefined
          }
          viewAllTooltipId={viewAllTooltipId}
        />
      </div>
    </>
  )

  const paymentsPausedMix = (
    <>
      <div className="flex flex-col gap-1" data-name="payments-paused-granular">
        <SectionStatusHeading
          sectionStatus="paused"
          label={CAPABILITY_STATUS_DISPLAY_LABELS.paused}
        />
        <LimitedPaymentsCapabilityPill>{ZIP_PAYMENTS_PAUSED_LABEL}</LimitedPaymentsCapabilityPill>
      </div>
      <div className="flex flex-col gap-1" data-name="payments-paused-active">
        <SectionStatusHeading
          sectionStatus="active"
          label={CAPABILITY_STATUS_DISPLAY_LABELS.active}
        />
        <PaymentsCommaMethods
          labels={PAYMENT_METHOD_CHIPS}
          onViewAllCapabilities={secondaryVariantViewAll}
          showOverflow={showCapabilityOverflow}
          viewAllTooltipId={viewAllTooltipId}
        />
      </div>
    </>
  )

  const paymentsPausingSoonMix = (
    <>
      <div className="flex flex-col gap-1" data-name="payments-pausing-soon-granular">
        <SectionStatusHeading
          sectionStatus="pausing_soon"
          label={CAPABILITY_STATUS_DISPLAY_LABELS.pausing_soon}
        />
        <LimitedPaymentsCapabilityPill>{PAUSING_SOON_PAYMENTS_METHOD_LABEL}</LimitedPaymentsCapabilityPill>
      </div>
      <div className="flex flex-col gap-1" data-name="payments-pausing-soon-active">
        <SectionStatusHeading
          sectionStatus="active"
          label={CAPABILITY_STATUS_DISPLAY_LABELS.active}
        />
        <PaymentsCommaMethods
          labels={PAYMENT_METHOD_CHIPS}
          onViewAllCapabilities={secondaryVariantViewAll}
          showOverflow={showCapabilityOverflow}
          viewAllTooltipId={viewAllTooltipId}
        />
      </div>
    </>
  )

  /** gap-3 only when multiple vertical blocks; single-cap paused/pausing_soon stays one column. */
  const mixedStatusVerticalGap =
    effectiveLimited ||
    (status === 'paused' && (isPayments || !singleCapabilityVariant)) ||
    (status === 'pausing_soon' && (isPayments || !singleCapabilityVariant))

  const homogenousStatusCapabilityBlock = (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <span className="inline-flex shrink-0" aria-hidden>
          <CapabilityStatusIcon status={status} size={12} />
        </span>
        <p className="m-0 min-w-0 flex-1 truncate font-label-medium text-[14px] leading-5 tracking-[-0.15px] text-default">
          {statusLabel}
        </p>
      </div>

      <PaymentsCommaMethods
        labels={activeMethodLabels}
        onViewAllCapabilities={secondaryVariantViewAll}
        showOverflow={showCapabilityOverflow || showFinancialAccountsOverflow}
        overflowExtra={
          isFinancialAccounts ? FINANCIAL_ACCOUNTS_POPOVER_OVERFLOW_EXTRA : undefined
        }
        viewAllTooltipId={viewAllTooltipId}
      />
    </div>
  )

  return (
    <div
      className={SIGNAL_GROUP_POPOVER_SHELL_CLASS}
      data-name={dataName}
      data-node-id={shellNodeId}
    >
      {onEditCapabilities != null && (
        <div className="absolute right-3 top-3 z-[1]">
          <IconButton
            label="Edit capabilities"
            tooltipId={editTooltipId}
            variant="ghost"
            tooltipPlacement="bottom"
            className="!h-6 !min-h-6 !w-6 !min-w-6 rounded-[12px]"
            onClick={(e) => {
              e.stopPropagation()
              onEditCapabilities()
            }}
          >
            <Icon name="settings" size={12} fill={iconDefault} />
          </IconButton>
        </div>
      )}

      <div
        className={`px-3 pt-4 pr-12 ${
          (isPayments && hasPaymentMethodOnFile) ||
          (isPayouts && payoutsLowerResolved !== 'off') ||
          (isTransfers && transfersShowPaymentsBalanceWell) ||
          (isFinancialAccounts && hasFinancialAccounts) ||
          showFinancingProductsWell ||
          isCardIssuing
            ? 'pb-0'
            : 'pb-3'
        }`}
      >
        <div className={`flex flex-col ${mixedStatusVerticalGap ? 'gap-3' : ''}`}>
          {effectiveLimited ? (
            isPayments ? (
              <>
                <div className="flex flex-col gap-1" data-name="payments-limited-paused">
                  <SectionStatusHeading
                    sectionStatus="paused"
                    label={CAPABILITY_STATUS_DISPLAY_LABELS.paused}
                  />
                  <LimitedPaymentsCapabilityPill>{ZIP_PAYMENTS_PAUSED_LABEL}</LimitedPaymentsCapabilityPill>
                </div>

                <div className="flex flex-col gap-1" data-name="payments-limited-pausing-soon">
                  <SectionStatusHeading
                    sectionStatus="pausing_soon"
                    label={CAPABILITY_STATUS_DISPLAY_LABELS.pausing_soon}
                  />
                  <LimitedPaymentsCapabilityPill>{PAUSING_SOON_PAYMENTS_METHOD_LABEL}</LimitedPaymentsCapabilityPill>
                </div>

                <div className="flex flex-col gap-1" data-name="payments-limited-active">
                  <SectionStatusHeading
                    sectionStatus="active"
                    label={CAPABILITY_STATUS_DISPLAY_LABELS.active}
                  />
                  <PaymentsCommaMethods
                    labels={PAYMENT_METHOD_CHIPS_LIMITED_ACTIVE}
                    onViewAllCapabilities={secondaryVariantViewAll}
                    showOverflow={showCapabilityOverflow}
                    viewAllTooltipId={viewAllTooltipId}
                  />
                </div>
              </>
            ) : (
              limitedTwoSection(
                isPayouts
                  ? 'payouts-paused-granular'
                  : isFinancialAccounts
                    ? 'financial-accounts-paused-granular'
                    : isFinancing
                      ? 'financing-paused-granular'
                      : isCardIssuing
                        ? 'card-issuing-paused-granular'
                        : isTransfers
                          ? 'transfers-paused-granular'
                          : undefined,
                pausedGranularLabel(
                  isPayouts,
                  isFinancialAccounts,
                  isFinancing,
                  isCardIssuing,
                  isTransfers
                )
              )
            )
          ) : status === 'paused' ? (
            isPayments ? (
              paymentsPausedMix
            ) : singleCapabilityVariant ? (
              homogenousStatusCapabilityBlock
            ) : (
              limitedTwoSection(
                isFinancialAccounts
                  ? 'financial-accounts-paused-granular'
                  : isFinancing
                    ? 'financing-paused-granular'
                    : isTransfers
                      ? 'transfers-paused-granular'
                      : undefined,
                pausedGranularLabel(
                  isPayouts,
                  isFinancialAccounts,
                  isFinancing,
                  isCardIssuing,
                  isTransfers
                )
              )
            )
          ) : status === 'pausing_soon' ? (
            isPayments ? (
              paymentsPausingSoonMix
            ) : singleCapabilityVariant ? (
              homogenousStatusCapabilityBlock
            ) : (
              pausingSoonTwoSection(
                isFinancialAccounts
                  ? 'financial-accounts-pausing-soon-granular'
                  : isFinancing
                    ? 'financing-pausing-soon-granular'
                    : isTransfers
                      ? 'transfers-pausing-soon-granular'
                      : undefined,
                pausedGranularLabel(
                  isPayouts,
                  isFinancialAccounts,
                  isFinancing,
                  isCardIssuing,
                  isTransfers
                )
              )
            )
          ) : (
            homogenousStatusCapabilityBlock
          )}
        </div>
      </div>

      {isPayments && hasPaymentMethodOnFile ? (
        <div className="mt-3 w-full shrink-0 px-0">
          <PaymentMethodsOnFileSection
            platformName={paymentMethodsPlatformLabel}
            defaultPaymentMethodExpired={defaultPaymentMethodExpired}
          />
        </div>
      ) : null}
      {isPayouts && payoutsLowerResolved === 'payoutInformation' ? (
        <div className="mt-3 w-full shrink-0 px-0">
          <PayoutInformationWell />
        </div>
      ) : null}
      {isPayouts && payoutsLowerResolved === 'external' ? (
        <div className="mt-3 w-full shrink-0 px-0">
          <ExternalPayoutAccountsWell />
        </div>
      ) : null}
      {isTransfers && transfersShowPaymentsBalanceWell ? (
        <div className="mt-3 w-full shrink-0 px-0">
          <TransfersPaymentsBalanceWell />
        </div>
      ) : null}
      {isFinancialAccounts && hasFinancialAccounts ? (
        <div className="mt-3 w-full shrink-0 px-0">
          <FinancialAccountsWithPlatformWell platformLabel={financialAccountsPlatformLabel} />
        </div>
      ) : null}
      {showFinancingProductsWell ? (
        <div className="mt-3 w-full shrink-0 px-0">
          <FinancingWithPlatformWell
            platformLabel={financingPlatformLabel}
            showLoan={financingProductsResolved.loan}
            showCashAdvance={financingProductsResolved.cashAdvance}
          />
        </div>
      ) : null}
      {isCardIssuing ? (
        <div className="mt-3 w-full shrink-0 px-0">
          <CardsIssuedByPlatformWell platformLabel={cardIssuingPlatformLabel} />
        </div>
      ) : null}
    </div>
  )
}
