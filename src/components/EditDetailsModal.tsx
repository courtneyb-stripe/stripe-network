/**
 * Edit details — Full-screen modal (same style as Settings).
 * Used when editing a profile section from the drawer (Contact information, Business details).
 * Escape closes only this modal; drawer stays open.
 */

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { IconButton } from './IconButton'
import ModalBackdrop from './ModalBackdrop'
import type { ProfileEditSection } from './AccountDrawer'

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

const SECTION_LABELS: Record<ProfileEditSection, string> = {
  contact: 'Contact information',
  business: 'Business details',
}

type EditDetailsModalProps = {
  open: boolean
  onClose: () => void
  section: ProfileEditSection
}

export default function EditDetailsModal({ open, onClose, section }: EditDetailsModalProps) {
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
    <ModalBackdrop aria-label="Edit details" onClose={onClose}>
      <div
        className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[16px] bg-surface shadow-[0px_50px_100px_0px_rgba(48,49,61,0.08),0px_15px_35px_0px_rgba(48,49,61,0.08),0px_5px_15px_0px_rgba(0,0,0,0.12)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 w-full items-center justify-between gap-2 px-4 pt-4 pb-4">
          <div>
            <p className="text-[18px] leading-[26px] font-semibold tracking-[-0.15px] text-default">
              Edit details
            </p>
            <p className="font-label-medium text-subdued mt-0.5">{SECTION_LABELS[section]}</p>
          </div>
          <IconButton
            label="Close"
            tooltipId="edit-details-modal-close-tooltip"
            tooltipPlacement="bottom"
            onClick={onClose}
          >
            <CloseIcon size={12} />
          </IconButton>
        </div>
        <div className="min-h-0 flex-1 overflow-auto px-4 pb-4">
          <p className="font-label-medium text-subdued">Edit form — placeholder</p>
        </div>
      </div>
    </ModalBackdrop>
  )

  return createPortal(modal, document.body)
}
