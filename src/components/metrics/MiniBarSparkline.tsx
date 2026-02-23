/**
 * Mini bar sparkline for balance card stacked row (Figma 24:12328–24:12335).
 * 7 bars: first 2 primary (purple), rest neutral-50.
 */

const BAR_COUNT = 7
const HEIGHTS = [34.872 / 40, 26.667 / 40, 1.026 / 40, 1.026 / 40, 1.026 / 40, 1.026 / 40, 1.026 / 40]

export default function MiniBarSparkline() {
  return (
    <div
      className="flex h-10 w-[148px] items-end gap-[2px]"
      aria-hidden
      data-node-id="24:12328"
    >
      {HEIGHTS.map((ratio, i) => (
        <div
          key={i}
          className="flex-1 min-w-0 rounded-t-[4px]"
          style={{
            height: `${ratio * 100}%`,
            backgroundColor:
              i < 2 ? 'var(--color-action-primary)' : 'var(--color-neutral-50)',
          }}
        />
      ))}
    </div>
  )
}
