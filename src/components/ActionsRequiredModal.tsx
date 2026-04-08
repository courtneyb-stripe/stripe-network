/**
 * Needs Attention — Full-screen view (like Settings): left sidebar = actions list,
 * main content = selected issue detail (first issue by default). Segment: Actions required | Blocking issues (default: Actions required).
 * Filter by impacted capabilities: All, Impacts payments, Impacts payouts. Low-fi: skeletons throughout.
 */

import { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  filterActionsRequired,
  getImpactsDisplayParts,
  getImpactsTooltipLabel,
  getImpactsMoreTooltipLabel,
  type ImpactsFilter,
} from '../data/actionsRequired'
import { ActionRequiredDescriptionRow } from './ActionRequiredDescriptionRow'
import { List, ListItem } from './List'
import { RightArrowIcon } from './metrics/MetricCard'
import { IconButton } from './IconButton'
import BabySegmentedControl from './BabySegmentedControl'
import ChevronDownIcon from '../icons/ChevronDownIcon'
import { usePrototypeOptional } from '../context/PrototypeContext'
import type { ActionRequiredItem } from '../data/actionsRequired'

function CloseIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M2 2l8 8M10 2L2 10"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** Red circle with white X — same as paused Payouts/Payments (Icon/Feedback Critical). */
function RestrictedCircleIcon({ size = 16 }: { size?: number }) {
  return (
    <span className="shrink-0 inline-flex" aria-hidden>
      <svg width={size} height={size} viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="6" cy="6" r="6" fill="var(--color-icon-feedback-critical)" />
        <path
          d="M4 4l4 4M8 4l-4 4"
          stroke="white"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
      </svg>
    </span>
  )
}

function getDaysPastDue(due: Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(due)
  d.setHours(0, 0, 0, 0)
  const diff = today.getTime() - d.getTime()
  return Math.max(0, Math.floor(diff / (24 * 60 * 60 * 1000)))
}

export type ActionsRequiredFilter = 'all' | ImpactsFilter

type ActionsRequiredModalProps = {
  open: boolean
  onClose: () => void
  /** Account id for "View full details" link to /network/:accountId/actions/:actionId. */
  accountId?: string
  /** Account name shown above "Needs Attention" heading (match Settings panel). */
  accountName?: string
  /** When opening from Payouts dropdown use 'payouts'; from Payments dropdown use 'payments'; otherwise 'all'. */
  initialFilter?: ActionsRequiredFilter
  /** When opening from paused Payouts/Payments/Subscriptions buttons, pass 'actions' so segment selects Actions required. */
  initialSegment?: 'blocking' | 'actions'
  /** When opening from sidebar list item click, pass that action's id to show its detail. */
  initialSelectedActionId?: string
}

const SEGMENT_OPTIONS = [
  { id: 'actions' as const, label: 'Actions required' },
  { id: 'blocking' as const, label: 'Blocking issues' },
] as const
type SegmentId = (typeof SEGMENT_OPTIONS)[number]['id']

const IMPACTS_CHIPS: { id: ActionsRequiredFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'payments', label: 'Impacts payments' },
  { id: 'payouts', label: 'Impacts payouts' },
]

function NeedsAttentionListSkeleton({ selectedIndex = 0 }: { selectedIndex?: number }) {
  const skeletonGray = 'bg-neutral-100'
  return (
    <div className="flex flex-col gap-0" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className={`flex items-start gap-3 py-2 min-h-[44px] rounded-[8px] px-2 ${i === selectedIndex ? 'bg-offset' : ''}`}>
          <div className={`h-3 w-3 shrink-0 rounded-[3px] ${skeletonGray}`} />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className={`h-3 w-full max-w-[70%] rounded-[3px] ${skeletonGray}`} />
            <div className={`h-3 w-full max-w-[50%] rounded-[3px] ${skeletonGray}`} />
          </div>
        </div>
      ))}
    </div>
  )
}

function NeedsAttentionDetailSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-hidden>
      <div className="h-3 w-3/4 rounded-[3px] bg-neutral-100" />
      <div className="h-3 w-full max-w-md rounded-[3px] bg-neutral-100" />
      <div className="h-3 w-full max-w-sm rounded-[3px] bg-neutral-100" />
      <div className="mt-4 flex flex-col gap-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-3 w-full rounded-[3px] bg-neutral-100" />
        ))}
      </div>
    </div>
  )
}

