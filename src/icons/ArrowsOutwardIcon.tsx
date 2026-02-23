/**
 * Expand / arrows outward icon — Figma NextIcon xsmall arrowsOutward.
 * Used for account section header to open the account drawer.
 */

export function ArrowsOutwardIcon({
  size = 12,
  fill = 'var(--color-icon-subdued)',
}: {
  size?: number
  fill?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.75 2.5C6.33579 2.5 6 2.16421 6 1.75C6 1.33579 6.33579 1 6.75 1H10.25C10.6642 1 11 1.33579 11 1.75V5.25C11 5.66421 10.6642 6 10.25 6C9.83579 6 9.5 5.66421 9.5 5.25V3.56066L3.56066 9.5H5.25C5.66421 9.5 6 9.83579 6 10.25C6 10.6642 5.66421 11 5.25 11H1.75C1.33579 11 1 10.6642 1 10.25V6.75C1 6.33579 1.33579 6 1.75 6C2.16421 6 2.5 6.33579 2.5 6.75V8.43934L8.43934 2.5H6.75Z"
        fill={fill}
      />
    </svg>
  )
}
