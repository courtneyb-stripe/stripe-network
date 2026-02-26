/**
 * ActiveFilterChip — Active filter pill per Figma 2082:23885 (M1 Filter Well).
 * Shows "Label | Value" with clear button; value uses action primary color.
 */

/** 16px circle with X — Figma cancelCircleFilled style (neutral bg, default icon). */
function CancelCircleIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="shrink-0"
    >
      <circle cx="8" cy="8" r="7" fill="var(--color-neutral-100)" />
      <path
        d="M6 6l4 4M10 6L6 10"
        stroke="var(--color-icon-default)"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  )
}

export type ActiveFilterChipProps = {
  /** Filter dimension label (e.g. "Account", "Status"). */
  label: string
  /** Selected value (e.g. account name). Shown in action primary. */
  value: string
  onClear: () => void
  /** Accessible label for the clear button. */
  clearAriaLabel?: string
}

export default function ActiveFilterChip({
  label,
  value,
  onClear,
  clearAriaLabel = 'Remove filter',
}: ActiveFilterChipProps) {
  return (
    <div
      className="flex h-[28px] shrink-0 items-center gap-2 overflow-clip rounded-[8px] border border-neutral-50 bg-surface px-2 py-1.5"
      data-name="Filter Chip"
      data-node-id="2082:23885"
    >
      <button
        type="button"
        onClick={onClear}
        aria-label={clearAriaLabel}
        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-colors hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-1"
      >
        <CancelCircleIcon size={16} />
      </button>
      <span className="shrink-0 font-label-small-emphasized text-subdued leading-4">{label}</span>
      <span
        className="h-2 w-px shrink-0 bg-neutral-100"
        aria-hidden
        role="presentation"
      />
      <span className="shrink-0 font-label-small-emphasized text-action-primary leading-4">
        {value}
      </span>
    </div>
  )
}
