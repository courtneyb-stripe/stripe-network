/**
 * Overview section — Config-driven. Renders blocks from config.overviewBlocks
 * (balances, recentTransactions, recentActivity). Used when Overview tab is active.
 */

import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import BalancesAndMetricsSection from '../BalancesAndMetricsSection'
import SectionHeader from '../SectionHeader'
import TabBar from '../TabBar'
import ItemsCountLink from '../ItemsCountLink'
import PayoutsTable, { generatePayoutRows } from '../PayoutsTable'
import TableSkeleton from '../TableSkeleton'
import TransactionsTable, { generateTransactionRows } from '../TransactionsTable'
import { ViewChip } from '../NetworkFilterGroup'
import FinancialSnapshot from '../FinancialSnapshot'
import TransactionListCard from '../TransactionListCard'
import { usePrototypeOptional } from '../../context/PrototypeContext'
import type { AccountConfig } from '../../data/accountConfigs'
import { getLatestRows } from './MoneyMovement'
import { TIME_RANGE_OPTIONS, type TimeRange } from '../metrics/constants'

const ALL_TRANSACTION_TABS = [
  { id: 'payments' as const, label: 'Payments' },
  { id: 'payouts' as const, label: 'Payouts' },
  { id: 'collected-fees' as const, label: 'Platform fees' },
]

type TransactionTabId = 'payments' | 'payouts' | 'collected-fees'

const SAVED_LIST_CHIPS = [
  { id: 'cactus' as const, label: 'Paid to Cactus Practice' },
  { id: 'toybox' as const, label: 'Paid to Toybox Labs' },
] as const

type SavedListId = (typeof SAVED_LIST_CHIPS)[number]['id']

const RECENT_ACTIVITY_TABS = [
  { id: 'support-cases', label: 'Support cases' },
  { id: 'events', label: 'Events' },
  { id: 'logs', label: 'Logs' },
  { id: 'sent-emails', label: 'Sent emails' },
] as const

type RecentActivityTabId = (typeof RECENT_ACTIVITY_TABS)[number]['id']

const LATEST_TXN_TABS_V3 = [
  { id: 'payments' as const, label: 'Payments' },
  { id: 'payouts' as const, label: 'Payouts' },
  { id: 'collected-fees' as const, label: 'Collected fees' },
  { id: 'financial-accounts' as const, label: 'Financial accounts' },
] as const

type LatestTxnTabV3Id = (typeof LATEST_TXN_TABS_V3)[number]['id']

const RECENT_TRANSACTIONS_LIMIT = 25
const EMBEDDED_PAYMENTS_TOTAL = 80
const EMBEDDED_PAYOUTS_TOTAL = 48

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
  const iaVariant = prototype?.iaVariant ?? 'v1'
  const loFiMode = prototype?.loFiMode ?? false
  const v3LoFi = iaVariant === 'v3' && loFiMode
  const [activeTransactionTab, setActiveTransactionTab] = useState<TransactionTabId>('payments')
  const [savedListId, setSavedListId] = useState<SavedListId>('cactus')
  const [activeActivityTab, setActiveActivityTab] = useState<RecentActivityTabId>('support-cases')
  const [financialTimeRange, setFinancialTimeRange] = useState<TimeRange>('Last 30 days')
  const [activeLatestTabV3, setActiveLatestTabV3] = useState<LatestTxnTabV3Id>('payments')

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
      {showBalances && iaVariant === 'v3' && (
        <div className="flex flex-col gap-2">
          <SectionHeader title="Balances" size="small" />
          {v3LoFi ? (
            <div className="flex items-center rounded-[12px] bg-offset px-4 py-4">
              <p className="text-[14px] text-subdued">Balances</p>
            </div>
          ) : (
            <BalancesAndMetricsSection onOpenMoneyMovement={onOpenMoneyMovement} />
          )}
        </div>
      )}
      {showBalances && iaVariant !== 'v3' && <BalancesAndMetricsSection onOpenMoneyMovement={onOpenMoneyMovement} />}

      {showRecentTransactions && iaVariant === 'v3' && (
        <div className={`flex flex-col gap-10 ${showBalances ? 'pt-10' : ''}`}>
          {v3LoFi ? (
            <>
              <div className="flex flex-col gap-2">
                <SectionHeader title="Financial snapshot" size="small" />
                <div className="flex items-center rounded-[12px] bg-offset px-4 py-4">
                  <p className="text-[14px] text-subdued">Financial snapshot</p>
                </div>
              </div>
              <div className="flex flex-col gap-0">
                <SectionHeader title="Latest transactions" size="small" />
                <p className="text-[14px] text-subdued">with Toybox Labs</p>
                <div className="flex items-center rounded-[12px] bg-offset px-4 py-4 mt-2">
                  <p className="text-[14px] text-subdued">Latest transactions</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <FinancialSnapshot
                moneyIn="$84,200.00"
                moneyOut="$36,800.00"
                netFlow="$47,400"
                timeRangeValue={financialTimeRange}
                timeRangeOptions={TIME_RANGE_OPTIONS}
                onTimeRangeChange={setFinancialTimeRange}
              />
              <div className="flex flex-col gap-0">
                <SectionHeader title="Latest transactions" size="small" />
                <p className="text-[14px] text-subdued">with Toybox Labs</p>
                <div className="flex w-full pt-2">
                  <TabBar
                    tabs={LATEST_TXN_TABS_V3.map((t) => ({ id: t.id, label: t.label }))}
                    activeId={activeLatestTabV3}
                    onChange={(id) => setActiveLatestTabV3(id as LatestTxnTabV3Id)}
                    variant="secondary"
                    gap={6}
                  />
                </div>
                <div className="pt-5">
                  <TransactionListCard
                    variant="latest"
                    title="Latest transactions"
                    hideHeader
                    onRowAction={onPaymentRowClick}
                    rows={getLatestRows(25)}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      )}
      {showRecentTransactions && iaVariant !== 'v3' && (
        <div className={`flex flex-col gap-0 ${showBalances ? 'pt-10' : ''}`}>
          <SectionHeader
            title="Recent transactions"
            size="small"
            onAction={() => {
              const params = new URLSearchParams()
              params.set('tab', validTransactionTab)
              if (validTransactionTab === 'payments') params.set('savedList', savedListId)
              if (accountId) params.set('accountId', accountId)
              if (accountName) params.set('accountName', accountName)
              navigate(`/transactions?${params.toString()}`, {
                state: {
                  tab: validTransactionTab,
                  ...(validTransactionTab === 'payments' && { savedListId }),
                  accountId,
                  accountName,
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
          <SectionHeader title="Recent Activity" size="small" />
          {v3LoFi ? (
            <div className="flex items-center rounded-[12px] bg-offset px-4 py-4 mt-2">
              <p className="text-[14px] text-subdued">Recent activity</p>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      )}

      {!showBalances && !showRecentTransactions && !showRecentActivity && (
        <div className="font-label-medium text-subdued py-4">Overview — no blocks configured</div>
      )}
    </div>
  )
}
