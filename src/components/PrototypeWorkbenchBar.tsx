/**
 * Prototype workbench — floating “Configure” control (viewport-fixed, lower-left).
 * Opens the prototype configure modal (`PrototypeFloatie`).
 */

import { Icon } from '../icons/SailIcons'

type PrototypeWorkbenchBarProps = {
  onConfigureClick: () => void
}

export default function PrototypeWorkbenchBar({ onConfigureClick }: PrototypeWorkbenchBarProps) {
  return (
    <button
      type="button"
      onClick={onConfigureClick}
      className="fixed z-[100] inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-neutral-100 bg-surface px-3 text-left font-label-medium text-[14px] leading-5 tracking-[-0.15px] text-default shadow-[0_2px_8px_rgba(64,68,82,0.12),0_1px_2px_rgba(64,68,82,0.06)] outline-none transition-colors hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-action-primary"
      style={{
        left: 'max(1.25rem, calc(0.5rem + env(safe-area-inset-left, 0px)))',
        bottom: 'max(1.25rem, calc(0.5rem + env(safe-area-inset-bottom, 0px)))',
      }}
      data-name="ConfigurePrototype"
      data-node-id="66:18456"
    >
      <span
        className="flex size-6 shrink-0 items-center justify-center rounded-md"
        data-name="iconBox"
        aria-hidden
      >
        <Icon name="control" size={14} fill="var(--color-icon-default)" />
      </span>
      <span className="shrink-0">Configure</span>
    </button>
  )
}
