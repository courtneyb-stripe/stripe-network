/**
 * Shared metric card: compact (Network list), withSparkline (Account All balances), simple (Paid in/out).
 * Balances Module matches Figma 2:6424: gap 8px, 16px padding, Label/Medium emphasized + Regular, Heading/Large subdued, right arrow icon.
 */

import React, { useState, useRef, useEffect } from 'react'
import ChevronDownIcon from '../../icons/ChevronDownIcon'
import LabelTooltip from '../LabelTooltip'
import { IconButton } from '../IconButton'
import MetricDropdown from './MetricDropdown'
import StaticSparkline from './StaticSparkline'

/** Right arrow icon — NextIcon xsmall arrowRight (fill path). Exported for SectionHeader. */
export const ARROW_RIGHT_PATH =
  'M7.28033 0.96967C6.98744 0.676777 6.51256 0.676777 6.21967 0.96967C5.92678 1.26256 5.92678 1.73744 6.21967 2.03033L9.43934 5.25H0.75C0.335786 5.25 0 5.58579 0 6C0 6.41421 0.335786 6.75 0.75 6.75H9.43934L6.21967 9.96967C5.92678 10.2626 5.92678 10.7374 6.21967 11.0303C6.51256 11.3232 6.98744 11.3232 7.28033 11.0303L11.7803 6.53033C11.9268 6.38388 12 6.19194 12 6C12 5.80806 11.9268 5.61612 11.7803 5.46967L7.28033 0.96967Z'

export function RightArrowIcon({
  size = 12,
  fill = 'var(--color-icon-subdued)',
}: {
  size?: number
  fill?: string
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d={ARROW_RIGHT_PATH} fill={fill} />
    </svg>
  )
}

export type MetricCardVariant = 'compact' | 'withSparkline' | 'simple' | 'labelValueSparkline'

type BaseProps = {
  variant: MetricCardVariant
  className?: string
}

/** Figma 28:12479 — Label on top, optional sparkline in middle, value at bottom (e.g. Lifetime value / MRR). */
type LabelValueSparklineProps = BaseProps & {
  variant: 'labelValueSparkline'
  label: string
  value: string
  /** Optional. When omitted, no chart area is shown (design note: chart is "nice to have"). */
  sparkline?: React.ReactNode
  /** Optional +/- % change (e.g. "+2.5%" or "-1.2%"). Shown right of value, baseline-aligned; tooltip describes period (e.g. last 30 days). */
  changePercent?: string
  /** Tooltip label when hovering the change (e.g. "Change over last 30 days"). */
  changeTooltipLabel?: string
  /** Optional: options for label dropdown (e.g. Volume / Value). When set, label row shows chevron and dropdown. */
  metricOptions?: { id: string; label: string }[]
  /** Current metric option id when metricOptions is used. */
  metricValue?: string
  /** Called when user picks a different option from the label dropdown. */
  onMetricChange?: (id: string) => void
}

type CompactProps = BaseProps & {
  variant: 'compact'
  metricValue: string
  metricOptions: readonly string[]
  metricValueCurrent: string
  onMetricChange: (v: string) => void
  timeOptions: readonly string[]
  timeValue: string
  onTimeChange: (v: string) => void
  change?: string
  loading?: boolean
}

type WithSparklineProps = BaseProps & {
  variant: 'withSparkline'
  balanceOptions: readonly string[]
  balanceValue: string
  onBalanceChange: (v: string) => void
  primaryValue: string
  subtitle: string
  axisStart: string
  axisEnd: string
  onOpenInNewTab?: () => void
}

type SimpleProps = BaseProps & {
  variant: 'simple'
  label: string
  value: string
  /** Optional right-aligned action (e.g. chevron). Figma 20:9780. */
  actionIcon?: React.ReactNode
  onActionClick?: () => void
}

export type MetricCardProps = CompactProps | WithSparklineProps | SimpleProps | LabelValueSparklineProps

/** Min height for simple metric card and skeleton so they match and appear taller. */
const SIMPLE_METRIC_CARD_MIN_HEIGHT = 'min-h-[80px]'

/** Skeleton for simple metric card (low fidelity): label and value as gray bars. */
export function SimpleMetricCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`flex min-w-0 flex-col rounded-[16px] border border-neutral-50 bg-surface justify-center gap-1.5 py-[8px] px-[12px] shadow-[0px_1px_2px_-0.5px_rgba(0,0,0,0.05)] ${SIMPLE_METRIC_CARD_MIN_HEIGHT} ${className}`.trim()}
      data-name="Metric card (simple) skeleton"
    >
      <div className="h-3 w-20 rounded-[3px] bg-neutral-100" aria-hidden />
      <div className="h-3 w-16 rounded-[3px] bg-neutral-100" aria-hidden />
    </div>
  )
}

