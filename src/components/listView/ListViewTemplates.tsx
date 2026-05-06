/**
 * List View shells — layout helpers for top-level list routes (`ListViewRoot`, …)
 * and **nested detail** routes under an account (object lists / hubs: invoices, financial accounts, …).
 *
 * Border tokens align with M1 Search Bar in SearchBar `listToolbar`.
 */

import type { ReactNode } from 'react'

/** 1px border token aligned with M1 Search Bar / filter controls ({@link SearchBar} `listToolbar`). */
export const LIST_VIEW_FIELD_BORDER_CLASS = 'border-neutral-50'

/** Bottom edge for the **table** column-label row (not page or M1 filter chrome). */
export const LIST_VIEW_TABLE_HEADER_ROW_CLASS =
  `border-b ${LIST_VIEW_FIELD_BORDER_CLASS}`.trim()

/** Outer frame: primary tabs + title row + M1 chip row + search toolbar (Figma 5756:275810). */
export function M1FilterGroupFrame({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`flex w-full flex-col gap-4 py-2 ${className}`.trim()}
      data-name="M1 Filter Group"
      data-node-id="5756:275810"
    >
      {children}
    </div>
  )
}

/** Root: parent / top-level list page — gap between list chrome and scrollable table body. */
export function ListViewRoot({
  children,
  className = '',
  dataName = 'ListView',
}: {
  children: ReactNode
  className?: string
  /** `data-name` for the page shell (e.g. NetworkList, TransactionsList). */
  dataName?: string
}) {
  return (
    <div
      className={`flex h-full w-full flex-col gap-[8px] ${className}`.trim()}
      data-name={dataName}
    >
      {children}
    </div>
  )
}

/** Parent list: page title + primary tabs + M1 filter toolbar (no page-level bottom rule). */
export function ListViewHeaderStack({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex shrink-0 w-full min-w-0 flex-col gap-0 ${className}`.trim()}>
      {children}
    </div>
  )
}

export function ListViewBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`min-h-0 flex-1 overflow-auto ${className}`.trim()}>{children}</div>
}

/**
 * Nested detail shell — account-scoped list or hub (`px-6`, full column).
 * Use with {@link NestedDetailViewHeaderStack} + {@link NestedPageHeader} + {@link NestedObjectListFilterGroup}.
 */
export function NestedDetailViewRoot({
  children,
  className = '',
  dataName = 'NestedDetailView',
}: {
  children: ReactNode
  className?: string
  /** Page-specific `data-name` (defaults to NestedDetailView). */
  dataName?: string
}) {
  return (
    <div
      className={`flex h-full w-full min-w-0 flex-col px-6 ${className}`.trim()}
      data-name={dataName}
    >
      {children}
    </div>
  )
}

/** Nested detail: identity / breadcrumbs + M1 filter region (table header carries column divider). */
export function NestedDetailViewHeaderStack({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`shrink-0 w-full min-w-0 ${className}`.trim()}>
      {children}
    </div>
  )
}
