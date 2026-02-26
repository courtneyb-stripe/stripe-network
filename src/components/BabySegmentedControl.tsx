/**
 * Baby segmented control — Figma 2059:88785 (baby/segmented-control).
 * Nested control: offset bg, 2px padding, 8px radius; segments 24px tall, 12px semibold, selected = neutral-700 bg + white text.
 */

export type BabySegmentedControlOption<T extends string = string> = {
  id: T
  label: string
}

type BabySegmentedControlProps<T extends string = string> = {
  options: BabySegmentedControlOption<T>[]
  selectedId: T
  onChange: (id: T) => void
  /** Optional aria-label for the control group. */
  'aria-label'?: string
}

export default function BabySegmentedControl<T extends string = string>({
  options,
  selectedId,
  onChange,
  'aria-label': ariaLabel,
}: BabySegmentedControlProps<T>) {
  return (
    <div
      className="flex w-fit items-center gap-1 rounded-[8px] bg-offset p-[2px]"
      data-name="baby/segmented-control"
      data-node-id="2059:88785"
      role="group"
      aria-label={ariaLabel}
    >
      {options.map((opt) => {
        const isSelected = selectedId === opt.id
        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onChange(opt.id)}
            className={`flex h-[24px] min-h-[24px] items-center justify-center gap-1 rounded-[6px] px-2 py-1 font-label-small-emphasized transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-1 ${
              isSelected
                ? 'bg-neutral-700 text-neutral-0'
                : 'bg-transparent text-subdued hover:text-default'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
