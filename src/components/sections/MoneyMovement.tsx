/**
 * Money management section — 320px sidebar (Financial accounts + Upcoming) + Latest transaction list.
 * Financial accounts heading in sidebar sits 24px below tabs (enforced by parent content area pt-6).
 */

import { useState } from 'react'
import { TIME_RANGE_OPTIONS, type TimeRange } from '../metrics/constants'
import { createPortal } from 'react-dom'
import { useNavigate, useParams } from 'react-router-dom'
import BalancesCard from '../BalancesCard'
import FinancialAccountsSidebar from '../FinancialAccountsSidebar'
import type { FinancialAccountCard } from '../FinancialAccountsSidebar'
import FinancialSnapshot from '../FinancialSnapshot'
import { PropertyList, PropertyListItem } from '../PropertyList'
import SectionHeader from '../SectionHeader'
import TransactionListCard from '../TransactionListCard'
import type { TransactionListRow } from '../TransactionListCard'
import { BrandIcon } from '../../icons/SailIcons'

const FINANCIAL_ACCOUNT_CARDS: FinancialAccountCard[] = [
  { id: 'main', accountName: 'Main', accountMask: '••1547', amount: '$8,092.34' },
  { id: 'savings', accountName: 'Savings', accountMask: '••7782', amount: '$25,092.34' },
]

const LATEST_ROW_TEMPLATES: TransactionListRow[] = [
  { id: '1', transactionType: 'transfer', description: 'Payout to Bank •••• 7280', subline: 'Feb 21 • Completed', amount: '$1,240.00' },
  { id: '2', transactionType: 'card', description: 'Card payment · Coffee Co', subline: 'Feb 20 • Completed', amount: '$47.20' },
  { id: '3', transactionType: 'card', description: 'Subscription · Pro plan', subline: 'Feb 19 • Completed', amount: '$29.00' },
  { id: '4', transactionType: 'transfer', description: 'Platform fee', subline: 'Feb 18 • Completed', amount: '$12.50' },
  { id: '5', transactionType: 'transfer', description: 'Transfer from Acct 9921', subline: 'Feb 17 • Completed', amount: '+$500.00', isCredit: true },
]

const LATEST_ROWS_COUNT = 50
function buildLatestRows(): TransactionListRow[] {
  const rows: TransactionListRow[] = []
  for (let i = 0; i < LATEST_ROWS_COUNT; i++) {
    const t = LATEST_ROW_TEMPLATES[i % LATEST_ROW_TEMPLATES.length]
    rows.push({ ...t, id: String(i + 1) })
  }
  return rows
}
const LATEST_ROWS = buildLatestRows()

const UPCOMING_ROWS: TransactionListRow[] = [
  { id: 'u1', transactionType: 'transfer', description: 'Payout to Bank •••• 7280', subline: 'Mar 1 • Scheduled', amount: '$1,200.00' },
  { id: 'u2', transactionType: 'card', description: 'Subscription renewal · Pro plan', subline: 'Mar 3 • Scheduled', amount: '$29.00' },
  { id: 'u3', transactionType: 'transfer', description: 'Platform fee', subline: 'Mar 5 • Scheduled', amount: '$15.20' },
  { id: 'u4', transactionType: 'transfer', description: 'Payout to Bank •••• 4412', subline: 'Mar 8 • Scheduled', amount: '$2,040.00' },
  { id: 'u5', transactionType: 'card', description: 'Card payment · Estimated', subline: 'Mar 12 • Scheduled', amount: '$—' },
]

export type MoneyMovementProps = {
  /** When set, row click opens shared AccountDrawer (payment-details) instead of local drawer. */
  onTransactionRowClick?: () => void
}

