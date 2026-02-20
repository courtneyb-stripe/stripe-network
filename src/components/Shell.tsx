/**
 * Shell — App layout: Sidebar (240px) + Global header + main content area.
 * Renders children in the main content area.
 */

import GlobalHeader from './GlobalHeader'
import Sidebar from './Sidebar'

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative h-screen w-full overflow-hidden rounded-[20px] bg-surface"
      data-name="Shell"
    >
      <Sidebar />
      <div className="absolute left-[240px] right-0 top-0">
        <GlobalHeader />
      </div>
      <main
        className="absolute left-[240px] top-[52px] right-0 bottom-0 bg-surface"
        data-name="Main"
        aria-label="Main content"
      >
        {children}
      </main>
    </div>
  )
}
