/**
 * NetworkMetrics — Two metric cards (Financial, Accounts) with dropdowns.
 * Uses shared MetricCard and MetricDropdown; values depend on list view (tab + status + search).
 */

import { useEffect, useState } from 'react'
import { getFilteredRows, parseLtv, type SavedViewId, type CustomerViewId } from './NetworkTable'
import type { NetworkTabId } from './NetworkPageHeader'
import MetricCard from './metrics/MetricCard'
import { TIME_RANGE_OPTIONS, type TimeRange } from './metrics/constants'

function formatLtv(total: number): string {
  if (total >= 1e6) return `$${(total / 1e6).toFixed(2)}M`
  if (total >= 1e3) return `$${(total / 1e3).toFixed(2)}K`
  return `$${total.toFixed(2)}`
}

/** Count rows considered "new" in period (dummy: dateAdded contains "Feb"). */
function countNewInPeriod(rows: { dateAdded: string }[]): number {
  return rows.filter((r) => r.dateAdded.startsWith('Feb')).length
}

const FINANCIAL_OPTIONS = ['Lifetime value', 'All funds in', 'All funds out'] as const
const ACCOUNTS_OPTIONS = ['Total accounts', 'New accounts', 'Churned accounts'] as const

type FinancialMetric = (typeof FINANCIAL_OPTIONS)[number]
type AccountsMetric = (typeof ACCOUNTS_OPTIONS)[number]

/** Simulated load delay (ms) before showing metric values. */
const LOAD_DELAY_MS = 1800

/** Simulated time-range multiplier (0–1) for financial metrics. */
const TIME_RANGE_MULT: Record<TimeRange, number> = {
  'Last 7 days': 0.08,
  'Last 30 days': 0.28,
  'Last 90 days': 0.62,
  'Last 12 months': 0.92,
  'All time': 1,
}

/** Simulated financial value and % change by metric + time range. */
function getFinancialDisplay(
  metric: FinancialMetric,
  timeRange: TimeRange,
  ltvTotal: number
): { value: string; change: string } {
  const mult = TIME_RANGE_MULT[timeRange]
  if (metric === 'Lifetime value') {
    const v = ltvTotal * mult
    return { value: formatLtv(v), change: mult <= 0.28 ? '+12.4%' : mult <= 0.62 ? '+8.9%' : mult < 1 ? '+5.2%' : '+2.1%' }
  }
  if (metric === 'All funds in') {
    const v = ltvTotal * mult * 0.4
    return { value: formatLtv(v), change: mult <= 0.28 ? '+15.1%' : mult <= 0.62 ? '+9.3%' : '+4.8%' }
  }
  // All funds out
  const v = ltvTotal * mult * 0.35
  return { value: formatLtv(v), change: mult <= 0.28 ? '+11.2%' : mult <= 0.62 ? '+7.1%' : '+3.4%' }
}

/** Simulated accounts value and % change by metric + time range. */
function getAccountsDisplay(
  metric: AccountsMetric,
  timeRange: TimeRange,
  totalAccounts: number,
  newInPeriod: number
): { value: string; change: string } {
  const mult = TIME_RANGE_MULT[timeRange]
  if (metric === 'Total accounts') {
    const totalInRange = Math.round(totalAccounts * (0.85 + mult * 0.15))
    return { value: totalInRange.toLocaleString(), change: mult <= 0.28 ? '+4.2%' : mult <= 0.62 ? '+3.0%' : mult < 1 ? '+2.1%' : '+1.2%' }
  }
  if (metric === 'New accounts') {
    const newCount = Math.max(0, Math.round(newInPeriod * mult * 3.5))
    return { value: String(newCount), change: mult <= 0.28 ? '+18.5%' : mult <= 0.62 ? '+8.2%' : '+3.1%' }
  }
  // Churned accounts
  const churned = Math.round(totalAccounts * (1 - mult) * 0.12)
  const changeNum = mult <= 0.28 ? -2.4 : mult <= 0.62 ? -1.8 : -0.9
  return { value: String(churned), change: `${changeNum}%` }
}

