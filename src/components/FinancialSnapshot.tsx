/**
 * Financial snapshot — Two cards side by side: each Volume + time range (upper right) + sparkline + value.
 */

import LabelTooltip from './LabelTooltip'
import MetricDropdown from './metrics/MetricDropdown'
import StaticSparkline from './metrics/StaticSparkline'
import type { TimeRange } from './metrics/constants'

export type FinancialSnapshotProps = {
  moneyIn: string
  moneyOut: string
  netFlow: string
  /** Current time range label (e.g. "Last 30 days"). */
  timeRangeValue: TimeRange
  /** Options for the time range dropdown (e.g. TIME_RANGE_OPTIONS). */
  timeRangeOptions: readonly TimeRange[]
  onTimeRangeChange: (value: TimeRange) => void
  /** Grayscale, simplified layout (no purple; sparkline → gray bar). */
  lowFidelity?: boolean
  className?: string
}

export default function FinancialSnapshot({
  moneyIn: _moneyIn,
  moneyOut: _moneyOut,
  netFlow,
  timeRangeValue,
  timeRangeOptions,
  onTimeRangeChange,
  lowFidelity = false,
  className = '',
}: FinancialSnapshotProps) {
  const cardClass = lowFidelity
    ? 'flex min-w-0 flex-1 flex-col overflow-hidden rounded-[12px] bg-surface p-[8px]'
    : 'flex min-w-0 flex-1 flex-col items-stretch justify-between gap-0 overflow-hidden rounded-[12px] bg-surface p-[8px]'
  const groupClass = 'flex w-full gap-4 rounded-[16px] bg-offset p-[8px]'
  const labelClass = lowFidelity
    ? 'font-label-medium-emphasized text-[14px] leading-5 tracking-[-0.15px] text-subdued'
    : 'font-label-medium-emphasized text-[14px] leading-5 tracking-[-0.15px] text-default'
  const valueClass = lowFidelity
    ? 'text-[20px] font-normal leading-6 tracking-[-0.2px] text-subdued tabular-nums'
    : 'text-[20px] font-normal leading-6 tracking-[-0.2px] text-default tabular-nums'

  /** Skeleton matching Volume metric card (label + value bars) */
  const VolumeMetricSkeleton = () => (
    <div className="flex flex-col gap-1.5" aria-hidden>
      <div className="h-3 w-20 rounded-[3px] bg-neutral-100" />
      <div className="h-3 w-16 rounded-[3px] bg-neutral-100" />
    </div>
  )

  return (
    <div
      className={`flex w-full flex-col gap-2 ${className}`.trim()}
      data-node-id="29:15219"
    >
      <div
        className={groupClass}
        data-name="Group"
        data-node-id="29:15178"
      >
        {/* Card 1: Volume + time range upper right + sparkline + value */}
        <div
          className={cardClass}
          data-name="Card-layout"
          data-node-id="29:15220"
        >
          <div className="flex w-full items-start justify-between gap-2 shrink-0">
            <p className={labelClass}>Volume</p>
            <MetricDropdown
              value={timeRangeValue}
              options={timeRangeOptions}
              onChange={onTimeRangeChange}
              ariaLabel="Time range"
            />
          </div>
          <div className="flex flex-col gap-4 flex-1">
            {!lowFidelity && (
              <div className="relative h-11 w-full min-h-[44px]" data-name="Spark line chart container" data-node-id="29:15267">
                <StaticSparkline />
              </div>
            )}
          </div>
          <div className="flex w-full items-center pt-0" data-name="Bottom" data-node-id="29:15275">
            {lowFidelity ? (
              <VolumeMetricSkeleton />
            ) : (
              <LabelTooltip
                label="Volume"
                tooltipId="financial-snapshot-volume-tooltip-1"
                placement="top"
              >
                <p className={valueClass}>{netFlow}</p>
              </LabelTooltip>
            )}
          </div>
        </div>
        {/* Card 2: same layout */}
        <div
          className={cardClass}
          data-name="Card-layout"
          data-node-id="29:15221"
        >
          <div className="flex w-full items-start justify-between gap-2 shrink-0">
            <p className={labelClass}>Volume</p>
            <MetricDropdown
              value={timeRangeValue}
              options={timeRangeOptions}
              onChange={onTimeRangeChange}
              ariaLabel="Time range"
            />
          </div>
          <div className="flex flex-col gap-4 flex-1">
            {!lowFidelity && (
              <div className="relative h-11 w-full min-h-[44px]" data-name="Spark line chart container" data-node-id="29:15267">
                <StaticSparkline />
              </div>
            )}
          </div>
          <div className="flex w-full items-center pt-0" data-name="Bottom" data-node-id="29:15275">
            {lowFidelity ? (
              <VolumeMetricSkeleton />
            ) : (
              <LabelTooltip
                label="Volume"
                tooltipId="financial-snapshot-volume-tooltip-2"
                placement="top"
              >
                <p className={valueClass}>{netFlow}</p>
              </LabelTooltip>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
