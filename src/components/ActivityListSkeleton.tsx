/**
 * ActivityListSkeleton — Figma Sections/Recent activity (6214:35515) “baby/list”.
 * List rows (not a data table): short label bar + full-width subline on the left, trailing bar on the right, dividers.
 */

type ActivityListSkeletonProps = {
  rowCount?: number
  /** When set, each row is a button that invokes this (e.g. open preview drawer). */
  onRowClick?: () => void
  /** Passed to the list for a11y. */
  'aria-label'?: string
}

function ActivityListSkeletonRowContent() {
  return (
    <>
      <div className="flex w-full min-w-0 items-start justify-between gap-3">
        <div className="flex min-w-0 w-[177px] shrink-0 flex-col items-start gap-1">
          <div className="flex w-full flex-col items-start py-0.5">
            <div
              className="h-3 w-[58px] max-w-full shrink-0 rounded-[3px] bg-neutral-100"
              aria-hidden
            />
          </div>
          <div className="flex w-full items-center">
            <div className="flex min-w-0 flex-1 flex-col items-start py-0.5">
              <div
                className="h-3 w-full max-w-full shrink-0 rounded-[3px] bg-neutral-100"
                aria-hidden
              />
            </div>
          </div>
        </div>
        <div className="flex w-[43px] shrink-0 flex-col items-end gap-0.5">
          <div className="flex w-full items-center justify-end">
            <div className="flex min-w-0 flex-1 flex-col items-end py-0.5">
              <div
                className="h-3 w-full shrink-0 rounded-[3px] bg-neutral-100"
                aria-hidden
              />
            </div>
          </div>
        </div>
      </div>
      <div
        className="h-px w-full shrink-0 border-t border-solid border-neutral-50"
        aria-hidden
      />
    </>
  )
}

export default function ActivityListSkeleton({
  rowCount = 6,
  onRowClick,
  'aria-label': ariaLabel = 'Activity',
}: ActivityListSkeletonProps) {
  const isClickable = onRowClick != null

  return (
    <ul
      className="m-0 flex w-full list-none flex-col p-0"
      data-name="baby/list"
      aria-label={ariaLabel}
    >
      {Array.from({ length: rowCount }, (_, i) => (
        <li
          key={i}
          className="flex w-full flex-col gap-2 bg-transparent px-2 pt-2"
          data-name=".baby/list-item"
        >
          {isClickable ? (
            <button
              type="button"
              onClick={onRowClick}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onRowClick()
                }
              }}
              className="flex w-full cursor-pointer flex-col gap-2 border-0 bg-transparent p-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2"
            >
              <ActivityListSkeletonRowContent />
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <ActivityListSkeletonRowContent />
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
