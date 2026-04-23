/**
 * capabilityModel.ts
 *
 * Standalone reference data derived from the Toolshed doc
 * "Stripe Capability ↔ Product Mapping v2" (stephmitesser, 2026-02-27),
 * which reads from lib/account/capabilities/types/types.rb in pay-server,
 * plus UAD's proposed status signal model and configuration layer.
 *
 * Data layers (bottom up):
 *
 *   granular capability  →  capability group (doc family, ~10)
 *                        →  status signal     (UAD header chip, 7)
 *                        →  configuration    (UAD role pill, 7)
 *
 * Each layer compresses the one below. Products sit off to the side and
 * depend on capability groups via backed/requires/none relationships.
 *
 * A note on naming
 * ────────────────
 * `configMatrix.ts` currently calls the UAD header chips "capability
 * groups" (its CapabilityGroupId = payments | payouts | treasury | ...).
 * UAD's proposed model renames these to "status signals" and frees up
 * "capability group" for the doc-level family. This file uses the new
 * naming. `configMatrix.ts` is left untouched; treat its
 * `CapabilityGroupId` as equivalent to this file's `StatusSignalId`
 * until the prototype migrates.
 *
 * Configuration vs. signal group labels
 * ─────────────────────────────────────
 * Configurations are named after the entity's role. Only Merchant
 * distributes (has its own downstream customers). Most other platform-
 * network configurations have a direct 1:1 relationship with the platform.
 *
 * Two configurations are DERIVED — they're not user-selectable and appear
 * only when their parent configuration is active. They exist as outcomes
 * of network participation, not as independent roles. They contribute no
 * signals themselves (derived items don't drive UAD state; their parent
 * configs do).
 *
 *     Config               →  Signal group                     Relationship    Network
 *     merchant             →  Payments + Payouts               distributes     platform
 *     customer             →  Payments                         direct          platform (no compliance)
 *     recipient            →  Transfers + Payouts              direct          platform
 *     storer               →  Financial accounts + Transfers   direct          platform
 *                             + Payouts (Transfers always
 *                             folds into FA when active)
 *     gp_recipient         →  Payouts                          direct          platform
 *     borrower             →  Financing                        direct          platform
 *     card_issuer          →  Card issuer                      direct          platform
 *     card_holder          →  (none)                           indirect        external, derived from card_issuer
 *     merchant_customer    →  (none)                           indirect        external, derived from merchant
 */

// ═══ Types ════════════════════════════════════════════════════════════

export type CapabilityId = string

/**
 * Doc-level capability group (also called "family" in the doc's prose).
 * The ~10 source-code groupings enumerated in types.rb.
 */
export type CapabilityGroupId =
  | 'core'
  | 'payment_methods'
  | 'issuing'
  | 'banking'
  | 'storer'
  | 'crypto'
  | 'lending'
  | 'tax'
  | 'atlas'
  | 'misc'

/**
 * UAD status signal. Most surface as header chips; tax_reporting surfaces
 * as Actions Required only (surfacesAs field on StatusSignal). Semantically
 * equivalent to `CapabilityGroupId` in `configMatrix.ts`, using signal-group
 * names.
 */
export type StatusSignalId =
  | 'payments'
  | 'payouts'
  | 'transfers'
  | 'billing'
  | 'financial_accounts'
  | 'financing'
  | 'card_issuer'
  | 'tax_reporting'

export type ProductId =
  | 'payments'
  | 'connect'
  | 'issuing'
  | 'treasury'
  | 'capital'
  | 'tax'
  | 'atlas'
  | 'billing'
  | 'checkout'
  | 'payment_links'
  | 'radar'
  | 'terminal'
  | 'sigma'
  | 'climate'
  | 'revenue_recognition'

/**
 * Compliance configuration (role). Matches AccountRoleId in configMatrix.ts,
 * with these refinements:
 *   - `issuer` renamed to `card_issuer` (config now shares noun with the signal)
 *   - `card_holder` retained but flagged as `derivedFrom: 'card_issuer'`:
 *     a card holder only exists because a card issuer issued a card. It's
 *     an outcome of Card issuer being active, not an independent config.
 *   - `merchant_customer` added with `derivedFrom: 'merchant'`: a merchant
 *     has its own downstream customers; they exist because the merchant does.
 */
export type ConfigurationId =
  | 'merchant'
  | 'customer'
  | 'recipient'
  | 'storer'
  | 'borrower'
  | 'card_issuer'
  | 'card_holder'
  | 'merchant_customer'
  | 'gp_recipient'

export interface Capability {
  id: CapabilityId
  /** Public API name when it differs from internal id (PUBLIC_ALIASES_FOR_CAPABILITIES) */
  publicName?: string
  /** Doc-level grouping */
  group: CapabilityGroupId
  /**
   * UAD signals this capability surfaces under. Typically one; length > 1
   * means a split (e.g. crypto caps span multiple signals). Empty array
   * means no header representation — surfaces elsewhere (Actions Required
   * for tax) or not at all.
   */
  signals: StatusSignalId[]
  /** In BASE_CAPABILITIES — always present on every account */
  isBase?: boolean
  /** In CORE_DIRECT_CAPABILITIES — derives charges_enabled / payouts_enabled */
  isCore?: boolean
  note?: string
}

export interface CapabilityGroup {
  id: CapabilityGroupId
  label: string
  description: string
  /** Total capability count (may include unnamed variants) */
  count: number
  approximate?: boolean
  /**
   * When true, the group does not surface as a status signal in the UAD
   * header. Its caps surface as Actions Required when status is anything
   * other than 'active'. Used for: 'tax'.
   */
  actionsRequiredOnly?: boolean
}

