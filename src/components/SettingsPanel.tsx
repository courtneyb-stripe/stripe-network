/**
 * Settings panel — Left nav + right content. Used by SettingsModal (with backdrop) and SettingsPage (full page).
 */

import { useEffect, useState } from 'react'
import { IconButton } from './IconButton'
import type { AccountStatusKind } from './AccountDetailsSidebar'

function CloseIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  )
}

export const SETTINGS_NAV: { section: string; id: string; label: string }[] = [
  { section: 'Account', id: 'contact-information', label: 'Account profile' },
  { section: 'Account', id: 'business-details', label: 'Business representatives' },
  { section: 'Account', id: 'capabilities', label: 'Capabilities' },
  { section: 'Account', id: 'configurations', label: 'Configurations' },
  { section: 'Account', id: 'verifications', label: 'Verifications' },
  { section: 'Account', id: 'apps-and-extensions', label: 'Apps and extensions' },
  { section: 'Financial', id: 'payment-methods', label: 'Payment methods' },
  { section: 'Financial', id: 'payout-settings', label: 'Payout settings' },
  { section: 'Financial', id: 'balance-pay', label: 'Balance pay' },
  { section: 'Financial', id: 'financial-connections', label: 'Financial connections' },
]

const SECTION_ORDER = ['Account', 'Financial']

export type SettingsPanelProps = {
  /** When opening, select this nav item. */
  initialSectionId?: string
  accountStatus?: AccountStatusKind
  /** Account name shown above Settings heading when provided (e.g. full page). */
  accountName?: string
  /** Label for the close/back button (e.g. "Close" or "Back"). */
  closeLabel: string
  onClose: () => void
  /** When true, panel is full viewport (page); when false, rounded card (modal). */
  fullPage?: boolean
  /** When true, hide the panel's top bar (Settings title + close). Used when the page provides its own header. */
  hideHeader?: boolean
}

export default function SettingsPanel({
  initialSectionId,
  accountStatus,
  accountName,
  closeLabel,
  onClose,
  fullPage = false,
  hideHeader = false,
}: SettingsPanelProps) {
  const [activeId, setActiveId] = useState<string>('contact-information')

  useEffect(() => {
    if (initialSectionId && SETTINGS_NAV.some((n) => n.id === initialSectionId)) {
      setActiveId(initialSectionId)
    } else {
      setActiveId('contact-information')
    }
  }, [initialSectionId])

  const wrapperClass = fullPage
    ? 'flex h-full min-h-0 w-full flex-1 overflow-hidden bg-surface'
    : 'flex h-full min-h-0 w-full flex-1 overflow-hidden rounded-[16px] bg-surface shadow-[0px_50px_100px_0px_rgba(48,49,61,0.08),0px_15px_35px_0px_rgba(48,49,61,0.08),0px_5px_15px_0px_rgba(0,0,0,0.12)]'

  return (
    <div className={wrapperClass} data-name="settings-panel">
      {/* Close/Back floated 24px from top and right of screen */}
      {!hideHeader && (
        <div className="fixed z-10" style={{ top: 24, right: 24 }}>
          <IconButton
            label={closeLabel}
            tooltipId="settings-panel-close-tooltip"
            tooltipPlacement="bottom"
            onClick={onClose}
          >
            <CloseIcon size={12} />
          </IconButton>
        </div>
      )}
      <nav
        className="flex h-full w-[320px] shrink-0 flex-col border-r border-neutral-50 bg-surface pb-16 pt-5 pl-6 pr-6"
        aria-label="Settings"
      >
        <div className="flex flex-1 flex-col gap-4 overflow-auto">
          {SECTION_ORDER.map((sectionLabel) => (
            <div key={sectionLabel} className="flex flex-col items-start gap-1">
              <p className="font-label-small text-subdued leading-5">{sectionLabel}</p>
              <div className="flex w-full flex-col gap-0">
                {SETTINGS_NAV.filter((n) => n.section === sectionLabel).map((item) => {
                  const isActive = activeId === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveId(item.id)}
                      className={`flex h-[30px] w-full items-center gap-2 rounded-[length:var(--radius-action)] px-1 text-left transition-colors hover:bg-offset ${
                        isActive ? 'bg-offset' : ''
                      }`}
                    >
                      <div className="h-6 w-6 shrink-0 rounded-[5px] bg-neutral-100" aria-hidden />
                      <span
                        className={`min-w-0 flex-1 truncate font-label-medium tracking-[-0.15px] text-default ${
                          isActive ? 'font-label-medium-emphasized' : ''
                        }`}
                      >
                        {item.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {!hideHeader && (
          <div className="flex shrink-0 flex-col gap-0 px-6 pt-5">
            {accountName != null && accountName !== '' && (
              <span className="font-label-small-emphasized text-subdued whitespace-nowrap">
                {accountName}
              </span>
            )}
            <h1 className="min-w-0 w-fit whitespace-pre-wrap text-[18px] leading-[26px] font-semibold tracking-0 text-default m-0">Settings</h1>
          </div>
        )}
        <div className={`min-h-0 flex-1 overflow-auto px-6 pb-8 ${hideHeader ? 'pt-8' : 'pt-8'}`}>
          <p className="font-label-medium text-subdued">
            {SETTINGS_NAV.find((n) => n.id === activeId)?.label ?? activeId} — placeholder
          </p>
        </div>
      </div>
    </div>
  )
}
