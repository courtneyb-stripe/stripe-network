/**
 * Capabilities — account-status-aware. Status (active/paused/paused_soon/inactive) is derived
 * from account status so enabled accounts have payments/payouts active; restricted accounts
 * have them paused.
 */

export type CapabilityStatus = 'active' | 'paused' | 'paused_soon' | 'inactive'

export type CapabilityItem = {
  id: string
  title: string
  description: string
  linkLabel?: string
  status: CapabilityStatus
}

/** Same shape as AccountStatusKind from AccountDetailsSidebar. */
type AccountStatusForCapabilities = 'enabled' | 'restricted' | 'restricted_soon' | undefined

type CapabilityDef = Omit<CapabilityItem, 'status'>

const DEFINITIONS: CapabilityDef[] = [
  { id: 'card-payments', title: 'Card payments', description: 'Allows the account to process their own card and ACH debit payments from their customers', linkLabel: 'Read docs' },
  { id: 'transfers', title: 'Transfers', description: 'Allows your platform to transfer funds to the connected account', linkLabel: 'Read docs' },
  { id: 'affirm', title: 'Affirm payments', description: 'Allows the account to process their own Affirm payments from their customers', linkLabel: 'Read docs' },
  { id: 'afterpay', title: 'Afterpay Clearpay payments', description: 'Allows the account to process their own Afterpay Clearpay payments from their customers', linkLabel: 'Read docs' },
  { id: 'klarna', title: 'Klarna payments', description: 'Allows the account to process their own Klarna payments from their customers', linkLabel: 'Read docs' },
  { id: 'link', title: 'Link payments', description: 'Allows the account to process their own Link payments from their customers', linkLabel: 'Read docs' },
  { id: 'pix', title: 'Pix payments', description: 'Allows the account to process their own Pix payments from their customers', linkLabel: 'Read docs' },
  { id: 'sepa-bank-transfer', title: 'SEPA Bank Transfer payments', description: 'Allows the account to process their own Sepa Bank Transfer payments (EUR) from their customers', linkLabel: 'Read docs' },
  { id: 'canadian-pad', title: 'Canadian pre-authorized debit payments', description: 'Allows the account to process their own Canadian pre-authorized debit payments from their customers', linkLabel: 'Read docs' },
  { id: 'amazon-pay', title: 'Amazon Pay payments', description: 'Allows the account to process their own Amazon Pay payments from their customers', linkLabel: 'Read docs' },
  { id: 'bancontact', title: 'Bancontact payments', description: 'Allows the account to process their own Bancontact payments from their customers', linkLabel: 'Read docs' },
  { id: 'cartes-bancaires', title: 'Cartes Bancaires payments', description: 'Allows the account to process their own Cartes Bancaires payments from their customers', linkLabel: 'Read docs' },
  { id: 'cash-app-pay', title: 'Cash App Pay payments', description: 'Allows the account to process their own Cash App Pay payments from their customers', linkLabel: 'Read docs' },
  { id: 'eps', title: 'EPS payments', description: 'Allows the account to process their own EPS payments from their customers', linkLabel: 'Read docs' },
  { id: 'ideal', title: 'iDEAL payments', description: 'Allows the account to process their own iDEAL payments from their customers', linkLabel: 'Read docs' },
  { id: 'kakao-pay', title: 'Kakao Pay payments', description: 'Allows the account to process their own Kakao Pay payments from their customers', linkLabel: 'Read docs' },
  { id: 'korean-cards', title: 'Korean cards payments', description: 'Allows the account to process their own Korean cards payments from their customers', linkLabel: 'Read docs' },
  { id: 'mb-way', title: 'MB WAY payments', description: 'Allow the account to access mb_way_payments capability' },
  { id: 'multibanco', title: 'Multibanco payments', description: 'Allows the account to process their own Multibanco payments from their customers', linkLabel: 'Read docs' },
  { id: 'naver-pay', title: 'Naver Pay payments', description: 'Allows the account to process their own Naver Pay payments from their customers', linkLabel: 'Read docs' },
  { id: 'p24', title: 'P24 payments', description: 'Allows the account to process their own P24 payments from their customers', linkLabel: 'Read docs' },
  { id: 'payco', title: 'PAYCO payments', description: 'Allows the account to process their own PAYCO payments from their customers', linkLabel: 'Read docs' },
  { id: 'samsung-pay', title: 'Samsung Pay payments', description: 'Allows the account to process their own Samsung Pay payments from their customers', linkLabel: 'Read docs' },
  { id: 'sepa-direct-debit', title: 'SEPA Direct Debit payments', description: 'Allows the account to process their own Sepa Debit payments from their customers', linkLabel: 'Read docs' },
  { id: 'tax-1099k', title: 'Tax reporting (US 1099-K)', description: 'Collects the required information from the account to file a US 1099-K form through Stripe' },
  { id: 'tax-1099misc', title: 'Tax reporting (US 1099-MISC)', description: 'Collects the required information from the account to file a US 1099-MISC form through Stripe' },
  { id: 'ach-direct-debit', title: 'ACH Direct Debit payments', description: 'Allows the account to process their own ACH Direct Debit payments from their customers', linkLabel: 'Read docs' },
  { id: 'us-bank-transfer', title: 'US Bank Transfer payments', description: 'Allows the account to process their own US Bank Transfer payments (USD) from their customers', linkLabel: 'Read docs' },
  { id: 'wechat-pay', title: 'WeChat Pay payments', description: 'Allows the account to process their own WeChat Pay payments from their customers', linkLabel: 'Read docs' },
  { id: 'zip', title: 'Zip payments', description: 'Allows the account to process their own Zip payments from their customers', linkLabel: 'Read docs' },
]

