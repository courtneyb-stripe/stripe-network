/**
 * Component inventory — Registry-driven page with TOC sidebar and filters.
 * Route: /components
 */

import { useState, useMemo, useEffect, useRef, useCallback, Fragment } from 'react'
import {
  COMPONENT_REGISTRY,
  COMPOSITION_REGISTRY,
  RESOURCES_REGISTRY,
  groupRegistryByStatus,
  componentSlug,
  type ComponentEntry,
  type ComponentStatus,
  type ComponentSource,
} from '../data/componentRegistry'
import { ViewChip } from '../components/NetworkFilterGroup'
import SectionHeader from '../components/SectionHeader'
import { PillBadge, RestrictedIcon } from '../components/PillBadge'
import { ActionButton } from '../components/ActionButton'
import { IconButton } from '../components/IconButton'
import { PageActionButton } from '../components/PageActionButton'
import TabBar from '../components/TabBar'
import SubscriptionCard from '../components/SubscriptionCard'
import MetricCard from '../components/metrics/MetricCard'
import StaticSparkline from '../components/metrics/StaticSparkline'
import BalancesCard from '../components/BalancesCard'
import MiniBarSparkline from '../components/metrics/MiniBarSparkline'
import { ConvertIcon } from '../icons/ConvertIcon'
import { GramIcon } from '../icons/GramIcon'
import { DailyPayoutIcon } from '../icons/DailyPayoutIcon'
import SearchBar from '../components/SearchBar'
import ItemsCountLink from '../components/ItemsCountLink'
import TableSkeleton from '../components/TableSkeleton'
import { Link } from '../components/Link'
import LabelTooltip from '../components/LabelTooltip'
import { DescriptionTooltipTrigger } from '../components/DescriptionTooltipTrigger'
import { PropertyList, PropertyListItem } from '../components/PropertyList'
import TransactionListCard from '../components/TransactionListCard'
import type { TransactionListRow } from '../components/TransactionListCard'
import { slugToDisplayName } from '../utils/string'
import { Icon } from '../icons/SailIcons'
import { PlusIcon } from '../icons/PlusIcon'
import InfoIcon from '../icons/InfoIcon'
import { List, ListItem } from '../components/List'
import MetricDropdown from '../components/metrics/MetricDropdown'
import { ActionRequiredDescriptionRow } from '../components/ActionRequiredDescriptionRow'
import FinancialSnapshot from '../components/FinancialSnapshot'
import FinancialAccountsSidebar from '../components/FinancialAccountsSidebar'
import { TIME_RANGE_OPTIONS, type TimeRange } from '../components/metrics/constants'
import { PaymentMethods, LoanDetails, Repayments } from '../components/sections'

// --- Constants ---
const STATUS_ORDER: ComponentStatus[] = ['ready', 'in_progress', 'placeholder']
const STATUS_LABELS: Record<ComponentStatus, string> = {
  ready: 'Ready',
  in_progress: 'In progress',
  placeholder: 'Not started',
}
const STATUS_DOT_COLORS: Record<ComponentStatus, string> = {
  ready: '#166534',     // forest green
  in_progress: '#EAB308', // golden rod
  placeholder: '#9CA3AF',
}
const BADGE_CLASS = 'rounded px-1.5 py-0.5 font-mono text-[11px] font-medium'
const SOURCE_LABELS: Record<ComponentSource, string> = {
  custom: 'Custom',
  sail: 'Sail',
  sail_riff: 'Sail-riff',
  borrowed: 'Borrowed',
}
const SOURCE_BADGE_STYLES: Record<ComponentSource, string> = {
  custom: 'bg-[#fce7f3] text-[#be185d]',       // barbie bubble gum pink
  sail: 'bg-[#ede9fe] text-[#5b21b6]',         // blurple
  sail_riff: 'bg-[#ccfbf1] text-[#0f766e]',    // teal
  borrowed: 'bg-[#ffedd5] text-[#c2410c]',    // orange
}
/** Badge text: for borrowed, show entry.borrowedSourceLabel (e.g. "List view") or "Borrowed"; otherwise SOURCE_LABELS. */
function getSourceBadgeLabel(entry: ComponentEntry): string {
  if (entry.source === 'borrowed') return entry.borrowedSourceLabel ?? 'Borrowed'
  return SOURCE_LABELS[entry.source]
}