export default function MoneyMovement({ onTransactionRowClick }: MoneyMovementProps = {}) {
  const { id: accountId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [txnDrawerOpen, setTxnDrawerOpen] = useState(false)
  const [selectedTxnId, setSelectedTxnId] = useState<string | null>(null)
  const [financialTimeRange, setFinancialTimeRange] = useState<TimeRange>('Last 30 days')

  const openTxn = (id: string) => {
    if (onTransactionRowClick) {
      onTransactionRowClick()
      return
    }
    setSelectedTxnId(id)
    setTxnDrawerOpen(true)
  }

  const useSharedDrawer = onTransactionRowClick != null
  const drawer = !useSharedDrawer && txnDrawerOpen && (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-transparent" aria-hidden onClick={() => setTxnDrawerOpen(false)} />
      <div className="relative w-full max-w-[400px] border-l border-neutral-100 bg-surface shadow-lg flex flex-col">
        <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
          <h2 className="font-heading-medium text-default">Transaction</h2>
          <button
            type="button"
            onClick={() => setTxnDrawerOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-[4px] text-icon-subdued hover:bg-offset"
            aria-label="Close"
          >
            <svg width={12} height={12} viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4 font-body-small text-subdued">
          Transaction {selectedTxnId ?? '—'} opens here.
        </div>
      </div>
    </div>
  )

  return (
    <>
      <div className="flex w-full flex-col gap-6">
        <div className="flex w-full gap-[40px]">
          {/* Main content: Balances (Figma 29:10264) + Financial snapshot + Latest transactions */}
          <div className="flex min-w-0 flex-1 flex-col gap-10">
            {/* Balances section — content ref Figma 29:10264; built with BalancesCard */}
            <div className="flex w-full flex-col gap-2" data-node-id="29:10264">
              <SectionHeader title="Balances" size="small" onAction={() => {}} actionLabel="View all" />
              <div className="flex flex-col gap-2 rounded-[16px] bg-offset p-2">
                <div className="overflow-hidden rounded-[12px] shadow-[0px_2px_5px_0px_rgba(48,49,61,0.08),0px_1px_1px_0px_rgba(0,0,0,0.12)]">
                  <BalancesCard
                    variant="stackedWithSparkline"
                    iconName="refund"
                    iconRotate={180}
                    label="Total balance"
                    subtitle="3 currencies"
                    value="$4,321.11"
                    valueSubtitle="$2,422.11 available instantly"
                    className="rounded-t-[12px]"
                  />
                  <BalancesCard
                    variant="stacked"
                    iconName="lock"
                    rowBackground="offset"
                    label="Pending"
                    subtitle="1 currency"
                    value="$321.89"
                    compactRow
                    className="rounded-b-[12px]"
                  />
                </div>
                <BalancesCard
                  variant="default"
                  iconName="balance"
                  label="Funds on hold"
                  subtitle="3 currencies"
                  value="$6,382.23"
                  valueSubtitle="$7,600.00 in transit to bank"
                />
              </div>
            </div>
            <FinancialSnapshot
              moneyIn="$84,200.00"
              moneyOut="$36,800.00"
              netFlow="$47,400"
              timeRangeValue={financialTimeRange}
              timeRangeOptions={TIME_RANGE_OPTIONS}
              onTimeRangeChange={setFinancialTimeRange}
            />
            <TransactionListCard
              variant="latest"
              title="Latest transactions"
              accountName="Toybox Labs"
              onRowAction={openTxn}
              rows={LATEST_ROWS}
            />
          </div>
          {/* Sidebar: 30% of container width, min 320px, 40px gap from main. */}
          <div className="flex min-w-[320px] w-[30%] shrink-0 flex-col gap-6">
            <FinancialAccountsSidebar
              accountCards={FINANCIAL_ACCOUNT_CARDS}
              accountId={accountId}
              onHeaderAction={
                accountId
                  ? () => navigate(`/network/${accountId}/financial-accounts`)
                  : undefined
              }
            />
            <TransactionListCard
              variant="upcoming"
              title="Upcoming transactions"
              accountName="Toybox Labs"
              onRowAction={openTxn}
              rows={UPCOMING_ROWS}
            />
            {/* Payout information — 40px below Upcoming transactions */}
            <div className="flex w-full flex-col gap-2 pt-[40px]">
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
      </div>
      {!useSharedDrawer && txnDrawerOpen && drawer && createPortal(drawer, document.body)}
    </>
  )
}
