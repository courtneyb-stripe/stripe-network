/**
 * Overview section — Config-driven. Renders blocks from config.overviewBlocks
 * (balances, recentTransactions, recentActivity). Used when Overview tab is active.
 */

import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import BalancesAndMetricsSection from '../BalancesAndMetricsSection'
import BalancesCard from '../BalancesCard'
import FinancialSnapshot from '../FinancialSnapshot'
import { PropertyList, PropertyListItem } from '../PropertyList'
import SectionHeader from '../SectionHeader'
import TransactionListCard from '../TransactionListCard'
import type { TransactionListRow } from '../TransactionListCard'
import { BrandIcon } from '../../icons/SailIcons'
import { TIME_RANGE_OPTIONS, type TimeRange } from '../metrics/constants'
import TabBar from '../TabBar'
import ItemsCountLink from '../ItemsCountLink'
import PayoutsTable, { generatePayoutRows } from '../PayoutsTable'
import TableSkeleton from '../TableSkeleton'
import TransactionsTable, { generateTransactionRows } from '../TransactionsTable'
import { ViewChip } from '../NetworkFilterGroup'
import { usePrototypeOptional } from '../../context/PrototypeContext'
import type { AccountConfig } from '../../data/accountConfigs'

const ALL_TRANSACTION_TABS = [
  { id: 'payments' as const, label: 'Payments' },
  { id: 'payouts' as const, label: 'Payouts' },
  { id: 'collected-fees' as const, label: 'Platform fees' },
]

type TransactionTabId = 'payments' | 'payouts' | 'collected-fees'

const SAVED_LIST_CHIPS = [
  { id: 'shopify' as const, label: 'Paid to Shopify' },
  { id: 'toybox' as const, label: 'Paid to Toybox Labs' },
] as const

type SavedListId = (typeof SAVED_LIST_CHIPS)[number]['id']

const RECENT_ACTIVITY_TABS = [
  { id: 'events', label: 'Events' },
  { id: 'logs', label: 'Logs' },
  { id: 'sent-emails', label: 'Sent emails' },
] as const

type RecentActivityTabId = (typeof RECENT_ACTIVITY_TABS)[number]['id']

const RECENT_TRANSACTIONS_LIMIT = 10
const EMBEDDED_PAYMENTS_TOTAL = 80
const EMBEDDED_PAYOUTS_TOTAL = 48

const UPCOMING_ROWS: TransactionListRow[] = [
  { id: 'u1', transactionType: 'transfer', description: 'Payout to Bank •••• 7280', subline: 'Mar 1 • Scheduled', amount: '$1,200.00' },
  { id: 'u2', transactionType: 'card', description: 'Subscription renewal · Pro plan', subline: 'Mar 3 • Scheduled', amount: '$29.00' },
  { id: 'u3', transactionType: 'transfer', description: 'Platform fee', subline: 'Mar 5 • Scheduled', amount: '$15.20' },
  { id: 'u4', transactionType: 'transfer', description: 'Payout to Bank •••• 4412', subline: 'Mar 8 • Scheduled', amount: '$2,040.00' },
  { id: 'u5', transactionType: 'card', description: 'Card payment · Estimated', subline: 'Mar 12 • Scheduled', amount: '$—' },
]

export type OverviewSectionProps = {
  config: AccountConfig
  accountId: string | undefined
  accountName: string
  onPaymentRowClick: () => void
  /** When set, Financial accounts balance card shows a ghost icon that switches to Money management tab. */
  onOpenMoneyMovement?: () => void
}

