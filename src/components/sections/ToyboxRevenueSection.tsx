/**
 * "As a business" tab — merchant-side revenue & billing surfaces (V2 account detail).
 * Money received (payouts / transfers), Payments collected, Billing (invoices / subscriptions),
 * products, and directory links to nested list shells.
 */

import { useMemo, useState } from 'react'
import AccountDrawer from '../AccountDrawer'
import MetricCard from '../metrics/MetricCard'
import { SimpleMetricCardSkeleton } from '../metrics/MetricCard'
import MetricDropdown from '../metrics/MetricDropdown'
import { TIME_RANGE_OPTIONS, type TimeRange } from '../metrics/constants'
import SectionHeader from '../SectionHeader'
import TableSkeleton from '../TableSkeleton'
import InlineListPagination from '../InlineListPagination'
import { ViewChip } from '../listView/ViewChip'
import { usePrototypeOptional } from '../../context/PrototypeContext'
import { INLINE_LIST_TOTALS, totalResultsForMoneyMovementChip } from '../../constants/inlineListMocks'
import { configTemplates, type ConfigType } from '../../data/accountConfigs'
import { NETWORK_CARD_ISSUER_DEMO } from '../../data/networkAudience'
import { getAccountById } from '../../data/mockAccounts'
import { slugToDisplayName } from '../../utils/string'
import {
  buildTransactionsListPath,
  transactionsListLinkState,
} from '../../utils/transactionsDeepLinks'
import {
  accountDirectoryPath,
  accountSubscriptionsPath,
} from '../../utils/accountNestedListPaths'

function PlaceholderBox({ label, dataName }: { label: string; dataName?: string }) {
  return (
    <div
      className="flex min-h-[80px] items-center rounded-[12px] bg-offset px-4 py-4"
      data-name={dataName}
    >
      <p className="text-[14px] text-subdued">{label}</p>
    </div>
  )
}

export type ToyboxRevenueSectionProps = {
  onRowClick?: () => void
  accountName?: string
  accountId?: string
}

const TOYBOX_LABS_ACCOUNT_ID = 'toybox-labs'

const TABLE_ROWS = 10
const PRODUCT_ROWS = 10
const NETWORK_ROWS = 10

type BillingChipId = 'invoices' | 'subscriptions'

