/**
 * Balances card — balance/status value card (replaces MetricCard for balance display).
 * Figma: 23:8329 (default/payments), 23:8880 (payouts), 24:12288 (section with stacked variants).
 * Variants: default (standalone), payouts (standalone, same layout), stacked, stackedWithSparkline.
 */

import { Icon } from '../icons/SailIcons'
import { IconButton } from './IconButton'
import { RightArrowIcon } from './metrics/MetricCard'

const ICON_BOX_SIZE = 32
const ICON_BOX_RADIUS = 7

export type BalancesCardVariant = 'default' | 'payouts' | 'stacked' | 'stackedWithSparkline' | 'amountRight'

export type BalancesCardProps = {
  /** Main label (e.g. "Payments balance"). */
  label: string
  /** Subtitle under label (e.g. "3 currencies"). */
  subtitle: string
  /** Primary value (e.g. "$6,382.23"). */
  value: string
  /** Optional line under value (e.g. "$7,600.00 in transit to bank"). */
  valueSubtitle?: string
  /** Optional footer text with cycle icon (e.g. "Earnings settle daily"). Only in default variant. */
  footerLabel?: string
  /** Optional icon for footer (e.g. DailyPayoutIcon). When set, rendered in 20×20 circle; else default refund icon. */
  footerIcon?: React.ReactNode
  /** Optional more (overflow) ghost icon button. */
  onMore?: () => void
  /** Optional secondary ghost icon (e.g. open in Money management). Shown before More when set. */
  onSecondaryAction?: () => void
  /** Tooltip/label for secondary action. Default: "View in Money management". */
  secondaryActionLabel?: string
  /** default | payouts = standalone card with border; stacked = row; stackedWithSparkline = row with sparkline; amountRight = title + amount only, amount block floated right with text left-aligned (MM sidebar payout, Billing). */
  variant?: BalancesCardVariant
  /** Icon in SailIcons (balance, refund, lock, stripe, etc.). Default: balance. Ignored when icon is set. */
  iconName?: string
  /** Custom icon node (e.g. GramIcon for Financial accounts). When set, overrides iconName. */
  icon?: React.ReactNode
  /** Row background for stacked variants. offset = grey (Figma "Held in reserve" row). */
  rowBackground?: 'surface' | 'offset'
  /** Sparkline node for variant stackedWithSparkline (e.g. MiniBarSparkline). */
  sparkline?: React.ReactNode
  /** When true and stacked, use compact row height (60px). Default stacked height 72px. */
  compactRow?: boolean
  /** Optional rotation in degrees for left icon (e.g. 180 for refund on Incoming). */
  iconRotate?: number
  /** Align value/amounts to the right. Use 'right' only when card is in a 2-per-row layout in main content or when the card is in the sidebar; otherwise default 'left'. */
  valueAlign?: 'left' | 'right'
  className?: string
}

