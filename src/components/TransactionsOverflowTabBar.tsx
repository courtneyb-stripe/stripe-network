/**
 * Primary tab row with overflow: tabs that do not fit move into a "More ▾" menu (8px chevron).
 */

import { useLayoutEffect, useRef, useState, useCallback } from 'react'
import ChevronDownIcon from '../icons/ChevronDownIcon'
import {
  TRANSACTIONS_PAGE_TABS,
  type TransactionsTabId,
} from '../data/transactionsPageTabs'

const TAB_GAP_PX = 16
const MORE_BUTTON_RESERVE_PX = 96
const TABLIST_MORE_GAP_PX = 8

type TabDef = (typeof TRANSACTIONS_PAGE_TABS)[number]

function countTabsThatFit(widths: number[], maxWidth: number): number {
  let used = 0
  let count = 0
  for (let i = 0; i < widths.length; i++) {
    const w = widths[i] ?? 0
    const gap = count > 0 ? TAB_GAP_PX : 0
    if (used + gap + w > maxWidth) break
    used += gap + w
    count++
  }
  return count
}

type TransactionsOverflowTabBarProps = {
  activeTab: TransactionsTabId
  onTabChange: (tabId: TransactionsTabId) => void
}

export default function TransactionsOverflowTabBar({
  activeTab,
  onTabChange,
}: TransactionsOverflowTabBarProps) {
  const tabs = TRANSACTIONS_PAGE_TABS
  const containerRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const moreBtnRef = useRef<HTMLButtonElement>(null)
  const [visibleCount, setVisibleCount] = useState<number>(tabs.length)
  const [menuOpen, setMenuOpen] = useState(false)

  const relayout = useCallback(() => {
    const container = containerRef.current
    const measureRow = measureRef.current
    if (!container || !measureRow) return
    const buttons = measureRow.querySelectorAll<HTMLButtonElement>('[data-tab-measure]')
    const widths = [...buttons].map((b) => b.offsetWidth)
    const cw = container.clientWidth
    if (cw <= 0) return

    let vc = countTabsThatFit(widths, cw)
    if (vc < tabs.length) {
      vc = countTabsThatFit(widths, cw - MORE_BUTTON_RESERVE_PX - TABLIST_MORE_GAP_PX)
    }
    setVisibleCount(Math.max(0, vc))
  }, [tabs.length])

  useLayoutEffect(() => {
    relayout()
    const id = requestAnimationFrame(() => relayout())
    const el = containerRef.current
    if (!el || typeof ResizeObserver === 'undefined') {
      return () => cancelAnimationFrame(id)
    }
    const ro = new ResizeObserver(() => relayout())
    ro.observe(el)
    return () => {
      cancelAnimationFrame(id)
      ro.disconnect()
    }
  }, [relayout])

  useLayoutEffect(() => {
    const onResize = () => relayout()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [relayout])

  useLayoutEffect(() => {
    if (!menuOpen) return
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node
      if (menuRef.current?.contains(t)) return
      if (moreBtnRef.current?.contains(t)) return
      setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [menuOpen])

  const visibleTabs = tabs.slice(0, visibleCount)
  const overflowTabs = tabs.slice(visibleCount)
  const showMore = overflowTabs.length > 0
  const activeInOverflow = overflowTabs.some((t) => t.id === activeTab)

  const renderTabButton = (tab: TabDef, isActive: boolean, opts: { measure?: boolean }) => (
    <button
      key={tab.id}
      type="button"
      role="tab"
      aria-selected={isActive}
      data-tab-measure={opts.measure ? '' : undefined}
      onClick={() => {
        onTabChange(tab.id)
        setMenuOpen(false)
      }}
      className="group relative flex h-fit shrink-0 cursor-pointer items-center pt-3 pb-3 font-label-medium-emphasized text-[14px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary"
      style={{
        color: isActive ? 'var(--color-default)' : 'var(--color-subdued)',
      }}
    >
      {isActive && (
        <span
          className="absolute bottom-0 left-0 right-0 h-0.5"
          style={{ backgroundColor: 'var(--color-default)' }}
          aria-hidden
        />
      )}
      <span className="block rounded-[var(--radius-action)] px-2 py-1 text-[14px] transition-colors group-hover:bg-offset">
        {tab.label}
      </span>
    </button>
  )

  return (
    <div className="flex w-full min-w-0 shrink-0 flex-col" data-name="Tabs">
      <div
        ref={measureRef}
        className="pointer-events-none fixed -left-[9999px] top-0 flex opacity-0"
        style={{ gap: TAB_GAP_PX }}
        aria-hidden
      >
        {tabs.map((tab) => renderTabButton(tab, false, { measure: true }))}
      </div>

      <div
        ref={containerRef}
        className="flex min-w-0 w-full items-end"
        style={{ gap: TABLIST_MORE_GAP_PX }}
      >
        <div
          role="tablist"
          className="flex min-w-0 flex-1 items-end overflow-hidden"
          style={{ gap: TAB_GAP_PX }}
        >
          {visibleTabs.map((tab) => renderTabButton(tab, tab.id === activeTab, {}))}
        </div>

        {showMore ? (
          <div className="relative shrink-0" ref={menuRef}>
            <button
              ref={moreBtnRef}
              type="button"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
              className={`relative flex shrink-0 items-center gap-1 rounded-[var(--radius-action)] px-2 py-1 pt-3 pb-3 font-label-medium-emphasized text-[14px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary ${
                activeInOverflow ? 'text-default' : 'text-subdued'
              } hover:bg-offset`}
            >
              {activeInOverflow ? (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: 'var(--color-default)' }}
                  aria-hidden
                />
              ) : null}
              <span className="relative">More</span>
              <ChevronDownIcon size={8} fill="var(--color-icon-default)" />
            </button>
            {menuOpen ? (
              <ul
                role="menu"
                className="absolute right-0 top-full z-20 mt-1 min-w-[220px] max-h-[min(400px,70vh)] overflow-auto rounded-[12px] border border-neutral-50 bg-surface py-1 shadow-[0px_4px_16px_rgba(48,49,61,0.12)]"
              >
                {overflowTabs.map((tab) => {
                  const isActive = tab.id === activeTab
                  return (
                    <li key={tab.id} role="none">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          onTabChange(tab.id)
                          setMenuOpen(false)
                        }}
                        className={`flex w-full px-3 py-2 text-left text-[14px] leading-5 transition-colors hover:bg-offset focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-inset ${
                          isActive ? 'font-semibold text-default' : 'font-label-medium text-subdued'
                        }`}
                      >
                        {tab.label}
                      </button>
                    </li>
                  )
                })}
              </ul>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="h-px w-full shrink-0 bg-neutral-50 -mt-px" aria-hidden />
    </div>
  )
}