export interface StatusSignal {
  id: StatusSignalId
  label: string
  /**
   * Where this signal surfaces in the UAD:
   *   'header'            — chip in the UAD header, always visible when active
   *   'actions_required'  — not in the header; surfaces in the Actions
   *                         Required area only when underlying caps are
   *                         not active
   */
  surfacesAs: 'header' | 'actions_required'
  /** Doc capability groups that contribute caps to this signal */
  capabilityGroups: CapabilityGroupId[]
  /** Products that activate or light up this signal */
  products: ProductId[]
  note?: string
}

export interface Product {
  id: ProductId
  label: string
  /**
   * backed   — product's activation IS a capability
   * requires — product needs caps to function but owns none
   * none     — no capability relationship
   */
  relationship: 'backed' | 'requires' | 'none'
  capabilityGroups: CapabilityGroupId[]
  /** UAD signals this product participates in */
  signals: StatusSignalId[]
  activation: string
  note?: string
  unverified?: boolean
}

export interface Configuration {
  id: ConfigurationId
  label: string
  /**
   * Relationship between the account and the platform:
   *   'distributes' — account has its own downstream customers; platform
   *                   facilitates payments flowing through them (Merchant only)
   *   'direct'      — 1:1 relationship between the account and the platform
   *   'indirect'    — relationship via another network participant, not
   *                   directly with the platform (derived configurations)
   */
  direction: 'distributes' | 'direct' | 'indirect'
  /**
   * True if this configuration is a direct participant in the platform's
   * network. False for derived roles that exist because of a network
   * participant (e.g., card_holder, merchant_customer).
   */
  platformNetwork: boolean
  /** True if the configuration carries compliance requirements (KYC, etc.) */
  hasCompliance: boolean
  /**
   * Status signals activated when this configuration is active, BEFORE
   * fold rules and before billing conditional logic. Derived configs
   * typically have no signals — they're outcomes, not drivers.
   */
  signals: StatusSignalId[]
  /**
   * Capability groups that back this configuration's functionality — the
   * compliance containers the role requires to operate. Distinct from the
   * derived-via-signals cascade: this is the direct, primary mapping.
   *
   * Empty array for relationship-only configs (e.g., customer) and derived
   * configs (e.g., card_holder, merchant_customer).
   */
  capabilityGroups: CapabilityGroupId[]
  /** Configurations auto-added when this is activated (ROLE_AUTO_SELECT) */
  autoSelects?: ConfigurationId[]
  /**
   * If set, this configuration is "derived" from another. It appears
   * only when the parent config is active, is not user-selectable, and
   * is rendered as a plain indicator rather than a selectable pill.
   */
  derivedFrom?: ConfigurationId
  /**
   * Explicit selectability flag. Defaults to true unless derivedFrom is
   * set, in which case selectable defaults to false.
   */
  selectable?: boolean
  note?: string
}

export interface FoldRule {
  /** Signal that disappears when the rule fires */
  signal: StatusSignalId
  /** Signal it merges into */
  foldInto: StatusSignalId
  /** Rule fires when ALL of these configurations are active */
  whenConfigurationsActive: ConfigurationId[]
  note?: string
}

// ═══ Capability groups (~10 doc families) ═════════════════════════════

export const capabilityGroups: CapabilityGroup[] = [
  {
    id: 'core',
    label: 'Core / Infrastructure',
    description:
      'BASE_CAPABILITIES (account, payouts) plus internal building blocks ' +
      '(core_payments, legacy_payments, platform_payments, payments/UPC, transfers)',
    count: 7,
  },
  {
    id: 'payment_methods',
    label: 'Payment methods',
    description: 'card_payments hub plus all LPMs, country bundles, turnkey methods',
    count: 90,
    approximate: true,
  },
  {
    id: 'issuing',
    label: 'Card issuing',
    description:
      'Card issuing across bank partners (Cross River, Celtic, Lead, Fifth Third, ' +
      'Stripe EMEA) and card types. Surfaces under the Card issuer signal.',
    count: 17,
    approximate: true,
  },
  {
    id: 'banking',
    label: 'Banking / Treasury (v1)',
    description: 'v1 Treasury capabilities by bank partner. Public API name: treasury',
    count: 4,
  },
  {
    id: 'storer',
    label: 'Storer (v2 FA)',
    description:
      'v2 Financial Account permissions — holding currencies, inbound/outbound ' +
      'money movement, financial addresses',
    count: 17,
  },
  {
    id: 'crypto',
    label: 'Crypto',
    description:
      'Crypto payments, transfers, financial accounts, Link withdrawals. ' +
      'Caps split across Payments, Transfers, and Financial accounts signals.',
    count: 8,
  },
  {
    id: 'lending',
    label: 'Capital / lending',
    description: 'Cash advances, loans, credit policy access, Stripe-funded fee credits',
    count: 4,
  },
  {
    id: 'tax',
    label: 'Tax',
    description:
      'Tax reporting (1099-K, 1099-MISC) and automatic indirect tax (Stripe Tax for CAs). ' +
      'Does not surface in the UAD header; non-active status surfaces as Actions Required.',
    count: 3,
    actionsRequiredOnly: true,
  },
  {
    id: 'atlas',
    label: 'Atlas / formation',
    description: 'Stripe Atlas company formation',
    count: 1,
  },
  {
    id: 'misc',
    label: 'Misc / emerging',
    description:
      'Corporate cards, verification, disputes, agentic payments, extension OAuth, ' +
      'projects, fund_and_send, received_credits, beneficiary_transfers',
    count: 15,
    approximate: true,
  },
]

// ═══ Capabilities (~70 enumerated; 130+ total per the doc) ════════════

