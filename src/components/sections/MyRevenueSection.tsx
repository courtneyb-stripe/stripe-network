/**
 * "As your customer" tab content for V2 (Money movement) account detail.
 * Sections: Revenue metrics, Subscriptions (Figma **6269:117627**), Money movement, Invoices, Purchases.
 */

import { useState, useMemo, useEffect } from 'react'
import AccountDrawer from '../AccountDrawer'
import MetricCard from '../metrics/MetricCard'
import { SimpleMetricCardSkeleton } from '../metrics/MetricCard'
import MetricDropdown from '../metrics/MetricDropdown'
import { TIME_RANGE_OPTIONS, type TimeRange } from '../metrics/constants'
import SectionHeader from '../SectionHeader'
import TableSkeleton from '../TableSkeleton'
import { MoneyMovementViewChipsRow } from '../MoneyMovementViewChipsRow'
import InlineListPagination from '../InlineListPagination'
import SubscriptionCard from '../SubscriptionCard'
import { IconButton } from '../IconButton'
import { PlusIcon } from '../../icons/PlusIcon'
import { usePrototypeOptional } from '../../context/PrototypeContext'
import {
  getDefaultMoneyMovementTransactionTabs,
  getMyRevenueMoneyMovementTabs,
  MONEY_MOVEMENT_TABLE_SKELETON_ROW_COUNT,
} from '../../data/moneyMovementTransactionTabs'
import { isValidMoneyMovementTypeSelection } from '../../data/moneyMovementViewChips'
import { INLINE_LIST_TOTALS, totalResultsForMoneyMovementChip } from '../../constants/inlineListMocks'
import { slugToDisplayName } from '../../utils/string'
import {
  buildMoneyMovementFullListLink,
  buildTransactionsListPath,
  transactionsListLinkState,
} from '../../utils/transactionsDeepLinks'

const MY_REVENUE_FALLBACK_TABS = getDefaultMoneyMovementTransactionTabs().filter(
  (t) => t.id === 'payments' || t.id === 'collected-fees'
)

const INVOICE_TABLE_ROWS = 10
const PURCHASE_TABLE_ROWS = 10

/** Matches subscriptions carousel header “10 of 13 results” (prototype). */
const MY_REVENUE_SUBSCRIPTION_INLINE = { pageEnd: 10, total: 13 } as const

export type MyRevenueSectionProps = {
  onRowClick?: () => void
  accountName?: string
  accountId?: string
}

const TOYBOX_LABS_ACCOUNT_ID = 'toybox-labs'
const TOYBOX_LABS_ACCOUNT_NAME = 'Toybox Labs'

