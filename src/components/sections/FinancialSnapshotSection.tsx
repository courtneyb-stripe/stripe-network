/**
 * Financial snapshot section for V2 (Money movement) account detail tab.
 * “Financial snapshot” metrics + Balances; then Money movement table (tabbed).
 * Low fidelity: metric cards and other blocks use skeletons / gray placeholders where noted.
 * Money movement: type selector is View chips (**All** + one chip per type), not a TabBar.
 */

import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import SectionHeader from '../SectionHeader'
import TableSkeleton from '../TableSkeleton'
import ActivityListSkeleton from '../ActivityListSkeleton'
import ActivityLogsEventsPagination from '../ActivityLogsEventsPagination'
import TabBar from '../TabBar'
import { MoneyMovementViewChipsRow } from '../MoneyMovementViewChipsRow'
import { usePrototypeOptional } from '../../context/PrototypeContext'
import { shouldSurfaceExpiredPaymentMethodBlocking } from '../../data/actionsRequired'
import { hasAnyNonActiveComplianceStatus, resolveCapabilityGroups } from '../../data/uadVisibility'
import {
  getDefaultMoneyMovementTransactionTabs,
  getMoneyMovementTransactionTabs,
  MONEY_MOVEMENT_TABLE_SKELETON_ROW_COUNT,
} from '../../data/moneyMovementTransactionTabs'
import { formatFinancialSnapshotBalancesTotal } from '../../data/financialSnapshotBalances'
import { isValidMoneyMovementTypeSelection } from '../../data/moneyMovementViewChips'
import { INLINE_LIST_TOTALS, totalResultsForMoneyMovementChip } from '../../constants/inlineListMocks'
import { slugToDisplayName } from '../../utils/string'
import {
  buildMoneyMovementFullListLink,
} from '../../utils/transactionsDeepLinks'
import MetricCard from '../metrics/MetricCard'
import { SimpleMetricCardSkeleton } from '../metrics/MetricCard'
import MetricDropdown from '../metrics/MetricDropdown'
import { TIME_RANGE_OPTIONS, type TimeRange } from '../metrics/constants'
import ActionsRequiredSidebarSection from '../ActionsRequiredSidebarSection'
import InlineListPagination from '../InlineListPagination'
import LabelTooltip from '../LabelTooltip'
import { IconButton } from '../IconButton'
import InfoIcon from '../../icons/InfoIcon'
import { Icon } from '../../icons/SailIcons'

const bar = 'h-[10px] rounded-[3px] bg-neutral-100'
const iconBoxGray = 'size-6 shrink-0 rounded-[6px] bg-neutral-100'
const iconBoxBlurple = 'size-6 shrink-0 rounded-[6px] bg-[#635BFF]'

/** Skeleton balance row: gray or blurple icon placeholder, gray bars for label/value. */
function SkeletonBalanceRow({ iconBlurple = false }: { iconBlurple?: boolean }) {
  return (
    <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <div className={iconBlurple ? iconBoxBlurple : iconBoxGray} aria-hidden />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className={`${bar} w-full max-w-[200px]`} />
          <div className={`${bar} w-[58px]`} />
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <div className={`${bar} w-full max-w-[120px]`} />
        <div className={`${bar} w-[58px]`} />
      </div>
    </div>
  )
}

/** Skeleton balances: two generic wells + optional Financial accounts row (blurple, links when `accountId` set). */
function BalancesCardPlaceholder({
  accountId,
  showFinancialAccountsRow,
}: {
  accountId?: string
  showFinancialAccountsRow: boolean
}) {
  const rowClass = 'flex h-[60px] w-full items-center gap-10 overflow-clip rounded-[12px] bg-white p-3'
  const cardContent = (iconBlurple: boolean) => (
    <div className={rowClass} data-name="Card-layout">
      <SkeletonBalanceRow iconBlurple={iconBlurple} />
    </div>
  )
  const financialAccountsCard =
    accountId != null ? (
      <Link
        to={`/network/${accountId}/financial-accounts`}
        className={`${rowClass} block transition-colors hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2`}
        data-name="Card-layout Financial accounts"
      >
        <SkeletonBalanceRow iconBlurple />
      </Link>
    ) : (
      cardContent(true)
    )

  return (
    <div
      className="flex w-full flex-col gap-2 rounded-[16px] bg-offset p-[8px]"
      data-name="Balances"
      data-node-id="2085-46771"
    >
      {cardContent(false)}
      {cardContent(false)}
      {showFinancialAccountsRow ? financialAccountsCard : null}
    </div>
  )
}

