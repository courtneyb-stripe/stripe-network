/**
 * Config-driven account detail: defines sections and features per config type.
 * AccountDetail.tsx reads configType from the account and renders sections from this map.
 */

export type ConfigType = 'merchant' | 'customer' | 'borrower' | 'radarRuleMatches'

/** Blocks shown in the Overview section. Omit or empty = overview shows nothing beyond layout. */
export type OverviewBlockId = 'balances' | 'recentTransactions' | 'recentActivity'

export type AccountConfig = {
  showLogo: boolean
  showPayouts: boolean
  showCollectedFees: boolean
  showCustomers: boolean
  sections: readonly string[]
  /** Which blocks to show in the Overview section. Drives Overview section component. */
  overviewBlocks: readonly OverviewBlockId[]
}

export const configTemplates: Record<ConfigType, AccountConfig> = {
  merchant: {
    showLogo: true,
    showPayouts: true,
    showCollectedFees: true,
    showCustomers: true,
    sections: ['overview', 'moneyMovement', 'billing', 'products'],
    overviewBlocks: ['balances', 'recentTransactions', 'recentActivity'],
  },
  customer: {
    showLogo: false,
    showPayouts: false,
    showCollectedFees: false,
    showCustomers: false,
    sections: ['overview', 'billing', 'paymentMethods'],
    overviewBlocks: ['balances', 'recentTransactions', 'recentActivity'],
  },
  borrower: {
    showLogo: false,
    showPayouts: false,
    showCollectedFees: false,
    showCustomers: false,
    sections: ['overview', 'loanDetails', 'repayments'],
    overviewBlocks: ['balances'],
  },
  radarRuleMatches: {
    showLogo: true,
    showPayouts: true,
    showCollectedFees: true,
    showCustomers: true,
    sections: ['overview', 'moneyMovement', 'billing', 'products'],
    overviewBlocks: ['balances', 'recentTransactions', 'recentActivity'],
  },
}

/** Section id -> display label for tabs */
export const SECTION_LABELS: Record<string, string> = {
  overview: 'Overview',
  moneyMovement: 'Money management',
  billing: 'Your business',
  products: 'Products',
  theirBusiness: 'Their business',
  paymentMethods: 'Payment methods',
  loanDetails: 'Loan details',
  repayments: 'Repayments',
}
