/**
 * Shell — App layout: global header + left nav + main content.
 * On /components (component inventory), hides header and nav so the page has its own full-width layout.
 */

import { useLocation } from 'react-router-dom'
import { GlobalSearchBar, GlobalHeaderActions } from './GlobalHeader'
import Sidebar from './Sidebar'

export default function Shell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation()
  const isComponentInventory = pathname === '/components'

  if (isComponentInventory) {
    return (
      <div
        className="relative h-screen w-full overflow-hidden rounded-[20px] bg-surface"
        data-name="Shell"
      >
        <main
          className="absolute inset-0 bg-surface"
          data-name="Main"
          aria-label="Main content"
        >
          {children}
        </main>
      </div>
    )
  }

  return (
    <div
      className="relative flex h-screen w-full overflow-hidden rounded-[20px] bg-surface"
      data-name="Shell"
    >
      <Sidebar />
      <main
        className="flex min-w-0 flex-1 flex-col overflow-hidden bg-surface"
        data-name="Main"
        aria-label="Main content"
      >
        <div className="flex shrink-0 items-center border-b border-neutral-100 bg-white/85 backdrop-blur-md px-6 py-3">
          <GlobalSearchBar />
          <GlobalHeaderActions />
        </div>
        <div className="min-h-0 flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
