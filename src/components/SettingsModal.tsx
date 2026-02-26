/**
 * Settings — Full-screen modal with contextual left nav (Figma 521-38424).
 * Renders SettingsPanel inside ModalBackdrop. Escape closes.
 */

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import ModalBackdrop from './ModalBackdrop'
import SettingsPanel from './SettingsPanel'
import type { AccountStatusKind } from './AccountDetailsSidebar'

type SettingsModalProps = {
  open: boolean
  onClose: () => void
  initialSectionId?: string
  accountStatus?: AccountStatusKind
}

export default function SettingsModal({ open, onClose, initialSectionId, accountStatus }: SettingsModalProps) {
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
      <div onClick={(e) => e.stopPropagation()} data-name="settings-modal">
        <SettingsPanel
          initialSectionId={initialSectionId}
          accountStatus={accountStatus}
          closeLabel="Close"
          onClose={onClose}
          fullPage={false}
        />
      </div>
    </ModalBackdrop>
  )

  return createPortal(modal, document.body)
}
