/**
 * Settings — Full-screen modal with contextual left nav (Figma 521-38424).
 * Left: section headings (Account, Financial) and nav items. Right: Settings header + content.
 * Escape closes only this modal; drawer stays open.
 */

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '../icons/SailIcons'
import { Accordion, AccordionItem } from './Accordion'
import { IconButton } from './IconButton'
import ModalBackdrop from './ModalBackdrop'
import { PageActionButton } from './PageActionButton'
import { PropertyListCapabilityItem } from './PropertyListCapabilityItem'
import {
  getActiveCapabilities,
  getPausedCapabilities,
  getPausedSoonCapabilities,
  getInactiveCapabilities,
} from '../data/capabilitiesList'
import type { AccountStatusKind } from './AccountDetailsSidebar'

function CloseIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M2 2l8 8M10 2L2 10"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** Red circle with white X — Paused. */
function PausedIcon() {
  return (
    <svg width={12} height={12} viewBox="0 0 12 12" fill="none" aria-hidden>
      <circle cx="6" cy="6" r="6" fill="var(--color-icon-feedback-critical)" />
      <path d="M4 4l4 4M8 4l-4 4" stroke="white" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  )
}

/** Orange filled circle with minus — Paused soon (NextIcon negativeCircleFilled). */
function PausedSoonIcon() {
  return (
    <svg width={12} height={12} viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 0C9.31371 0 12 2.68629 12 6C12 9.31371 9.31371 12 6 12C2.68629 12 0 9.31371 0 6C0 2.68629 2.68629 0 6 0ZM3.65625 5.34375C3.29381 5.34375 3 5.63756 3 6C3 6.36244 3.29381 6.65625 3.65625 6.65625L8.34375 6.65625C8.70619 6.65625 9 6.36244 9 6C9 5.63756 8.70619 5.34375 8.34375 5.34375L3.65625 5.34375Z"
        fill="#CC4B00"
      />
    </svg>
  )
}

/** Empty circle — Inactive (NextIcon circle). */
function InactiveIcon() {
  return (
    <svg width={12} height={12} viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 10.6875C8.58917 10.6875 10.6875 8.58917 10.6875 5.99999C10.6875 3.40964 8.59626 1.3125 6 1.3125C3.41083 1.3125 1.3125 3.41082 1.3125 5.99999C1.3125 8.58917 3.41083 10.6875 6 10.6875ZM6 12C9.31405 12 12 9.31404 12 5.99999C12 2.68595 9.32231 0 6 0C2.68595 0 0 2.68595 0 5.99999C0 9.31404 2.68595 12 6 12Z"
        fill="#D8DEE4"
      />
    </svg>
  )
}

