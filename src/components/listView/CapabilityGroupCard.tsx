/**
 * Capability group summary card — Figma **6269:112640** (hub header row).
 */

import type { ReactNode } from 'react'
import {
  CAPABILITY_GROUP_CARD_BUTTON_CLASS,
  CAPABILITY_GROUP_CARD_ICON_WELL_CLASS,
  CAPABILITY_GROUP_CARD_SUBTITLE_CLASS,
  CAPABILITY_GROUP_CARD_TEXT_COL_CLASS,
  CAPABILITY_GROUP_CARD_TITLE_CLASS,
} from './capabilityGroupCardTokens'

export function CapabilityGroupCard({
  label,
  subtitle,
  statusIcon,
  accessibilityLabel,
  onClick,
}: {
  label: string
  subtitle?: string
  statusIcon?: ReactNode
  accessibilityLabel: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={accessibilityLabel}
      className={CAPABILITY_GROUP_CARD_BUTTON_CLASS}
      data-name="Hub capability card"
      data-node-id="6269:112640"
    >
      <div className={CAPABILITY_GROUP_CARD_TEXT_COL_CLASS}>
        <span className={CAPABILITY_GROUP_CARD_TITLE_CLASS}>{label}</span>
        {subtitle != null && subtitle !== '' ? (
          <span className={CAPABILITY_GROUP_CARD_SUBTITLE_CLASS}>{subtitle}</span>
        ) : null}
      </div>
      <div className={CAPABILITY_GROUP_CARD_ICON_WELL_CLASS}>{statusIcon ?? null}</div>
    </button>
  )
}
