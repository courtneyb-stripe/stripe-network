/**
 * Global header — Figma Stripe Network Cursor SRC, node 2:358 (baby/global-header)
 * Left: Search bar (desktop). Right: Help, Notifications, Settings, Create.
 */

import { Icon } from '../icons/SailIcons'

function KeyboardShortcut({ keyChar = '/' }: { keyChar?: string }) {
  return (
    <div
      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[length:var(--radius-xsmall)] bg-neutral-100"
      data-name="KeyboardShortcut"
    >
      <kbd className="font-mono text-xs font-bold leading-4 text-icon-subdued" style={{ fontFamily: 'Menlo, monospace' }}>
        {keyChar}
      </kbd>
    </div>
  )
}

function HeaderIconButton({
  'aria-label': ariaLabel,
  children,
  ...props
}: {
  'aria-label': string
  children: React.ReactNode
} & React.ComponentPropsWithoutRef<'button'>) {
  return (
    <button
      type="button"
      className="relative flex h-4 w-4 shrink-0 flex-col items-center justify-center rounded-[length:var(--radius-action)] transition-colors hover:bg-offset focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-default"
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </button>
  )
}

/** Global search bar — used at top of main content area (pushed over by left nav). */
export function GlobalSearchBar() {
  return (
    <div
      className="group flex h-9 min-w-[318px] max-w-[540px] flex-1 items-center rounded-[length:var(--radius-form)] bg-offset px-[length:var(--spacing-150)] py-[length:var(--spacing-small)]"
      data-name="Search.desktop"
    >
      <div className="flex w-full min-w-0 items-center gap-[length:var(--spacing-small)] overflow-hidden rounded-lg" data-name="Search field">
        <Icon name="search" size={16} fill="var(--color-icon-default)" className="shrink-0" />
        <span className="min-w-0 flex-1 font-label-medium text-subdued">Search</span>
      </div>
      <div className="ml-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" data-name="Secondary action">
        <KeyboardShortcut />
      </div>
    </div>
  )
}

/** Header actions (Help, Notifications, Settings, Create) — right-aligned to viewport edge. */
export function GlobalHeaderActions() {
  return (
    <div
      className="flex items-center justify-end shrink-0 ml-auto"
      data-name="[desktop +]"
      data-node-id="2:370"
    >
      <div className="flex items-center gap-[24px] shrink-0">
        <HeaderIconButton aria-label="Help" data-name="Help">
          <Icon name="help" size={16} fill="var(--color-icon-default)" />
        </HeaderIconButton>
        <HeaderIconButton aria-label="Notifications" data-name="Notifications">
          <Icon name="notifications" size={16} fill="var(--color-icon-default)" />
        </HeaderIconButton>
        <HeaderIconButton aria-label="Settings" data-name="Settings">
          <Icon name="settings" size={16} fill="var(--color-icon-default)" />
        </HeaderIconButton>
        <HeaderIconButton aria-label="Create">
          <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-icon-action bg-icon-action z-[2]">
            <Icon name="add" size={8} fill="var(--color-neutral-0)" />
          </div>
        </HeaderIconButton>
      </div>
    </div>
  )
}

export default function GlobalHeader() {
  return (
    <header
      className="flex w-full items-center justify-end bg-white/85 backdrop-blur-md pl-10 pr-10 py-3"
      data-name="baby/global-header"
      data-node-id="2:358"
    >
      <GlobalHeaderActions />
    </header>
  )
}
