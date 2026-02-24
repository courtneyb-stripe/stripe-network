/**
 * ThirdPartyActivityToggle — Single page-level control (not embedded per tab).
 * When Activity filter is "Universal toggle", this one toggle controls content across ALL account
 * detail tabs in one action; unlike View Chips which are embedded in each section (Overview, Billing, Products).
 * Charcoal toggle (off by default), label "Include third party activity", info icon with description tooltip.
 */

import LabelTooltip from './LabelTooltip'
import InfoIcon from '../icons/InfoIcon'
import { usePrototypeOptional } from '../context/PrototypeContext'

const TOOLTIP_LABEL =
  'When turned on, the user will see all merchant account customer\'s transactions and billing.'

/** Charcoal toggle — compact, flat track and thumb. */
function CharcoalToggle({
  checked,
  onChange,
  id,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  id: string
}) {
  return (
    <label
      htmlFor={id}
      className="relative inline-flex h-5 w-8 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-within:ring-2 focus-within:ring-action-primary focus-within:ring-offset-1"
      role="switch"
      aria-checked={checked}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span className="block h-5 w-8 rounded-full bg-neutral-100 transition-colors peer-checked:bg-[#1a1d21]" />
      <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-3" />
    </label>
  )
}

export default function ThirdPartyActivityToggle() {
  const prototype = usePrototypeOptional()
  if (prototype == null) return null

  const { activityFilter, includeThirdPartyActivity, setIncludeThirdPartyActivity } = prototype
  if (activityFilter !== 'universalToggle') return null

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[12px] leading-4 text-[var(--color-default)]">
        Include third party activity
      </span>
      <LabelTooltip
        label={TOOLTIP_LABEL}
        tooltipId="third-party-activity-info-tooltip"
        placement="top"
        variant="light"
        maxWidth={320}
      >
        <span className="flex shrink-0 cursor-default items-center justify-center text-[var(--color-icon-subdued)]" aria-hidden>
          <InfoIcon size={10} />
        </span>
      </LabelTooltip>
      <CharcoalToggle
        id="third-party-activity-toggle"
        checked={includeThirdPartyActivity}
        onChange={setIncludeThirdPartyActivity}
      />
    </div>
  )
}