export default function BalancesCard({
  label,
  subtitle,
  value,
  valueSubtitle,
  footerLabel,
  footerIcon,
  onMore,
  onSecondaryAction,
  secondaryActionLabel,
  variant = 'default',
  iconName = 'balance',
  icon,
  rowBackground = 'surface',
  sparkline,
  compactRow = false,
  iconRotate,
  valueAlign = 'left',
  className = '',
}: BalancesCardProps) {
  const isStacked = variant === 'stacked' || variant === 'stackedWithSparkline'
  const isStandalone = variant === 'default' || variant === 'payouts'
  const isAmountRight = variant === 'amountRight'
  const hasSparkline = variant === 'stackedWithSparkline' && sparkline != null
  const hasFooter = isStandalone && footerLabel != null && footerLabel !== ''
  const hasRightContent = hasSparkline || hasFooter || onMore != null || onSecondaryAction != null

  const borderClass = isStacked ? '' : 'border border-neutral-50'
  const roundedClass = isStacked ? '' : 'rounded-[12px]'
  const bgClass =
    rowBackground === 'offset' ? 'bg-offset' : 'bg-surface'
  const paddingClass = isStacked ? 'px-3 py-4' : 'p-[var(--spacing-150)]'
  const heightClass = isStacked ? (compactRow ? 'h-[60px]' : 'h-[72px]') : ''
  const dataNodeId = variant === 'payouts' ? '23:8880' : isStacked ? '24:12307' : '23:8329'

  /** Far right: always room for two icon buttons. */
  const actionIcons = (
    <div className="flex shrink-0 items-center gap-0 w-[72px] justify-end">
      {onSecondaryAction != null ? (
        <IconButton
          label={secondaryActionLabel ?? 'View in Money management'}
          tooltipId="balances-card-secondary-tooltip"
          variant="ghost"
          className="!h-9 !w-9 !min-h-9 !min-w-9"
          onClick={onSecondaryAction}
        >
          <RightArrowIcon size={12} fill="var(--color-icon-subdued)" />
        </IconButton>
      ) : (
        <span className="w-9 h-9 shrink-0" />
      )}
      {onMore != null ? (
        <IconButton
          label="More actions"
          tooltipId="balances-card-more-tooltip"
          variant="ghost"
          className="!h-9 !w-9 !min-h-9 !min-w-9"
          onClick={onMore}
        >
          <Icon
            name="more"
            size={16}
            fill="var(--color-icon-default)"
            aria-hidden
          />
        </IconButton>
      ) : (
        <span className="w-9 h-9 shrink-0" />
      )}
    </div>
  )

  const titleBlock = (
    <div className="flex min-w-0 items-center gap-[var(--spacing-small)] justify-start">
      <div
        className="flex shrink-0 items-center justify-center rounded-[7px] bg-offset"
        style={{ width: ICON_BOX_SIZE, height: ICON_BOX_SIZE }}
        data-node-id="23:8332"
      >
        {icon != null ? (
          <span className="flex items-center justify-center text-icon-default">
            {icon}
          </span>
        ) : (
          <span style={iconRotate != null ? { display: 'inline-block', transform: `rotate(${iconRotate}deg)` } : undefined}>
            <Icon
              name={iconName as 'balance'}
              size={16}
              fill="var(--color-icon-default)"
              aria-hidden
            />
          </span>
        )}
      </div>
      <div className="min-w-0">
        <p className="text-left text-[14px] font-semibold leading-5 tracking-[-0.15px] text-default">
          {label}
        </p>
        <p className="text-left font-label-small text-subdued leading-4">
          {subtitle}
        </p>
      </div>
    </div>
  )

  const amountBlockLeftAligned = (
    <div className="flex min-w-0 flex-col items-start justify-center text-left">
      <p className="whitespace-nowrap text-[14px] font-semibold leading-5 tracking-[-0.15px] text-default">
        {value}
      </p>
      {valueSubtitle != null && valueSubtitle !== '' && (
        <p className="font-label-small text-subdued leading-4 line-clamp-1 text-left">
          {valueSubtitle}
        </p>
      )}
    </div>
  )

  return (
    <div
      className={`flex w-full items-center overflow-clip ${heightClass} ${roundedClass} ${borderClass} ${bgClass} ${paddingClass} ${className}`}
      data-name="Balances card"
      data-node-id={dataNodeId}
    >
      {isAmountRight ? (
        <div className="flex min-w-0 flex-1 items-center gap-4">
          {/* Title fills available space; 16px gap (gap-4) before amount */}
          <div className="min-w-0 flex-1">
            {titleBlock}
          </div>
          {/* Amount block far right, text right-aligned (amount + description) */}
          <div className="shrink-0 flex flex-col items-end text-right">
            <p className="whitespace-nowrap text-[14px] font-semibold leading-5 tracking-[-0.15px] text-default">
              {value}
            </p>
            {valueSubtitle != null && valueSubtitle !== '' && (
              <p className="font-label-small text-subdued leading-4 line-clamp-1 text-right">
                {valueSubtitle}
              </p>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="grid min-w-0 flex-1 grid-cols-[1fr_1fr_1fr] gap-x-4 gap-y-2 items-center">
            {titleBlock}
            {amountBlockLeftAligned}
            <div className="flex min-w-0 items-center justify-start">
              {hasSparkline && sparkline}
              {!hasSparkline && hasFooter && (
                <div className="flex items-center gap-[var(--spacing-small)]">
                  {footerIcon != null ? (
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-neutral-100 bg-surface text-icon-subdued"
                      aria-hidden
                    >
                      {footerIcon}
                    </span>
                  ) : (
                    <span
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[length:var(--radius-rounded)] border border-neutral-100 bg-surface"
                      aria-hidden
                    >
                      <span className="rotate-180">
                        <Icon
                          name="refund"
                          size={12}
                          fill="var(--color-icon-subdued)"
                          aria-hidden
                        />
                      </span>
                    </span>
                  )}
                  <span className="text-left text-[12px] leading-4 text-subdued whitespace-nowrap">
                    {footerLabel}
                  </span>
                </div>
              )}
            </div>
          </div>
          {actionIcons}
        </>
      )}
    </div>
  )
}
