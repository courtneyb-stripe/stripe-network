/**
 * Small outline calendar for Gantt detail panel (no calendar asset in public/).
 */

export function CalendarOutlineIcon({
  size = 14,
  color = 'currentColor',
}: {
  size?: number
  color?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect
        x="1.25"
        y="2.75"
        width="11.5"
        height="9.5"
        rx="1.25"
        stroke={color}
        strokeWidth="1.25"
      />
      <path d="M1.25 5.75h11.5" stroke={color} strokeWidth="1.25" />
      <path
        d="M4.5 1.25v2.25M9.5 1.25v2.25"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  )
}
