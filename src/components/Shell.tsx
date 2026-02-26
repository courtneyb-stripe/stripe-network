/**
 * Shell — App layout: global header + left nav + main content.
 * On /components and /network/:id/settings, hides header and nav for full-width layout.
 */

import { useLocation } from 'react-router-dom'
import { GlobalSearchBar, GlobalHeaderActions } from './GlobalHeader'
import PrototypeFloatie from './PrototypeFloatie'
import Sidebar from './Sidebar'

const SETTINGS_PAGE_PATTERN = /^\/network\/[^/]+\/settings$/

export default function Shell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation()
  const isComponentInventory = pathname === '/components'
  const isSettingsPage = SETTINGS_PAGE_PATTERN.test(pathname)
  const hideNav = isComponentInventory || isSettingsPage

  if (hideNav) {
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
      <PrototypeFloatie />
      <main
        className="flex min-w-0 flex-1 flex-col overflow-hidden bg-surface"
        data-name="Main"
        aria-label="Main content"
      >
        <div className="flex shrink-0 items-center border-b-0 bg-white/85 backdrop-blur-md pl-6 pr-10 py-3">
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