// --- Transaction list demo data ---
const LATEST_ROWS: TransactionListRow[] = [
  { id: '1', transactionType: 'transfer', description: 'Payout to Bank •••• 7280', subline: 'Feb 21 • Completed', amount: '$1,240.00' },
  { id: '2', transactionType: 'card', description: 'Card payment · Coffee Co', subline: 'Feb 20 • Completed', amount: '$47.20' },
  { id: '3', transactionType: 'card', description: 'Subscription · Pro plan', subline: 'Feb 19 • Completed', amount: '$29.00' },
]
const UPCOMING_ROWS: TransactionListRow[] = [
  { id: 'u1', transactionType: 'transfer', description: 'Payout to Bank •••• 7280', subline: 'Mar 1 • Scheduled', amount: '$1,200.00' },
  { id: 'u2', transactionType: 'card', description: 'Subscription renewal · Pro plan', subline: 'Mar 3 • Scheduled', amount: '$29.00' },
]

function MetricDropdownDemo() {
  const [value, setValue] = useState<TimeRange>('Last 30 days')
  return (
    <MetricDropdown
      value={value}
      options={TIME_RANGE_OPTIONS}
      onChange={setValue}
      ariaLabel="Time range"
    />
  )
}

function FinancialSnapshotDemo() {
  const [timeRange, setTimeRange] = useState<TimeRange>('Last 30 days')
  return (
    <div className="max-w-xl">
      <FinancialSnapshot
        moneyIn="$12,450.00"
        moneyOut="$8,200.00"
        netFlow="$4,250.00"
        timeRangeValue={timeRange}
        timeRangeOptions={TIME_RANGE_OPTIONS}
        onTimeRangeChange={setTimeRange}
      />
    </div>
  )
}