function ActionDetailContent({ action, accountId }: { action: ActionRequiredItem; accountId?: string }) {
  const daysPastDue = getDaysPastDue(action.dueDate)
  const pastDueText = `${daysPastDue} days past due`
  const { base: impactsBase, more: impactsMore } = getImpactsDisplayParts(action)
  const mainTooltipLabel = getImpactsTooltipLabel(action)
  const moreTooltipLabel = getImpactsMoreTooltipLabel(action)

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-[18px] leading-[26px] font-semibold tracking-0 text-default m-0">
        {action.title}
      </h2>
      <ActionRequiredDescriptionRow
        impactsBase={impactsBase}
        impactsMore={impactsMore}
        mainTooltipLabel={mainTooltipLabel}
        moreTooltipLabel={impactsMore ? moreTooltipLabel : undefined}
        tooltipId={`needs-attn-detail-impacts-${action.id}`}
        pastDueText={pastDueText}
      />
      {accountId && (
        <a
          href={`/network/${accountId}/actions/${action.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-label-medium text-action-primary hover:underline"
        >
          View full details
        </a>
      )}
    </div>
  )
}

export default function ActionsRequiredModal({
  open,
  onClose,
  accountId,
  accountName,
  initialFilter = 'all',
  initialSegment,
  initialSelectedActionId,
}: ActionsRequiredModalProps) {
  const prototype = usePrototypeOptional()
  const isLowFidelity = prototype?.fidelity === 'low'

  const [segment, setSegment] = useState<SegmentId>('actions')
  const [impactsFilter, setImpactsFilter] = useState<ActionsRequiredFilter>(initialFilter)
  const [impactsDropdownOpen, setImpactsDropdownOpen] = useState(false)
  const impactsDropdownRef = useRef<HTMLDivElement>(null)
  /** Blocking issues: no filter (always "all"). Actions required: use impacts dropdown (All / Impacts payments / Impacts payouts). */
  const listFilter = segment === 'blocking' ? 'all' : impactsFilter
  const filteredList = filterActionsRequired(listFilter)
  /** Blocking: 2 items only; Actions required: full list. */
  const displayList = segment === 'blocking' ? filteredList.slice(0, 2) : filteredList
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null)

  const selectedAction = selectedActionId
    ? displayList.find((a) => a.id === selectedActionId) ?? displayList[0]
    : displayList[0]

  useEffect(() => {
    if (!open) return
    setImpactsFilter(initialFilter)
    setSegment(initialSegment ?? 'actions')
    setSelectedActionId(initialSelectedActionId ?? null)
  }, [open, initialFilter, initialSegment, initialSelectedActionId])

  useEffect(() => {
    if (!open) return
    if (displayList.length > 0) {
      if (selectedActionId === null || !displayList.some((a) => a.id === selectedActionId)) {
        setSelectedActionId(displayList[0].id)
      }
    } else {
      setSelectedActionId(null)
    }
  }, [open, displayList, selectedActionId])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        e.stopImmediatePropagation()
        if (impactsDropdownOpen) {
          setImpactsDropdownOpen(false)
        } else {
          onClose()
        }
      }
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [open, onClose, impactsDropdownOpen])

  useEffect(() => {
    if (!impactsDropdownOpen) return
    const handleMouseDown = (e: MouseEvent) => {
      if (impactsDropdownRef.current && !impactsDropdownRef.current.contains(e.target as Node)) {
        setImpactsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [impactsDropdownOpen])

  if (!open) return null

  const impactsFilterLabel = IMPACTS_CHIPS.find((c) => c.id === impactsFilter)?.label ?? 'All'

  const fullScreen = (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-surface"
      role="dialog"
      aria-modal="true"
      aria-label="Needs Attention"
    >
      {/* Close floated top-right (match Settings) */}
      <div className="fixed z-10" style={{ top: 24, right: 24 }}>
        <IconButton
          label="Close"
          tooltipId="needs-attn-close-tooltip"
          tooltipPlacement="bottom"
          onClick={onClose}
        >
          <CloseIcon size={12} />
        </IconButton>
      </div>

      <div className="flex min-h-0 flex-1 flex-row">
        {/* Left sidebar: segment control + filter chips + list (8px between segment area and list) */}
        <aside
          className="flex w-[320px] shrink-0 flex-col gap-2 border-r border-neutral-50 bg-surface overflow-hidden"
          aria-label="Needs attention list"
        >
          <div className="flex shrink-0 flex-col gap-3 p-4">
            <BabySegmentedControl
              options={SEGMENT_OPTIONS}
              selectedId={segment}
              onChange={(id) => {
                setSegment(id)
                if (id === 'blocking') setImpactsDropdownOpen(false)
              }}
              aria-label="Category"
            />
            {segment === 'actions' && (
              <div className="relative shrink-0" ref={impactsDropdownRef}>
                <button
                  type="button"
                  onClick={() => setImpactsDropdownOpen((o) => !o)}
                  className="flex h-8 min-h-8 shrink-0 items-center gap-2 overflow-clip rounded-[8px] border border-solid border-neutral-100 bg-surface px-2 py-1.5 text-left transition-colors hover:border-neutral-100 hover:bg-offset focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-action-primary"
                  aria-haspopup="listbox"
                  aria-expanded={impactsDropdownOpen}
                  aria-label="Filter by impact"
                >
                  <span className="shrink-0 truncate text-[14px] leading-5 tracking-[-0.15px] font-[500] text-subdued">
                    {impactsFilterLabel}
                  </span>
                  <ChevronDownIcon size={8} fill="var(--color-icon-subdued)" className="shrink-0" />
                </button>
                {impactsDropdownOpen && (
                  <div
                    className="absolute left-0 top-full z-50 mt-1 min-w-[160px] rounded-[6px] border border-neutral-100 bg-surface py-1 shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
                    role="listbox"
                    aria-label="Filter by impact"
                  >
                    {IMPACTS_CHIPS.map((chip) => (
                      <button
                        key={chip.id}
                        type="button"
                        role="option"
                        aria-selected={impactsFilter === chip.id}
                        onClick={() => {
                          setImpactsFilter(chip.id)
                          setImpactsDropdownOpen(false)
                        }}
                        className={`w-full px-3 py-2 text-left font-label-medium transition-colors hover:bg-offset focus:bg-offset focus:outline-none ${
                          impactsFilter === chip.id ? 'bg-offset text-default' : 'text-subdued'
                        }`}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="min-h-0 flex-1 overflow-auto px-4 pb-4">
            {isLowFidelity ? (
              <NeedsAttentionListSkeleton selectedIndex={0} />
            ) : (
              <List
                aria-label="Needs Attention"
                variant="noDividers"
                onAction={(id) => setSelectedActionId(id)}
              >
                {displayList.map((action) => (
                  <ListItem
                    key={action.id}
                    id={action.id}
                    icon={<RestrictedCircleIcon size={16} />}
                    iconVariant="critical"
                    title={action.title}
                    active={selectedActionId === action.id}
                    trailingContent={
                      <span
                        className="opacity-0 transition-opacity duration-150 group-hover/row:opacity-100 pr-2"
                        aria-hidden
                      >
                        <RightArrowIcon size={12} fill="var(--color-icon-subdued)" />
                      </span>
                    }
                    children={
                      <ActionRequiredDescriptionRow
                        impactsBase={getImpactsDisplayParts(action).base}
                        impactsMore={getImpactsDisplayParts(action).more}
                        mainTooltipLabel={getImpactsTooltipLabel(action)}
                        moreTooltipLabel={getImpactsDisplayParts(action).more ? getImpactsMoreTooltipLabel(action) : undefined}
                        tooltipId={`needs-attn-list-${action.id}`}
                        pastDueText={`${getDaysPastDue(action.dueDate)} days past due`}
                      />
                    }
                  />
                ))}
              </List>
            )}
          </div>
        </aside>

        {/* Main content: heading (match Settings panel) + selected issue detail */}
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex shrink-0 flex-col gap-0 px-6 pt-5">
            {accountName != null && accountName !== '' && (
              <span className="font-label-small-emphasized text-subdued whitespace-nowrap">
                {accountName}
              </span>
            )}
            <h1 className="min-w-0 w-fit whitespace-pre-wrap text-[18px] leading-[26px] font-semibold tracking-0 text-default m-0">
              Needs Attention
            </h1>
          </div>
          <div className="min-h-0 flex-1 overflow-auto px-6 pb-8 pt-8">
            {isLowFidelity ? (
              <NeedsAttentionDetailSkeleton />
            ) : selectedAction ? (
              <ActionDetailContent action={selectedAction} accountId={accountId} />
            ) : (
              <p className="font-label-medium text-subdued">Select an item from the list.</p>
            )}
          </div>
        </main>
      </div>
    </div>
  )

  return createPortal(fullScreen, document.body)
}
