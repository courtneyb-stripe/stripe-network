/**
 * Needs Attention sidebar section — Figma 18-7608.
 * Shown when account is Restricted: title "Needs Attention", nested segmented control, link/expand buttons,
 * first 5 actions from shared list (using List/ListItem), "5 of 9 actions required" link (opens modal with All).
 * Styling aligned with Profile card and other sidebar sections.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ACTIONS_REQUIRED_LIST,
  filterActionsRequired,
  getImpactsDisplayParts,
  getImpactsTooltipLabel,
  getImpactsMoreTooltipLabel,
} from '../data/actionsRequired'
import BabySegmentedControl from './BabySegmentedControl'
import { usePrototypeOptional } from '../context/PrototypeContext'
import { Icon } from '../icons/SailIcons'
import { ArrowsOutwardIcon } from '../icons/ArrowsOutwardIcon'
import { ActionRequiredDescriptionRow } from './ActionRequiredDescriptionRow'
import { IconButton } from './IconButton'
import { List, ListItem } from './List'
import { RightArrowIcon } from './metrics/MetricCard'

const TOTAL_ACTIONS = ACTIONS_REQUIRED_LIST.length
const SIDEBAR_ACTION_COUNT = 5

/** Skeleton row for actions required list (low fidelity). */
function ActionsRequiredSkeletonRow() {
  return (
    <div className="flex items-start gap-3 py-2 min-h-[44px]">
      <div className="h-3 w-3 shrink-0 rounded-[3px] bg-neutral-100" aria-hidden />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="h-3 w-full max-w-[70%] rounded-[3px] bg-neutral-100" aria-hidden />
        <div className="h-3 w-full max-w-[50%] rounded-[3px] bg-neutral-100" aria-hidden />
      </div>
    </div>
  )
}

const SEGMENT_OPTIONS = [
  { id: 'blocking' as const, label: 'Blocking issues' },
  { id: 'actions' as const, label: 'Actions required' },
] as const
type SegmentId = (typeof SEGMENT_OPTIONS)[number]['id']

function getDaysPastDue(due: Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(due)
  d.setHours(0, 0, 0, 0)
  const diff = today.getTime() - d.getTime()
  return Math.max(0, Math.floor(diff / (24 * 60 * 60 * 1000)))
}

type ActionsRequiredSidebarSectionProps = {
  /** Opens the fullscreen Actions required modal. */
  onOpenActionsModal: () => void
  /** Account id for action detail navigation (same tab). */
  accountId?: string
  /** Optional: URL to copy when link button is clicked. Defaults to current window location. */
  copyLinkUrl?: string
}

export default function ActionsRequiredSidebarSection({ onOpenActionsModal, accountId, copyLinkUrl }: ActionsRequiredSidebarSectionProps) {
  const navigate = useNavigate()
  const prototype = usePrototypeOptional()
  const isLowFidelity = prototype?.fidelity === 'low'
  const [segment, setSegment] = useState<SegmentId>('blocking')
  const filteredForSidebar = filterActionsRequired('all')
  /** Blocking: 2 items only; Actions required: full preview list. */
  const sidebarActions =
    segment === 'blocking'
      ? filteredForSidebar.slice(0, 2)
      : filteredForSidebar.slice(0, SIDEBAR_ACTION_COUNT)

  const handleCopyLink = () => {
    const url = copyLinkUrl ?? (typeof window !== 'undefined' ? window.location.href : '')
    if (url && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url)
    }
  }

  return (
    <div
      className="flex w-full min-w-0 flex-col gap-1 shrink-0 overflow-hidden rounded-[12px] bg-surface px-4 pb-4 pt-0"
      data-name="Needs Attention section"
      data-node-id="18:7608"
    >
      {/* Header: same structure as SectionHeader (min-h-8, 18px title) for consistency */}
      <div className="flex min-h-8 w-full items-center justify-between gap-1.5 shrink-0" data-node-id="18:7609">
        <div className="flex min-w-0 flex-1 items-center gap-1.5" data-node-id="18:7610">
          <p className="min-w-0 w-fit text-[18px] leading-[26px] font-semibold tracking-0 text-default shrink-0">
            Needs Attention
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1" data-node-id="18:7613">
          <IconButton
            label="Request information"
            tooltipId="actions-required-link-tooltip"
            variant="ghost"
            onClick={handleCopyLink}
            data-cursor-element-id="cursor-el-1"
          >
            <Icon name="link" size={12} fill="var(--color-icon-subdued)" />
          </IconButton>
          <IconButton
            label="View details"
            tooltipId="actions-required-expand-tooltip"
            variant="ghost"
            onClick={onOpenActionsModal}
          >
            <ArrowsOutwardIcon size={12} fill="var(--color-icon-subdued)" />
          </IconButton>
        </div>
      </div>
      {/* Nested segmented control — Figma 2059:88785 */}
      <div className="shrink-0 pt-1">
        <BabySegmentedControl
          options={SEGMENT_OPTIONS}
          selectedId={segment}
          onChange={setSegment}
          aria-label="Filter needs attention"
        />
      </div>
      {isLowFidelity ? (
        <div className="flex flex-col shrink-0" aria-label="Needs Attention">
          {Array.from({ length: SIDEBAR_ACTION_COUNT }, (_, i) => (
            <ActionsRequiredSkeletonRow key={i} />
          ))}
        </div>
      ) : (
        <>
          <List
            aria-label="Needs Attention"
            className="shrink-0"
            variant="noDividers"
            onAction={(id) => {
              if (accountId) {
                navigate(`/network/${accountId}/actions/${id}`)
              } else {
                onOpenActionsModal()
              }
            }}
          >
            {sidebarActions.map((action) => {
              const daysPastDue = getDaysPastDue(action.dueDate)
              const pastDueText = `${daysPastDue} days past due`
              const { base: impactsBase, more: impactsMore } = getImpactsDisplayParts(action)
              const mainTooltipLabel = getImpactsTooltipLabel(action)
              const moreTooltipLabel = getImpactsMoreTooltipLabel(action)
              return (
                <ListItem
                  key={action.id}
                  id={action.id}
                  icon={
                    <Icon
                      name="identityVerification"
                      size={16}
                      fill="var(--color-icon-subdued)"
                    />
                  }
                  title={action.title}
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
                      impactsBase={impactsBase}
                      impactsMore={impactsMore}
                      mainTooltipLabel={mainTooltipLabel}
                      moreTooltipLabel={impactsMore ? moreTooltipLabel : undefined}
                      tooltipId={`actions-required-impacts-${action.title.replace(/\s+/g, '-')}`}
                      pastDueText={pastDueText}
                    />
                  }
                />
              )
            })}
          </List>
          {/* "5 of 9 actions required" — link part in action primary */}
          <button
            type="button"
            onClick={onOpenActionsModal}
            className="flex flex-col font-label-small text-subdued text-[12px] leading-4 text-left hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary rounded-[4px] -mb-1"
          >
            <span>
              <span className="leading-4">{sidebarActions.length} of </span>
              <span className="text-action-primary leading-4">{TOTAL_ACTIONS} need attention</span>
            </span>
          </button>
        </>
      )}
    </div>
  )
}
