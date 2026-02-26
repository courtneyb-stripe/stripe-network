/**
 * TransactionsList — Full transactions view. Same template as Network list:
 * Page header (Transactions + tabs). Payments: status chips + payments table. Payouts: payouts table (like account detail).
 */

import { useState, useMemo, useEffect } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import TransactionsPageHeader from '../components/TransactionsPageHeader'
import ReturnToAccountFloating from '../components/ReturnToAccountFloating'
import type { TransactionsTabId } from '../components/TransactionsPageHeader'
import { ViewChip } from '../components/NetworkFilterGroup'
import SearchBar from '../components/SearchBar'
import PayoutsTable, { generatePayoutRows, type PayoutRow, type PayoutStatus } from '../components/PayoutsTable'
import TransactionsTable, {
  generateTransactionRows,
  type TransactionRow,
  type TransactionStatus,
} from '../components/TransactionsTable'

const TRANSACTION_STATUS_CHIPS: { id: 'all' | TransactionStatus; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'succeeded', label: 'Succeeded' },
  { id: 'refunded', label: 'Refunded' },
  { id: 'disputed', label: 'Disputed' },
  { id: 'failed', label: 'Failed' },
  { id: 'uncaptured', label: 'Uncaptured' },
]

const PAYOUT_STATUS_CHIPS: { id: 'all' | PayoutStatus; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'paid', label: 'Paid' },
  { id: 'pending', label: 'Pending' },
  { id: 'in_transit', label: 'In transit' },
  { id: 'failed', label: 'Failed' },
  { id: 'canceled', label: 'Canceled' },
]

const ALL_TRANSACTIONS: TransactionRow[] = generateTransactionRows(80)

function filterByStatus(rows: TransactionRow[], status: 'all' | TransactionStatus): TransactionRow[] {
  if (status === 'all') return rows
  return rows.filter((row) => row.status === status)
}

function getStatusCounts(rows: TransactionRow[]): Record<'all' | TransactionStatus, number> {
  const counts: Record<string, number> = { all: rows.length }
  for (const row of rows) {
    counts[row.status] = (counts[row.status] ?? 0) + 1
  }
  return counts as Record<'all' | TransactionStatus, number>
}

function filterByPayoutStatus(rows: PayoutRow[], status: 'all' | PayoutStatus): PayoutRow[] {
  if (status === 'all') return rows
  return rows.filter((row) => row.status === status)
}

function getPayoutStatusCounts(rows: PayoutRow[]): Record<'all' | PayoutStatus, number> {
  const counts: Record<string, number> = { all: rows.length }
  for (const row of rows) {
    counts[row.status] = (counts[row.status] ?? 0) + 1
  }
  return counts as Record<'all' | PayoutStatus, number>
}

type TransactionsLocationState = {
  tab?: TransactionsTabId
  savedListId?: string
  accountId?: string
  accountName?: string
}

export default function TransactionsList() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const state = (location.state ?? null) as TransactionsLocationState | null

  const tabFromUrl = (searchParams.get('tab') ?? undefined) as TransactionsTabId | undefined
  const accountIdFromUrl = searchParams.get('accountId') ?? undefined
  const accountNameFromUrl = searchParams.get('accountName') ?? undefined

  const stateTab = state?.tab ?? tabFromUrl
  const accountId = state?.accountId ?? accountIdFromUrl
  const accountName = state?.accountName ?? accountNameFromUrl

  const [activeTab, setActiveTab] = useState<TransactionsTabId>(stateTab ?? 'payments')
  const [selectedStatus, setSelectedStatus] = useState<'all' | TransactionStatus>('all')
  const [selectedPayoutStatus, setSelectedPayoutStatus] = useState<'all' | PayoutStatus>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (stateTab) setActiveTab(stateTab)
  }, [stateTab])

  const statusCounts = useMemo(() => getStatusCounts(ALL_TRANSACTIONS), [])
  const filteredRows = useMemo(
    () => filterByStatus(ALL_TRANSACTIONS, selectedStatus),
    [selectedStatus]
  )
  const allPayoutRows = useMemo(() => generatePayoutRows(48), [])
  const payoutStatusCounts = useMemo(() => getPayoutStatusCounts(allPayoutRows), [allPayoutRows])
  const filteredPayoutRows = useMemo(
    () => filterByPayoutStatus(allPayoutRows, selectedPayoutStatus),
    [allPayoutRows, selectedPayoutStatus]
  )

  return (
    <div className="flex h-full w-full flex-col gap-[8px]" data-name="TransactionsList">
      <div className="flex shrink-0 flex-col gap-0">
        <TransactionsPageHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          initialMerchant={accountName ?? undefined}
        />
        {activeTab === 'payments' && (
          <div
            className="flex w-full flex-col gap-[12px] px-[40px] py-[8px]"
            data-name="Saved list"
          >
            <div className="flex w-full shrink-0 items-center gap-[8px]" data-name="Saved Views 2.0">
              {TRANSACTION_STATUS_CHIPS.map((chip) => (
                <ViewChip
                  key={chip.id}
                  label={chip.label}
                  count={statusCounts[chip.id] ?? 0}
                  active={selectedStatus === chip.id}
                  onClick={() => setSelectedStatus(chip.id)}
                />
              ))}
            </div>
            <SearchBar
              value={searchQuery}
              onSearchChange={setSearchQuery}
              placeholder="Search by amount, description, or date"
              searchAriaLabel="Search by amount, description, or date"
            />
          </div>
        )}
        {activeTab === 'payouts' && (
          <div
            className="flex w-full flex-col gap-[12px] px-[40px] py-[8px]"
            data-name="Saved list"
          >
            <div className="flex w-full shrink-0 items-center gap-[8px]" data-name="Saved Views 2.0">
              {PAYOUT_STATUS_CHIPS.map((chip) => (
                <ViewChip
                  key={chip.id}
                  label={chip.label}
                  count={payoutStatusCounts[chip.id] ?? 0}
                  active={selectedPayoutStatus === chip.id}
                  onClick={() => setSelectedPayoutStatus(chip.id)}
                />
              ))}
            </div>
            <SearchBar
              value={searchQuery}
              onSearchChange={setSearchQuery}
              placeholder="Search by amount, description, or date"
              searchAriaLabel="Search by amount, description, or date"
            />
          </div>
        )}
        {activeTab !== 'payments' && activeTab !== 'payouts' && (
          <div className="px-[40px] pt-5 pb-[8px]">
            <SearchBar
              value={searchQuery}
              onSearchChange={setSearchQuery}
              placeholder="Search by amount, description, or date"
              searchAriaLabel="Search by amount, description, or date"
            />
          </div>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-auto px-[40px] pb-6">
        {activeTab === 'payments' && <TransactionsTable rows={filteredRows} />}
        {activeTab === 'payouts' && <PayoutsTable rows={filteredPayoutRows} />}
        {activeTab !== 'payments' && activeTab !== 'payouts' && (
          <div className="font-label-medium text-subdued py-8">
            {activeTab === 'top-ups' && 'Top ups — placeholder'}
            {activeTab === 'platform-fees' && 'Platform fees — placeholder'}
            {activeTab === 'transfers' && 'Transfers to connected accounts — placeholder'}
          </div>
        )}
      </div>
      {accountId && accountName && (
        <ReturnToAccountFloating accountId={accountId} accountName={accountName} />
      )}
    </div>
  )
}