export default function Overview({
  config,
  accountId,
  accountName,
  onPaymentRowClick,
  onOpenMoneyMovement,
}: OverviewSectionProps) {
  const navigate = useNavigate()
  const prototype = usePrototypeOptional()
  const activityFilter = prototype?.activityFilter ?? 'viewChip'
  const iaVersion = prototype?.iaVersion ?? 'v2-money-movement'
  const [financialTimeRange, setFinancialTimeRange] = useState<TimeRange>('Last 30 days')
  const [activeTransactionTab, setActiveTransactionTab] = useState<TransactionTabId>('payments')
  const [savedListId, setSavedListId] = useState<SavedListId>('shopify')
  const [activeActivityTab, setActiveActivityTab] = useState<RecentActivityTabId>('events')

  const transactionTabs = useMemo(
    () =>
      ALL_TRANSACTION_TABS.filter(
        (tab) =>
          tab.id === 'payments' ||
          (tab.id === 'payouts' && config.showPayouts) ||
          (tab.id === 'collected-fees' && config.showCollectedFees)
      ),
    [config.showPayouts, config.showCollectedFees]
  )
  const validTransactionTab: TransactionTabId =
    transactionTabs.some((t) => t.id === activeTransactionTab)
      ? activeTransactionTab
      : (transactionTabs[0]?.id ?? 'payments')

  const recentTransactionsRows = useMemo(
    () => generateTransactionRows(EMBEDDED_PAYMENTS_TOTAL).slice(0, RECENT_TRANSACTIONS_LIMIT),
    []
  )
  const allPayoutRows = useMemo(() => generatePayoutRows(EMBEDDED_PAYOUTS_TOTAL), [])
  const payoutRows = useMemo(() => allPayoutRows.slice(0, RECENT_TRANSACTIONS_LIMIT), [allPayoutRows])

  const showBalances = config.overviewBlocks.includes('balances')
  const showRecentTransactions = config.overviewBlocks.includes('recentTransactions')
  const showRecentActivity = config.overviewBlocks.includes('recentActivity')

  return (
    <div className="flex min-w-0 max-w-[1120px] flex-1 flex-col">
      {showBalances && <BalancesAndMetricsSection accountId={accountId} onOpenMoneyMovement={onOpenMoneyMovement} />}

      {showBalances && iaVersion === 'v1-global-ia' && (
        <div className="flex flex-col gap-6 pt-6">
          <FinancialSnapshot
            moneyIn="$84,200.00"
            moneyOut="$36,800.00"
            netFlow="$47,400"
            timeRangeValue={financialTimeRange}
            timeRangeOptions={TIME_RANGE_OPTIONS}
            onTimeRangeChange={setFinancialTimeRange}
          />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <TransactionListCard
              variant="upcoming"
              title="Upcoming transactions"
              accountName="Toybox Labs"
              onRowAction={onPaymentRowClick}
              rows={UPCOMING_ROWS}
            />
            <div className="flex flex-col gap-2">
              <SectionHeader title="Payout information" size="small" />
              <BalancesCard
                variant="amountRight"
                iconName="balance"
                label="Available"
                subtitle=" "
                value="$8,234.00"
                valueSubtitle="Available instantly $2,422.11"
              />
              <PropertyList orientation="vertical" className="pt-3">
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
            </div>
          </div>
        </div>
      )}

      {showRecentTransactions && (
        <div className={`flex flex-col gap-0 ${showBalances ? 'pt-10' : ''}`}>
          <SectionHeader
            title="Recent transactions"
            size="small"
            onAction={() => {
              navigate('/transactions?tab=payments&savedList=toybox', {
                state: {
                  tab: 'payments',
                  savedListId: 'toybox',
                  accountId: 'toybox-labs',
                  accountName: 'Toybox Labs',
                },
              })
            }}
          />
          <div
            className="flex w-full"
            data-name="baby/tab-group"
            data-node-id="2:6471"
          >
            <TabBar
              tabs={transactionTabs}
              activeId={validTransactionTab}
              onChange={(id) => setActiveTransactionTab(id as TransactionTabId)}
              variant="secondary"
              gap={6}
            />
          </div>
          {validTransactionTab === 'payments' && activityFilter === 'viewChip' && (
            <div className="flex items-center gap-2 pt-5">
              {SAVED_LIST_CHIPS.map((chip) => (
                <ViewChip
                  key={chip.id}
                  label={chip.label}
                  active={savedListId === chip.id}
                  onClick={() => setSavedListId(chip.id)}
                  size="compact"
                />
              ))}
            </div>
          )}
          <div className="pt-5 flex flex-col gap-3">
            {validTransactionTab === 'payments' && (
              <>
                <TransactionsTable rows={recentTransactionsRows} onRowClick={onPaymentRowClick} />
                <ItemsCountLink
                  displayedCount={RECENT_TRANSACTIONS_LIMIT}
                  totalCount={EMBEDDED_PAYMENTS_TOTAL}
                  to={`/transactions?tab=payments&savedList=${savedListId}${accountId ? `&accountId=${encodeURIComponent(accountId)}` : ''}${accountName ? `&accountName=${encodeURIComponent(accountName)}` : ''}`}
                  linkState={{ tab: 'payments', savedListId, accountId, accountName }}
                />
              </>
            )}
            {config.showPayouts && validTransactionTab === 'payouts' && (
              <>
                <PayoutsTable rows={payoutRows} onRowClick={onPaymentRowClick} />
                <ItemsCountLink
                  displayedCount={RECENT_TRANSACTIONS_LIMIT}
                  totalCount={EMBEDDED_PAYOUTS_TOTAL}
                  to={`/transactions?tab=payouts${accountId ? `&accountId=${encodeURIComponent(accountId)}` : ''}${accountName ? `&accountName=${encodeURIComponent(accountName)}` : ''}`}
                  linkState={{ tab: 'payouts', accountId, accountName }}
                />
              </>
            )}
            {config.showCollectedFees && validTransactionTab === 'collected-fees' && (
              <div className="font-label-medium text-subdued py-8">Platform fees — placeholder</div>
            )}
          </div>
        </div>
      )}

      {showRecentActivity && (
        <div className="pt-[40px] flex flex-col gap-0">
          <SectionHeader title="Recent Activity" size="small" onAction={() => {}} actionLabel="View all" />
          <div className="flex w-full">
            <TabBar
              tabs={RECENT_ACTIVITY_TABS.map((t) => ({ id: t.id, label: t.label }))}
              activeId={activeActivityTab}
              onChange={(id) => setActiveActivityTab(id as RecentActivityTabId)}
              variant="secondary"
              gap={6}
            />
          </div>
          <TableSkeleton rowCount={7} showCheckboxColumn={false} />
        </div>
      )}

      {/* Tax forms + Reports — same width as Payout info / Upcoming payouts columns (2-col grid) */}
      <div className="grid grid-cols-1 gap-6 pt-10 lg:grid-cols-2">
        <div
          className="flex items-center rounded-[12px] bg-offset px-4 py-3 min-h-[48px]"
          data-name="Tax forms placeholder"
        >
          <p className="text-[14px] text-subdued">Tax forms — placeholder</p>
        </div>
        <div
          className="flex items-center rounded-[12px] bg-offset px-4 py-3 min-h-[48px]"
          data-name="Reports placeholder"
        >
          <p className="text-[14px] text-subdued">Reports — placeholder</p>
        </div>
      </div>

      {!showBalances && !showRecentTransactions && !showRecentActivity && (
        <div className="font-label-medium text-subdued py-4">Overview — no blocks configured</div>
      )}
    </div>
  )
}
