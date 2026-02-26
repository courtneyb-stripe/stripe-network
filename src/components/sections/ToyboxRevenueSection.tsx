/**
 * Toybox Lab's revenue section for V2 (Money movement) account detail tab.
 * Same sections as My revenue except no Monetization; Transactions tabs: Payments, Payouts, Transfers, Global payouts received.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AccountDrawer from '../AccountDrawer'
import MetricCard from '../metrics/MetricCard'
import { SimpleMetricCardSkeleton } from '../metrics/MetricCard'
import MetricDropdown from '../metrics/MetricDropdown'
import { TIME_RANGE_OPTIONS, type TimeRange } from '../metrics/constants'
import SectionHeader from '../SectionHeader'
import TabBar from '../TabBar'
import TableSkeleton from '../TableSkeleton'
import { usePrototypeOptional } from '../../context/PrototypeContext'

const TRANSACTION_TABS = [
  { id: 'payments', label: 'Payments' },
  { id: 'payouts', label: 'Payouts' },
  { id: 'transfers', label: 'Transfers' },
  { id: 'global-payouts-received', label: 'Global payouts received' },
] as const

function PlaceholderBox({ label, dataName }: { label: string; dataName?: string }) {
  return (
    <div
      className="rounded-[12px] bg-offset px-4 py-4 min-h-[80px] flex items-center"
      data-name={dataName}
    >
      <p className="text-[14px] text-subdued">{label}</p>
    </div>
  )
}

export type ToyboxRevenueSectionProps = {
  /** When set, skeleton table rows are clickable and call this (e.g. open preview drawer). */
  onRowClick?: () => void
  /** Account name for section header (optional). */
  accountName?: string
}

const TOYBOX_LABS_ACCOUNT_ID = 'toybox-labs'
const TOYBOX_LABS_ACCOUNT_NAME = 'Toybox Labs'

export default function ToyboxRevenueSection({ onRowClick, accountName }: ToyboxRevenueSectionProps = {}) {
  const navigate = useNavigate()
  const prototype = usePrototypeOptional()
  const isLowFidelity = prototype?.fidelity === 'low'
  const [timeRange, setTimeRange] = useState<TimeRange>('Last 30 days')
  const [transactionsTab, setTransactionsTab] = useState<string>(TRANSACTION_TABS[0].id)
  const [invoiceDrawerOpen, setInvoiceDrawerOpen] = useState(false)
  const [productDrawerOpen, setProductDrawerOpen] = useState(false)

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
  return (
    <div className="flex min-w-0 max-w-[1120px] flex-1 flex-col" style={{ gap: 40 }}>
      <div className="flex flex-col gap-0">
        <SectionHeader
          title="Volume"
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
        {/* Metric cards row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {isLowFidelity ? (
          <>
            <SimpleMetricCardSkeleton />
            <SimpleMetricCardSkeleton />
            <SimpleMetricCardSkeleton />
          </>
        ) : (
          <>
            <MetricCard variant="simple" label="Revenue" value="$12.4K" />
            <MetricCard variant="simple" label="Volume" value="$48.2K" />
            <MetricCard variant="simple" label="Transactions" value="1,247" />
          </>
        )}
        </div>
      </div>
      {/* Subscriptions */}
      <div className="flex flex-col gap-2">
        <SectionHeader title="Subscriptions" size="small" onAction={() => {}} onAdd={() => {}} actionLabel="View all" />
        <PlaceholderBox label="Subscriptions content placeholder" dataName="Placeholder: Subscriptions" />
      </div>

      {/* Recent transactions */}
      <div className="flex flex-col gap-2">
        <SectionHeader title="Recent transactions" size="small" onAction={openTransactionsFilteredByToyboxLabs} actionLabel="View all" />
        <TabBar
          tabs={TRANSACTION_TABS.map((t) => ({ id: t.id, label: t.label }))}
          activeId={transactionsTab}
          onChange={setTransactionsTab}
          variant="secondary"
          gap={6}
        />
        <TableSkeleton rowCount={10} showCheckboxColumn={false} onRowClick={onRowClick} />
      </div>

      {/* Invoices */}
      <div className="flex flex-col gap-2">
        <SectionHeader title="Invoices" size="small" onAction={() => {}} onAdd={() => {}} actionLabel="View all" />
        <TableSkeleton rowCount={10} showCheckboxColumn={false} onRowClick={() => setInvoiceDrawerOpen(true)} />
      </div>

      {/* Products */}
      <div className="flex flex-col gap-2">
        <SectionHeader title="Products" size="small" onAction={() => {}} onAdd={() => {}} actionLabel="View all" />
        <TableSkeleton rowCount={10} showCheckboxColumn={false} onRowClick={() => setProductDrawerOpen(true)} />
      </div>
      <AccountDrawer
        open={invoiceDrawerOpen}
        onClose={() => setInvoiceDrawerOpen(false)}
        variant="invoice-details"
      />
      <AccountDrawer
        open={productDrawerOpen}
        onClose={() => setProductDrawerOpen(false)}
        variant="product-details"
      />
    </div>
  )
}
