/**
 * Global header — Figma Stripe Network Cursor SRC, node 2:358 (baby/global-header)
 * Left: Search bar (desktop). Right: App Dock, Help, Notifications, Settings, Create.
 */

import { Icon } from '../icons/SailIcons'

/* Figma asset URLs for App Dock (replace with local assets if needed after expiry) */
const APP_DOCK_LOGO_1 = 'https://www.figma.com/api/mcp/asset/66b613b2-2a45-4061-979a-73b8072d15a1'
const APP_DOCK_LOGO_2 = 'https://www.figma.com/api/mcp/asset/b3af7195-0f0a-4c39-a175-db7cff111dce'
const APP_DOCK_LOGO_3 = 'https://www.figma.com/api/mcp/asset/b6d48d39-eea8-418b-9f43-116be5079eb0'
const APP_DOCK_ADD_ICON = 'https://www.figma.com/api/mcp/asset/cfdbab8a-0a96-4fc6-9b18-3c5e7f64dab1'

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

function AppDock() {
  return (
    <div
      className="relative flex items-center gap-4 px-3 py-3 rounded-[length:var(--radius-rounded)] shrink-0"
      data-name="App Dock"
      data-node-id="2:105"
    >
      <div className="flex items-center gap-[16px] shrink-0" data-name="apps">
        <button
          type="button"
          className="relative flex h-4 w-4 shrink-0 items-center justify-center rounded-[length:var(--radius-xsmall)] transition-colors hover:bg-offset"
          aria-label="App 1"
        >
          <img src={APP_DOCK_LOGO_1} alt="" className="h-4 w-4 object-contain" />
        </button>
        <button
          type="button"
          className="relative flex h-4 w-4 shrink-0 items-center justify-center rounded-[length:var(--radius-xsmall)] bg-[#063667] transition-colors hover:bg-offset"
          aria-label="App 2"
        >
          <img src={APP_DOCK_LOGO_2} alt="" className="h-2.5 w-2.5 object-contain" />
        </button>
        <button
          type="button"
          className="relative flex h-4 w-4 shrink-0 items-center justify-center rounded-[length:var(--radius-xsmall)] transition-colors hover:bg-offset"
          aria-label="App 3"
        >
          <img src={APP_DOCK_LOGO_3} alt="" className="h-4 w-4 object-contain" />
        </button>
      </div>
      <button
        type="button"
        className="relative flex h-4 w-4 shrink-0 items-center justify-center rounded-[length:var(--radius-xsmall)] transition-colors hover:bg-offset"
        aria-label="Add app"
        data-name="addApp"
      >
        <img src={APP_DOCK_ADD_ICON} alt="" className="h-4 w-4 object-contain" />
      </button>
      <div
        className="pointer-events-none absolute inset-0 left-0 right-0 top-1/2 h-10 -translate-y-1/2 rounded-[length:var(--radius-rounded)] border border-neutral-50"
        data-name="Border"
        aria-hidden
      />
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

/** Header actions (App Dock + Help, Notifications, Settings, Create) — for use in main top bar, flush with viewport. */
export function GlobalHeaderActions() {
  return (
    <div
      className="flex items-center justify-end shrink-0 pr-2"
      data-name="[desktop +]"
      data-node-id="2:370"
    >
      <AppDock />
      <div className="w-[24px] shrink-0" aria-hidden />
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
