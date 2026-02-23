/**
 * TabBar — Shared tab list for section tabs (primary) and sub-tabs (secondary).
 * Renders tablist + underline divider. Use for Account detail sections, transaction tabs, page headers.
 */

export type TabBarVariant = 'primary' | 'secondary'

type TabBarProps = {
  tabs: readonly { id: string; label: string }[]
  activeId: string
  onChange: (id: string) => void
  variant?: TabBarVariant
  /** Gap between tabs (px). Default: 4 (16px) for primary, 6 (24px) for secondary. Use 12 for 12px. */
  gap?: 4 | 6 | 12 | 16
}

export default function TabBar({
  tabs,
  activeId,
  onChange,
  variant = 'primary',
  gap = variant === 'primary' ? 4 : 6,
}: TabBarProps) {
  const isPrimary = variant === 'primary'
  const gapPx = gap === 16 ? 16 : gap === 12 ? 12 : gap === 6 ? 24 : 16
  return (
    <div className="flex w-full shrink-0 flex-col" role="tablist">
      <div className="flex" style={{ gap: gapPx }}>
        {tabs.map((tab) => {
          const isActive = activeId === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={
                isPrimary
                  ? 'group relative h-fit shrink-0 cursor-pointer pt-3 pb-3 font-label-medium-emphasized text-[14px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary flex items-center'
                  : 'group relative h-fit shrink-0 cursor-pointer pt-2 pb-2 font-label-medium-emphasized transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-action-primary'
              }
              style={
                isPrimary
                  ? {
                      color: isActive ? 'var(--color-action-primary)' : 'var(--color-subdued)',
                    }
                  : {
                      color: isActive ? 'var(--color-default)' : 'var(--color-subdued)',
                    }
              }
            >
              {isActive && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{
                    backgroundColor: isPrimary ? 'var(--color-action-primary)' : 'currentColor',
                  }}
                  aria-hidden
                />
              )}
              <span
                className={
                  isPrimary
                    ? 'block rounded-[var(--radius-action)] px-2 py-1 text-[14px] transition-colors group-hover:bg-offset'
                    : 'block rounded-[length:var(--radius-action)] px-2 py-1 transition-colors group-hover:bg-offset'
                }
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
      {/* 1px neutral-50 bottom border; primary: overlaps 1px */}
      <div
        className={`h-px w-full shrink-0 bg-neutral-50 ${isPrimary ? '-mt-px' : ''}`}
        aria-hidden
      />
    </div>
  )
}
