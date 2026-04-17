/**
 * Payments capability popover — Figma 113:50564.
 * When the group is Limited: Active capability chips, then Paused (Zip). Section headers use status
 * icons; capability chips are text-only (no per-chip status glyphs).
 */

import {
  CAPABILITY_GROUP_DISPLAY_LABELS,
  CAPABILITY_STATUS_DISPLAY_LABELS,
  DEFAULT_FINANCING_POPOVER,
  FINANCIAL_ACCOUNTS_POPOVER_CHIPS,
  financingPopoverChipLabels,
  type CapabilityStatus,
  type FinancingProductSelection,
} from '../data/configMatrix'
import CapabilityStatusIcon from '../icons/CapabilityStatusIcon'
import { Icon } from '../icons/SailIcons'
import { IconButton } from './IconButton'
import LabelTooltip from './LabelTooltip'

const iconDefault = 'var(--color-icon-default)'

const PAYMENT_METHOD_CHIPS = [
  'Affirm payments',
  'Bancontact payments',
  'Card payments',
  'Cash App Pay payments',
  'EPS payments',
  'Klarna payments',
] as const

const MORE_OVERFLOW = 13

const ZIP_PAYMENTS_PAUSED_LABEL = 'Zip payments'

/** Limited payouts group: paused granular capability (mirrors Zip row on payments). */
const INSTANT_PAYOUTS_PAUSED_LABEL = 'Instant payouts'

/** Limited Financial accounts group: paused granular row (paired with Figma 113:49956 chip set). */
const FINANCIAL_ACCOUNTS_PAUSED_GRANULAR_LABEL = 'Cross-border transfers'

const FINANCING_PAUSED_GRANULAR_LABEL = 'Term loans'

const CARD_ISSUING_PAUSED_GRANULAR_LABEL = 'Physical cards'

const PAYOUTS_CAPABILITY_CHIPS = ['Payouts'] as const

const CARD_ISSUING_CAPABILITY_CHIPS = [CAPABILITY_GROUP_DISPLAY_LABELS.issuing] as const

const CHIP_CLASS =
  'inline-flex h-6 max-w-full shrink-0 items-center rounded-[999px] border border-neutral-100 bg-surface px-2 font-label-small-emphasized leading-4 tracking-[-0.024px] text-default'

/** Figma 113:49956 Chip: horizontal padding 6px / 8px, border default #d8dee4 → neutral-100. */
const FINANCIAL_ACCOUNTS_CHIP_CLASS =
  'inline-flex h-6 max-w-full shrink-0 items-center rounded-[999px] border border-neutral-100 bg-surface pl-[6px] pr-2 font-label-small-emphasized leading-4 tracking-[-0.024px] text-default'

