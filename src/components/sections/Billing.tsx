/**
 * Billing section — Layout from Figma 20:9762, 20:9764, 20:9772, 20:9780, 20:10301, 20:10302.
 * ViewChips (2) at top, Balances section (same style as Overview: SectionHeader + offset container + BalancesCard row cards), Subscriptions, Invoices.
 */

import { useState, useMemo, useRef, useEffect } from 'react'
import AccountDrawer from '../AccountDrawer'
import BalancesCard from '../BalancesCard'
import { ViewChip } from '../NetworkFilterGroup'
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
    <div ref={rootRef} className="flex w-full flex-col gap-6">
      <div className="flex w-full gap-[40px]">
        {/* Main content */}
        <div className="flex min-w-0 flex-1 flex-col gap-6" data-node-id="20:9762">
          {/* Balances first (when Cactus) so first heading is 24px from tab bar */}
          {isCactus && (
            <div className="flex w-full flex-col gap-2">
              <SectionHeader title="Balances" size="small" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-[16px] bg-offset p-2">
                <BalancesCard
                  variant="amountRight"
                  iconName="balance"
                  label="Invoice balance"
                  subtitle="Current"
                  value="$0.00"
                />
                <BalancesCard
                  variant="amountRight"
                  iconName="balance"
                  label="Cash account balance"
                  subtitle="Available"
                  value="$2.00"
                />
              </div>
            </div>
          )}

          {/* Paid to view chips — below Balances; Figma 20:10301, 20:10302 */}
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

          {/* Subscriptions — 40px below when Balances/chips above; else 24px from tab bar */}
          <div className={`flex flex-col gap-3 ${isCactus ? 'pt-[40px]' : ''}`}>
            <SectionHeader
              title="Subscriptions"
              size="small"
              onAction={() => {}}
              onAdd={() => {}}
              actionLabel="View all"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-[8px] gap-y-[8px]">
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
                  <SubscriptionCard
                    planName="Starter plan"
                    badges={[{ label: 'Active', variant: 'success' }]}
                    invoiceFrequencyValue="Monthly on 1st"
                    nextInvoiceValue="Mar 1 for $29.00"
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
                  <SubscriptionCard
                    planName="Enterprise plan"
                    badges={[{ label: 'Pending', variant: 'attention' }]}
                    invoiceFrequencyValue="Yearly on Jan 1"
                    nextInvoiceValue="Jan 1, 2026 for $12,000.00"
                    onNextInvoiceClick={() => {}}
                  />
                </>
              )}
            </div>
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
            <InvoicesTable
              rows={invoiceRows}
              onRowClick={() => setInvoiceDrawerOpen(true)}
            />
            <p className="text-[14px] text-default">
              {invoiceRows.length} of <span className="text-action-primary">{invoiceTotalCount}</span> items
            </p>
          </div>

          {/* Credit grants table placeholder */}
          <div className="flex flex-col gap-2 rounded-[12px] bg-offset p-4">
            <p className="text-[14px] text-subdued">Credit grants table</p>
          </div>

          <AccountDrawer
            open={invoiceDrawerOpen}
            onClose={() => setInvoiceDrawerOpen(false)}
            variant="invoice-details"
          />
        </div>
        {/* Sidebar — gray placeholder */}
        <div className="flex min-w-[320px] w-[30%] shrink-0 flex-col rounded-[12px] bg-offset px-4 py-3">
          <p className="text-[12px] leading-4 text-subdued">Default payment methods</p>
        </div>
      </div>
    </div>
  )
}
