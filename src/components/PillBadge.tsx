/**
 * PillBadge (Sail Badge) — Status pill, one size. Semantic variants; optional icon (e.g. restricted X).
 * Restricted = critical variant with RestrictedIcon.
 */

export type PillBadgeVariant = 'success' | 'attention' | 'critical' | 'neutral'

const VARIANT_STYLES: Record<
  PillBadgeVariant,
  { backgroundColor: string; color: string }
> = {
  success: {
    backgroundColor: 'var(--color-feedback-success-subdued)',
    color: 'var(--color-feedback-success-on)',
  },
  attention: {
    backgroundColor: 'var(--color-feedback-attention-subdued)',
    color: 'var(--color-feedback-attention-on)',
  },
  critical: {
    backgroundColor: 'var(--color-feedback-critical-subdued)',
    color: 'var(--color-feedback-critical-on)',
  },
  neutral: {
    backgroundColor: 'var(--color-offset)',
    color: 'var(--color-subdued)',
  },
}

/** Restricted (negative) badge icon — X in critical circle. Use with variant="critical". */
export function RestrictedIcon() {
  return (
    <span className="shrink-0 inline-flex" aria-hidden>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="6" cy="6" r="6" fill="var(--color-feedback-critical-on)" />
        <path
          d="M4 4l4 4M8 4l-4 4"
          stroke="white"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
      </svg>
    </span>
  )
}

type PillBadgeProps = {
  label: string
  variant: PillBadgeVariant
  /** Optional icon (e.g. RestrictedIcon) rendered after label. */
  icon?: React.ReactNode
}

export function PillBadge({ label, variant, icon }: PillBadgeProps) {
  const style = VARIANT_STYLES[variant]
  return (
    <span
      className="inline-flex items-center gap-1 shrink-0 font-label-small rounded-[6px] px-[6px] py-1 text-xs"
      style={style}
    >
      {label}
      {icon}
    </span>
  )
}