function MetricValueSkeleton() {
  return (
    <div className="flex items-baseline gap-2" aria-hidden>
      <div className="h-8 w-24 rounded-[3px] bg-neutral-100 animate-pulse" />
      <div className="h-4 w-10 rounded-[3px] bg-neutral-100 animate-pulse" />
    </div>
  )
}

const isPositiveChange = (s: string) => s.startsWith('+')

type LabelValueSparklineCardProps = {
  className: string
  displayLabel: string
  hasMetricDropdown: boolean
  metricOptions: { id: string; label: string }[]
  metricValue?: string
  onMetricChange: (id: string) => void
  value: string
  changePercent?: string
  changeTooltipLabel: string
  changeColor: string | undefined
  sparkline?: React.ReactNode
}

function LabelValueSparklineCard({
  className,
  displayLabel,
  hasMetricDropdown,
  metricOptions,
  metricValue,
  onMetricChange,
  value,
  changePercent,
  changeTooltipLabel,
  changeColor,
  sparkline,
}: LabelValueSparklineCardProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!dropdownOpen) return
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [dropdownOpen])

  return (
    <div
      className={`flex min-w-0 flex-col items-start justify-between overflow-hidden rounded-[8px] border border-neutral-50 bg-surface p-3 ${className}`}
      data-name="Card 2"
      data-node-id="28:12479"
    >
      <div className="relative flex min-h-5 w-full shrink-0 items-center px-1" data-node-id="28:12480" ref={ref}>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <p className="min-w-0 flex-1 font-label-medium-emphasized text-default leading-5 tracking-[-0.15px] truncate" data-node-id="28:12481">
            {displayLabel}
          </p>
          {hasMetricDropdown && (
            <button
              type="button"
              onClick={() => setDropdownOpen((o) => !o)}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[4px] text-icon-subdued hover:bg-offset focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary"
              aria-expanded={dropdownOpen}
              aria-haspopup="listbox"
              aria-label="Choose metric"
            >
              <ChevronDownIcon size={8} fill="currentColor" />
            </button>
          )}
        </div>
        {hasMetricDropdown && dropdownOpen && (
          <ul
            role="listbox"
            className="absolute left-0 top-full z-20 mt-0.5 min-w-[140px] rounded-[4px] border border-neutral-100 bg-surface py-1 shadow-lg"
            style={{ left: 4 }}
          >
          {metricOptions.map((opt) => (
            <li key={opt.id} role="option" aria-selected={metricValue === opt.id}>
              <button
                type="button"
                className="w-full px-3 py-1.5 text-left font-label-medium text-default hover:bg-offset focus:bg-offset focus:outline-none"
                onMouseDown={(e) => {
                  e.preventDefault()
                  onMetricChange(opt.id)
                  setDropdownOpen(false)
                }}
              >
                {opt.label}
              </button>
            </li>
          ))}
          </ul>
        )}
      </div>
      {sparkline != null && (
        <div
          className="relative flex min-h-[44px] flex-1 w-full min-w-0 items-center justify-center px-1"
          data-name="Spark line chart container"
          data-node-id="28:12486"
        >
          <div className="relative h-full w-full min-h-0 min-w-0" data-node-id="28:12487">
            {sparkline}
          </div>
        </div>
      )}
      <div className="flex w-full shrink-0 items-baseline justify-start gap-[6px] pl-1 pr-1" data-node-id="28:12484">
        <p
          className="min-w-0 shrink-0 text-left text-[20px] leading-6 tracking-[-0.2px] text-default tabular-nums"
          style={{ fontFeatureSettings: "'lnum' 1, 'pnum' 1" }}
          data-node-id="28:12485"
        >
          {value}
        </p>
        {changePercent != null && (
          <LabelTooltip
            label={changeTooltipLabel}
            tooltipId="metric-card-change-tooltip"
            placement="top"
          >
            <span
              className="shrink-0 cursor-default font-label-small-emphasized tabular-nums"
              style={{ color: changeColor }}
              aria-hidden
            >
              {changePercent}
            </span>
          </LabelTooltip>
        )}
      </div>
    </div>
  )
}