type PaymentsPopoverPanelProps = {
  /** Payments capability group status from prototype configure modal. */
  status: CapabilityStatus
  /**
   * Payments: full method list + overflow; Payouts / Financial accounts: dedicated chip sets;
   * Financing: Loan / Cash advance chips from `financingProducts`; Card issuing: single chip.
   */
  variant?:
    | 'payments'
    | 'payouts'
    | 'financialAccounts'
    | 'financing'
    | 'cardIssuing'
  /** Configure account financing selection; when variant is `financing`, defaults to loan-only. */
  financingProducts?: FinancingProductSelection
  /** Opens Profile drawer to Capabilities (payments +NN overflow). */
  onViewAllCapabilities?: () => void
  /** Opens Settings on the Capabilities edit surface (gear control). */
  onEditCapabilities?: () => void
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

/** Capability chips: text only (no status icons in this density). */
function MethodChipPills({
  labels,
  onViewAllCapabilities,
  showOverflow = true,
  viewAllTooltipId = 'payments-popover-view-all-capabilities-tooltip',
  chipClassName = CHIP_CLASS,
}: {
  labels: readonly string[]
  onViewAllCapabilities?: () => void
  /** When false, omit +NN (e.g. payouts single capability). */
  showOverflow?: boolean
  viewAllTooltipId?: string
  chipClassName?: string
}) {
  const overflow =
    !showOverflow ? null : onViewAllCapabilities ? (
      <LabelTooltip
        label="View all capabilities"
        tooltipId={viewAllTooltipId}
        placement="bottom"
        variant="dark"
      >
        <button
          type="button"
          className="inline-flex h-6 shrink-0 cursor-pointer items-center rounded border-0 px-1.5 py-px font-label-small leading-4 text-[#50617a] bg-[#f4f7fa] transition-colors hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-action-primary"
          aria-label="View all capabilities"
          onClick={(e) => {
            e.stopPropagation()
            onViewAllCapabilities()
          }}
        >
          +{MORE_OVERFLOW}
        </button>
      </LabelTooltip>
    ) : (
      <span className="inline-flex h-6 shrink-0 items-center rounded px-1.5 py-px font-label-small leading-4 text-[#50617a] bg-[#f4f7fa]">
        +{MORE_OVERFLOW}
      </span>
    )

  return (
    <div className="flex w-full flex-wrap gap-2">
      {labels.map((label) => (
        <span key={label} className={chipClassName}>
          <span className="min-w-0 truncate">{label}</span>
        </span>
      ))}
      {overflow}
    </div>
  )
}

export default function PaymentsPopoverPanel({
  status,
  variant = 'payments',
  financingProducts: financingProductsProp,
  onViewAllCapabilities,
  onEditCapabilities,
}: PaymentsPopoverPanelProps) {
  const statusLabel = CAPABILITY_STATUS_DISPLAY_LABELS[status]
  const isLimitedGroup = status === 'limited'
  const isPayouts = variant === 'payouts'
  const isFinancialAccounts = variant === 'financialAccounts'
  const isFinancing = variant === 'financing'
  const isCardIssuing = variant === 'cardIssuing'
  const financingProductsResolved = financingProductsProp ?? DEFAULT_FINANCING_POPOVER

  const dataName = isPayouts
    ? 'payouts'
    : isFinancialAccounts
      ? 'financial-accounts'
      : isFinancing
        ? 'financing'
        : isCardIssuing
          ? 'card-issuing'
          : 'payments'
  const editTooltipId = isPayouts
    ? 'payouts-popover-capabilities-edit-tooltip'
    : isFinancialAccounts
      ? 'financial-accounts-popover-capabilities-edit-tooltip'
      : isFinancing
        ? 'financing-popover-capabilities-edit-tooltip'
        : isCardIssuing
          ? 'card-issuing-popover-capabilities-edit-tooltip'
          : 'payments-popover-capabilities-edit-tooltip'
  const viewAllTooltipId = isPayouts
    ? 'payouts-popover-view-all-capabilities-tooltip'
    : isFinancialAccounts
      ? 'financial-accounts-popover-view-all-capabilities-tooltip'
      : isFinancing
        ? 'financing-popover-view-all-capabilities-tooltip'
        : isCardIssuing
          ? 'card-issuing-popover-view-all-capabilities-tooltip'
          : 'payments-popover-view-all-capabilities-tooltip'

  const activeMethodLabels = isPayouts
    ? PAYOUTS_CAPABILITY_CHIPS
    : isFinancialAccounts
      ? FINANCIAL_ACCOUNTS_POPOVER_CHIPS
      : isFinancing
        ? financingPopoverChipLabels(financingProductsResolved)
        : isCardIssuing
          ? CARD_ISSUING_CAPABILITY_CHIPS
          : PAYMENT_METHOD_CHIPS
  const showCapabilityOverflow =
    !isPayouts && !isFinancialAccounts && !isFinancing && !isCardIssuing
  const secondaryVariantViewAll =
    isPayouts || isFinancialAccounts || isFinancing || isCardIssuing
      ? undefined
      : onViewAllCapabilities

  const shellNodeId =
    isFinancialAccounts ? '113:49956' : variant === 'payments' ? '113:50564' : undefined
  const capabilityChipClass = isFinancialAccounts ? FINANCIAL_ACCOUNTS_CHIP_CLASS : CHIP_CLASS

  return (
    <div
      className="relative w-[min(100vw-24px,360px)] min-w-[280px] max-w-[360px] rounded-[16px] border border-neutral-100 bg-surface pb-1 pl-1 pr-1 pt-0 shadow-[0px_15px_35px_0px_rgba(48,49,61,0.08),0px_5px_15px_0px_rgba(0,0,0,0.12)]"
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

      <div className="px-3 pb-3 pt-4 pr-12">
        <div className="flex flex-col gap-4">
          {isLimitedGroup ? (
            <>
              <div className="flex flex-col gap-2">
                <SectionStatusHeading
                  sectionStatus="active"
                  label={CAPABILITY_STATUS_DISPLAY_LABELS.active}
                />
                <MethodChipPills
                  labels={activeMethodLabels}
                  onViewAllCapabilities={secondaryVariantViewAll}
                  showOverflow={showCapabilityOverflow}
                  viewAllTooltipId={viewAllTooltipId}
                  chipClassName={capabilityChipClass}
                />
              </div>

              <div
                className="flex flex-col gap-2"
                data-name={
                  isPayouts
                    ? 'payouts-paused-granular'
                    : isFinancialAccounts
                      ? 'financial-accounts-paused-granular'
                      : isFinancing
                        ? 'financing-paused-granular'
                        : isCardIssuing
                          ? 'card-issuing-paused-granular'
                          : 'payments-paused-granular'
                }
              >
                <SectionStatusHeading
                  sectionStatus="paused"
                  label={CAPABILITY_STATUS_DISPLAY_LABELS.paused}
                />
                <div className="flex w-full flex-wrap gap-2">
                  <span className={capabilityChipClass}>
                    <span className="min-w-0 truncate">
                      {isPayouts
                        ? INSTANT_PAYOUTS_PAUSED_LABEL
                        : isFinancialAccounts
                          ? FINANCIAL_ACCOUNTS_PAUSED_GRANULAR_LABEL
                          : isFinancing
                            ? FINANCING_PAUSED_GRANULAR_LABEL
                            : isCardIssuing
                              ? CARD_ISSUING_PAUSED_GRANULAR_LABEL
                              : ZIP_PAYMENTS_PAUSED_LABEL}
                    </span>
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <span className="inline-flex shrink-0" aria-hidden>
                  <CapabilityStatusIcon status={status} size={12} />
                </span>
                <p className="m-0 min-w-0 flex-1 truncate font-label-medium text-[14px] leading-5 tracking-[-0.15px] text-default">
                  {statusLabel}
                </p>
              </div>

              <MethodChipPills
                labels={activeMethodLabels}
                onViewAllCapabilities={secondaryVariantViewAll}
                showOverflow={showCapabilityOverflow}
                viewAllTooltipId={viewAllTooltipId}
                chipClassName={capabilityChipClass}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
