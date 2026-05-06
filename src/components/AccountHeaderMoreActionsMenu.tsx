/**
 * Header “More actions” overflow menu — Figma `.action-menu-more` (node 252:142762).
 */

import { ExternalLinkIcon } from '../icons/ExternalLinkIcon'
import ChevronDownIcon from '../icons/ChevronDownIcon'

const MENU_SHADOW =
  'shadow-[0px_15px_35px_rgba(48,49,61,0.08),0px_5px_15px_rgba(0,0,0,0.12)]'

function MenuDivider() {
  return (
    <div className="h-px w-full shrink-0 bg-neutral-100" role="presentation" aria-hidden />
  )
}

function MenuGroupHeading({ label }: { label: string }) {
  return (
    <div className="px-2 py-1.5" role="presentation">
      <p className="m-0 text-[12px] font-semibold leading-5 text-default">{label}</p>
    </div>
  )
}

type RowProps = {
  label: string
  onSelect: () => void
  variant?: 'default' | 'critical'
  trailing?: 'external' | 'chevron'
}

function MenuRow({ label, onSelect, variant = 'default', trailing }: RowProps) {
  const colorClass =
    variant === 'critical' ? 'text-[color:var(--color-feedback-critical-on)]' : 'text-default'
  const horizontalPadding = trailing ? 'pl-2 pr-1' : 'px-2'
  return (
    <button
      type="button"
      role="menuitem"
      className={`flex h-8 w-full min-h-8 shrink-0 items-center gap-2 rounded ${horizontalPadding} text-left font-label-medium leading-5 tracking-[-0.15px] hover:bg-offset focus:bg-offset focus:outline-none ${colorClass}`}
      onMouseDown={(e) => {
        e.preventDefault()
        onSelect()
      }}
    >
      <span className="min-w-0 flex-1">{label}</span>
      {trailing === 'external' ? (
        <span className="flex h-8 shrink-0 items-center pr-1 text-icon-subdued" aria-hidden>
          <ExternalLinkIcon size={12} fill="var(--color-icon-default)" />
        </span>
      ) : trailing === 'chevron' ? (
        <span
          className="flex h-8 w-4 shrink-0 items-center justify-center text-icon-subdued"
          aria-hidden
        >
          <ChevronDownIcon
            size={8}
            fill="currentColor"
            className="shrink-0 rotate-[-90deg]"
          />
        </span>
      ) : null}
    </button>
  )
}

export type AccountHeaderMoreActionsMenuProps = {
  merchantName: string
  /** Called after any item is activated (prototype: menu closes via parent). */
  onClose: () => void
}

export default function AccountHeaderMoreActionsMenu({ merchantName, onClose }: AccountHeaderMoreActionsMenuProps) {
  const noopItem = () => {
    onClose()
  }

  return (
    <div
      className={`absolute end-0 top-full z-[200] mt-1 flex min-w-[272px] max-w-[min(100vw-2rem,320px)] flex-col gap-0 rounded-[12px] border border-neutral-100 bg-surface ${MENU_SHADOW}`}
      role="menu"
      data-name=".action-menu-more"
      data-node-id="252:142762"
    >
      <div className="flex flex-col gap-1 p-1">
        <MenuRow
          label={`View dashboard as ${merchantName}`}
          onSelect={noopItem}
          trailing="external"
        />
      </div>
      <MenuDivider />
      <div className="flex flex-col gap-1 p-1">
        <MenuGroupHeading label="Actions" />
        <MenuRow label="Add" onSelect={noopItem} trailing="chevron" />
        <MenuRow label="Adjust invoice balance" onSelect={noopItem} />
        <MenuRow label="Pause" onSelect={noopItem} variant="critical" trailing="chevron" />
        <MenuRow label="Reject account" onSelect={noopItem} variant="critical" />
        <MenuRow label="Transfer account owner" onSelect={noopItem} />
        {/* <MenuRow label="Remove account" onSelect={noopItem} variant="critical" /> */}
      </div>
      <MenuDivider />
      <div className="flex flex-col gap-1 p-1">
        <MenuGroupHeading label="Radar" />
        <MenuRow label="Add to allow list" onSelect={noopItem} />
        <MenuRow label="Add to block list" onSelect={noopItem} />
      </div>
    </div>
  )
}
