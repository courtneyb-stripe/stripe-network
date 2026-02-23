/**
 * ModalBackdrop — Shared overlay wrapper for full-screen modals (Settings, Edit details).
 * Renders a fixed overlay; click on backdrop calls onClose. Children (modal panel) should
 * use onClick={(e) => e.stopPropagation()} on their root so clicking the panel doesn't close.
 */

type ModalBackdropProps = {
  /** Accessible label for the dialog. */
  'aria-label': string
  onClose: () => void
  children: React.ReactNode
}

export default function ModalBackdrop({ 'aria-label': ariaLabel, onClose, children }: ModalBackdropProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col p-4"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      style={{ backgroundColor: 'var(--color-overlay-backdrop)' }}
      onClick={onClose}
    >
      {children}
    </div>
  )
}