export const capabilities: Capability[] = [
  // ── Core / Infrastructure ──────────────────────
  {
    id: 'account',
    group: 'core',
    signals: [],
    isBase: true,
    note: 'Represents having a Stripe account at all',
  },
  {
    id: 'payouts',
    group: 'core',
    signals: ['payouts'],
    isBase: true,
    isCore: true,
    note: 'Ability to receive payouts. Every account has this.',
  },
  {
    id: 'core_payments',
    group: 'core',
    signals: ['payments'],
    note: 'Internal building block; other payment method caps extend from it',
  },
  {
    id: 'platform_payments',
    group: 'core',
    signals: ['payments'],
    note: 'Platform is merchant-of-record; being replaced by transfers',
  },
  {
    id: 'legacy_payments',
    group: 'core',
    signals: ['payments'],
    isCore: true,
    note: 'Migration cap. In TRANSFERS_ALLOWED_CAPABILITIES.',
  },
  {
    id: 'payments',
    group: 'core',
    signals: ['payments'],
    note: 'Unified Payments Capability (UPC); purpose uncertain per doc',
  },
  {
    id: 'transfers',
    group: 'core',
    signals: ['transfers'],
    isCore: true,
    note: 'Platform → CA transfers. In TRANSFERS_ALLOWED_CAPABILITIES.',
  },

  // ── Payment methods (subset; ~60 more unnamed) ──────────────────────
  {
    id: 'card_payments',
    group: 'payment_methods',
    signals: ['payments'],
    isCore: true,
    note: 'Hub. Backs Payments; required by Billing, Checkout, Payment Links, Radar, Terminal',
  },
  { id: 'us_bank_account_ach_payments', group: 'payment_methods', signals: ['payments'] },
  { id: 'ach_debit_payments', group: 'payment_methods', signals: ['payments'] },
  { id: 'bacs_debit_payments', group: 'payment_methods', signals: ['payments'] },
  { id: 'bacs_debit_stripe_sun_payments', group: 'payment_methods', signals: ['payments'] },
  { id: 'sepa_debit_payments', group: 'payment_methods', signals: ['payments'] },
  {
    id: 'bank_transfer_payments',
    group: 'payment_methods',
    signals: ['payments'],
    note: 'Umbrella; has per-country variants',
  },
  { id: 'paypal_payments', group: 'payment_methods', signals: ['payments'] },
  { id: 'cashapp_payments', group: 'payment_methods', signals: ['payments'] },
  { id: 'grabpay_payments', group: 'payment_methods', signals: ['payments'] },
  { id: 'affirm_payments', group: 'payment_methods', signals: ['payments'] },
  { id: 'klarna_payments', group: 'payment_methods', signals: ['payments'] },
  { id: 'afterpay_clearpay_payments', group: 'payment_methods', signals: ['payments'] },
  { id: 'boleto_payments', group: 'payment_methods', signals: ['payments'] },
  { id: 'oxxo_payments', group: 'payment_methods', signals: ['payments'] },
  { id: 'pix_payments', group: 'payment_methods', signals: ['payments'] },
  { id: 'jcb_payments', group: 'payment_methods', signals: ['payments'] },
  { id: 'cartes_bancaires_payments', group: 'payment_methods', signals: ['payments'] },
  { id: 'kr_card_payments', group: 'payment_methods', signals: ['payments'] },
  { id: 'ng_card_payments', group: 'payment_methods', signals: ['payments'] },
  {
    id: 'billie_payments',
    group: 'payment_methods',
    signals: ['payments'],
    note: 'Turnkey payment method',
  },
  {
    id: 'bizum_payments',
    group: 'payment_methods',
    signals: ['payments'],
    note: 'Turnkey payment method',
  },
  {
    id: 'satispay_payments',
    group: 'payment_methods',
    signals: ['payments'],
    note: 'Turnkey payment method',
  },

  // ── Issuing (subset; ~13 more unnamed) ──────────────────────────────
  {
    id: 'card_issuing',
    group: 'issuing',
    signals: ['card_issuer'],
    note: 'Umbrella cap',
  },
  { id: 'card_issuing_consumer', group: 'issuing', signals: ['card_issuer'] },
  { id: 'card_issuing_charge_card', group: 'issuing', signals: ['card_issuer'] },
  {
    id: 'card_issuing_consumer_prepaid_card_cross_river',
    group: 'issuing',
    signals: ['card_issuer'],
  },
  { id: 'card_issuing_fa_spend_card_celtic', group: 'issuing', signals: ['card_issuer'] },

  // ── Banking / Treasury (v1) ─────────────────────────────────────────
  { id: 'banking', publicName: 'treasury', group: 'banking', signals: ['financial_accounts'] },
  {
    id: 'banking_evolve',
    publicName: 'treasury_evolve',
    group: 'banking',
    signals: ['financial_accounts'],
  },
  {
    id: 'banking_goldman_sachs',
    publicName: 'treasury_goldman_sachs',
    group: 'banking',
    signals: ['financial_accounts'],
  },
  {
    id: 'banking_fifth_third',
    publicName: 'treasury_fifth_third',
    group: 'banking',
    signals: ['financial_accounts'],
  },

  // ── Storer (v2 FA) ──────────────────────────────────────────────────
  { id: 'storer_holds_currencies_usd', group: 'storer', signals: ['financial_accounts'] },
  { id: 'storer_holds_currencies_gbp', group: 'storer', signals: ['financial_accounts'] },
  { id: 'storer_holds_currencies_eur', group: 'storer', signals: ['financial_accounts'] },
  { id: 'storer_holds_currencies_usdc', group: 'storer', signals: ['financial_accounts'] },
  {
    id: 'storer_consumer_holds_currencies_usd',
    group: 'storer',
    signals: ['financial_accounts'],
    note: 'For Link consumers',
  },
  {
    id: 'storer_inbound_transfers_bank_accounts',
    group: 'storer',
    signals: ['financial_accounts'],
  },
  {
    id: 'storer_inbound_transfers_crypto_wallets',
    group: 'storer',
    signals: ['financial_accounts'],
  },
  {
    id: 'storer_outbound_payments_bank_accounts',
    group: 'storer',
    signals: ['financial_accounts'],
  },
  { id: 'storer_outbound_payments_cards', group: 'storer', signals: ['financial_accounts'] },
  {
    id: 'storer_outbound_payments_crypto_wallets',
    group: 'storer',
    signals: ['financial_accounts'],
  },
  {
    id: 'storer_outbound_payments_financial_accounts',
    group: 'storer',
    signals: ['financial_accounts'],
  },
  {
    id: 'storer_outbound_payments_paper_checks',
    group: 'storer',
    signals: ['financial_accounts'],
  },
  {
    id: 'storer_outbound_transfers_bank_accounts',
    group: 'storer',
    signals: ['financial_accounts'],
  },
  {
    id: 'storer_outbound_transfers_crypto_wallets',
    group: 'storer',
    signals: ['financial_accounts'],
  },
  {
    id: 'storer_outbound_transfers_financial_accounts',
    group: 'storer',
    signals: ['financial_accounts'],
  },
  {
    id: 'storer_financial_addresses_bank_accounts',
    group: 'storer',
    signals: ['financial_accounts'],
    note: 'VBANs',
  },
  {
    id: 'storer_financial_addresses_crypto_wallets',
    group: 'storer',
    signals: ['financial_accounts'],
    note: 'Bridge LiquidationAddress',
  },

  // ── Crypto (SPLIT across 3 signals) ─────────────────────────────────
  {
    id: 'crypto_payments',
    group: 'crypto',
    signals: ['payments'],
    note: 'Crypto split — surfaces under Payments',
  },
  {
    id: 'crypto_transfers',
    group: 'crypto',
    signals: ['transfers'],
    note: 'In TRANSFERS_ALLOWED_CAPABILITIES. Crypto split — surfaces under Transfers.',
  },
  {
    id: 'crypto_transfers_platform',
    group: 'crypto',
    signals: ['transfers'],
    note: 'Crypto split — surfaces under Transfers',
  },
  {
    id: 'crypto_financial_accounts',
    group: 'crypto',
    signals: ['financial_accounts'],
    note: 'Crypto split — surfaces under Financial accounts',
  },
  {
    id: 'crypto_financial_account_recipients',
    group: 'crypto',
    signals: ['financial_accounts'],
    note: 'Crypto split — surfaces under Financial accounts',
  },
  {
    id: 'consumer_crypto_financial_accounts',
    group: 'crypto',
    signals: ['financial_accounts'],
    note: 'Crypto split — surfaces under Financial accounts',
  },
  {
    id: 'link_balance_withdrawals_bank_accounts',
    group: 'crypto',
    signals: [],
    note: 'TBD — signal mapping unresolved. Candidates: transfers, financial_accounts.',
  },
  {
    id: 'link_balance_withdrawals_crypto',
    group: 'crypto',
    signals: [],
    note: 'TBD — signal mapping unresolved. Candidates: transfers, financial_accounts.',
  },

  // ── Capital / lending ───────────────────────────────────────────────
  { id: 'cash_advances', group: 'lending', signals: ['financing'] },
  { id: 'loans', group: 'lending', signals: ['financing'] },
  {
    id: 'funding_credit',
    group: 'lending',
    signals: ['financing'],
    note: 'Access to CreditPolicy APIs',
  },
  { id: 'stripe_funded_fee_credits', group: 'lending', signals: ['financing'] },

  // ── Tax (surfaces as tax_reporting signal → Actions Required area) ──
  {
    id: 'tax_reporting_us_1099_k',
    group: 'tax',
    signals: ['tax_reporting'],
    note: 'Triggers TIN checks (US_TAX_CAPABILITIES).',
  },
  {
    id: 'tax_reporting_us_1099_misc',
    group: 'tax',
    signals: ['tax_reporting'],
    note: 'Triggers TIN checks (US_TAX_CAPABILITIES).',
  },
  {
    id: 'automatic_indirect_tax',
    group: 'tax',
    signals: ['tax_reporting'],
    note: 'Stripe Tax for CAs; feature-flagged.',
  },

  // ── Atlas ───────────────────────────────────────────────────────────
  { id: 'company_formation', group: 'atlas', signals: [] },

  // ── Misc / emerging ─────────────────────────────────────────────────
  { id: 'corporate_cards_charge_card', group: 'misc', signals: [], note: 'Separate from Issuing' },
  { id: 'corporate_cards_balance_card', group: 'misc', signals: [] },
  { id: 'stripe_card', group: 'misc', signals: [] },
  { id: 'verified', group: 'misc', signals: [], note: 'Verification / identity' },
  { id: 'verified_basic', group: 'misc', signals: [] },
  { id: 'dispute_arbitration', group: 'misc', signals: [] },
  { id: 'dispute_resolution', group: 'misc', signals: [] },
  {
    id: 'agentic_payments',
    group: 'misc',
    signals: ['payments'],
    note: 'AI agent payment flows — emerging. Assumed Payments signal.',
  },
  {
    id: 'extension_oauth_connections',
    group: 'misc',
    signals: [],
    note: 'Connect extensions OAuth',
  },
  {
    id: 'projects',
    group: 'misc',
    signals: [],
    note: 'Unknown product per doc',
  },
  {
    id: 'fund_and_send',
    group: 'misc',
    signals: ['financial_accounts'],
    note: 'v1 cap backing vNext FA; shares compliance with card_payments in UK',
  },
  {
    id: 'received_credits',
    group: 'misc',
    signals: [],
    note: 'v1 cap for Caribou project',
  },
  {
    id: 'beneficiary_transfers',
    group: 'misc',
    signals: ['transfers'],
    note: 'In TRANSFERS_ALLOWED_CAPABILITIES',
  },
]

