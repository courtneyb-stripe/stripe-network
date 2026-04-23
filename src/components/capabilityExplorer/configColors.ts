import type { ConfigurationId } from '../../data/capabilityModel'

/** Platform-network role order (spec) — dot color is stable per config. */
export const PLATFORM_NETWORK_CONFIG_IDS: readonly ConfigurationId[] = [
  'merchant',
  'customer',
  'recipient',
  'gp_recipient',
  'storer',
  'borrower',
  'card_issuer',
] as const

export const CONFIGURATION_DOT_COLOR: Partial<Record<ConfigurationId, string>> = {
  merchant: '#3B82F6',
  customer: '#F97316',
  recipient: '#06B6D4',
  gp_recipient: '#14B8A6', // teal — distinct from cyan (recipient family)
  storer: '#EF4444',
  borrower: '#A855F7',
  card_issuer: '#10B981',
  /** Derived configs — preview / identity; when parent is active the dot uses the parent color instead. */
  card_holder: '#EAB308',
  merchant_customer: '#EAB308',
}