export default function Components() {
  const [statusFilters, setStatusFilters] = useState<Record<ComponentStatus, boolean>>({
    ready: true,
    in_progress: true,
    placeholder: false,
  })
  const [sourceFilters, setSourceFilters] = useState<Record<ComponentSource, boolean>>({
    custom: true,
    sail: true,
    sail_riff: true,
    borrowed: true,
  })
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null)
  const [viewChipActive, setViewChipActive] = useState<string>('all')
  const [tabPrimary, setTabPrimary] = useState('overview')
  const [tabSecondary, setTabSecondary] = useState('payments')
  const [filtersOpen, setFiltersOpen] = useState(true)
  const [componentsOpen, setComponentsOpen] = useState(true)
  const [resourcesOpen, setResourcesOpen] = useState(false)
  const [compositionsOpen, setCompositionsOpen] = useState(true)
  const mainRef = useRef<HTMLDivElement>(null)

  const filteredComponents = useMemo(() => {
    return COMPONENT_REGISTRY.filter(
      (e) => statusFilters[e.status] && sourceFilters[e.source]
    )
  }, [statusFilters, sourceFilters])

  const filteredCompositions = useMemo(() => {
    return COMPOSITION_REGISTRY.filter(
      (e) => statusFilters[e.status] && sourceFilters[e.source]
    )
  }, [statusFilters, sourceFilters])

  const filteredResources = useMemo(() => {
    return RESOURCES_REGISTRY.filter(
      (e) => statusFilters[e.status] && sourceFilters[e.source]
    )
  }, [statusFilters, sourceFilters])

  const groupedForTOC = useMemo(() => groupRegistryByStatus(filteredComponents), [filteredComponents])

  useEffect(() => {
    const el = mainRef.current
    if (!el) return
    const sections = el.querySelectorAll('[data-component-section]')
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const id = entry.target.getAttribute('id')
          if (id) setActiveSectionId(id)
        }
      },
      { root: el, rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    )
    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [filteredComponents, filteredCompositions, filteredResources])

  const handleTocClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, slug: string) => {
    e.preventDefault()
    document.getElementById(slug)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const toggleStatus = (s: ComponentStatus) => setStatusFilters((f) => ({ ...f, [s]: !f[s] }))
  const toggleSource = (s: ComponentSource) => setSourceFilters((f) => ({ ...f, [s]: !f[s] }))

  return (
    <div className="flex h-full w-full" data-name="Components inventory">
      {/* Sidebar: 250px, sticky */}
      <aside
        className="w-[250px] shrink-0 flex flex-col border-r border-neutral-100 bg-[#F7F8FA]"
        style={{ minHeight: '100vh' }}
      >
        <div className="sticky top-0 flex flex-col max-h-screen">
          <div className="p-4 border-b border-neutral-100">
            <button
              type="button"
              onClick={() => setFiltersOpen((o) => !o)}
              className="flex w-full items-center justify-between gap-2 py-0 text-left font-label-medium-emphasized text-default text-[13px] uppercase tracking-wide hover:opacity-80"
              aria-expanded={filtersOpen}
            >
              Filters
              <svg className={`h-3.5 w-3.5 shrink-0 transition-transform ${filtersOpen ? '' : '-rotate-90'}`} viewBox="0 0 12 12" fill="none" aria-hidden>
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {filtersOpen && (
              <>
                <p className="font-semibold text-subdued text-[12px] py-1.5 mt-2 mb-1.5">Status</p>
                <div className="flex flex-col gap-1.5 mb-3">
                  {STATUS_ORDER.map((s) => (
                    <label key={s} className="flex items-center gap-2 cursor-pointer text-[13px] text-default">
                      <input
                        type="checkbox"
                        checked={statusFilters[s]}
                        onChange={() => toggleStatus(s)}
                        className="rounded border-neutral-300 accent-[#374151]"
                      />
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: STATUS_DOT_COLORS[s] }} aria-hidden />
                      {STATUS_LABELS[s]}
                    </label>
                  ))}
                </div>
                <p className="font-semibold text-subdued text-[12px] py-1.5 mb-1.5">Source</p>
                <div className="flex flex-col gap-1.5">
                  {(['custom', 'sail', 'sail_riff', 'borrowed'] as const).map((s) => (
                    <label key={s} className="flex items-center gap-2 cursor-pointer text-[13px] text-default">
                      <input
                        type="checkbox"
                        checked={sourceFilters[s]}
                        onChange={() => toggleSource(s)}
                        className="rounded border-neutral-300 accent-[#374151]"
                      />
                      {SOURCE_LABELS[s]}
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>
          <nav className="flex-1 overflow-auto p-3" aria-label="Table of contents">
            <button
              type="button"
              onClick={() => setComponentsOpen((o) => !o)}
              className="flex w-full items-center justify-between gap-2 py-1 mb-1 text-left font-label-medium-emphasized text-default text-[13px] uppercase tracking-wide hover:opacity-80"
              aria-expanded={componentsOpen}
            >
              Components
              <svg className={`h-3.5 w-3.5 shrink-0 transition-transform ${componentsOpen ? '' : '-rotate-90'}`} viewBox="0 0 12 12" fill="none" aria-hidden>
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {componentsOpen && (
              (filteredComponents.length === 0 && filteredCompositions.length === 0 && filteredResources.length === 0) ? (
                <p className="text-[13px] text-subdued pl-0 pb-2">No items match the selected filters.</p>
              ) : (
                <ul className="space-y-0.5 mb-2">
                  {STATUS_ORDER.map((status) => {
                    const list = groupedForTOC.get(status) ?? []
                    if (list.length === 0) return null
                    return (
                      <li key={status}>
                        <p className="flex items-center gap-2 font-semibold text-subdued text-[12px] py-1.5 mt-2 mb-1 first:mt-0">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: STATUS_DOT_COLORS[status] }} aria-hidden />
                          {STATUS_LABELS[status]}
                        </p>
                        <ul className="space-y-0.5">
                          {list.map((entry) => {
                            const slug = componentSlug(entry.name)
                            const isActive = activeSectionId === slug
                            return (
                              <li key={entry.name}>
                                <a
                                  href={`#${slug}`}
                                  onClick={(e) => handleTocClick(e, slug)}
                                  className={`flex items-center gap-2 py-1.5 px-2 rounded text-[13px] leading-tight ${
                                    isActive ? 'bg-neutral-100 text-default font-medium' : 'text-subdued hover:bg-neutral-50 hover:text-default'
                                  }`}
                                >
                                  <span className="min-w-0 truncate">{entry.name}</span>
                                  {entry.status !== 'placeholder' && (
                                    <span className={`shrink-0 ${BADGE_CLASS} ${SOURCE_BADGE_STYLES[entry.source]}`}>
                                      {getSourceBadgeLabel(entry)}
                                    </span>
                                  )}
                                </a>
                              </li>
                            )
                          })}
                        </ul>
                      </li>
                    )
                  })}
                </ul>
              )
            )}

            <button
              type="button"
              onClick={() => setCompositionsOpen((o) => !o)}
              className="flex w-full items-center justify-between gap-2 py-1 mb-1 text-left font-label-medium-emphasized text-default text-[13px] uppercase tracking-wide hover:opacity-80"
              aria-expanded={compositionsOpen}
            >
              Compositions
              <svg className={`h-3.5 w-3.5 shrink-0 transition-transform ${compositionsOpen ? '' : '-rotate-90'}`} viewBox="0 0 12 12" fill="none" aria-hidden>
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {compositionsOpen && filteredCompositions.length > 0 && (
              <ul className="space-y-0.5 mb-2">
                {filteredCompositions.map((entry) => {
                  const slug = `composition-${componentSlug(entry.name)}`
                  const isActive = activeSectionId === slug
                  return (
                    <li key={entry.name}>
                      <a
                        href={`#${slug}`}
                        onClick={(e) => handleTocClick(e, slug)}
                        className={`flex items-center gap-2 py-1.5 px-2 rounded text-[13px] leading-tight ${
                          isActive ? 'bg-neutral-100 text-default font-medium' : 'text-subdued hover:bg-neutral-50 hover:text-default'
                        }`}
                      >
                        <span className="min-w-0 truncate">{entry.name}</span>
                        {entry.status !== 'placeholder' && (
                          <span className={`shrink-0 ${BADGE_CLASS} ${SOURCE_BADGE_STYLES[entry.source]}`}>
                            {getSourceBadgeLabel(entry)}
                          </span>
                        )}
                      </a>
                    </li>
                  )
                })}
              </ul>
            )}

            <button
              type="button"
              onClick={() => setResourcesOpen((o) => !o)}
              className="flex w-full items-center justify-between gap-2 py-1 mb-1 text-left font-label-medium-emphasized text-default text-[13px] uppercase tracking-wide hover:opacity-80"
              aria-expanded={resourcesOpen}
            >
              <span className="flex items-center gap-1.5">
                Resources
                <LabelTooltip
                  label="Reference items (e.g. copy, patterns) useful for designers and for Cursor prompting. Resources are not included in the filter count."
                  tooltipId="resources-info-tooltip"
                  placement="right"
                  variant="light"
                >
                  <span
                    role="img"
                    aria-label="What are resources?"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.key === 'Enter' && e.stopPropagation()}
                    className="inline-flex shrink-0 rounded p-0.5 text-icon-subdued hover:text-default focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-action-primary"
                  >
                    <InfoIcon size={12} />
                  </span>
                </LabelTooltip>
              </span>
              <svg className={`h-3.5 w-3.5 shrink-0 transition-transform ${resourcesOpen ? '' : '-rotate-90'}`} viewBox="0 0 12 12" fill="none" aria-hidden>
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {resourcesOpen && filteredResources.length > 0 && (
              <ul className="space-y-0.5">
                {filteredResources.map((entry) => {
                  const slug = `resource-${componentSlug(entry.name)}`
                  const isActive = activeSectionId === slug
                  return (
                    <li key={entry.name}>
                      <a
                        href={`#${slug}`}
                        onClick={(e) => handleTocClick(e, slug)}
                        className={`flex items-center gap-2 py-1.5 px-2 rounded text-[13px] leading-tight ${
                          isActive ? 'bg-neutral-100 text-default font-medium' : 'text-subdued hover:bg-neutral-50 hover:text-default'
                        }`}
                      >
                        <span className="min-w-0 truncate">{entry.name}</span>
                        {entry.status !== 'placeholder' && (
                          <span className={`shrink-0 ${BADGE_CLASS} ${SOURCE_BADGE_STYLES[entry.source]}`}>
                            {getSourceBadgeLabel(entry)}
                          </span>
                        )}
                      </a>
                    </li>
                  )
                })}
              </ul>
            )}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main ref={mainRef} className="flex-1 overflow-auto min-w-0">
        <div className="px-10 py-8 max-w-4xl">
          <h1 className="font-heading-xlarge text-default mb-2">Component inventory</h1>
          <p className="font-body-medium text-subdued mb-8">
            Audit: what components exist, what state they’re in, what they look like. Filter in sidebar.
          </p>

          {(filteredComponents.length === 0 && filteredCompositions.length === 0 && filteredResources.length === 0) ? (
            <p className="text-default font-label-medium py-8">No items match the selected filters.</p>
          ) : (
            <>
              {filteredComponents.map((entry, index) => (
                <Fragment key={entry.name}>
                  {index > 0 && (
                    <div className="border-t border-neutral-50 mt-[120px] mb-[120px]" aria-hidden />
                  )}
                  <ComponentSection
                    entry={entry}
                    demoState={{
                      viewChipActive,
                      setViewChipActive,
                      tabPrimary,
                      setTabPrimary,
                      tabSecondary,
                      setTabSecondary,
                    }}
                  />
                </Fragment>
              ))}
              {filteredCompositions.length > 0 && (
                <>
                  <div className="border-t border-neutral-50 mt-[120px] mb-[120px]" aria-hidden />
                  <section className="pb-10" aria-labelledby="compositions-heading">
                    <h2 id="compositions-heading" className="font-heading-medium text-default text-[18px] mb-8">Compositions</h2>
                    {filteredCompositions.map((entry, index) => (
                      <Fragment key={entry.name}>
                        {index > 0 && (
                          <div className="border-t border-neutral-50 mt-[120px] mb-[120px]" aria-hidden />
                        )}
                        <CompositionSection entry={entry} />
                      </Fragment>
                    ))}
                  </section>
                </>
              )}
              {filteredResources.length > 0 && (
                <section className="mt-12" aria-labelledby="resources-heading">
                  <h2 id="resources-heading" className="font-heading-medium text-default text-[18px] mb-6">Resources</h2>
                  <div className="space-y-8">
                    {filteredResources.map((entry) => (
                      <ResourceRow key={entry.name} entry={entry} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}

type DemoState = {
  viewChipActive: string
  setViewChipActive: (v: string) => void
  tabPrimary: string
  setTabPrimary: (v: string) => void
  tabSecondary: string
  setTabSecondary: (v: string) => void
}

function ComponentSection({ entry, demoState }: { entry: ComponentEntry; demoState: DemoState }) {
  const slug = componentSlug(entry.name)
  const [copied, setCopied] = useState(false)
  const copyAnchorLink = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      const url = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}#${slug}` : `#${slug}`
      navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    },
    [slug]
  )
  return (
    <section id={slug} data-component-section className="group pb-10 -ml-10 pt-16 scroll-mt-16">
      <div className="flex gap-[8px] items-center">
        <div className="w-10 shrink-0 flex justify-end">
          <span className="opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            <LabelTooltip
              label={copied ? 'Copied!' : 'Copy link to section'}
              tooltipId={`inv-copy-link-${slug}`}
              placement="right"
              open={copied ? true : undefined}
            >
              <button
                type="button"
                onClick={copyAnchorLink}
                className="flex h-8 w-8 min-h-8 min-w-8 shrink-0 items-center justify-center rounded-[8px] text-default hover:bg-offset transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-action-primary"
                aria-label="Copy link to section"
              >
                <Icon name="link" size={12} fill="var(--color-icon-default)" />
              </button>
            </LabelTooltip>
          </span>
        </div>
        <div className="min-w-0 flex-1 flex flex-wrap items-center gap-[8px] mb-1">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: STATUS_DOT_COLORS[entry.status] }}
            aria-hidden
          />
          <h2 className="font-heading-medium text-default text-[18px]">{entry.name}</h2>
          {entry.status !== 'placeholder' && (
            <span className={`shrink-0 ${BADGE_CLASS} ${SOURCE_BADGE_STYLES[entry.source]}`}>
              {getSourceBadgeLabel(entry)}
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-[8px]">
        <div className="w-10 shrink-0" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-sm text-subdued">{entry.description}</p>
          {entry.auditNote && (
            <p className="text-xs text-subdued">{entry.auditNote}</p>
          )}
          <div className="mt-10">
            <ComponentVariants name={entry.name} demoState={demoState} />
          </div>
        </div>
      </div>
    </section>
  )
}

function ResourceRow({ entry }: { entry: ComponentEntry }) {
  const slug = `resource-${componentSlug(entry.name)}`
  return (
    <div id={slug} data-component-section className="flex flex-wrap items-baseline gap-2">
      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: STATUS_DOT_COLORS[entry.status] }} aria-hidden />
      <span className="font-label-medium text-default text-[16px]">{entry.name}</span>
      {entry.status !== 'placeholder' && (
        <span className={`shrink-0 ${BADGE_CLASS} ${SOURCE_BADGE_STYLES[entry.source]}`}>
          {getSourceBadgeLabel(entry)}
        </span>
      )}
      <span className="text-sm text-subdued">{entry.description}</span>
    </div>
  )
}

function CompositionSection({ entry }: { entry: ComponentEntry }) {
  const slug = `composition-${componentSlug(entry.name)}`
  const [copied, setCopied] = useState(false)
  const copyAnchorLink = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      const url = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}#${slug}` : `#${slug}`
      navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    },
    [slug]
  )
  return (
    <section id={slug} data-component-section className="group pb-10 -ml-10 pt-16 scroll-mt-16">
      <div className="flex gap-[8px] items-center">
        <div className="w-10 shrink-0 flex justify-end">
          <span className="opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            <LabelTooltip
              label={copied ? 'Copied!' : 'Copy link to section'}
              tooltipId={`inv-copy-comp-${slug}`}
              placement="right"
              open={copied ? true : undefined}
            >
              <button
                type="button"
                onClick={copyAnchorLink}
                className="flex h-8 w-8 min-h-8 min-w-8 shrink-0 items-center justify-center rounded-[8px] text-default hover:bg-offset transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-action-primary"
                aria-label="Copy link to section"
              >
                <Icon name="link" size={12} fill="var(--color-icon-default)" />
              </button>
            </LabelTooltip>
          </span>
        </div>
        <div className="min-w-0 flex-1 flex flex-wrap items-center gap-[8px] mb-1">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: STATUS_DOT_COLORS[entry.status] }}
            aria-hidden
          />
          <h2 className="font-heading-medium text-default text-[18px]">{entry.name}</h2>
          {entry.status !== 'placeholder' && (
            <span className={`shrink-0 ${BADGE_CLASS} ${SOURCE_BADGE_STYLES[entry.source]}`}>
              {getSourceBadgeLabel(entry)}
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-[8px]">
        <div className="w-10 shrink-0" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-sm text-subdued">{entry.description}</p>
          <div className="mt-10">
            {CompositionVariants(entry.name)}
          </div>
        </div>
      </div>
    </section>
  )
}

