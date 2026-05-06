/**
 * TableSkeleton — Loading skeleton for data tables.
 * N skeleton rows with optional checkbox column (52px row height).
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
  /** When set, rows are clickable and invoke this (e.g. open preview drawer). */
  onRowClick?: () => void
}

export default function TableSkeleton({
  rowCount = 7,
  columnWidths = DEFAULT_COLUMN_WIDTHS,
  showCheckboxColumn = true,
  onRowClick,
}: TableSkeletonProps) {
  const isClickable = onRowClick != null
  return (
    <div className="flex w-full flex-col overflow-hidden" data-name="Table 2.0">
      {Array.from({ length: rowCount }, (_, i) => {
        const RowWrapper = isClickable ? 'button' : 'div'
        return (
          <RowWrapper
            key={i}
            type={isClickable ? 'button' : undefined}
            onClick={isClickable ? onRowClick : undefined}
            onKeyDown={
              isClickable
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onRowClick?.()
                    }
                  }
                : undefined
            }
            className={`group flex w-full shrink-0 items-center rounded-[length:var(--radius-action)] pl-2 pr-2 bg-surface transition-colors ${isClickable ? 'cursor-pointer text-left hover:bg-offset focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary' : ''}`}
            data-name="Table Row 2.0"
            aria-busy={!isClickable}
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
                  <div className="h-3 w-full max-w-full rounded-[3px] bg-neutral-100" aria-hidden />
                </div>
              ))}
            </div>
          </RowWrapper>
        )
      })}
    </div>
  )
}
