/**
 * Dummy network data: 1200 accounts, ~70% merchants (Merchant, Customer), ~30% customers only.
 * Merchants are also customers, so they appear in both Merchants and Customers tabs.
 */

export type StatusKind = 'enabled' | 'restricted_soon' | 'restricted' | null

export type NetworkRow = {
  id: string
  status: StatusKind
  /** When true, account appears in Radar rule matches view and Risk column shows High. */
  isRadarRuleMatch: boolean
  account: string
  email: string
  configurations: string
  lastTransaction: string
  lifetimeValue: string
  dateAdded: string
  // Customer segment flags (used for Customer tab saved lists)
  isTopSpender: boolean
  isSubscriber: boolean
  isInternational: boolean
  highRefunds: boolean
  highDisputes: boolean
  last30Days: boolean
}

const BUSINESS_PREFIX = [
  'Acme', 'Summit', 'North', 'Metro', 'River', 'Hartley', 'Pine', 'Blue', 'Swift', 'Global',
  'Prime', 'Apex', 'Elite', 'Vertex', 'Nova', 'Atlas', 'Cedar', 'Stone', 'Bright', 'Core',
]
const BUSINESS_SUFFIX = [
  'Corp', 'Inc', 'Labs', 'Group', 'Co', 'Industries', 'Solutions', 'Services', 'Partners', 'Ventures',
  'Systems', 'Tech', 'Digital', 'Commerce', 'Supply', 'Logistics', 'Design', 'Studio', 'Works', 'Hub',
]
const FIRST_NAMES = [
  'David', 'Sarah', 'Olivia', 'James', 'Emily', 'Michael', 'Emma', 'Daniel', 'Sophie', 'Chris',
  'Anna', 'Ryan', 'Maya', 'Alex', 'Lisa', 'Kevin', 'Julia', 'Mark', 'Rachel', 'Tom',
]
const LAST_NAMES = [
  'Chen', 'Mitchell', 'Rodriguez', 'Wilson', 'Johnson', 'Brown', 'Lee', 'Martinez', 'Taylor', 'Clark',
  'Davis', 'Garcia', 'Moore', 'White', 'Harris', 'Martin', 'Thompson', 'Lewis', 'Walker', 'Hall',
]
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length]
}

function formatDate(month: string, day: number, year?: number): string {
  const y = year != null ? `, ${year}` : ''
  return `${month} ${day}${y}`
}

/** ~70% merchants (840), ~30% customer-only (360) = 1200 total.
 * Only merchants get a status; customer-only accounts always have status null and are never radar rule matches. */
export function generateNetworkRows(): NetworkRow[] {
  const rows: NetworkRow[] = []
  const MERCHANT_COUNT = 840
  const CUSTOMER_ONLY_COUNT = 360
  const TOTAL = MERCHANT_COUNT + CUSTOMER_ONLY_COUNT

  for (let i = 0; i < TOTAL; i++) {
    const isMerchant = i < MERCHANT_COUNT
    const config = isMerchant ? 'Merchant, Customer' : 'Customer'
    // Merchants only: weighted status; customer-only always null. ~10% of merchants are radar rule matches.
    const r = i % 20
    const status: StatusKind = isMerchant
      ? (r <= 8 ? 'enabled' : r <= 13 ? 'restricted' : r === 14 ? 'restricted_soon' : r <= 18 ? null : 'enabled')
      : null
    const isRadarRuleMatch = isMerchant && (r >= 15 && r <= 16)

    let account: string
    let email: string
    let id: string

    if (isMerchant) {
      const p = pick(BUSINESS_PREFIX, i)
      const s = pick(BUSINESS_SUFFIX, Math.floor(i / 20))
      account = `${p} ${s}`
      const slug = `${p}-${s}-${i}`.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      id = slug
      email = `billing@${slug}.com`
    } else {
      const j = i - MERCHANT_COUNT
      const first = pick(FIRST_NAMES, j)
      const last = pick(LAST_NAMES, Math.floor(j / 20))
      account = `${first} ${last}`
      id = `${first.toLowerCase()}-${last.toLowerCase()}-${j}`
      email = `${first.toLowerCase()}.${last.toLowerCase()}@example.com`
    }

    const ltvRaw = (i * 12345) % 500000 + 500
    const ltvFormatted = (ltvRaw / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const month = pick(MONTHS, i)
    const day = (i % 28) + 1
    const year = i % 5 === 0 ? 2024 : undefined
    const lastTransaction = `${month} ${day}, ${(i % 12)}:${(i % 60).toString().padStart(2, '0')} ${i % 2 ? 'AM' : 'PM'}`
    const dateAdded = year != null ? formatDate(month, day, year) : `${month} ${day}, ${(i % 12)}:${(i % 60).toString().padStart(2, '0')} ${i % 2 ? 'AM' : 'PM'}`

    // Customer segment flags (deterministic for dummy data)
    const isTopSpender = ltvRaw > 350000 // ~top 12%
    const isSubscriber = i % 5 === 0 // ~20%
    const isInternational = i % 4 === 0 // ~25%
    const highRefunds = i % 10 === 1 // ~10%
    const highDisputes = i % 12 === 2 // ~8%
    const last30Days = i % 3 === 0 // ~33%

    rows.push({
      id,
      status,
      isRadarRuleMatch,
      account,
      email,
      configurations: config,
      lastTransaction,
      lifetimeValue: `$${ltvFormatted}`,
      dateAdded,
      isTopSpender,
      isSubscriber,
      isInternational,
      highRefunds,
      highDisputes,
      last30Days,
    })
  }

  return rows
}
