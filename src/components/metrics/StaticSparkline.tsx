/**
 * Static sparkline for balance card (placeholder until real chart).
 * Dec 1 – Dec 31, single line.
 */

export default function StaticSparkline() {
  // Simple upward-trending path in 0–1 space, ~40px height
  const path = 'M0 32 L20 28 L40 26 L60 22 L80 18 L100 14 L120 10 L140 8 L160 6 L180 4 L200 2 L220 4 L240 8 L260 12 L280 10 L300 8'
  return (
    <div className="relative h-full min-h-10 w-full" aria-hidden>
      <svg
        viewBox="0 0 300 40"
        preserveAspectRatio="none"
        className="h-full w-full"
      >
        <path
          d={path}
          fill="none"
          stroke="var(--color-brand-25)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={path}
          fill="none"
          stroke="#9966FF"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}