function CompositionVariants(name: string): React.ReactNode {
  switch (name) {
    case 'Transaction list':
      return (
        <div className="flex flex-wrap gap-6">
          <div className="w-full min-w-0 max-w-[380px]">
            <TransactionListCard variant="latest" title="Latest transactions" accountName="Toybox Labs" onViewAll={() => {}} onAdd={() => {}} onRowAction={() => {}} rows={LATEST_ROWS} />
          </div>
          <div className="w-full min-w-0 max-w-[380px]">
            <TransactionListCard variant="upcoming" title="Upcoming transactions" accountName="Toybox Labs" onViewAll={() => {}} onAdd={() => {}} onRowAction={() => {}} rows={UPCOMING_ROWS} />
          </div>
        </div>
      )
    case 'Actions required list':
      return (
        <div className="flex flex-col gap-2 max-w-md">
          <ActionRequiredDescriptionRow
            impactsBase="Payments, Payouts"
            mainTooltipLabel="Payments and Payouts are affected."
            tooltipId="comp-action-row-1"
            pastDueText="3 days past due"
          />
          <ActionRequiredDescriptionRow
            impactsBase="Payments"
            impactsMore=" +1 more"
            mainTooltipLabel="Payments"
            moreTooltipLabel="Payouts"
            tooltipId="comp-action-row-2"
            pastDueText="1 day past due"
          />
        </div>
      )
    default:
      return null
  }
}

