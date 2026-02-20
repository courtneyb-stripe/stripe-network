/**
 * NetworkMetrics — Two metric cards (Financial, Accounts) with dropdowns.
 * Values depend on current list view (tab + status + search).
 */

import { useEffect, useState } from 'react'
import { Icon } from '../icons/SailIcons'
import { getFilteredRows, parseLtv, type SavedViewId, type CustomerViewId } from './NetworkTable'
import type { NetworkTabId } from './NetworkPageHeader'

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
const TIME_RANGE_OPTIONS = ['Last 7 days', 'Last 30 days', 'Last 90 days', 'Last 12 months', 'All time'] as const

type FinancialMetric = (typeof FINANCIAL_OPTIONS)[number]
type AccountsMetric = (typeof ACCOUNTS_OPTIONS)[number]
type TimeRange = (typeof TIME_RANGE_OPTIONS)[number]

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

function DropdownButton<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  emphasized = false,
}: {
  value: T
  options: readonly T[]
  onChange: (v: T) => void
  ariaLabel: string
  emphasized?: boolean
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setOpen(false)}
        className={`inline-flex items-center gap-1 rounded-[length:var(--radius-xsmall)] text-subdued transition-colors hover:text-default focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary ${emphasized ? 'font-label-medium-emphasized' : 'font-label-medium'}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
      >
        <span>{value}</span>
        <Icon name="chevronDown" size={8} fill="var(--color-icon-subdued)" />
      </button>
      {open && (
        <ul
          className="absolute top-full left-0 z-10 mt-1 min-w-[140px] rounded-[length:var(--radius-small)] border border-neutral-50 bg-surface py-1 shadow-lg"
          role="listbox"
        >
          {options.map((opt) => (
            <li key={opt} role="option" aria-selected={opt === value}>
              <button
                type="button"
                className="w-full px-3 py-1.5 text-left font-label-medium text-default hover:bg-offset focus:bg-offset focus:outline-none"
                onMouseDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onChange(opt)
                  setOpen(false)
                }}
              >
                {opt}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function MetricValueSkeleton() {
  return (
    <div className="flex items-baseline gap-2" aria-hidden>
      <div className="h-8 w-24 rounded-[3px] bg-neutral-50 animate-pulse" />
      <div className="h-4 w-10 rounded-[3px] bg-neutral-50 animate-pulse" />
    </div>
  )
}

export default function NetworkMetrics({
  activeTab = 'all',
  statusViewId = '1',
  customerViewId = 'c1',
  searchQuery = '',
}: {
  activeTab?: NetworkTabId
  statusViewId?: SavedViewId
  customerViewId?: CustomerViewId
  searchQuery?: string
}) {
  const viewId = activeTab === 'customers' ? customerViewId : statusViewId
  const [financialLoading, setFinancialLoading] = useState(true)
  const [accountsLoading, setAccountsLoading] = useState(true)
  const [financialMetric, setFinancialMetric] = useState<FinancialMetric>('Lifetime value')
  const [accountsMetric, setAccountsMetric] = useState<AccountsMetric>('Total accounts')
  const [financialTime, setFinancialTime] = useState<TimeRange>('Last 30 days')
  const [accountsTime, setAccountsTime] = useState<TimeRange>('Last 30 days')

  // Financial card: loading only when list view or this card’s metric/time range changes
  useEffect(() => {
    setFinancialLoading(true)
    const t = setTimeout(() => setFinancialLoading(false), LOAD_DELAY_MS)
    return () => clearTimeout(t)
  }, [activeTab, viewId, searchQuery, financialMetric, financialTime])

  // Accounts card: loading only when list view or this card’s metric/time range changes
  useEffect(() => {
    setAccountsLoading(true)
    const t = setTimeout(() => setAccountsLoading(false), LOAD_DELAY_MS)
    return () => clearTimeout(t)
  }, [activeTab, viewId, searchQuery, accountsMetric, accountsTime])

  const rows = getFilteredRows(
    activeTab,
    statusViewId,
    searchQuery,
    activeTab === 'customers' ? customerViewId : undefined
  )
  const totalAccounts = rows.length
  const ltvTotal = rows.reduce((sum, r) => sum + parseLtv(r.lifetimeValue), 0)
  const newInPeriod = countNewInPeriod(rows)

  const financial = getFinancialDisplay(financialMetric, financialTime, ltvTotal)
  const accounts = getAccountsDisplay(accountsMetric, accountsTime, totalAccounts, newInPeriod)

  const isPositiveChange = (s: string) => s.startsWith('+')

  return (
    <div
      className="grid w-full shrink-0 grid-cols-2 gap-2 px-[40px] py-2"
      data-name="Metrics row"
      data-node-id="5:5052"
    >
      {/* Card 1 — Financial */}
      <div
        className="flex min-w-0 flex-col gap-3 rounded-[12px] border border-neutral-50 bg-surface p-4"
        data-name="Financial metric card"
      >
        <div className="flex w-full items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <DropdownButton
              value={financialMetric}
              options={FINANCIAL_OPTIONS}
              onChange={setFinancialMetric}
              ariaLabel="Financial metric"
              emphasized
            />
            {financialLoading ? (
              <MetricValueSkeleton />
            ) : (
              <div className="flex items-baseline gap-1">
                <span className="font-heading-large-subdued tabular-nums">{financial.value}</span>
                <span
                  className="font-label-small-emphasized"
                  style={{ color: isPositiveChange(financial.change) ? 'var(--color-feedback-success-on)' : 'var(--color-subdued)' }}
                >
                  {financial.change}
                </span>
              </div>
            )}
          </div>
          <DropdownButton
            value={financialTime}
            options={TIME_RANGE_OPTIONS}
            onChange={setFinancialTime}
            ariaLabel="Time range"
          />
        </div>
      </div>

      {/* Card 2 — Accounts */}
      <div
        className="flex min-w-0 flex-col gap-3 rounded-[12px] border border-neutral-50 bg-surface p-4"
        data-name="Accounts metric card"
      >
        <div className="flex w-full items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <DropdownButton
              value={accountsMetric}
              options={ACCOUNTS_OPTIONS}
              onChange={setAccountsMetric}
              ariaLabel="Accounts metric"
              emphasized
            />
            {accountsLoading ? (
              <MetricValueSkeleton />
            ) : (
              <div className="flex items-baseline gap-1">
                <span className="font-heading-large-subdued tabular-nums">{accounts.value}</span>
                <span
                  className="font-label-small-emphasized"
                  style={{ color: isPositiveChange(accounts.change) ? 'var(--color-feedback-success-on)' : 'var(--color-subdued)' }}
                >
                  {accounts.change}
                </span>
              </div>
            )}
          </div>
          <DropdownButton
            value={accountsTime}
            options={TIME_RANGE_OPTIONS}
            onChange={setAccountsTime}
            ariaLabel="Time range"
          />
        </div>
      </div>
    </div>
  )
}
