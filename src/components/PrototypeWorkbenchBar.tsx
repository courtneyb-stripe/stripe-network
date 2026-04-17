/**
 * Prototype Workbench — bottom strip (Figma 66:18456). Control icon + "Configure" opens the prototype modal.
 */

import { Icon } from '../icons/SailIcons'

type PrototypeWorkbenchBarProps = {
  onConfigureClick: () => void
}

export default function PrototypeWorkbenchBar({ onConfigureClick }: PrototypeWorkbenchBarProps) {
  return (
    <div
      className="flex shrink-0 flex-col border-t border-neutral-50 bg-[#f4f5f7] px-5 pt-[9px] pb-[max(9px,calc(9px+env(safe-area-inset-bottom,0px)))]"
      data-name="Workbench"
      data-node-id="66:18456"
    >
      <div className="flex h-[30px] w-full items-center" data-name="Developer tools">
        <button
          type="button"
          onClick={onConfigureClick}
          className="inline-flex h-[30px] shrink-0 items-center gap-1 rounded-[6px] px-[8px] text-left text-default outline-none transition-colors hover:bg-[#E5EAF0] focus-visible:ring-2 focus-visible:ring-action-primary"
          data-name="ConfigurePrototype"
        >
          <span
            className="flex size-6 shrink-0 items-center justify-center rounded-[6px]"
            data-name="iconBox"
            aria-hidden
          >
            <Icon name="control" size={14} fill="var(--color-icon-default)" />
          </span>
          <span className="shrink-0 font-label-medium text-[14px] leading-5 tracking-[-0.15px] text-default">
            Configure
          </span>
        </button>
      </div>
    </div>
  )
}
