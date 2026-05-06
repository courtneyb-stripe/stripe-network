/**
 * Activity (Financial snapshot) — Logs / Events footer: page range + purple-styled total and Workbench CTA (no destination yet).
 */

type ActivityLogsEventsPaginationProps = {
  pageStart: number
  pageEnd: number
  totalResults: number
  workbenchLabel: string
}

const accentInteractiveClass =
  'font-label-small text-action-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 rounded-[length:var(--radius-xsmall)] cursor-pointer border-0 bg-transparent p-0 text-left'

export default function ActivityLogsEventsPagination({
  pageStart,
  pageEnd,
  totalResults,
  workbenchLabel,
}: ActivityLogsEventsPaginationProps) {
  const totalFormatted = totalResults.toLocaleString('en-US')

  return (
    <div
      className="flex flex-col items-start gap-1 bg-surface py-2 pr-3"
      data-name="Pagination"
      data-variant="activity-workbench"
    >
      <p className="m-0 font-label-small text-subdued">
        {pageStart}–{pageEnd} of{' '}
        <span className="font-label-small text-action-primary tabular-nums">{totalFormatted}</span> results
      </p>
      <button type="button" className={accentInteractiveClass}>
        {workbenchLabel}
      </button>
    </div>
  )
}
