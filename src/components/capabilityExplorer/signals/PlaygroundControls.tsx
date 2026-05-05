type PlaygroundControlsProps = {
  merchantActive: boolean
  billingEnabled: boolean
  taxEnabled: boolean
  onBillingChange: (value: boolean) => void
  onTaxChange: (value: boolean) => void
  showClearAll: boolean
  onClearAll: () => void
}

export default function PlaygroundControls({
  merchantActive,
  billingEnabled,
  taxEnabled,
  onBillingChange,
  onTaxChange,
  showClearAll,
  onClearAll,
}: PlaygroundControlsProps) {
  return (
    <div
      className="flex w-full min-w-0 flex-col gap-2 border-b border-neutral-100 pb-4"
      data-name="Playground controls"
    >
      <div className="flex w-full min-w-0 flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-label-small text-default">
          <label
            className={`inline-flex cursor-pointer items-center gap-2 ${!merchantActive ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <input
              type="checkbox"
              className="h-3.5 w-3.5 shrink-0 rounded border-neutral-300 accent-neutral-700"
              checked={billingEnabled}
              disabled={!merchantActive}
              onChange={(e) => onBillingChange(e.target.checked)}
            />
            <span>Uses Billing</span>
          </label>
          <label
            className={`inline-flex cursor-pointer items-center gap-2 ${!merchantActive ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <input
              type="checkbox"
              className="h-3.5 w-3.5 shrink-0 rounded border-neutral-300 accent-neutral-700"
              checked={taxEnabled}
              disabled={!merchantActive}
              onChange={(e) => onTaxChange(e.target.checked)}
            />
            <span>Uses Tax Reporting</span>
          </label>
        </div>
        {showClearAll && (
          <button
            type="button"
            className="shrink-0 rounded-form px-2 py-1 font-label-small text-subdued transition-colors hover:bg-offset hover:text-default focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-1"
            onClick={onClearAll}
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  )
}
