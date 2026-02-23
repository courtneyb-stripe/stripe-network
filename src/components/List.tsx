/**
 * List — Sail-style list container. Supports onAction for row click (e.g. open detail).
 * Use with ListItem; API aligned with Sail List for easy migration to @sail/ui.
 */

import React from 'react'
import { ListItem } from './ListItem'

const ListActionContext = React.createContext<((id: string | number) => void) | null>(null)

export function useListAction() {
  return React.useContext(ListActionContext)
}

type ListProps = {
  /** Called when a row is activated (click or Enter). Receives the row id. */
  onAction?: (id: string | number) => void
  /** Accessible label for the list. */
  'aria-label': string
  children: React.ReactNode
  className?: string
  /** Visual variant: default = dividers between rows; noDividers = no divider lines (e.g. actions-required sidebar/modal/dropdown). */
  variant?: 'default' | 'noDividers'
}

const listDividerClasses =
  '[&>li]:transition-[border-color] [&>li]:duration-150 [&>li+li]:border-t [&>li+li]:border-t-neutral-50 [&>li:hover]:border-t-transparent [&>li:hover+li]:border-t-transparent'

export function List({
  onAction,
  'aria-label': ariaLabel,
  children,
  className = '',
  variant = 'default',
}: ListProps) {
  const showDividers = variant === 'default'
  return (
    <ListActionContext.Provider value={onAction ?? null}>
      <ul
        className={`flex flex-col px-2 ${showDividers ? listDividerClasses : ''} ${className}`.trim()}
        aria-label={ariaLabel}
        role="list"
      >
        {children}
      </ul>
    </ListActionContext.Provider>
  )
}

export { ListItem } from './ListItem'