export default function MyRevenueSection({
  onRowClick,
  accountName,
  accountId,
}: MyRevenueSectionProps = {}) {
  const prototype = usePrototypeOptional()
  const isLowFidelity = prototype?.fidelity === 'low'
  const [timeRange, setTimeRange] = useState<TimeRange>('Last 30 days')
  const [moneyMovementTypeId, setMoneyMovementTypeId] = useState('all')
  const [invoiceDrawerOpen, setInvoiceDrawerOpen] = useState(false)
  const [purchaseDrawerOpen, setPurchaseDrawerOpen] = useState(false)

  const moneyMovementTabs = useMemo(
    () =>
      prototype != null
        ? getMyRevenueMoneyMovementTabs(prototype.activeRoles, prototype.billingEnabled)
        : MY_REVENUE_FALLBACK_TABS,
    [prototype]
  )

  useEffect(() => {
    if (isValidMoneyMovementTypeSelection(moneyMovementTypeId, moneyMovementTabs)) return
    setMoneyMovementTypeId('all')
  }, [moneyMovementTabs, moneyMovementTypeId])

  const mmAccountId = accountId ?? TOYBOX_LABS_ACCOUNT_ID
  const mmAccountLabel =
    accountId === TOYBOX_LABS_ACCOUNT_ID
      ? TOYBOX_LABS_ACCOUNT_NAME
      : accountId != null
        ? slugToDisplayName(accountId)
        : accountName ?? TOYBOX_LABS_ACCOUNT_NAME

  const mmListLink = buildMoneyMovementFullListLink({
    accountId: mmAccountId,
    accountName: mmAccountLabel,
    moneyMovementTypeId,
    savedListId: 'toybox',
  })

  const invoicesListPath = buildTransactionsListPath('platform-fees', {
    accountId: mmAccountId,
    accountName: mmAccountLabel,
  })
  const invoicesListState = transactionsListLinkState({
    tab: 'platform-fees',
    accountId: mmAccountId,
    accountName: mmAccountLabel,
  })

  const purchasesListPath = '/network'

  return (
    <div className="flex min-w-0 max-w-[1120px] flex-1 flex-col" style={{ gap: 40 }}>
      <div className="flex flex-col gap-4">
        <SectionHeader
          title={accountName ? `Revenue from ${accountName}` : 'Revenue'}
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
              <MetricCard variant="simple" label="Revenue" value="$8.2K" />
              <MetricCard variant="simple" label="Volume" value="$32.1K" />
              <MetricCard variant="simple" label="Transactions" value="892" />
            </>
          )}
        </div>
      </div>

      {/* Subscriptions — Figma Sections/Subscriptions 6269:117627 */}
      <div className="flex flex-col gap-4" data-node-id="6269:117627" data-name="Sections/Subscriptions">
        <div className="flex min-h-7 w-full items-center gap-4">
          <p
            className="min-w-0 shrink-0 whitespace-pre-wrap text-[20px] font-bold leading-[28px] tracking-0 text-page-header-ink"
            style={{ fontFeatureSettings: "'lnum' 1, 'pnum' 1" }}
          >
            Subscriptions
          </p>
          <span className="ml-auto shrink-0 font-label-small leading-4 text-subdued tabular-nums">
            {MY_REVENUE_SUBSCRIPTION_INLINE.pageEnd} of {MY_REVENUE_SUBSCRIPTION_INLINE.total} results
          </span>
          <IconButton
            label="Add subscription"
            tooltipId="my-revenue-subscriptions-add"
            variant="sectionHeader"
            onClick={() => {}}
          >
            <PlusIcon size={12} fill="var(--color-action-primary)" />
          </IconButton>
        </div>
        <div
          className="-mx-1 flex min-w-0 gap-2 overflow-x-auto pb-1 pt-0 [scrollbar-width:thin]"
          data-name="Carousel"
        >
          <SubscriptionCard
            className="min-w-[320px] max-w-[422px] shrink-0"
            planName="Professional plan"
            badges={[
              { label: 'Update scheduled', variant: 'neutral' },
              { label: 'Active', variant: 'success' },
            ]}
            invoiceFrequencyValue="Monthly on day 1"
            nextInvoiceValue="Sep 28"
            servicePeriodValue="Sep 15–Oct 14"
            onNextInvoiceClick={() => {}}
          />
          <SubscriptionCard
            className="min-w-[320px] max-w-[422px] shrink-0"
            planName="Basic plan"
            badges={[{ label: 'Trial ending', variant: 'attention' }]}
            invoiceFrequencyValue="Weekly on Tue"
            nextInvoiceValue="Sep 12 for $12.00"
            onNextInvoiceClick={() => {}}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <SectionHeader title="Money movement" size="small" />
        <div className="flex flex-col gap-4" data-mm-type={moneyMovementTypeId}>
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

      <div className="flex flex-col gap-4">
        <SectionHeader title="Invoices" size="small" />
        <TableSkeleton
          rowCount={INVOICE_TABLE_ROWS}
          showCheckboxColumn={false}
          onRowClick={() => setInvoiceDrawerOpen(true)}
        />
        <InlineListPagination
          pageStart={1}
          pageEnd={INVOICE_TABLE_ROWS}
          totalResults={INLINE_LIST_TOTALS.invoices}
          to={invoicesListPath}
          linkState={invoicesListState}
        />
      </div>

      <div className="flex flex-col gap-4">
        <SectionHeader title="Purchases" size="small" />
        <TableSkeleton
          rowCount={PURCHASE_TABLE_ROWS}
          showCheckboxColumn={false}
          onRowClick={() => setPurchaseDrawerOpen(true)}
        />
        <InlineListPagination
          pageStart={1}
          pageEnd={PURCHASE_TABLE_ROWS}
          totalResults={INLINE_LIST_TOTALS.purchases}
          to={purchasesListPath}
        />
      </div>

      <AccountDrawer open={invoiceDrawerOpen} onClose={() => setInvoiceDrawerOpen(false)} variant="invoice-details" />
      <AccountDrawer open={purchaseDrawerOpen} onClose={() => setPurchaseDrawerOpen(false)} variant="product-details" />
    </div>
  )
}