const SETTINGS_NAV: { section: string; id: string; label: string }[] = [
  { section: 'Account', id: 'contact-information', label: 'Contact information' },
  { section: 'Account', id: 'business-details', label: 'Business details' },
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

/** Info icon (circle with i) for status tooltips. */
const CAPABILITY_STATUS_TOOLTIPS: Record<string, string> = {
  Active: 'Capabilities that are currently enabled and in use.',
  Paused: 'Capabilities that are temporarily disabled.',
  'Paused soon': 'Capabilities that will be paused soon unless you take action.',
  Inactive: 'Capabilities that are not yet enabled. Request to add them for this account.',
}

type SettingsModalProps = {
  open: boolean
  onClose: () => void
  /** When opening, select this nav item (e.g. from profile drawer Edit → Contact information / Business details). */
  initialSectionId?: string
  /** Account status so Capabilities section shows correct active/paused/paused_soon/inactive. */
  accountStatus?: AccountStatusKind
}

export default function SettingsModal({ open, onClose, initialSectionId, accountStatus }: SettingsModalProps) {
  const [activeId, setActiveId] = useState<string>('contact-information')

  useEffect(() => {
    if (!open) return
    if (initialSectionId && SETTINGS_NAV.some((n) => n.id === initialSectionId)) {
      setActiveId(initialSectionId)
    } else {
      setActiveId('contact-information')
    }
  }, [open, initialSectionId])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        e.stopImmediatePropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [open, onClose])

  if (!open) return null

  const modal = (
    <ModalBackdrop aria-label="Settings" onClose={onClose}>
      <div
        className="flex h-full min-h-0 w-full flex-1 overflow-hidden rounded-[16px] bg-surface shadow-[0px_50px_100px_0px_rgba(48,49,61,0.08),0px_15px_35px_0px_rgba(48,49,61,0.08),0px_5px_15px_0px_rgba(0,0,0,0.12)]"
        onClick={(e) => e.stopPropagation()}
        data-name="settings-modal"
      >
        {/* Left nav — 240px, border-r, sections + items */}
        <nav
          className="flex h-full w-[240px] shrink-0 flex-col border-r border-neutral-50 bg-surface pb-16 pt-5 pl-6 pr-6"
          aria-label="Settings"
        >
          <div className="flex flex-1 flex-col gap-4 overflow-auto">
            {SECTION_ORDER.map((sectionLabel) => (
              <div key={sectionLabel} className="flex flex-col items-start gap-1">
                <p className="font-label-small text-subdued leading-5">
                  {sectionLabel}
                </p>
                <div className="flex w-full flex-col gap-0">
                  {SETTINGS_NAV.filter((n) => n.section === sectionLabel).map(
                    (item) => {
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
                    }
                  )}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* Right content — header + main */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex shrink-0 items-center justify-between gap-2 px-6 pt-5">
            <h2 className="text-[16px] font-bold leading-6 tracking-[-0.31px] text-subdued">
              Settings
            </h2>
            <IconButton
              label="Close"
              tooltipId="settings-modal-close-tooltip"
              tooltipPlacement="bottom"
              onClick={onClose}
            >
              <CloseIcon size={12} />
            </IconButton>
          </div>
          <div className="min-h-0 flex-1 overflow-auto px-6 pb-8 pt-8">
            {/* Contextual content per section — Capabilities from Figma (Active / Paused / Paused soon) */}
            {activeId === 'capabilities' && (
              <Accordion>
                <AccordionItem
                  title="Active"
                  tooltipLabel={CAPABILITY_STATUS_TOOLTIPS.Active}
                  tooltipId="settings-cap-active-tooltip"
                  defaultExpanded
                >
                  <div className="flex flex-col gap-4">
                    {getActiveCapabilities(accountStatus).map((cap) => (
                      <PropertyListCapabilityItem
                        key={cap.id}
                        icon={
                          <Icon
                            name="checkCircleFilled"
                            size={12}
                            fill="var(--color-feedback-success-on)"
                          />
                        }
                        title={cap.title}
                        description={cap.description}
                        linkHref={cap.linkLabel ? '#' : undefined}
                        linkLabel={cap.linkLabel}
                        action={<PageActionButton>Remove</PageActionButton>}
                      />
                    ))}
                  </div>
                </AccordionItem>
                <AccordionItem
                  title="Paused"
                  tooltipLabel={CAPABILITY_STATUS_TOOLTIPS.Paused}
                  tooltipId="settings-cap-paused-tooltip"
                  defaultExpanded
                >
                  <div className="flex flex-col gap-4">
                    {getPausedCapabilities(accountStatus).map((cap) => (
                      <PropertyListCapabilityItem
                        key={cap.id}
                        icon={<PausedIcon />}
                        title={cap.title}
                        description={cap.description}
                        linkHref={cap.linkLabel ? '#' : undefined}
                        linkLabel={cap.linkLabel}
                        action={<PageActionButton>Remove</PageActionButton>}
                      />
                    ))}
                  </div>
                </AccordionItem>
                <AccordionItem
                  title="Paused soon"
                  tooltipLabel={CAPABILITY_STATUS_TOOLTIPS['Paused soon']}
                  tooltipId="settings-cap-paused-soon-tooltip"
                  defaultExpanded
                >
                  <div className="flex flex-col gap-4">
                    {getPausedSoonCapabilities(accountStatus).map((cap) => (
                      <PropertyListCapabilityItem
                        key={cap.id}
                        icon={<PausedSoonIcon />}
                        title={cap.title}
                        description={cap.description}
                        linkHref={cap.linkLabel ? '#' : undefined}
                        linkLabel={cap.linkLabel}
                        action={<PageActionButton>Remove</PageActionButton>}
                      />
                    ))}
                  </div>
                </AccordionItem>
                <AccordionItem
                  title="Inactive"
                  tooltipLabel={CAPABILITY_STATUS_TOOLTIPS.Inactive}
                  tooltipId="settings-cap-inactive-tooltip"
                  defaultExpanded
                >
                  <div className="flex flex-col gap-4">
                    {getInactiveCapabilities(accountStatus).map((cap) => (
                      <PropertyListCapabilityItem
                        key={cap.id}
                        icon={<InactiveIcon />}
                        title={cap.title}
                        description={cap.description}
                        linkHref={cap.linkLabel ? '#' : undefined}
                        linkLabel={cap.linkLabel}
                        action={<PageActionButton>Request</PageActionButton>}
                      />
                    ))}
                  </div>
                </AccordionItem>
              </Accordion>
            )}
            {activeId !== 'capabilities' && (
              <p className="font-label-medium text-subdued">
                {SETTINGS_NAV.find((n) => n.id === activeId)?.label ?? activeId} — placeholder
              </p>
            )}
          </div>
        </div>
      </div>
    </ModalBackdrop>
  )

  return createPortal(modal, document.body)
}
