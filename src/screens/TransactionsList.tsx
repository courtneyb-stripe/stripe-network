/**
 * TransactionsList — Full transactions view: overflow primary tabs, saved-list chips (payments/payouts),
 * search + account filter well, abstracted table body (skeleton).
 */

import { useState, useEffect, useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import TransactionsPageHeader, {
  parseTransactionsTabFromUrl,
  type TransactionsTabId,
} from '../components/TransactionsPageHeader'
import ReturnToAccountFloating from '../components/ReturnToAccountFloating'
import TransactionsTablePanel from '../components/TransactionsTablePanel'
import InlineListPagination from '../components/InlineListPagination'
import SearchBar from '../components/SearchBar'
import { ViewChip } from '../components/NetworkFilterGroup'
import {
  ListViewBody,
  ListViewHeaderStack,
  ListViewRoot,
  M1FilterGroupFrame,
} from '../components/listView/ListViewTemplates'
import { Icon } from '../icons/SailIcons'
import { moneyMovementChipIdForTransactionsTab } from '../utils/transactionsDeepLinks'
import { totalResultsForMoneyMovementChip } from '../constants/inlineListMocks'
import { MONEY_MOVEMENT_TABLE_SKELETON_ROW_COUNT } from '../data/moneyMovementTransactionTabs'
import { generatePayoutRows, type PayoutStatus } from '../components/PayoutsTable'
import { generateTransactionRows, type TransactionStatus } from '../components/TransactionsTable'

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

const ALL_TRANSACTIONS = generateTransactionRows(80)
const ALL_PAYOUT_ROWS = generatePayoutRows(48)

function getStatusCounts(rows: typeof ALL_TRANSACTIONS): Record<'all' | TransactionStatus, number> {
  const counts: Record<string, number> = { all: rows.length }
  for (const row of rows) {
    counts[row.status] = (counts[row.status] ?? 0) + 1
  }
  return counts as Record<'all' | TransactionStatus, number>
}

function getPayoutStatusCounts(rows: ReturnType<typeof generatePayoutRows>): Record<'all' | PayoutStatus, number> {
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
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const state = (location.state ?? null) as TransactionsLocationState | null

  const tabFromUrl = searchParams.get('tab')
  const accountIdFromUrl = searchParams.get('accountId') ?? undefined
  const accountNameFromUrl = searchParams.get('accountName') ?? undefined
  const savedListFromUrl = searchParams.get('savedList') ?? undefined

  const resolvedTab = parseTransactionsTabFromUrl(state?.tab ?? tabFromUrl ?? null)
  const accountId = state?.accountId ?? accountIdFromUrl
  const accountName = state?.accountName ?? accountNameFromUrl

  const [activeTab, setActiveTab] = useState<TransactionsTabId>(resolvedTab)
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<'all' | TransactionStatus>('all')
  const [selectedPayoutStatus, setSelectedPayoutStatus] = useState<'all' | PayoutStatus>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    setActiveTab(parseTransactionsTabFromUrl(state?.tab ?? tabFromUrl ?? null))
  }, [state?.tab, tabFromUrl])

  const clearAccountFilter = () => {
    const qs = new URLSearchParams()
    qs.set('tab', activeTab)
    if (savedListFromUrl != null && savedListFromUrl !== '') qs.set('savedList', savedListFromUrl)
    navigate(`/transactions?${qs.toString()}`, { replace: true })
  }

  const ADD_FILTER_DEFAULT_ACCOUNT = { id: 'toybox-labs', name: 'Toybox Labs' }
  const applyAddFilter = () => {
    navigate(
      `/transactions?tab=${activeTab}&accountId=${encodeURIComponent(ADD_FILTER_DEFAULT_ACCOUNT.id)}&accountName=${encodeURIComponent(ADD_FILTER_DEFAULT_ACCOUNT.name)}${savedListFromUrl != null && savedListFromUrl !== '' ? `&savedList=${encodeURIComponent(savedListFromUrl)}` : ''}`,
      { replace: true }
    )
  }

  const commitTabToUrl = (tabId: TransactionsTabId) => {
    setActiveTab(tabId)
    const qs = new URLSearchParams()
    qs.set('tab', tabId)
    if (savedListFromUrl != null && savedListFromUrl !== '') qs.set('savedList', savedListFromUrl)
    if (accountId != null && accountId !== '') qs.set('accountId', accountId)
    if (accountName != null && accountName !== '') qs.set('accountName', accountName)
    navigate(`/transactions?${qs.toString()}`, { replace: true })
  }

  const statusCounts = useMemo(() => getStatusCounts(ALL_TRANSACTIONS), [])
  const payoutStatusCounts = useMemo(() => getPayoutStatusCounts(ALL_PAYOUT_ROWS), [])
  const tableFooterTotal = useMemo(
    () => totalResultsForMoneyMovementChip(moneyMovementChipIdForTransactionsTab(activeTab)),
    [activeTab]
  )

  const searchBarProps = {
    value: searchQuery,
    onSearchChange: setSearchQuery,
    placeholder: 'Search by amount, description, or date',
    searchAriaLabel: 'Search by amount, description, or date',
    activeFilter:
      accountId && accountName
        ? {
            label: 'Account',
            value: accountName,
            onClear: clearAccountFilter,
            clearAriaLabel: `Remove account filter ${accountName}`,
          }
        : null,
    onAddFilterClick: applyAddFilter,
  }

  return (
    <ListViewRoot dataName="TransactionsList">
      <ListViewHeaderStack>
        <TransactionsPageHeader activeTab={activeTab} onTabChange={commitTabToUrl} />
        <M1FilterGroupFrame className="px-6">
          {(activeTab === 'payments' || activeTab === 'payouts') && (
            <div className="flex w-full min-w-0 shrink-0 flex-wrap items-center gap-2" data-name="Chip Row">
              {activeTab === 'payments' &&
                TRANSACTION_STATUS_CHIPS.map((chip) => (
                  <ViewChip
                    key={chip.id}
                    visualVariant="list"
                    label={chip.label}
                    count={statusCounts[chip.id] ?? 0}
                    active={selectedPaymentStatus === chip.id}
                    onClick={() => setSelectedPaymentStatus(chip.id)}
                  />
                ))}
              {activeTab === 'payouts' &&
                PAYOUT_STATUS_CHIPS.map((chip) => (
                  <ViewChip
                    key={chip.id}
                    visualVariant="list"
                    label={chip.label}
                    count={payoutStatusCounts[chip.id] ?? 0}
                    active={selectedPayoutStatus === chip.id}
                    onClick={() => setSelectedPayoutStatus(chip.id)}
                  />
                ))}
              <button
                type="button"
                aria-label="More views"
                className="flex size-9 shrink-0 items-center justify-center overflow-clip rounded-[8px] border border-neutral-50 bg-surface transition-colors hover:bg-offset focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-action-primary"
                data-name="More Views"
              >
                <Icon name="more" size={16} fill="var(--color-icon-default)" />
              </button>
            </div>
          )}
          <SearchBar {...searchBarProps} layoutVariant="listToolbar" />
        </M1FilterGroupFrame>
      </ListViewHeaderStack>
      <ListViewBody className="px-6 pb-6">
        <TransactionsTablePanel activeTab={activeTab} />
        <InlineListPagination
          pageStart={1}
          pageEnd={MONEY_MOVEMENT_TABLE_SKELETON_ROW_COUNT}
          totalResults={tableFooterTotal}
        />
      </ListViewBody>
      {accountId && accountName && (
        <ReturnToAccountFloating accountId={accountId} accountName={accountName} />
      )}
    </ListViewRoot>
  )
}
