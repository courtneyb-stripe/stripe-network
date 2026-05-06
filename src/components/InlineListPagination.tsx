/**
 * InlineListPagination — Figma `.Pagination` (6214:39314): “1–10 of 2,776 results”.
 * The total count links to the full `/transactions` list when `to` is set (per Money movement chip — omitted for **All**).
 */

import { Link } from 'react-router-dom'

export type InlineListPaginationProps = {
  /** First row index on this page (1-based). */
  pageStart: number
  /** Last row index on this page (1-based), inclusive. */
  pageEnd: number
  totalResults: number
  /** Navigates to full list (e.g. `/transactions?...`). */
  to?: string
  linkState?: object
  /** When routing is not used (e.g. open modal); mutually exclusive with `to` in typical use. */
  onViewFullList?: () => void
  className?: string
}

function formatTotal(n: number): string {
  return n.toLocaleString('en-US')
}

export default function InlineListPagination({
  pageStart,
  pageEnd,
  totalResults,
  to,
  linkState,
  onViewFullList,
  className = '',
}: InlineListPaginationProps) {
  const totalFormatted = formatTotal(totalResults)
  const interactiveClass =
    'text-action-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 rounded-[length:var(--radius-xsmall)]'

  const totalControl =
    to != null ? (
      <Link to={to} state={linkState} className={interactiveClass}>
        {totalFormatted}
      </Link>
    ) : onViewFullList != null ? (
      <button type="button" onClick={onViewFullList} className={`${interactiveClass} bg-transparent border-0 cursor-pointer p-0 font-inherit text-left`}>
        {totalFormatted}
      </button>
    ) : (
      <span className="text-action-primary">{totalFormatted}</span>
    )

  return (
    <div
      className={`flex items-center bg-surface py-2 pr-3 ${className}`.trim()}
      data-name="Pagination"
      data-node-id="6214:39314"
    >
      <p className="m-0 font-label-small text-subdued">
        {pageStart}–{pageEnd} of {totalControl} results
      </p>
    </div>
  )
}
