/**
 * Needs Attention sidebar section — Figma 18-7608.
 * Heading reflects visibility:
 * - **Needs attention** — both Actions required (compliance/tax remediation) and Blocking issues (expired PM) apply.
 * - **Blocking issues** — blocking-only (e.g. expired default PM while capabilities active); no segment control;
 *   list rows and pagination do not open the fullscreen Needs Attention modal (no Actions required to pair).
 * - **Actions required** — compliance/tax remediation without surfaced blocking row; no segment control.
 * Copy link + View details only when heading is **Needs attention** (dual mode).
 */

import { useState, useMemo, useEffect } from 'react'
import {
  ACTIONS_REQUIRED_LIST,
  BLOCKING_EXPIRED_DEFAULT_PAYMENT_METHOD,
  filterActionsRequired,
  getImpactsDisplayParts,
  getImpactsTooltipLabel,
  getImpactsMoreTooltipLabel,
  shouldSurfaceExpiredPaymentMethodBlocking,
} from '../data/actionsRequired'
import BabySegmentedControl from './BabySegmentedControl'
import { usePrototypeOptional } from '../context/PrototypeContext'
import { Icon } from '../icons/SailIcons'
import { ArrowsOutwardIcon } from '../icons/ArrowsOutwardIcon'
import { ActionRequiredDescriptionRow } from './ActionRequiredDescriptionRow'
import { IconButton } from './IconButton'
import InlineListPagination from './InlineListPagination'
import { List, ListItem } from './List'
import { RightArrowIcon } from './metrics/MetricCard'
import { hasAnyNonActiveComplianceStatus, resolveCapabilityGroups } from '../data/uadVisibility'

const TOTAL_ACTIONS = ACTIONS_REQUIRED_LIST.length
const SIDEBAR_ACTION_COUNT = 5

/** Skeleton row for actions required list (low fidelity). Uses red circle X so icon matches full list. Clickable to open Needs Attention modal with that item selected. */
function ActionsRequiredSkeletonRow({ onClick, actionId }: { onClick?: (actionId: string) => void; actionId?: string }) {
  const rowContent = (
    <>
      <span className="flex h-fit w-fit shrink-0 items-start justify-start" aria-hidden>
        <RestrictedCircleIcon size={16} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="h-3 w-full max-w-[70%] rounded-[3px] bg-neutral-100" aria-hidden />
        <div className="h-3 w-full max-w-[50%] rounded-[3px] bg-neutral-100" aria-hidden />
      </div>
    </>
  )
  const rowClass = 'flex items-start gap-3 py-2 min-h-[52px] min-w-0 w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-inset rounded-[8px]'
  if (onClick != null && actionId != null) {
    return (
      <button
        type="button"
        onClick={() => onClick(actionId)}
        className={`${rowClass} cursor-pointer hover:bg-offset transition-colors px-2 -mx-2`}
        aria-label="Open in Needs Attention"
      >
        {rowContent}
      </button>
    )
  }
  return <div className={rowClass}>{rowContent}</div>
}

const SEGMENT_OPTIONS = [
  { id: 'actions' as const, label: 'Actions required' },
  { id: 'blocking' as const, label: 'Blocking issues' },
] as const
type SegmentId = (typeof SEGMENT_OPTIONS)[number]['id']

type AttentionHeadingKind = 'needsAttention' | 'blockingIssues' | 'actionsRequired'