function ComponentVariants({ name, demoState }: { name: string; demoState: DemoState }) {
  const { viewChipActive, setViewChipActive, tabPrimary, setTabPrimary, tabSecondary, setTabSecondary } = demoState
  switch (name) {
    case 'BalancesCard':
      return (
        <div className="flex max-w-2xl flex-col gap-4">
          <BalancesCard variant="default" iconName="balance" label="Payments balance" subtitle="3 currencies" value="$6,382.23" valueSubtitle="$7,600.00 in transit" footerLabel="Earnings settle daily" footerIcon={<DailyPayoutIcon size={12} />} onMore={() => {}} />
          <BalancesCard variant="amountRight" iconName="balance" label="Available" subtitle=" " value="$8,234.00" valueSubtitle="Available instantly $2,422.11" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <BalancesCard variant="amountRight" iconName="balance" label="Available" subtitle=" " value="$8,234.00" />
            <BalancesCard variant="amountRight" iconName="balance" label="Cash account balance" subtitle="Available" value="$2.00" />
          </div>
        </div>
      )
    case 'ViewChip':
      return (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {['all', 'restricted', 'enabled'].map((id) => (
              <ViewChip key={id} label={id === 'all' ? 'All' : id === 'restricted' ? 'Restricted' : 'Enabled'} count={id === 'all' ? 42 : id === 'restricted' ? 3 : 39} active={viewChipActive === id} onClick={() => setViewChipActive(id)} />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ViewChip label="All" count={42} active={viewChipActive === 'all'} onClick={() => setViewChipActive('all')} size="compact" />
          </div>
        </div>
      )
    case 'TabBar':
      return (
        <div className="flex flex-col gap-6">
          <TabBar tabs={[{ id: 'overview', label: 'Financial overview' }, { id: 'billing', label: 'Billing' }, { id: 'moneyMovement', label: 'Money management' }]} activeId={tabPrimary} onChange={setTabPrimary} variant="primary" gap={4} />
          <TabBar tabs={[{ id: 'payments', label: 'Payments' }, { id: 'payouts', label: 'Payouts' }, { id: 'collected-fees', label: 'Platform fees' }]} activeId={tabSecondary} onChange={setTabSecondary} variant="secondary" gap={6} />
        </div>
      )
    case 'SectionHeader':
      return (
        <div className="flex flex-col gap-4">
          <SectionHeader title="Recent transactions" onAction={() => {}} actionLabel="View all" />
          <SectionHeader title="Subscriptions" onAction={() => {}} onAdd={() => {}} actionLabel="View all" />
          <SectionHeader title="Recent Activity" size="small" />
        </div>
      )
    case 'SubscriptionCard':
      return (
        <div className="flex flex-col gap-4 max-w-[380px]">
          <SubscriptionCard
            planName="Basic plan"
            badges={[{ label: 'Active', variant: 'success' }, { label: 'Update scheduled', variant: 'attention' }]}
            invoiceFrequencyValue="Weekly on Tue"
            nextInvoiceValue="Sep 12 for $12.00"
            onMoreClick={() => {}}
          />
        </div>
      )
    case 'Badge':
      return (
        <div className="flex flex-wrap items-center gap-3">
          <PillBadge label="Success" variant="success" />
          <PillBadge label="Attention" variant="attention" />
          <PillBadge label="Critical" variant="critical" />
          <PillBadge label="Neutral" variant="neutral" />
          <PillBadge label="Restricted" variant="critical" icon={<RestrictedIcon />} />
        </div>
      )
    case 'PropertyList':
      return (
        <div className="flex flex-col gap-6 max-w-[400px]">
          <PropertyList>
            <PropertyListItem label="Object ID" value="cus_MIP4POO5wvyaly" />
            <PropertyListItem label="Customer" value={<Link href="#">Megan Smith</Link>} />
            <PropertyListItem label="Last update" value="Sep 28, 10:50 PM" />
          </PropertyList>
          <PropertyList orientation="horizontal">
            <PropertyListItem label="ID" value="acct_1T33YYE3TJsbfSRo" />
            <PropertyListItem label="Type" value="Express" />
          </PropertyList>
        </div>
      )
    case 'ActionButton':
      return (
        <div className="flex flex-wrap items-center gap-3">
          <ActionButton label="Move money" tooltipId="inv-action-move" variant="standard" showChevron>
            <ConvertIcon size={12} fill="var(--color-icon-default)" />
            Move money
          </ActionButton>
          <ActionButton label="Payouts are enabled." tooltipId="inv-action-payouts" variant="outline">
            <Icon name="checkCircleFilled" size={12} fill="#2B8700" />
            Payouts
          </ActionButton>
          <ActionButton label="Payouts paused" tooltipId="inv-action-payouts-paused" variant="standard" showChevron>
            <Icon name="cancelCircleFilled" size={12} fill="#E61947" />
            Payouts paused
          </ActionButton>
          <ActionButton label="Payouts are enabled for this account." tooltipId="inv-action-ghost" variant="ghost" labelDottedTooltip>
            <Icon name="checkCircleFilled" size={12} fill="#2B8700" />
            Payouts
          </ActionButton>
          <ActionButton label="More actions" tooltipId="inv-action-more" variant="iconOnly">
            <Icon name="more" size={12} fill="var(--color-icon-default)" />
          </ActionButton>
        </div>
      )
    case 'IconButton':
      return (
        <div className="flex flex-wrap items-center gap-3">
          <IconButton label="View all" tooltipId="inv-icon-viewall">
            <Icon name="identityVerification" size={12} fill="var(--color-icon-default)" />
          </IconButton>
          <IconButton label="Close" tooltipId="inv-icon-close">
            <svg width={12} height={12} viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" /></svg>
          </IconButton>
          <IconButton label="Add" tooltipId="inv-icon-add" variant="create">
            <PlusIcon size={12} fill="var(--color-action-primary)" />
          </IconButton>
        </div>
      )
    case 'MetricCard':
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard variant="labelValueSparkline" label="Lifetime value" value="$9.88K" sparkline={<StaticSparkline />} />
          <MetricCard variant="labelValueSparkline" label="Lifetime value" value="$9.88K" />
        </div>
      )
    case 'DescriptionTooltip':
      return (
        <div className="flex flex-wrap items-center gap-6">
          <DescriptionTooltipTrigger tooltipLabel="Accounts that can receive payments and pay out to bank accounts." tooltipId="inv-desc-tooltip">
            Merchant
          </DescriptionTooltipTrigger>
        </div>
      )
    case 'List':
      return (
        <div className="flex flex-col gap-10 max-w-md">
          <div>
            <p className="text-sm text-subdued mb-2">Default (dividers)</p>
            <List aria-label="Demo list" onAction={() => {}}>
              <ListItem
                id="1"
                icon={<Icon name="payment" size={16} fill="var(--color-icon-subdued)" />}
                title="Payout to Bank •••• 7280"
                description="Feb 21 • Completed"
                trailingContent={<span className="font-label-medium text-default">$1,240.00</span>}
              />
              <ListItem
                id="2"
                icon={<Icon name="payment" size={16} fill="var(--color-icon-subdued)" />}
                title="Card payment · Coffee Co"
                description="Feb 20 • Completed"
                trailingContent={<span className="font-label-medium text-default">$47.20</span>}
              />
            </List>
          </div>
          <div>
            <p className="text-sm text-subdued mb-2">noDividers</p>
            <List aria-label="Demo list no dividers" variant="noDividers" onAction={() => {}}>
              <ListItem
                id="a"
                icon={<Icon name="identityVerification" size={16} fill="var(--color-icon-subdued)" />}
                title="Verify identity"
                description="Required for payouts"
                trailingContent={<PillBadge label="Due" variant="attention" />}
              />
            </List>
          </div>
        </div>
      )
    case 'ListItem':
      return (
        <div className="max-w-md">
          <List aria-label="ListItem demo" variant="noDividers">
            <ListItem
              id="a"
              icon={<Icon name="identityVerification" size={16} fill="var(--color-icon-subdued)" />}
              title="Verify identity"
              description="Required for payouts"
              trailingContent={<PillBadge label="Due" variant="attention" />}
            />
          </List>
        </div>
      )
    case 'MetricDropdown':
      return <MetricDropdownDemo />
    case 'ActionRequiredDescriptionRow':
      return (
        <div className="flex flex-col gap-2 max-w-md">
          <ActionRequiredDescriptionRow
            impactsBase="Payments, Payouts"
            mainTooltipLabel="Payments and Payouts are affected."
            tooltipId="inv-action-row-1"
            pastDueText="3 days past due"
          />
          <ActionRequiredDescriptionRow
            impactsBase="Payments"
            impactsMore=" +1 more"
            mainTooltipLabel="Payments"
            moreTooltipLabel="Payouts"
            tooltipId="inv-action-row-2"
            pastDueText="1 day past due"
          />
        </div>
      )
    case 'FinancialSnapshot':
      return <FinancialSnapshotDemo />
    case 'FinancialAccountsSidebar':
      return (
        <div className="flex flex-wrap gap-8">
          <div className="max-w-sm">
            <FinancialAccountsSidebar
              accountCards={[
                { accountName: 'Business checking', accountMask: '•••• 4521', amount: '$12,450.00' },
                { accountName: 'Savings', accountMask: '•••• 8789', amount: '$3,200.00' },
              ]}
            />
          </div>
          <div className="max-w-sm flex flex-col gap-2">
            <span className="font-label-small text-subdued">Multi-currency</span>
            <FinancialAccountsSidebar
              sections={[
                { label: 'Main', accounts: [{ currency: 'USD', accountMask: '•••• 4521', amount: '$12,450.00' }, { currency: 'EUR', accountMask: '•••• 0908', amount: '€2,100.00' }] },
                { label: 'Secondary', accounts: [{ currency: 'GBP', accountMask: '•••• 7280', amount: '£890.00' }] },
              ]}
            />
          </div>
        </div>
      )
    case 'PaymentMethods':
      return (
        <div className="max-w-md border border-neutral-50 rounded-[12px] p-4">
          <PaymentMethods />
        </div>
      )
    case 'LoanDetails':
      return (
        <div className="max-w-md border border-neutral-50 rounded-[12px] p-4">
          <LoanDetails />
        </div>
      )
    case 'Repayments':
      return (
        <div className="max-w-md border border-neutral-50 rounded-[12px] p-4">
          <Repayments />
        </div>
      )
    default:
      return null
  }
}