// ═══ Status signals (7 header chips + 1 Actions Required surface) ════

export const statusSignals: StatusSignal[] = [
  {
    id: 'payments',
    label: 'Payments',
    surfacesAs: 'header',
    capabilityGroups: ['core', 'payment_methods', 'crypto', 'misc'],
    products: ['payments', 'billing', 'checkout', 'payment_links', 'radar', 'terminal'],
    note: 'card_payments hub plus all LPMs. crypto_payments surfaces here (split).',
  },
  {
    id: 'payouts',
    label: 'Payouts',
    surfacesAs: 'header',
    capabilityGroups: ['core'],
    products: [],
    note: 'Just the `payouts` BASE_CAPABILITY. No dedicated product.',
  },
  {
    id: 'transfers',
    label: 'Transfers',
    surfacesAs: 'header',
    capabilityGroups: ['core', 'crypto', 'misc'],
    products: ['connect'],
    note:
      'Folds into Financial accounts whenever Storer is active ' +
      '(see foldRules). crypto_transfers surfaces here.',
  },
  {
    id: 'billing',
    label: 'Billing',
    surfacesAs: 'header',
    capabilityGroups: [],
    products: ['billing'],
    note:
      'No backing capability. Rides on card_payments via product usage. ' +
      'Conditional: appears when Merchant is active and billingEnabled is true.',
  },
  {
    id: 'financial_accounts',
    label: 'Financial accounts',
    surfacesAs: 'header',
    capabilityGroups: ['banking', 'storer', 'crypto', 'misc'],
    products: ['treasury'],
    note:
      'Spans v1 Treasury (banking_*), v2 Storer, crypto financial accounts, ' +
      'and fund_and_send. Receives folded Transfers whenever Storer is active.',
  },
  {
    id: 'financing',
    label: 'Financing',
    surfacesAs: 'header',
    capabilityGroups: ['lending'],
    products: ['capital'],
  },
  {
    id: 'card_issuer',
    label: 'Card issuer',
    surfacesAs: 'header',
    capabilityGroups: ['issuing'],
    products: ['issuing'],
    note:
      'Driven by the Card issuer configuration (config and signal share the same noun). ' +
      'Also activated by the Card holder role even though card_holder is not in the platform network.',
  },
  {
    id: 'tax_reporting',
    label: 'Tax reporting',
    surfacesAs: 'actions_required',
    capabilityGroups: ['tax'],
    products: ['tax'],
    note:
      'Not a header chip. Surfaces in the Actions Required area when underlying ' +
      'tax caps are non-active. Represented in the playground with a dotted outline.',
  },
]