/** For each account status, which capability ids are active / paused / paused_soon. Rest are inactive. */
const STATUS_BY_ACCOUNT: Record<NonNullable<AccountStatusForCapabilities>, Partial<Record<string, CapabilityStatus>>> = {
  enabled: {
    'card-payments': 'active',
    'transfers': 'active',
    'link': 'active',
    'ach-direct-debit': 'active',
    'us-bank-transfer': 'active',
    'sepa-direct-debit': 'active',
    'affirm': 'paused',
    'afterpay': 'paused',
    'klarna': 'paused',
    'pix': 'paused_soon',
    'sepa-bank-transfer': 'paused_soon',
    'multibanco': 'paused_soon',
  },
  restricted: {
    'card-payments': 'paused',
    'transfers': 'paused',
    'affirm': 'paused',
    'afterpay': 'paused',
    'klarna': 'paused',
    'link': 'paused_soon',
    'pix': 'paused_soon',
    'sepa-bank-transfer': 'paused_soon',
  },
  restricted_soon: {
    'card-payments': 'active',
    'transfers': 'active',
    'link': 'active',
    'ach-direct-debit': 'active',
    'us-bank-transfer': 'active',
    'sepa-direct-debit': 'active',
    'affirm': 'paused',
    'afterpay': 'paused',
    'klarna': 'paused',
    'pix': 'paused_soon',
    'sepa-bank-transfer': 'paused_soon',
    'multibanco': 'paused_soon',
  },
}

/** Returns capabilities with status set from account status. When status is undefined (e.g. customer-only), use enabled. */
export function getCapabilitiesWithStatus(accountStatus: AccountStatusForCapabilities): CapabilityItem[] {
  const key = accountStatus ?? 'enabled'
  const statusMap = STATUS_BY_ACCOUNT[key] ?? STATUS_BY_ACCOUNT.enabled
  return DEFINITIONS.map((def) => ({
    ...def,
    status: (statusMap[def.id] ?? 'inactive') as CapabilityStatus,
  }))
}

/** Helpers for sections; pass account status from context. */
export function getActiveCapabilities(accountStatus: AccountStatusForCapabilities): CapabilityItem[] {
  return getCapabilitiesWithStatus(accountStatus).filter((c) => c.status === 'active')
}
export function getPausedCapabilities(accountStatus: AccountStatusForCapabilities): CapabilityItem[] {
  return getCapabilitiesWithStatus(accountStatus).filter((c) => c.status === 'paused')
}
export function getPausedSoonCapabilities(accountStatus: AccountStatusForCapabilities): CapabilityItem[] {
  return getCapabilitiesWithStatus(accountStatus).filter((c) => c.status === 'paused_soon')
}
export function getInactiveCapabilities(accountStatus: AccountStatusForCapabilities): CapabilityItem[] {
  return getCapabilitiesWithStatus(accountStatus).filter((c) => c.status === 'inactive')
}

/** Total count for section header (e.g. "32 Capabilities"). */
export function getCapabilitiesTotalCount(_accountStatus: AccountStatusForCapabilities): number {
  return DEFINITIONS.length
}