const TOYBOX_LABS_ACCOUNT_ID = 'toybox-labs'
const TOYBOX_LABS_ACCOUNT_NAME = 'Toybox Labs'

/** Inline Activity list — Figma Sections/Recent activity (6214:35515), skeleton row count. */
const ACTIVITY_TABLE_SKELETON_ROWS = 6

const ACTIVITY_TABS = [
  { id: 'recent-activity', label: 'Recent activity' },
  { id: 'sent-emails', label: 'Sent emails' },
  { id: 'logs', label: 'Logs' },
  { id: 'events', label: 'Events' },
] as const

type ActivityTabId = (typeof ACTIVITY_TABS)[number]['id']

export type FinancialSnapshotSectionProps = {
  /** When set, skeleton table rows are clickable and call this (e.g. open preview drawer). */
  onRowClick?: () => void
  /** Opens the fullscreen Actions required modal; pass (actionId, segment) when a list item is clicked so the modal opens with that item and segment selected. */
  onOpenActionsModal?: (actionId?: string, segment?: 'blocking' | 'actions') => void
  /** Account id for action detail links. */
  accountId?: string
}

export default function FinancialSnapshotSection({ onRowClick, onOpenActionsModal, accountId }: FinancialSnapshotSectionProps = {}) {
  const prototype = usePrototypeOptional()
  const isLowFidelity = prototype?.fidelity === 'low'
  const [timeRange, setTimeRange] = useState<TimeRange>('Last 30 days')
  const [moneyMovementTypeId, setMoneyMovementTypeId] = useState('all')
  const [activityTabId, setActivityTabId] = useState<ActivityTabId>('recent-activity')

  const moneyMovementTabs = useMemo(
    () =>
      prototype != null
        ? getMoneyMovementTransactionTabs(prototype.activeRoles, prototype.billingEnabled)
        : getDefaultMoneyMovementTransactionTabs(),
    [prototype]
  )

  useEffect(() => {
    if (isValidMoneyMovementTypeSelection(moneyMovementTypeId, moneyMovementTabs)) return
    setMoneyMovementTypeId('all')
  }, [moneyMovementTabs, moneyMovementTypeId])

  /** Financial accounts balance card: storer role + Configure → Financial accounts enabled. */
  const showFinancialAccountsBalanceRow = useMemo(() => {
    if (prototype == null) return true
    return prototype.hasFinancialAccounts && prototype.activeRoles.has('storer')
  }, [prototype])

  const balancesTotalDisplay = useMemo(
    () => formatFinancialSnapshotBalancesTotal(showFinancialAccountsBalanceRow),
    [showFinancialAccountsBalanceRow]
  )

  const moneyMovementAccountId = accountId ?? TOYBOX_LABS_ACCOUNT_ID
  const moneyMovementAccountLabel =
    accountId === TOYBOX_LABS_ACCOUNT_ID
      ? TOYBOX_LABS_ACCOUNT_NAME
      : accountId != null
        ? slugToDisplayName(accountId)
        : TOYBOX_LABS_ACCOUNT_NAME

  const mmListLink = buildMoneyMovementFullListLink({
    accountId: moneyMovementAccountId,
    accountName: moneyMovementAccountLabel,
    moneyMovementTypeId,
    savedListId: 'toybox',
  })

  const showNeedsAttention =
    prototype != null &&
    onOpenActionsModal != null &&
    (hasAnyNonActiveComplianceStatus(
      prototype.capabilityStatuses,
      resolveCapabilityGroups(prototype.activeRoles, prototype.hasBilling),
      prototype.taxCapabilityStatus
    ) ||
      shouldSurfaceExpiredPaymentMethodBlocking(prototype))

  const financialSnapshotMetricsBlock = (
    <div className="flex flex-col gap-4">
      <SectionHeader
        title="Financial snapshot"
        size="small"
        trailing={
          <MetricDropdown
            value={timeRange}
            options={TIME_RANGE_OPTIONS}
            onChange={(v) => setTimeRange(v)}
            ariaLabel="Time range"
          />
        }
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {isLowFidelity ? (
          <>
            <SimpleMetricCardSkeleton />
            <SimpleMetricCardSkeleton />
            <SimpleMetricCardSkeleton />
          </>
        ) : (
          <>
            <MetricCard variant="simple" label="Money in" value="$84.2K" />
            <MetricCard variant="simple" label="Money out" value="$36.8K" />
            <MetricCard variant="simple" label="Net flow" value="$47.4K" />
          </>
        )}
      </div>
    </div>
  )

  const balancesBlock = (
    <div className="flex flex-col gap-4">
      <SectionHeader
        title="Balances"
        size="small"
        trailing={
          <span className="text-[20px] font-normal leading-6 tracking-[-0.2px] text-default tabular-nums">
            {balancesTotalDisplay}
          </span>
        }
      />
      <BalancesCardPlaceholder accountId={accountId} showFinancialAccountsRow={showFinancialAccountsBalanceRow} />
    </div>
  )

  return (
    <div className="flex min-w-0 max-w-[1120px] flex-1 flex-col" style={{ gap: 40 }}>
      {showNeedsAttention ? (
        <div className="flex w-full min-w-0 flex-col" style={{ gap: 20 }}>
          <div className="flex w-full min-w-0 flex-col gap-2">
            <ActionsRequiredSidebarSection onOpenActionsModal={onOpenActionsModal} accountId={accountId} />
          </div>
          {financialSnapshotMetricsBlock}
          {balancesBlock}
        </div>
      ) : (
        <>
          {financialSnapshotMetricsBlock}
          {balancesBlock}
        </>
      )}

      {/* Money movement */}
      <div className="flex flex-col gap-4">
        <SectionHeader title="Money movement" size="small" />
        <div
          className="flex flex-col gap-4"
          data-mm-type={moneyMovementTypeId}
        >
          <MoneyMovementViewChipsRow
            tabs={moneyMovementTabs}
            activeTypeId={moneyMovementTypeId}
            onTypeChange={setMoneyMovementTypeId}
          />
          <TableSkeleton
            rowCount={MONEY_MOVEMENT_TABLE_SKELETON_ROW_COUNT}
            showCheckboxColumn={false}
            onRowClick={onRowClick}
          />
          {moneyMovementTypeId !== 'all' ? (
            <InlineListPagination
              pageStart={1}
              pageEnd={MONEY_MOVEMENT_TABLE_SKELETON_ROW_COUNT}
              totalResults={totalResultsForMoneyMovementChip(moneyMovementTypeId)}
              to={mmListLink.to}
              linkState={mmListLink.linkState}
            />
          ) : null}
        </div>
      </div>

      {/* Activity — Figma Sections/Recent activity (6214:35515); heading row aligns with 6232:150998 section chrome */}
      <div className="flex flex-col gap-4">
        <div className="flex min-h-7 w-full items-center gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-1">
            <p
              className="min-w-0 whitespace-pre-wrap text-[20px] font-bold leading-[28px] tracking-0 text-page-header-ink"
              style={{ fontFeatureSettings: "'lnum' 1, 'pnum' 1" }}
            >
              Activity
            </p>
            <LabelTooltip
              label="Timeline, email, logs, and events for this account."
              tooltipId="financial-snapshot-activity-info"
              placement="top"
            >
              <span
                className="flex shrink-0 items-end self-stretch pb-[6px] pt-[10px] text-icon-subdued"
                aria-hidden
              >
                <InfoIcon size={12} />
              </span>
            </LabelTooltip>
          </div>
          <IconButton
            label="More actions"
            tooltipId="financial-snapshot-activity-more"
            variant="sectionHeader"
          >
            <Icon name="more" size={12} fill="var(--color-icon-default)" className="shrink-0" />
          </IconButton>
        </div>
        <TabBar
          tabs={ACTIVITY_TABS}
          activeId={activityTabId}
          onChange={(id) => setActivityTabId(id as ActivityTabId)}
          variant="primary"
          gap={16}
        />
        <div className="flex flex-col gap-4" data-name="Timeline + pagination">
          <ActivityListSkeleton
            key={activityTabId}
            rowCount={ACTIVITY_TABLE_SKELETON_ROWS}
            onRowClick={onRowClick}
            aria-label={ACTIVITY_TABS.find((t) => t.id === activityTabId)?.label ?? 'Activity'}
          />
          {activityTabId === 'logs' ? (
            <ActivityLogsEventsPagination
              pageStart={1}
              pageEnd={ACTIVITY_TABLE_SKELETON_ROWS}
              totalResults={INLINE_LIST_TOTALS.activityLogs}
              workbenchLabel="Inspect more logs in Workbench"
            />
          ) : activityTabId === 'events' ? (
            <ActivityLogsEventsPagination
              pageStart={1}
              pageEnd={ACTIVITY_TABLE_SKELETON_ROWS}
              totalResults={INLINE_LIST_TOTALS.activityEvents}
              workbenchLabel="Inspect more events in Workbench"
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}