const ATTENTION_HEADING_LABEL: Record<AttentionHeadingKind, string> = {
  needsAttention: 'Needs attention',
  blockingIssues: 'Blocking issues',
  actionsRequired: 'Actions required',
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

type ActionsRequiredSidebarSectionProps = {
  /** Opens the fullscreen Actions required modal. Pass (actionId, segment) when a list item is clicked so the modal opens with that item and segment (Actions required / Blocking issues) selected. */
  onOpenActionsModal: (actionId?: string, segment?: SegmentId) => void
  /** Account id for action detail link in modal. */
  accountId?: string
  /** Optional: URL to copy when link button is clicked. Defaults to current window location. */
  copyLinkUrl?: string
}

export default function ActionsRequiredSidebarSection({ onOpenActionsModal, accountId, copyLinkUrl }: ActionsRequiredSidebarSectionProps) {
  const prototype = usePrototypeOptional()
  const isLowFidelity = prototype?.fidelity === 'low'
  const [segment, setSegment] = useState<SegmentId>('actions')
  const expiredPmBlocking = shouldSurfaceExpiredPaymentMethodBlocking(prototype)
  const hasComplianceRemediation = useMemo(() => {
    if (prototype == null) return false
    return hasAnyNonActiveComplianceStatus(
      prototype.capabilityStatuses,
      resolveCapabilityGroups(prototype.activeRoles, prototype.hasBilling),
      prototype.taxCapabilityStatus
    )
  }, [prototype])
  /** Expired PM with no capability/tax remediation — blocking-only row, no Actions required segment. */
  const blockingOnlyMode = !hasComplianceRemediation && expiredPmBlocking

  /** Primary section title + chrome (segment + header icons). */
  const attentionHeading: AttentionHeadingKind = blockingOnlyMode
    ? 'blockingIssues'
    : hasComplianceRemediation && expiredPmBlocking
      ? 'needsAttention'
      : hasComplianceRemediation
        ? 'actionsRequired'
        : 'needsAttention'

  const showSegmentControl = attentionHeading === 'needsAttention'
  /** Copy link + expand: only when both blocking and Actions required surfaces apply (dual tabs). */
  const showHeaderChromeIcons = attentionHeading === 'needsAttention'

  /** Reset segment when leaving dual mode so list/modal don’t use a stale Blocking selection. */
  useEffect(() => {
    if (!showSegmentControl) setSegment('actions')
  }, [showSegmentControl])

  const effectiveSegmentForList: SegmentId = showSegmentControl
    ? segment
    : attentionHeading === 'blockingIssues'
      ? 'blocking'
      : 'actions'

  const filteredForSidebar = filterActionsRequired('all')
  /** Blocking tab lists expired PM when surfaced; otherwise first preview row (dual mode only). */
  const sidebarActions =
    attentionHeading === 'blockingIssues'
      ? [BLOCKING_EXPIRED_DEFAULT_PAYMENT_METHOD]
      : effectiveSegmentForList === 'blocking'
        ? expiredPmBlocking
          ? [BLOCKING_EXPIRED_DEFAULT_PAYMENT_METHOD]
          : filteredForSidebar.slice(0, 1)
        : filteredForSidebar.slice(0, SIDEBAR_ACTION_COUNT)

  const modalSegmentArg: SegmentId | undefined =
    attentionHeading === 'blockingIssues'
      ? undefined
      : attentionHeading === 'actionsRequired'
        ? 'actions'
        : segment

  /** Blocking-only: expired PM with no compliance/tax row — stay in sidebar; modal opens only when Actions required also applies (dual tab). */
  const listRowOpensNeedsAttentionModal = !blockingOnlyMode

  const handleCopyLink = () => {
    const url = copyLinkUrl ?? (typeof window !== 'undefined' ? window.location.href : '')
    if (url && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url)
    }
  }

  return (
    <div
      className="flex h-fit w-full min-w-0 max-w-full shrink-0 flex-col gap-4 overflow-hidden rounded-none bg-surface px-0 py-0"
      data-name="Needs Attention section"
      data-node-id="18:7608"
      data-attention-heading={attentionHeading}
    >
      {/* Header: matches {@link SectionHeader} / Figma 6232:150998 (20 bold title, 28px outlined controls). */}
      <div className="flex min-h-7 w-full shrink-0 items-center gap-4" data-node-id="18:7609">
        <div className="flex min-w-0 flex-1 items-center gap-1.5" data-node-id="18:7610">
          <p
            className="min-w-0 w-fit shrink-0 whitespace-pre-wrap text-[20px] font-bold leading-[28px] tracking-0 text-page-header-ink"
            style={{ fontFeatureSettings: "'lnum' 1, 'pnum' 1" }}
          >
            {ATTENTION_HEADING_LABEL[attentionHeading]}
          </p>
        </div>
        {showHeaderChromeIcons && (
          <div className="flex shrink-0 items-center gap-2" data-node-id="18:7613">
            <IconButton
              label="Request information"
              tooltipId="actions-required-link-tooltip"
              variant="sectionHeader"
              onClick={handleCopyLink}
              data-cursor-element-id="cursor-el-1"
            >
              <Icon name="link" size={12} fill="var(--color-icon-default)" />
            </IconButton>
            <IconButton
              label="View details"
              tooltipId="actions-required-expand-tooltip"
              variant="sectionHeader"
              onClick={() => onOpenActionsModal()}
            >
              <ArrowsOutwardIcon size={12} fill="var(--color-icon-default)" />
            </IconButton>
          </div>
        )}
      </div>
      <div className="flex shrink-0 flex-col gap-2 pb-2">
        {showSegmentControl && (
          <div className="shrink-0 pt-1">
            <BabySegmentedControl
              options={[...SEGMENT_OPTIONS]}
              selectedId={segment}
              onChange={setSegment}
              aria-label="Filter needs attention"
            />
          </div>
        )}
        {isLowFidelity ? (
          <div className="flex flex-col shrink-0 px-2" aria-label={ATTENTION_HEADING_LABEL[attentionHeading]}>
            {Array.from(
              {
                length:
                  attentionHeading === 'blockingIssues' ||
                  (showSegmentControl && segment === 'blocking')
                    ? 1
                    : SIDEBAR_ACTION_COUNT,
              },
              (_, i) => {
                const action = ACTIONS_REQUIRED_LIST[i]
                const skeletonActionId =
                  attentionHeading === 'blockingIssues' ||
                  (showSegmentControl && segment === 'blocking' && expiredPmBlocking)
                    ? BLOCKING_EXPIRED_DEFAULT_PAYMENT_METHOD.id
                    : action?.id
                return (
                  <ActionsRequiredSkeletonRow
                    key={i}
                    actionId={skeletonActionId}
                    onClick={
                      listRowOpensNeedsAttentionModal && skeletonActionId != null
                        ? (actionId) => onOpenActionsModal(actionId, modalSegmentArg)
                        : undefined
                    }
                  />
                )
              }
            )}
          </div>
        ) : (
          <>
            <List
              aria-label={ATTENTION_HEADING_LABEL[attentionHeading]}
              className="shrink-0"
              variant="noDividers"
              onAction={
                listRowOpensNeedsAttentionModal
                  ? (id) =>
                      onOpenActionsModal(typeof id === 'string' ? id : String(id), modalSegmentArg)
                  : undefined
              }
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
                  icon={<RestrictedCircleIcon size={16} />}
                  iconVariant="critical"
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
            <InlineListPagination
              pageStart={1}
              pageEnd={sidebarActions.length}
              totalResults={effectiveSegmentForList === 'blocking' ? filteredForSidebar.length : TOTAL_ACTIONS}
              onViewFullList={
                listRowOpensNeedsAttentionModal
                  ? () => onOpenActionsModal(undefined, modalSegmentArg)
                  : undefined
              }
            />
          </>
        )}
      </div>
    </div>
  )
}