export default function NetworkMetrics({
  activeTab = 'all',
  statusViewId = '1',
  customerViewId = 'c1',
  searchQuery = '',
  selectedMerchant = 'Shopify',
}: {
  activeTab?: NetworkTabId
  statusViewId?: SavedViewId
  customerViewId?: CustomerViewId
  searchQuery?: string
  selectedMerchant?: string
}) {
  const viewId = activeTab === 'customers' ? customerViewId : statusViewId
  const [financialLoading, setFinancialLoading] = useState(true)
  const [accountsLoading, setAccountsLoading] = useState(true)
  const [financialMetric, setFinancialMetric] = useState<FinancialMetric>('Lifetime value')
  const [accountsMetric, setAccountsMetric] = useState<AccountsMetric>('Total accounts')
  const [financialTime, setFinancialTime] = useState<TimeRange>('Last 30 days')
  const [accountsTime, setAccountsTime] = useState<TimeRange>('Last 30 days')

  const rows = getFilteredRows(
    activeTab,
    statusViewId,
    searchQuery,
    activeTab === 'customers' ? customerViewId : undefined
  )
  const totalAccounts = rows.length
  const ltvTotal = rows.reduce((sum, r) => sum + parseLtv(r.lifetimeValue), 0)
  const newInPeriod = countNewInPeriod(rows)

  const isShopify = selectedMerchant === 'Shopify'

  // Financial card: loading only when list view or this card's metric/time range changes
  useEffect(() => {
    setFinancialLoading(true)
    const t = setTimeout(() => setFinancialLoading(false), LOAD_DELAY_MS)
    return () => clearTimeout(t)
  }, [activeTab, viewId, searchQuery, financialMetric, financialTime])

  // Accounts card: loading only when list view or this card's metric/time range changes
  useEffect(() => {
    setAccountsLoading(true)
    const t = setTimeout(() => setAccountsLoading(false), LOAD_DELAY_MS)
    return () => clearTimeout(t)
  }, [activeTab, viewId, searchQuery, accountsMetric, accountsTime])

  const financial = getFinancialDisplay(financialMetric, financialTime, ltvTotal)
  const accounts = getAccountsDisplay(accountsMetric, accountsTime, totalAccounts, newInPeriod)

  if (!isShopify) {
    return (
      <div
        className="grid w-full shrink-0 grid-cols-2 gap-2 px-[40px] py-2"
        data-name="Metrics row"
        data-node-id="5:5052"
      >
        <MetricCard variant="simple" label="Total spend" value={formatLtv(ltvTotal)} />
        <MetricCard variant="simple" label="Total accounts" value={totalAccounts.toLocaleString()} />
      </div>
    )
  }

  return (
    <div
      className="grid w-full shrink-0 grid-cols-2 gap-2 px-[40px] py-2"
      data-name="Metrics row"
      data-node-id="5:5052"
    >
      <MetricCard
        variant="compact"
        metricValue={financial.value}
        metricOptions={FINANCIAL_OPTIONS}
        metricValueCurrent={financialMetric}
        onMetricChange={(v) => setFinancialMetric(v as FinancialMetric)}
        timeOptions={TIME_RANGE_OPTIONS}
        timeValue={financialTime}
        onTimeChange={(v) => setFinancialTime(v as TimeRange)}
        change={financial.change}
        loading={financialLoading}
      />
      <MetricCard
        variant="compact"
        metricValue={accounts.value}
        metricOptions={ACCOUNTS_OPTIONS}
        metricValueCurrent={accountsMetric}
        onMetricChange={(v) => setAccountsMetric(v as AccountsMetric)}
        timeOptions={TIME_RANGE_OPTIONS}
        timeValue={accountsTime}
        onTimeChange={(v) => setAccountsTime(v as TimeRange)}
        change={accounts.change}
        loading={accountsLoading}
      />
    </div>
  )
}
