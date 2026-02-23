/**
 * PropertyList — Sail-style list wrapper for PropertyListItem. Use in sidebars and drawers.
 * Sidebar: orientation vertical (label above value). Drawer: orientation horizontal (label left, value right).
 */

import { PropertyListContextProvider, type PropertyListOrientation } from './PropertyListContext'

type PropertyListProps = {
  children: React.ReactNode
  /** Vertical = label above value (sidebars). Horizontal = label left, value right (drawers). Default: vertical. */
  orientation?: PropertyListOrientation
  className?: string
}

export type { PropertyListOrientation } from './PropertyListContext'

export function PropertyList({ children, orientation = 'vertical', className = '' }: PropertyListProps) {
  return (
    <PropertyListContextProvider value={orientation}>
      <div className={`flex flex-col gap-3 w-full min-w-0 ${className}`.trim()} data-name="PropertyList">
        {children}
      </div>
    </PropertyListContextProvider>
  )
}

export { PropertyListItem } from './PropertyListItem'