export default function MetricCard(props: MetricCardProps) {
  const { variant, className = '' } = props
  const baseCard =
    'flex min-w-0 flex-col rounded-[12px] border border-neutral-50 bg-surface'

  if (variant === 'labelValueSparkline') {
    const {
      label,
      value,
      sparkline,
      changePercent,
      changeTooltipLabel = 'Change over last 30 days',
      metricOptions,
      metricValue,
      onMetricChange,
    } = props
    const changeColor =
      changePercent == null
        ? undefined
        : changePercent.startsWith('-')
          ? 'var(--color-feedback-critical-on)'
          : 'var(--color-feedback-success-on)'
    const hasMetricDropdown = metricOptions != null && metricOptions.length > 0 && onMetricChange != null
    const currentOption = hasMetricDropdown && metricValue != null
      ? metricOptions!.find((o) => o.id === metricValue) ?? metricOptions![0]
      : null
    const displayLabel = currentOption != null ? currentOption.label : label

    return (
      <LabelValueSparklineCard
        className={className}
        displayLabel={displayLabel}
        hasMetricDropdown={hasMetricDropdown}
        metricOptions={metricOptions ?? []}
        metricValue={metricValue}
        onMetricChange={onMetricChange!}
        value={value}
        changePercent={changePercent}
        changeTooltipLabel={changeTooltipLabel}
        changeColor={changeColor}
        sparkline={sparkline}
      />
    )
  }

  if (variant === 'simple') {
    const hasAction = props.actionIcon != null
    return (
      <div
        className={`${baseCard} justify-center gap-1.5 p-4 shadow-[0px_1px_2px_-0.5px_rgba(0,0,0,0.05)] ${SIMPLE_METRIC_CARD_MIN_HEIGHT} ${className}`}
        data-name="Metric card (simple)"
      >
        <div className="flex w-full shrink-0 items-start justify-between gap-2">
          <p className="min-w-0 flex-1 font-label-small-emphasized text-subdued leading-4">
            {props.label}
          </p>
          {hasAction && (
            props.onActionClick ? (
              <button
                type="button"
                onClick={props.onActionClick}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] bg-offset text-default transition-colors hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-action-primary"
                aria-label={`${props.label} details`}
              >
                {props.actionIcon}
              </button>
            ) : (
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center text-icon-subdued">
                {props.actionIcon}
              </span>
            )
          )}
        </div>
        <p className="font-heading-large-subdued tabular-nums leading-6 text-subdued">
          {props.value}
        </p>
      </div>
    )
  }

  if (variant === 'withSparkline') {
    const {
      balanceOptions,
      balanceValue,
      onBalanceChange,
      primaryValue,
      subtitle,
      axisStart,
      axisEnd,
      onOpenInNewTab,
    } = props
    return (
      <div
        className={`${baseCard} isolate h-full gap-[8px] p-4 ${className}`}
        data-name="Balances Module"
        data-node-id="2:6424"
      >
        <div className="flex w-full shrink-0 items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 flex-col gap-[4px]">
            <MetricDropdown
              value={balanceValue}
              options={balanceOptions}
              onChange={onBalanceChange}
              ariaLabel="Balance or account"
              emphasized
            />
            <p className="font-heading-large-subdued tabular-nums leading-8">
              {primaryValue}
            </p>
            <p className="font-label-small text-subdued leading-4">{subtitle}</p>
          </div>
          {onOpenInNewTab && (
            <IconButton
              label="Open in new tab"
              tooltipId="metric-card-open-new-tab-tooltip"
              onClick={onOpenInNewTab}
            >
              <RightArrowIcon size={12} fill="var(--color-icon-subdued)" />
            </IconButton>
          )}
        </div>
        <div className="flex min-h-0 flex-1 items-center">
          <StaticSparkline />
        </div>
        <div className="flex w-full shrink-0 items-center justify-between text-[11px] leading-[11px] text-subdued">
          <span>{axisStart}</span>
          <span className="text-right">{axisEnd}</span>
        </div>
      </div>
    )
  }

  // compact
  const {
    metricValue,
    metricOptions,
    metricValueCurrent,
    onMetricChange,
    timeOptions,
    timeValue,
    onTimeChange,
    change,
    loading,
  } = props
  return (
    <div
      className={`${baseCard} gap-3 p-4 ${className}`}
      data-name="Metric card (compact)"
    >
      <div className="flex w-full items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <MetricDropdown
            value={metricValueCurrent}
            options={metricOptions}
            onChange={onMetricChange}
            ariaLabel="Metric"
            emphasized
          />
          {loading ? (
            <MetricValueSkeleton />
          ) : (
            <div className="flex items-baseline gap-1">
              <span className="font-heading-large-subdued tabular-nums">{metricValue}</span>
              {change != null && (
                <span
                  className="font-label-small-emphasized"
                  style={{
                    color: isPositiveChange(change)
                      ? 'var(--color-feedback-success-on)'
                      : 'var(--color-subdued)',
                  }}
                >
                  {change}
                </span>
              )}
            </div>
          )}
        </div>
        <MetricDropdown
          value={timeValue}
          options={timeOptions}
          onChange={onTimeChange}
          ariaLabel="Time range"
        />
      </div>
    </div>
  )
}