// ═══ Products (~16) ═══════════════════════════════════════════════════

export const products: Product[] = [
  // Backed by dedicated capability ─────────────
  {
    id: 'payments',
    label: 'Payments',
    relationship: 'backed',
    capabilityGroups: ['payment_methods', 'core'],
    signals: ['payments'],
    activation: 'card_payments + LPMs',
  },
  {
    id: 'connect',
    label: 'Connect',
    relationship: 'backed',
    capabilityGroups: ['core', 'misc'],
    signals: ['transfers'],
    activation: 'transfers (+ card_payments, platform_payments, beneficiary_transfers)',
  },
  {
    id: 'issuing',
    label: 'Issuing',
    relationship: 'backed',
    capabilityGroups: ['issuing'],
    signals: ['card_issuer'],
    activation: 'card_issuing + bank-partner variants',
  },
  {
    id: 'treasury',
    label: 'Treasury',
    relationship: 'backed',
    capabilityGroups: ['banking', 'storer'],
    signals: ['financial_accounts'],
    activation: 'banking (v1) + storer (v2 FA)',
    note: 'Spans two capability generations',
  },
  {
    id: 'capital',
    label: 'Capital',
    relationship: 'backed',
    capabilityGroups: ['lending'],
    signals: ['financing'],
    activation: 'cash_advances, loans, funding_credit',
  },
  {
    id: 'tax',
    label: 'Tax',
    relationship: 'backed',
    capabilityGroups: ['tax'],
    signals: ['tax_reporting'],
    activation: 'tax_reporting_* + automatic_indirect_tax',
    note: 'Surfaces in UAD as Actions Required via the tax_reporting signal, not as a header chip.',
  },
  {
    id: 'atlas',
    label: 'Atlas',
    relationship: 'backed',
    capabilityGroups: ['atlas'],
    signals: [],
    activation: 'company_formation',
  },

  // Requires card_payments (no dedicated capability) ────────────
  {
    id: 'billing',
    label: 'Billing',
    relationship: 'requires',
    capabilityGroups: ['payment_methods'],
    signals: ['billing', 'payments'],
    activation: 'Product usage (Subscriptions/Invoices API)',
    note: 'No dedicated cap; rides on card_payments + bank payment caps',
  },
  {
    id: 'checkout',
    label: 'Checkout',
    relationship: 'requires',
    capabilityGroups: ['payment_methods'],
    signals: ['payments'],
    activation: 'Product usage',
  },
  {
    id: 'payment_links',
    label: 'Payment Links',
    relationship: 'requires',
    capabilityGroups: ['payment_methods'],
    signals: ['payments'],
    activation: 'Product usage',
  },
  {
    id: 'radar',
    label: 'Radar',
    relationship: 'requires',
    capabilityGroups: ['payment_methods'],
    signals: ['payments'],
    activation: 'Bundled with card_payments; Fraud Teams add-on is paid',
  },
  {
    id: 'terminal',
    label: 'Terminal',
    relationship: 'requires',
    capabilityGroups: ['payment_methods'],
    signals: ['payments'],
    activation: 'Likely card_payments + product config — UNVERIFIED',
    unverified: true,
  },

  // No capability relationship ────────────────
  {
    id: 'sigma',
    label: 'Sigma',
    relationship: 'none',
    capabilityGroups: [],
    signals: [],
    activation: 'Paid subscription',
  },
  {
    id: 'climate',
    label: 'Climate',
    relationship: 'none',
    capabilityGroups: [],
    signals: [],
    activation: 'Opt-in',
  },
  {
    id: 'revenue_recognition',
    label: 'Revenue recognition',
    relationship: 'none',
    capabilityGroups: [],
    signals: [],
    activation: 'Paid add-on',
  },
]

