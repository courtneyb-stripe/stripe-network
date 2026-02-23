/**
 * TableSkeleton — Loading skeleton for data tables.
 * Renders one header row (skeleton bars only) + N skeleton rows with checkbox column and configurable column widths.
 * Matches NetworkTable / AccountDetail Recent Activity table structure (52px row height).
 */

import { ROW_HEIGHT } from '../constants/table'

const DEFAULT_COLUMN_WIDTHS = [
  'w-[120px]',
  'w-[200px]',
  'w-[100px]',
  'min-w-0 flex-1 ml-[8px]',
]

type TableSkeletonProps = {
  rowCount?: number
  columnWidths?: string[]
  showCheckboxColumn?: boolean
}

export default function TableSkeleton({
  rowCount = 7,
  columnWidths = DEFAULT_COLUMN_WIDTHS,
  showCheckboxColumn = true,
}: TableSkeletonProps) {
  return (
    <div className="pt-5 flex w-full flex-col overflow-hidden" data-name="Table 2.0">
      {/* Skeleton header */}
      <div
        className="group flex w-full shrink-0 items-center overflow-hidden pr-6"
        data-name="Table Header"
        style={{ height: ROW_HEIGHT, minHeight: ROW_HEIGHT }}
      >
        {showCheckboxColumn && (
          <div
            className="flex shrink-0 items-center justify-center p-[7px] w-8 opacity-0 transition-opacity group-hover:opacity-100"
            aria-hidden
          >
            <div
              className="h-3.5 w-3.5 shrink-0 rounded-[length:var(--radius-xsmall)] border border-neutral-100 bg-surface"
              style={{ boxShadow: 'var(--shadow-button)' }}
            />
          </div>
        )}
        <div className="flex min-w-0 flex-1 items-center gap-6">
          {columnWidths.map((width, i) => (
            <div
              key={i}
              className={`flex min-w-0 shrink-0 items-center overflow-hidden ${width}`}
            >
              <div className="h-2.5 w-full max-w-full rounded-[3px] bg-neutral-50" aria-hidden />
            </div>
          ))}
        </div>
      </div>
      {/* Skeleton rows */}
      {Array.from({ length: rowCount }, (_, i) => (
        <div
          key={i}
          className={`group flex w-full shrink-0 items-center rounded-[length:var(--radius-action)] pr-2 transition-colors ${i % 2 === 0 ? 'bg-[#fafbfb]' : 'bg-surface'}`}
          data-name="Table Row 2.0"
          aria-busy
          style={{ height: ROW_HEIGHT }}
        >
          {showCheckboxColumn && (
            <div
              className="flex shrink-0 items-center justify-center p-[7px] w-8 opacity-0 transition-opacity group-hover:opacity-100"
              aria-hidden
            >
              <div className="h-3.5 w-3.5 shrink-0 rounded-[length:var(--radius-xsmall)] border border-neutral-100 bg-surface" />
            </div>
          )}
          <div className="flex min-w-0 flex-1 items-center gap-6">
            {columnWidths.map((width, j) => (
              <div
                key={j}
                className={`flex min-w-0 shrink-0 items-center overflow-hidden ${width}`}
              >
                <div className="h-2.5 w-full max-w-full rounded-[3px] bg-neutral-50" aria-hidden />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
