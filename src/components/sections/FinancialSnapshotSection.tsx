/**
 * Financial snapshot section for V2 (Money movement) account detail tab.
 * Metrics row (“Financial snapshot”) above Balances; then payouts, recent transactions.
 * Low fidelity: metric cards and other blocks use skeletons / gray placeholders where noted.
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PropertyList, PropertyListItem } from '../PropertyList'
import SectionHeader from '../SectionHeader'
import TabBar from '../TabBar'
import TableSkeleton from '../TableSkeleton'
import TransactionListCard from '../TransactionListCard'
import type { TransactionListRow } from '../TransactionListCard'
import { BrandIcon } from '../../icons/SailIcons'
import { usePrototypeOptional } from '../../context/PrototypeContext'
import MetricCard from '../metrics/MetricCard'
import { SimpleMetricCardSkeleton } from '../metrics/MetricCard'
import MetricDropdown from '../metrics/MetricDropdown'
import { TIME_RANGE_OPTIONS, type TimeRange } from '../metrics/constants'
import ActionsRequiredSidebarSection from '../ActionsRequiredSidebarSection'
import type { AccountStatusKind } from '../AccountDetailsSidebar'

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

/** Skeleton balances: 3 cards. Last card has blurple icon and links to financial-accounts when accountId set. */
function BalancesCardPlaceholder({ accountId }: { accountId?: string }) {
  const rowClass = 'flex h-[60px] w-full items-center gap-10 overflow-clip rounded-[12px] bg-white p-3'
  const cardContent = (iconBlurple: boolean) => (
    <div className={rowClass} data-name="Card-layout">
      <SkeletonBalanceRow iconBlurple={iconBlurple} />
    </div>
  )
  const lastCard = accountId ? (
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
      className="flex w-full flex-col gap-2 rounded-[12px] bg-offset p-3"
      data-name="Balances"
      data-node-id="2085-46771"
    >
      {cardContent(false)}
      {cardContent(false)}
      {lastCard}
    </div>
  )
}

function LowFidelityBox({ className = '' }: { className?: string }) {
  return (
    <div
      className={`min-h-[80px] rounded-[12px] bg-neutral-100 flex items-center justify-center ${className}`.trim()}
      aria-hidden
    />
  )
}

const TOYBOX_LABS_ACCOUNT_ID = 'toybox-labs'
const TOYBOX_LABS_ACCOUNT_NAME = 'Toybox Labs'

const UPCOMING_PAYOUT_ROWS: TransactionListRow[] = [
  { id: 'p1', transactionType: 'transfer', description: 'Payout to Bank •••• 7280', subline: 'Mar 1 • Scheduled', amount: '$1,200.00' },
  { id: 'p2', transactionType: 'transfer', description: 'Payout to Bank •••• 4412', subline: 'Mar 8 • Scheduled', amount: '$2,040.00' },
  { id: 'p3', transactionType: 'transfer', description: 'Payout — Platform fee', subline: 'Mar 5 • Scheduled', amount: '$15.20' },
  { id: 'p4', transactionType: 'transfer', description: 'Payout to Bank •••• 9012', subline: 'Mar 12 • Scheduled', amount: '$890.00' },
  { id: 'p5', transactionType: 'transfer', description: 'Payout to Bank •••• 7280', subline: 'Mar 15 • Scheduled', amount: '$2,100.00' },
]

const RECENT_TRANSACTION_TABS = [
  { id: 'payments', label: 'Payments' },
  { id: 'payouts', label: 'Payouts' },
  { id: 'financial-accounts', label: 'Financial accounts' },
  { id: 'global-payouts', label: 'Global payouts' },
  { id: 'collected-fees', label: 'Collected fees' },
] as const

export type FinancialSnapshotSectionProps = {
  /** When set, skeleton table rows are clickable and call this (e.g. open preview drawer). */
  onRowClick?: () => void
  /** When 'restricted', Needs attention is shown above Balances in main. */
  status?: AccountStatusKind
  /** Opens the fullscreen Actions required modal; pass (actionId, segment) when a list item is clicked so the modal opens with that item and segment selected. */
  onOpenActionsModal?: (actionId?: string, segment?: 'blocking' | 'actions') => void
  /** Account id for action detail links. */
  accountId?: string
}

export default function FinancialSnapshotSection({ onRowClick, status, onOpenActionsModal, accountId }: FinancialSnapshotSectionProps = {}) {
  const navigate = useNavigate()
  const prototype = usePrototypeOptional()
  const isLowFidelity = prototype?.fidelity === 'low'
  const [timeRange, setTimeRange] = useState<TimeRange>('Last 30 days')
  const [recentTransactionsTab, setRecentTransactionsTab] = useState<string>(RECENT_TRANSACTION_TABS[0].id)

  const openTransactionsFilteredByToyboxLabs = () => {
    navigate('/transactions?tab=payments&savedList=toybox', {
      state: {
        tab: 'payments',
        savedListId: 'toybox',
        accountId: TOYBOX_LABS_ACCOUNT_ID,
        accountName: TOYBOX_LABS_ACCOUNT_NAME,
      },
    })
  }
  const showNeedsAttention = status === 'restricted' && onOpenActionsModal

  const financialSnapshotMetricsBlock = (
    <div className="flex flex-col gap-0">
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
    <div className="flex flex-col gap-2">
      <SectionHeader
        title="Balances"
        size="small"
        trailing={
          <span className="text-[20px] font-normal leading-6 tracking-[-0.2px] text-default tabular-nums">
            $12,345.67
          </span>
        }
      />
      <BalancesCardPlaceholder accountId={accountId} />
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

      {/* Payout information + Upcoming payouts — just below Balances */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <SectionHeader title="Payout information" size="small" />
          {isLowFidelity ? (
            <LowFidelityBox />
          ) : (
            <PropertyList orientation="vertical" className="pt-0">
              <PropertyListItem label="Schedule" value="Daily — 2 day rolling basis" />
              <PropertyListItem label="Default currency" value="USD" />
              <PropertyListItem
                label="Default external account"
                value={
                  <div className="flex items-center gap-1.5">
                    <BrandIcon name="morganchase" size={20} aria-hidden />
                    <span className="font-label-medium text-default">Chase •••• 7280</span>
                  </div>
                }
              />
              <PropertyListItem label="Payout statement descriptor" value="–" />
            </PropertyList>
          )}
        </div>
        <div className="flex flex-col gap-2">
          {isLowFidelity ? (
            <>
              <SectionHeader title="Upcoming payouts" size="small" />
              <LowFidelityBox />
            </>
          ) : (
            <TransactionListCard
              variant="upcoming"
              title="Upcoming payouts"
              onRowAction={onRowClick ? () => onRowClick() : undefined}
              rows={UPCOMING_PAYOUT_ROWS}
            />
          )}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="flex flex-col gap-2">
        <SectionHeader title="Recent transactions" size="small" onAction={openTransactionsFilteredByToyboxLabs} actionLabel="View all" />
        <TabBar
          tabs={RECENT_TRANSACTION_TABS.map((t) => ({ id: t.id, label: t.label }))}
          activeId={recentTransactionsTab}
          onChange={setRecentTransactionsTab}
          variant="secondary"
          gap={6}
        />
        <TableSkeleton rowCount={10} showCheckboxColumn={false} onRowClick={onRowClick} />
      </div>
    </div>
  )
}
