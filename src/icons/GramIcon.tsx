/**
 * Financial accounts balance card icon (Icon.svg).
 * Blurple 14.4×14.4 rounded rect with white parallelogram glyph.
 */

export function GramIcon({
  size = 15,
}: {
  size?: number
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect width="14.4" height="14.4" x="0" y="0" rx="2" fill="var(--color-action-primary)" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.59961 10.9981L10.7996 9.47119V3.7981L3.59961 5.34285L3.59961 10.9981Z"
        fill="white"
      />
    </svg>
  )
}
