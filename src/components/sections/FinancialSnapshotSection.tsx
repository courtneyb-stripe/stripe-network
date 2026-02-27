/**
 * Financial snapshot section for V2 (Money movement) account detail tab.
 * Snapshot + placeholder sections: Balances, Recent transactions, Payouts.
 * Low fidelity: Financial snapshot, Balances, Payout information, Upcoming payouts are gray boxes (headings kept).
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FinancialSnapshot from '../FinancialSnapshot'
import { PropertyList, PropertyListItem } from '../PropertyList'
import SectionHeader from '../SectionHeader'
import TabBar from '../TabBar'
import TableSkeleton from '../TableSkeleton'
import TransactionListCard from '../TransactionListCard'
import type { TransactionListRow } from '../TransactionListCard'
import { BrandIcon } from '../../icons/SailIcons'
import { usePrototypeOptional } from '../../context/PrototypeContext'
import { TIME_RANGE_OPTIONS, type TimeRange } from '../metrics/constants'
import ActionsRequiredSidebarSection from '../ActionsRequiredSidebarSection'
import type { AccountStatusKind } from '../AccountDetailsSidebar'

function LowFidelityBox({ className = '' }: { className?: string }) {
  return (
    <div
      className={`min-h-[80px] rounded-[12px] bg-neutral-100 flex items-center justify-center ${className}`.trim()}
      aria-hidden
    />
  )
}

/** Balance card from Figma 2085:46771 — white card with placeholder layout, embedded in gray. */
function BalancesCardPlaceholder() {
  const bar = 'h-[10px] rounded-[3px] bg-neutral-100'
  const iconBox = 'size-6 shrink-0 rounded-[6px] bg-neutral-100'
  const cardContent = (
    <>
      <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className={iconBox} />
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
    </>
  )
  return (
    <div
      className="flex w-full flex-col gap-2 rounded-[12px] bg-offset p-3"
      data-name="Balances"
      data-node-id="2085-46771"
      aria-hidden
    >
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex h-[60px] w-full items-center gap-10 overflow-clip rounded-[12px] bg-white p-3"
          data-name="Card-layout"
        >
          {cardContent}
        </div>
      ))}
    </div>
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
  /** Opens the fullscreen Actions required modal; required when status is restricted to show Needs attention. */
  onOpenActionsModal?: () => void
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
  const showFinancialSnapshot = false
  const showNeedsAttention = status === 'restricted' && onOpenActionsModal

  return (
    <div className="flex min-w-0 max-w-[1120px] flex-1 flex-col" style={{ gap: 40 }}>
      {showNeedsAttention && (
        <div className="flex flex-col gap-2">
          <ActionsRequiredSidebarSection onOpenActionsModal={onOpenActionsModal} accountId={accountId} />
        </div>
      )}
      {showFinancialSnapshot && (
        <div className="flex flex-col gap-2">
          <FinancialSnapshot
            moneyIn="$84,200.00"
            moneyOut="$36,800.00"
            netFlow="$47,400"
            timeRangeValue={timeRange}
            timeRangeOptions={TIME_RANGE_OPTIONS}
            onTimeRangeChange={setTimeRange}
            lowFidelity={isLowFidelity}
          />
        </div>
      )}

      {/* Balances — Figma 2085:46771: single white card in gray area; header shows total in FinancialSnapshot value style */}
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
        <BalancesCardPlaceholder />
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

      {/* Payout information + Upcoming payouts */}
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
    </div>
  )
}
