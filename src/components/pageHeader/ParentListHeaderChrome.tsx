/**
 * Composable shell for **parent list** headers — Network, Transactions.
 * Layout tokens: {@link pageHeaderTokens}. Visual reference: Figma **6269:112533**.
 */

import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { PAGE_HEADER_ACTIONS_ROW_GAP_CLASS, PARENT_LIST_PAGE_HEADER_SHELL_CLASS, PARENT_LIST_TITLE_ROW_CLASS, PARENT_LIST_TABS_REGION_CLASS } from './pageHeaderTokens'

export function ParentListHeaderChrome({ children }: { children: ReactNode }) {
  return (
    <div
      className={PARENT_LIST_PAGE_HEADER_SHELL_CLASS}
      data-name="Parent list header"
      data-node-id="6269:112533"
    >
      {children}
    </div>
  )
}

export function ParentListHeaderTitleRow({ children }: { children: ReactNode }) {
  return (
    <div className={PARENT_LIST_TITLE_ROW_CLASS} data-name="Header">
      {children}
    </div>
  )
}

export function ParentListHeaderActions({ children }: { children: ReactNode }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-end ${PAGE_HEADER_ACTIONS_ROW_GAP_CLASS}`}
      data-name="Buttons"
    >
      {children}
    </div>
  )
}

export function ParentListHeaderTabsRegion({ children }: { children: ReactNode }) {
  return (
    <div className={PARENT_LIST_TABS_REGION_CLASS} data-name="Tabs">
      {children}
    </div>
  )
}

/** Figma 6269 — offset pill, 32px tall, fully rounded (`rounded-[16px]`). */
export function ParentListHeaderIconPillButton({
  children,
  className = '',
  ...props
}: { children: ReactNode; className?: string } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`inline-flex h-8 shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full bg-offset px-2 text-default transition-colors hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-action-primary ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  )
}

/** Label + icon — same offset pill as {@link ParentListHeaderIconPillButton} (Figma 6269 Create row). */
export function ParentListHeaderCreateButton({
  children = 'Create',
  icon,
  ...props
}: {
  children?: ReactNode
  icon?: ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className="inline-flex h-8 shrink-0 items-center gap-1 overflow-hidden rounded-full bg-offset py-0 pl-2 pr-3 font-label-medium-emphasized text-default transition-colors hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-action-primary"
      {...props}
    >
      <span className="flex shrink-0 items-center p-0.5" aria-hidden>
        {icon}
      </span>
      {children}
    </button>
  )
}
