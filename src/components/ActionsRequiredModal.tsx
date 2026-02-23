/**
 * Actions required — Drawer (same style as Profile and transaction drawers).
 * View chips: All (count), Impacts payments, Impacts payouts. List filtered by chip.
 * Payouts/Payments dropdown "View all" deep link opens with that filter. List items open detail in new tab.
 */

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  filterActionsRequired,
  getActionsRequiredCountByFilter,
  getImpactsDisplayParts,
  getImpactsTooltipLabel,
  getImpactsMoreTooltipLabel,
  type ImpactsFilter,
} from '../data/actionsRequired'
import { ActionRequiredDescriptionRow } from './ActionRequiredDescriptionRow'
import { List, ListItem } from './List'
import { Icon } from '../icons/SailIcons'
import { RightArrowIcon } from './metrics/MetricCard'
import { ViewChip } from './NetworkFilterGroup'
import { IconButton } from './IconButton'

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
  /** Account id so item links open /network/:accountId/actions/:actionId in new tab. */
  accountId?: string
  /** When opening from Payouts dropdown use 'payouts'; from Payments dropdown use 'payments'; otherwise 'all'. */
  initialFilter?: ActionsRequiredFilter
}

const VIEW_CHIPS: { id: ActionsRequiredFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'payments', label: 'Impacts payments' },
  { id: 'payouts', label: 'Impacts payouts' },
]

export default function ActionsRequiredModal({
  open,
  onClose,
  accountId,
  initialFilter = 'all',
}: ActionsRequiredModalProps) {
  const [selectedFilter, setSelectedFilter] = useState<ActionsRequiredFilter>(initialFilter)

  useEffect(() => {
    if (!open) return
    setSelectedFilter(initialFilter)
  }, [open, initialFilter])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        e.stopImmediatePropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [open, onClose])

  if (!open) return null

  const filteredList = filterActionsRequired(selectedFilter)
  const allCount = getActionsRequiredCountByFilter('all')

  const drawer = (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-label="Actions required"
      onClick={onClose}
    >
      <div
        className="fixed right-4 top-4 bottom-4 w-[50%] min-w-[320px] max-w-[560px] flex flex-col overflow-hidden rounded-[16px] bg-surface px-6 py-5 shadow-[0px_50px_100px_0px_rgba(48,49,61,0.08),0px_15px_35px_0px_rgba(48,49,61,0.08),0px_5px_15px_0px_rgba(0,0,0,0.12)]"
        data-name="Actions required drawer"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: title + close */}
        <div className="flex shrink-0 w-full items-center justify-between gap-2 pb-4">
          <p className="shrink-0 text-[18px] leading-[26px] font-semibold tracking-[-0.15px] text-default">
            Actions required
          </p>
          <IconButton
            label="Close"
            tooltipId="actions-required-drawer-close-tooltip"
            tooltipPlacement="bottom"
            onClick={onClose}
          >
            <CloseIcon size={12} />
          </IconButton>
        </div>
        {/* View chips: All (count), Impacts payments, Impacts payouts */}
        <div className="flex shrink-0 flex-wrap items-center gap-2 pb-4">
          {VIEW_CHIPS.map((chip) => (
            <ViewChip
              key={chip.id}
              label={chip.label}
              count={chip.id === 'all' ? allCount : undefined}
              active={selectedFilter === chip.id}
              onClick={() => setSelectedFilter(chip.id)}
              size="compact"
            />
          ))}
        </div>
        {/* List — same List/ListItem as sidebar and dropdown; row click opens detail in new tab */}
        <div className="flex min-h-0 flex-1 flex-col overflow-auto">
          <List
            aria-label="Actions required"
            variant="noDividers"
            onAction={(id) => {
              if (accountId) {
                window.open(`/network/${accountId}/actions/${id}`, '_blank', 'noopener,noreferrer')
              }
            }}
          >
            {filteredList.map((action) => {
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
                      tooltipId={`actions-modal-impacts-${action.id}`}
                      pastDueText={pastDueText}
                    />
                  }
                />
              )
            })}
          </List>
        </div>
      </div>
    </div>
  )

  return createPortal(drawer, document.body)
}
