/**
 * Financial snapshot — Figma 29:15219.
 * Section title + time range dropdown (consistent with metric options); offset container with two cards:
 * First: Net flow + sparkline + total; Second: Money in / Money out with progress bars.
 *
 * Snapshot dropdown: Uses MetricDropdown; value/options/onChange come from parent (MoneyMovement holds
 * financialTimeRange state and TIME_RANGE_OPTIONS). Closes on blur. For consistency with other dropdowns,
 * consider closing on outside click if needed.
 */

import LabelTooltip from './LabelTooltip'
import MetricDropdown from './metrics/MetricDropdown'
import StaticSparkline from './metrics/StaticSparkline'
import type { TimeRange } from './metrics/constants'

const PROGRESS_BAR_FILL = '#9966FF' // Chart/Categorical 1
const PROGRESS_BAR_TRACK = '#f4f7fa' // Neutral/25

export type FinancialSnapshotProps = {
  moneyIn: string
  moneyOut: string
  netFlow: string
  /** Current time range label (e.g. "Last 30 days"). */
  timeRangeValue: TimeRange
  /** Options for the time range dropdown (e.g. TIME_RANGE_OPTIONS). */
  timeRangeOptions: readonly TimeRange[]
  onTimeRangeChange: (value: TimeRange) => void
  className?: string
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div
      className="h-4 w-full overflow-hidden rounded-[4px]"
      style={{ backgroundColor: PROGRESS_BAR_TRACK }}
      aria-hidden
    >
      <div
        className="h-full rounded-[4px] transition-[width]"
        style={{ width: `${pct}%`, backgroundColor: PROGRESS_BAR_FILL }}
      />
    </div>
  )
}

export default function FinancialSnapshot({
  moneyIn,
  moneyOut,
  netFlow,
  timeRangeValue,
  timeRangeOptions,
  onTimeRangeChange,
  className = '',
}: FinancialSnapshotProps) {
  const inNum = parseFloat(moneyIn.replace(/[^0-9.-]/g, '')) || 0
  const outNum = parseFloat(moneyOut.replace(/[^0-9.-]/g, '')) || 0
  /** Total money moved (in + out); gray bar = 100% of this, purple fill = % of in/out. */
  const totalSum = Math.max(inNum + outNum, 1)

  return (
    <div
      className={`flex w-full flex-col gap-2 ${className}`.trim()}
      data-node-id="29:15219"
    >
      <div className="flex w-full items-center justify-end gap-2" data-node-id="29:15125">
        <MetricDropdown
          value={timeRangeValue}
          options={timeRangeOptions}
          onChange={onTimeRangeChange}
          ariaLabel="Time range"
        />
      </div>
      <div
        className="flex w-full gap-4 rounded-[16px] bg-offset p-2"
        data-name="Group"
        data-node-id="29:15178"
      >
        {/* First card: Net flow + sparkline + total */}
        <div
          className="flex min-w-0 flex-1 flex-col items-stretch justify-between gap-0 overflow-hidden rounded-[12px] border-b border-neutral-50 bg-surface p-3"
          data-name="Card-layout"
          data-node-id="29:15220"
        >
          <div className="flex flex-col gap-8">
            <p className="font-label-medium-emphasized text-[14px] leading-5 tracking-[-0.15px] text-default">
              Net flow
            </p>
            <div className="relative h-11 w-full min-h-[44px]" data-name="Spark line chart container" data-node-id="29:15267">
              <StaticSparkline />
            </div>
          </div>
          <div className="flex w-full items-center pt-0" data-name="Bottom" data-node-id="29:15275">
            <LabelTooltip
              label="Net flow amount"
              tooltipId="financial-snapshot-net-flow-tooltip"
              placement="top"
            >
              <p className="text-[20px] font-normal leading-6 tracking-[-0.2px] text-default tabular-nums">
                {netFlow}
              </p>
            </LabelTooltip>
          </div>
        </div>
        {/* Second card: Money in / Money out */}
        <div
          className="flex min-w-0 flex-1 flex-col gap-10 rounded-[12px] border-b border-neutral-50 bg-surface p-3"
          data-name="Card-layout"
          data-node-id="29:15200"
        >
          <div className="flex flex-col gap-4">
            <div className="flex w-full items-center justify-between gap-2">
              <p className="font-label-medium-emphasized text-[14px] leading-5 tracking-[-0.15px] text-default">
                Money in
              </p>
              <p className="shrink-0 font-label-medium-emphasized text-[14px] leading-5 tracking-[-0.15px] text-default tabular-nums">
                {moneyIn}
              </p>
            </div>
            <ProgressBar value={inNum} max={totalSum} />
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex w-full items-center justify-between gap-2">
              <p className="font-label-medium-emphasized text-[14px] leading-5 tracking-[-0.15px] text-default">
                Money out
              </p>
              <p className="shrink-0 font-label-medium-emphasized text-[14px] leading-5 tracking-[-0.15px] text-default tabular-nums">
                {moneyOut}
              </p>
            </div>
            <ProgressBar value={outNum} max={totalSum} />
          </div>
        </div>
      </div>
    </div>
  )
}