// ═══ Configurations (UAD roles) ═══════════════════════════════════════

export const configurations: Configuration[] = [
  {
    id: 'merchant',
    label: 'Merchant',
    direction: 'distributes',
    platformNetwork: true,
    hasCompliance: true,
    signals: ['payments', 'payouts'],
    capabilityGroups: ['core', 'payment_methods'],
    note:
      'Accepts payments from end customers. Only configuration that distributes — ' +
      'merchants have their own downstream customers. Also enables Billing signal ' +
      'when billingEnabled is true (see resolveSignalsForConfigurations).',
  },
  {
    id: 'customer',
    label: 'Customer',
    direction: 'direct',
    platformNetwork: true,
    hasCompliance: false,
    signals: ['payments'],
    capabilityGroups: [],
    note:
      'Pays the platform/operator. Direct relationship but no compliance — ' +
      'the only platform-network config without compliance requirements. ' +
      'Has no backing capability groups; surfaces in UAD only via relationship.',
  },
  {
    id: 'recipient',
    label: 'Recipient',
    direction: 'direct',
    platformNetwork: true,
    hasCompliance: true,
    signals: ['transfers', 'payouts'],
    capabilityGroups: ['core'],
    note:
      'Receives funds from a platform. When Storer is also active, Transfers ' +
      'folds into Financial accounts (fold rule triggers on Storer alone — ' +
      "Recipient's Transfers contribution is absorbed).",
  },
  {
    id: 'gp_recipient',
    label: 'GP Recipient',
    direction: 'direct',
    platformNetwork: true,
    hasCompliance: true,
    signals: ['payouts'],
    capabilityGroups: ['core'],
    note:
      'Global Payouts recipient. Requires payout capabilities only (no transfers, ' +
      'no financial accounts). Distinct from Recipient, which receives funds to hold.',
  },
  {
    id: 'storer',
    label: 'Storer',
    direction: 'direct',
    platformNetwork: true,
    hasCompliance: true,
    signals: ['financial_accounts', 'transfers', 'payouts'],
    capabilityGroups: ['storer'],
    note:
      'Holds and moves funds (v2 FA). Owns FA + Transfers + Payouts signals, but ' +
      'Transfers is always folded into Financial accounts whenever Storer is ' +
      'active (see foldRules). Auto-select to Recipient has been removed per Eng ' +
      'direction — the two roles are now independently togglable.',
  },
  {
    id: 'borrower',
    label: 'Borrower',
    direction: 'direct',
    platformNetwork: true,
    hasCompliance: true,
    signals: ['financing'],
    capabilityGroups: ['lending'],
    note: 'Receives loan or cash advance.',
  },
  {
    id: 'card_issuer',
    label: 'Card issuer',
    direction: 'direct',
    platformNetwork: true,
    hasCompliance: true,
    signals: ['card_issuer'],
    capabilityGroups: ['issuing'],
    note: 'Issues cards. Configuration and signal share the same noun.',
  },
  {
    id: 'card_holder',
    label: 'Card holder',
    direction: 'indirect',
    platformNetwork: false,
    hasCompliance: false,
    signals: [],
    capabilityGroups: [],
    derivedFrom: 'card_issuer',
    selectable: false,
    note:
      'Holds a card issued by a card issuer on the platform. Derived — appears ' +
      'only when Card issuer is active. No capabilities, no signals — the card ' +
      'issuer configuration drives the Card issuer signal, not the card holder.',
  },
  {
    id: 'merchant_customer',
    label: "Merchant's customer",
    direction: 'indirect',
    platformNetwork: false,
    hasCompliance: false,
    signals: [],
    capabilityGroups: [],
    derivedFrom: 'merchant',
    selectable: false,
    note:
      'A customer of a merchant on the platform. Derived — appears only when ' +
      'Merchant is active. Not a direct platform participant; the merchant ' +
      "facilitates the relationship. Distinct from the platform's own customer " +
      "(the 'customer' configuration), which pays the platform directly.",
  },
]

// ═══ Fold rules ═══════════════════════════════════════════════════════

export const foldRules: FoldRule[] = [
  {
    signal: 'transfers',
    foldInto: 'financial_accounts',
    whenConfigurationsActive: ['storer'],
    note:
      'Whenever Storer is active, Transfers folds into Financial accounts in the ' +
      'cascade. The Signals tab UAD column keeps a suppressed Transfers chip with a ' +
      'fold caption; the resolved signal set has Financial accounts, not Transfers. ' +
      "Absorbs Storer's Transfers and Recipient's when Recipient is also active.",
  },
]

// ═══ Lookups & helpers ════════════════════════════════════════════════

const capabilitiesById = new Map(capabilities.map((c) => [c.id, c]))
const capabilityGroupsById = new Map(capabilityGroups.map((g) => [g.id, g]))
const productsById = new Map(products.map((p) => [p.id, p]))
const statusSignalsById = new Map(statusSignals.map((s) => [s.id, s]))
const configurationsById = new Map(configurations.map((c) => [c.id, c]))

export function getCapability(id: CapabilityId): Capability | undefined {
  return capabilitiesById.get(id)
}

