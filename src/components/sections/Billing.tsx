/**
 * Billing section — Layout from Figma 20:9762, 20:9764, 20:9772, 20:9780, 20:10301, 20:10302.
 * ViewChips (2) at top, Balances section (same style as Overview: SectionHeader + offset container + BalancesCard row cards), Subscriptions, Invoices.
 */

import { useState, useMemo, useRef, useEffect } from 'react'
import AccountDrawer from '../AccountDrawer'
import BalancesCard from '../BalancesCard'
import { ViewChip } from '../NetworkFilterGroup'
import { usePrototypeOptional } from '../../context/PrototypeContext'
import SectionHeader from '../SectionHeader'
import SubscriptionCard from '../SubscriptionCard'
import InvoicesTable, { generateInvoiceRows, generateInvoiceRowsAlt } from '../InvoicesTable'

const BILLING_CHIPS = [
  { id: 'cactus', label: 'Billed by Cactus Practice' },
  { id: 'toybox', label: 'Billed by Toybox Labs' },
] as const

const INVOICE_ROWS = 10
const TOYBOX_INVOICE_TOTAL = 8907

export default function Billing() {
  const prototype = usePrototypeOptional()
  const activityFilter = prototype?.activityFilter ?? 'viewChip'
  const iaVariant = prototype?.iaVariant ?? 'v1'
  const loFiMode = prototype?.loFiMode ?? false
  const v3LoFi = iaVariant === 'v3' && loFiMode
  const showViewChips = activityFilter === 'viewChip' && iaVariant === 'v1'
  const [activeChipId, setActiveChipId] = useState<string>(BILLING_CHIPS[0].id)
  const [invoiceDrawerOpen, setInvoiceDrawerOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const savedScrollTopRef = useRef<number | null>(null)

  const isCactus = activeChipId === 'cactus'

  useEffect(() => {
    if (savedScrollTopRef.current === null) return
    const scrollContainer = rootRef.current?.closest('.overflow-auto') as HTMLElement | null
    if (scrollContainer) {
      scrollContainer.scrollTop = savedScrollTopRef.current
      savedScrollTopRef.current = null
    }
  }, [activeChipId])

  const handleChipClick = (chipId: string) => {
    const scrollContainer = rootRef.current?.closest('.overflow-auto') as HTMLElement | null
    if (scrollContainer) savedScrollTopRef.current = scrollContainer.scrollTop
    setActiveChipId(chipId)
  }
  const invoiceRows = useMemo(
    () => (isCactus ? generateInvoiceRows(INVOICE_ROWS) : generateInvoiceRowsAlt(INVOICE_ROWS)),
    [isCactus]
  )
  const invoiceTotalCount = isCactus ? INVOICE_ROWS : TOYBOX_INVOICE_TOTAL

  return (
    <div ref={rootRef} className="flex min-w-0 flex-1 flex-col gap-6">
      <div className="flex min-w-0 flex-1 flex-col gap-6" data-node-id="20:9762">
          {/* Paid to view chips — only in V1; V2/V3 match (no chips) */}
          {showViewChips && (
            <div className="flex flex-wrap items-center gap-2">
              {BILLING_CHIPS.map((chip) => (
                <ViewChip
                  key={chip.id}
                  label={chip.label}
                  active={activeChipId === chip.id}
                  onClick={() => handleChipClick(chip.id)}
                  size="compact"
                />
              ))}
            </div>
          )}

          {/* Subscriptions */}
          <div className="flex flex-col gap-3">
            <SectionHeader
              title="Subscriptions"
              size="small"
              onAction={() => {}}
              onAdd={() => {}}
              actionLabel="View all"
            />
            {iaVariant === 'v3' && (
              <p className="text-[14px] text-subdued">with Toybox Labs</p>
            )}
            {v3LoFi ? (
              <div className="flex items-center rounded-[12px] bg-offset px-4 py-4">
                <p className="text-[14px] text-subdued">Subscriptions</p>
              </div>
            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-[8px] gap-y-[8px]">
              {isCactus ? (
                <>
                  <SubscriptionCard
                    planName="Basic plan"
                    badges={[
                      { label: 'Active', variant: 'success' },
                      { label: 'Update scheduled', variant: 'neutral' },
                    ]}
                    invoiceFrequencyValue="Weekly on Tue"
                    nextInvoiceValue="Sep 12 for $12.00"
                    onMoreClick={() => {}}
                    onNextInvoiceClick={() => {}}
                  />
                  <SubscriptionCard
                    planName="Professional plan"
                    badges={[
                      { label: 'Unpaid', variant: 'critical' },
                      { label: 'Paused', variant: 'neutral' },
                    ]}
                    invoiceFrequencyValue="Yearly on Jan 1"
                    nextInvoiceValue="Sep 8 for $120.00"
                    onMoreClick={() => {}}
                    onNextInvoiceClick={() => {}}
                  />
                </>
              ) : (
                <>
                  <SubscriptionCard
                    planName="Growth plan"
                    badges={[{ label: 'Past due', variant: 'critical' }]}
                    invoiceFrequencyValue="Monthly on 15th"
                    nextInvoiceValue="Mar 15 for $199.00"
                    onNextInvoiceClick={() => {}}
                  />
                  <SubscriptionCard
                    planName="Team plan"
                    badges={[
                      { label: 'Active', variant: 'success' },
                      { label: 'Update scheduled', variant: 'neutral' },
                    ]}
                    invoiceFrequencyValue="Quarterly"
                    nextInvoiceValue="Apr 1 for $599.00"
                    onNextInvoiceClick={() => {}}
                  />
                </>
              )}
            </div>
            )}
          </div>

          {/* Invoices — 40px below Subscriptions; Figma 20:9812 */}
          <div className="flex flex-col gap-3 pt-[40px]">
            <SectionHeader
              title="Invoices"
              size="small"
              onAction={() => {}}
              onAdd={() => {}}
              actionLabel="View all"
            />
            {iaVariant === 'v3' && (
              <p className="text-[14px] text-subdued">with Toybox Labs</p>
            )}
            {v3LoFi ? (
              <div className="flex items-center rounded-[12px] bg-offset px-4 py-4">
                <p className="text-[14px] text-subdued">Invoices</p>
              </div>
            ) : (
            <>
            <InvoicesTable
              rows={invoiceRows}
              onRowClick={() => setInvoiceDrawerOpen(true)}
            />
            <p className="text-[14px] text-default">
              {invoiceRows.length} of <span className="text-action-primary">{invoiceTotalCount}</span> items
            </p>
            </>
            )}
          </div>

          {/* Credit grants table placeholder */}
          <div className="flex flex-col gap-2 pt-[40px]">
            {v3LoFi ? (
              <div className="flex items-center rounded-[12px] bg-offset px-4 py-4">
                <p className="text-[14px] text-subdued">Credit grants table</p>
              </div>
            ) : (
              <div className="rounded-[12px] bg-offset p-4">
                <p className="text-[14px] text-subdued">Credit grants table</p>
              </div>
            )}
          </div>

          <AccountDrawer
            open={invoiceDrawerOpen}
            onClose={() => setInvoiceDrawerOpen(false)}
            variant="invoice-details"
          />
      </div>
    </div>
  )
}

/** Billing tab sidebar: balances (no section header) + payment methods placeholder. Used only when Billing tab is active. */
export function BillingSidebar() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <BalancesCard
          variant="amountRight"
          iconName="balance"
          label="Invoice balance"
          subtitle="Current"
          value="$0.00"
          valueAlign="right"
        />
        <BalancesCard
          variant="amountRight"
          iconName="balance"
          label="Cash account balance"
          subtitle="Available"
          value="$2.00"
          valueAlign="right"
        />
      </div>
      <div
        className="flex items-center rounded-[12px] bg-offset px-4 py-4"
        data-name="Sidebar placeholder: Payment methods"
      >
        <p className="text-[14px] text-subdued">Payment methods — placeholder</p>
      </div>
    </div>
  )
}