export default function ToyboxRevenueSection({
  onRowClick,
  accountId,
}: ToyboxRevenueSectionProps = {}) {
  const prototype = usePrototypeOptional()
  const isLowFidelity = prototype?.fidelity === 'low'
  const [timeRange, setTimeRange] = useState<TimeRange>('Last 30 days')
  const [moneyReceivedKind, setMoneyReceivedKind] = useState<'payouts' | 'transfers'>('payouts')
  const [billingChip, setBillingChip] = useState<BillingChipId>('invoices')
  const [productDrawerOpen, setProductDrawerOpen] = useState(false)

  const routeAccountId = accountId ?? TOYBOX_LABS_ACCOUNT_ID
  const mockAccount = accountId != null ? getAccountById(accountId) : undefined
  const configType: ConfigType = mockAccount?.configType ?? 'merchant'
  const cfg = configTemplates[configType]

  const businessInvoicesPath = `/network/${routeAccountId}/invoices`

  const showPayouts = cfg.showPayouts
  const showTransfers = configType === 'merchant' || configType === 'radarRuleMatches'
  const showMoneyReceivedShell = showPayouts || showTransfers
  const showBothMoneyReceivedKinds = showPayouts && showTransfers

  const moneyReceivedTitle = !showMoneyReceivedShell
    ? null
    : showBothMoneyReceivedKinds
      ? 'Money received'
      : showPayouts
        ? 'Payouts'
        : 'Transfers'

  const moneyReceivedKindEffective: 'payouts' | 'transfers' = showBothMoneyReceivedKinds
    ? moneyReceivedKind
    : showPayouts
      ? 'payouts'
      : 'transfers'

  const routeAccountLabel = mockAccount?.name ?? slugToDisplayName(routeAccountId)

  const toyboxTxnQuery = useMemo(
    () => ({
      savedList: 'toybox' as const,
      accountId: routeAccountId,
      accountName: routeAccountLabel,
    }),
    [routeAccountId, routeAccountLabel],
  )

  const moneyReceivedTxTab = moneyReceivedKindEffective === 'payouts' ? 'payouts' : 'transfers'
  const moneyReceivedListPath = buildTransactionsListPath(moneyReceivedTxTab, toyboxTxnQuery)
  const moneyReceivedLinkState = transactionsListLinkState({
    tab: moneyReceivedTxTab,
    savedListId: 'toybox',
    accountId: routeAccountId,
    accountName: routeAccountLabel,
  })

  const paymentsCollectedPath = buildTransactionsListPath('payments', toyboxTxnQuery)
  const paymentsCollectedLinkState = transactionsListLinkState({
    tab: 'payments',
    savedListId: 'toybox',
    accountId: routeAccountId,
    accountName: routeAccountLabel,
  })

  const subscriptionsPath = accountSubscriptionsPath(routeAccountId)

  const showBillingStrip = configType === 'merchant' || configType === 'radarRuleMatches'

  const billingPaginationPath = billingChip === 'invoices' ? businessInvoicesPath : subscriptionsPath
  const billingTotal =
    billingChip === 'invoices' ? INLINE_LIST_TOTALS.invoices : INLINE_LIST_TOTALS.subscriptions

  const directoryLinks = useMemo(() => {
    const base: { id: 'customers' | 'recipients' | 'card-holders'; label: string }[] = [
      { id: 'customers', label: 'Customers' },
      { id: 'recipients', label: 'Recipients' },
    ]
    if (NETWORK_CARD_ISSUER_DEMO && (configType === 'merchant' || configType === 'radarRuleMatches')) {
      base.push({ id: 'card-holders', label: 'Card holders' })
    }
    return base
  }, [configType])

  const [networkSegment, setNetworkSegment] = useState<'customers' | 'recipients' | 'card-holders'>(
    'customers',
  )

  const networkListPath = accountDirectoryPath(routeAccountId, networkSegment)

  return (
    <div className="flex min-w-0 max-w-[1120px] flex-1 flex-col" style={{ gap: 40 }}>
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
              <MetricCard variant="simple" label="Revenue" value="$12.4K" />
              <MetricCard variant="simple" label="Net volume" value="$48.2K" />
              <MetricCard variant="simple" label="Transactions" value="1,247" />
            </>
          )}
        </div>
      </div>

      {showMoneyReceivedShell && moneyReceivedTitle != null ? (
        <div className="flex flex-col gap-4">
          <SectionHeader title={moneyReceivedTitle} size="small" />
          {showBothMoneyReceivedKinds ? (
            <div className="flex flex-wrap items-center gap-2">
              <ViewChip
                visualVariant="list"
                label="Payouts"
                active={moneyReceivedKind === 'payouts'}
                onClick={() => setMoneyReceivedKind('payouts')}
              />
              <ViewChip
                visualVariant="list"
                label="Transfers"
                active={moneyReceivedKind === 'transfers'}
                onClick={() => setMoneyReceivedKind('transfers')}
              />
            </div>
          ) : null}
          <TableSkeleton rowCount={TABLE_ROWS} showCheckboxColumn={false} onRowClick={onRowClick} />
          <InlineListPagination
            pageStart={1}
            pageEnd={TABLE_ROWS}
            totalResults={totalResultsForMoneyMovementChip(moneyReceivedKindEffective)}
            to={moneyReceivedListPath}
            linkState={moneyReceivedLinkState}
          />
        </div>
      ) : null}

      {cfg.showCollectedFees ? (
        <div className="flex flex-col gap-4">
          <SectionHeader title="Payments collected" size="small" />
          <TableSkeleton rowCount={TABLE_ROWS} showCheckboxColumn={false} onRowClick={onRowClick} />
          <InlineListPagination
            pageStart={1}
            pageEnd={TABLE_ROWS}
            totalResults={INLINE_LIST_TOTALS.paymentsCollected}
            to={paymentsCollectedPath}
            linkState={paymentsCollectedLinkState}
          />
        </div>
      ) : null}

      {showBillingStrip ? (
        <div className="flex flex-col gap-4">
          <SectionHeader title="Billing" size="small" />
          <div className="flex flex-wrap items-center gap-2">
            <ViewChip
              visualVariant="list"
              label="Invoices"
              active={billingChip === 'invoices'}
              onClick={() => setBillingChip('invoices')}
            />
            <ViewChip
              visualVariant="list"
              label="Subscriptions"
              active={billingChip === 'subscriptions'}
              onClick={() => setBillingChip('subscriptions')}
            />
          </div>
          <TableSkeleton rowCount={TABLE_ROWS} showCheckboxColumn={false} onRowClick={onRowClick} />
          <InlineListPagination
            pageStart={1}
            pageEnd={TABLE_ROWS}
            totalResults={billingTotal}
            to={billingPaginationPath}
          />
        </div>
      ) : null}

      <div className="flex flex-col gap-4">
        <SectionHeader title="Products" size="small" />
        <TableSkeleton
          rowCount={PRODUCT_ROWS}
          showCheckboxColumn={false}
          onRowClick={() => setProductDrawerOpen(true)}
        />
        <InlineListPagination
          pageStart={1}
          pageEnd={PRODUCT_ROWS}
          totalResults={INLINE_LIST_TOTALS.products}
          to="/network"
        />
      </div>

      <div className="flex flex-col gap-4">
        <SectionHeader title="Network" size="small" />
        <div className="flex flex-wrap items-center gap-2">
          {directoryLinks.map((d) => (
            <ViewChip
              key={d.id}
              visualVariant="list"
              label={d.label}
              active={networkSegment === d.id}
              onClick={() => setNetworkSegment(d.id)}
            />
          ))}
        </div>
        <TableSkeleton rowCount={NETWORK_ROWS} showCheckboxColumn={false} onRowClick={onRowClick} />
        <InlineListPagination
          pageStart={1}
          pageEnd={NETWORK_ROWS}
          totalResults={INLINE_LIST_TOTALS.network}
          to={networkListPath}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PlaceholderBox label="Tax forms — placeholder" dataName="Tax forms placeholder" />
        <PlaceholderBox label="Reports — placeholder" dataName="Reports placeholder" />
      </div>

      <AccountDrawer open={productDrawerOpen} onClose={() => setProductDrawerOpen(false)} variant="product-details" />
    </div>
  )
}