export function getCapabilityGroup(id: CapabilityGroupId): CapabilityGroup | undefined {
  return capabilityGroupsById.get(id)
}

export function getProduct(id: ProductId): Product | undefined {
  return productsById.get(id)
}

export function getStatusSignal(id: StatusSignalId): StatusSignal | undefined {
  return statusSignalsById.get(id)
}

export function getConfiguration(id: ConfigurationId): Configuration | undefined {
  return configurationsById.get(id)
}

/** All capabilities in a given doc capability group */
export function getCapabilitiesInGroup(groupId: CapabilityGroupId): Capability[] {
  return capabilities.filter((c) => c.group === groupId)
}

/** Enumerated caps in a group for the granular column (+ approximate tail when the doc lists more than we enumerate). */
export function getGranularCapabilitiesDisplay(groupId: CapabilityGroupId): {
  displayed: Capability[]
  approximateTailCount: number
} {
  const meta = getCapabilityGroup(groupId)
  const listed = getCapabilitiesInGroup(groupId)
  if (!meta) return { displayed: listed, approximateTailCount: 0 }
  if (meta.approximate && listed.length < meta.count) {
    return { displayed: listed, approximateTailCount: meta.count - listed.length }
  }
  return { displayed: listed, approximateTailCount: 0 }
}

/** All capabilities that surface under a given status signal */
export function getCapabilitiesForSignal(signalId: StatusSignalId): Capability[] {
  return capabilities.filter((c) => c.signals.includes(signalId))
}

/** Products that depend on a capability group (backed or requires) */
export function getProductsByCapabilityGroup(groupId: CapabilityGroupId): Product[] {
  return products.filter((p) => p.capabilityGroups.includes(groupId))
}

/** Configurations that require a capability group (direct mapping) */
export function getConfigurationsByCapabilityGroup(
  groupId: CapabilityGroupId
): Configuration[] {
  return configurations.filter((c) => c.capabilityGroups.includes(groupId))
}

/** Capability groups that back the given signal (via cap-group-to-signal mapping) */
export function getCapabilityGroupsBySignal(
  signalId: StatusSignalId
): CapabilityGroup[] {
  return capabilityGroups.filter((cg) => {
    const capsInGroup = capabilities.filter((c) => c.group === cg.id)
    return capsInGroup.some((c) => c.signals.includes(signalId))
  })
}

/** Status signals that a capability group feeds (via its member capabilities) */
export function getSignalsByCapabilityGroup(
  groupId: CapabilityGroupId
): StatusSignalId[] {
  const capsInGroup = capabilities.filter((c) => c.group === groupId)
  const signals = new Set<StatusSignalId>()
  capsInGroup.forEach((c) => c.signals.forEach((s) => signals.add(s)))
  return Array.from(signals)
}

/**
 * Capabilities within a group that are RELEVANT to a given configuration.
 * Relevance is derived from signal overlap: a cap is relevant if its signals
 * intersect with the config's signals. Used to show "partial mapping" in
 * the Capabilities map view — e.g., Recipient maps to the Core group but
 * only needs `transfers` and `payouts` caps from it, not all 7.
 */
export function getRelevantCapsForConfigInGroup(
  configId: ConfigurationId,
  groupId: CapabilityGroupId
): Capability[] {
  const config = configurations.find((c) => c.id === configId)
  if (!config) return []
  const capsInGroup = capabilities.filter((c) => c.group === groupId)
  return capsInGroup.filter((cap) =>
    cap.signals.some((s) => config.signals.includes(s))
  )
}

/**
 * True if a config's mapping to a cap group is partial — i.e., the config
 * only needs a subset of the group's caps. Drives dotted-edge treatment
 * in the Capabilities map view's Config mode.
 */
export function isPartialMapping(
  configId: ConfigurationId,
  groupId: CapabilityGroupId
): boolean {
  const totalCaps = capabilities.filter((c) => c.group === groupId).length
  if (totalCaps === 0) return false
  const relevant = getRelevantCapsForConfigInGroup(configId, groupId).length
  return relevant > 0 && relevant < totalCaps
}

/** Products that participate in a status signal */
export function getProductsForSignal(signalId: StatusSignalId): Product[] {
  return products.filter((p) => p.signals.includes(signalId))
}

/** Signals a capability surfaces under (usually 1; >1 means a split) */
export function getSignalsForCapability(capId: CapabilityId): StatusSignal[] {
  const cap = getCapability(capId)
  if (!cap) return []
  return cap.signals
    .map((s) => getStatusSignal(s))
    .filter((s): s is StatusSignal => s != null)
}

/**
 * Capabilities that surface under more than one signal — the "split" cases.
 * Today this is empty because each crypto cap maps to a single signal; the
 * split is a property of the crypto GROUP, not any individual capability.
 */
export function getSplitCapabilities(): Array<{
  capability: Capability
  signals: StatusSignal[]
}> {
  return capabilities
    .filter((c) => c.signals.length > 1)
    .map((c) => ({ capability: c, signals: getSignalsForCapability(c.id) }))
}

/**
 * Capability groups that touch multiple signals — the group-level split
 * story. crypto is the obvious example (payments + transfers + financial_accounts).
 */
export function getSplitCapabilityGroups(): Array<{
  group: CapabilityGroup
  signals: StatusSignal[]
}> {
  return capabilityGroups
    .map((g) => {
      const signalIds = new Set<StatusSignalId>()
      for (const cap of getCapabilitiesInGroup(g.id)) {
        for (const s of cap.signals) signalIds.add(s)
      }
      return {
        group: g,
        signals: [...signalIds]
          .map((id) => getStatusSignal(id))
          .filter((s): s is StatusSignal => s != null),
      }
    })
    .filter((x) => x.signals.length > 1)
}

/** Capabilities with unresolved signal mapping — flagged as TBD in the data */
export function getUnresolvedCapabilities(): Capability[] {
  return capabilities.filter((c) => c.signals.length === 0 && c.note?.startsWith('TBD'))
}

/**
 * Capabilities that should trigger Actions Required when non-active.
 * Today this is just the tax group; other caps may join if UAD decides to
 * treat them similarly.
 */
export function getActionsRequiredCapabilities(): Capability[] {
  const actionOnlyGroups = new Set(
    capabilityGroups.filter((g) => g.actionsRequiredOnly).map((g) => g.id)
  )
  return capabilities.filter((c) => actionOnlyGroups.has(c.group))
}

/**
 * Derived: which capability groups contribute caps to a signal.
 * Useful when statusSignals.capabilityGroups gets out of sync with the
 * underlying capabilities data — this recomputes from ground truth.
 */
export function deriveCapabilityGroupsForSignal(signalId: StatusSignalId): CapabilityGroupId[] {
  const groupIds = new Set<CapabilityGroupId>()
  for (const cap of getCapabilitiesForSignal(signalId)) {
    groupIds.add(cap.group)
  }
  return [...groupIds]
}

// ═══ Configuration resolver ═══════════════════════════════════════════

/** Apply auto-select rules to expand the active configuration set */
export function expandConfigurationsWithAutoSelect(
  activeConfigs: ReadonlySet<ConfigurationId>
): Set<ConfigurationId> {
  const expanded = new Set<ConfigurationId>(activeConfigs)
  for (const configId of activeConfigs) {
    const config = getConfiguration(configId)
    if (config?.autoSelects) {
      for (const auto of config.autoSelects) expanded.add(auto)
    }
  }
  return expanded
}

function collectSignalsUnfolded(
  activeConfigs: ReadonlySet<ConfigurationId>,
  billingEnabled: boolean,
  taxEnabled: boolean
): { expandedConfigs: Set<ConfigurationId>; baseSignals: Set<StatusSignalId> } {
  const expandedConfigs = expandConfigurationsWithAutoSelect(activeConfigs)
  const baseSignals = new Set<StatusSignalId>()
  for (const configId of expandedConfigs) {
    const config = getConfiguration(configId)
    if (config) {
      for (const sig of config.signals) baseSignals.add(sig)
    }
  }
  if (expandedConfigs.has('merchant') && billingEnabled) {
    baseSignals.add('billing')
  }
  if (expandedConfigs.has('merchant') && taxEnabled) {
    baseSignals.add('tax_reporting')
  }
  return { expandedConfigs, baseSignals }
}

/**
 * Config-derived status signals plus conditional Billing, before {@link foldRules}
 * are applied. Compare with the folded output of {@link resolveSignalsForConfigurations}
 * to implement fold UI (e.g. show Transfers as visually folded into Financial accounts).
 * {@link taxEnabled} adds `tax_reporting` when Merchant is expanded (playground only).
 */
export function resolveSignalsBeforeFold(
  activeConfigs: ReadonlySet<ConfigurationId>,
  billingEnabled: boolean = false,
  taxEnabled: boolean = false
): Set<StatusSignalId> {
  return new Set(collectSignalsUnfolded(activeConfigs, billingEnabled, taxEnabled).baseSignals)
}

/**
 * Resolve status signals given active configurations. Applies auto-select
 * and fold rules. Adds Billing signal when merchant is active and
 * billingEnabled is true.
 *
 * Returns a Set (order is arbitrary). Use CAPABILITY_GROUP_DISPLAY_ORDER
 * from configMatrix.ts or your own ordering if presentation order matters.
 * When {@link taxEnabled} is true and Merchant is active, includes the
 * `tax_reporting` signal (playground “Uses Tax Reporting”).
 */
export function resolveSignalsForConfigurations(
  activeConfigs: ReadonlySet<ConfigurationId>,
  billingEnabled: boolean = false,
  taxEnabled: boolean = false
): Set<StatusSignalId> {
  const { expandedConfigs, baseSignals } = collectSignalsUnfolded(
    activeConfigs,
    billingEnabled,
    taxEnabled
  )
  const signals = new Set<StatusSignalId>(baseSignals)
  for (const rule of foldRules) {
    const allPresent = rule.whenConfigurationsActive.every((c) => expandedConfigs.has(c))
    if (allPresent && signals.has(rule.signal)) {
      signals.delete(rule.signal)
      signals.add(rule.foldInto)
    }
  }
  return signals
}

/** All capabilities surfaced by a set of resolved signals */
export function getCapabilitiesForSignals(signals: ReadonlySet<StatusSignalId>): Capability[] {
  return capabilities.filter((c) => c.signals.some((s) => signals.has(s)))
}

/** All products participating in a set of resolved signals */
export function getProductsForSignals(signals: ReadonlySet<StatusSignalId>): Product[] {
  return products.filter((p) => p.signals.some((s) => signals.has(s)))
}

/** Capability groups contributing caps to any of a set of signals */
export function getCapabilityGroupsForSignals(
  signals: ReadonlySet<StatusSignalId>
): CapabilityGroup[] {
  const groupIds = new Set<CapabilityGroupId>()
  for (const cap of getCapabilitiesForSignals(signals)) {
    groupIds.add(cap.group)
  }
  return [...groupIds]
    .map((id) => getCapabilityGroup(id))
    .filter((g): g is CapabilityGroup => g != null)
}

/**
 * Detect whether the current configuration set is relationship-only
 * (no compliance). Used to hide the status badge in the UAD header.
 */
export function isRelationshipOnly(activeConfigs: ReadonlySet<ConfigurationId>): boolean {
  for (const configId of activeConfigs) {
    const config = getConfiguration(configId)
    if (config?.hasCompliance) return false
  }
  return true
}
