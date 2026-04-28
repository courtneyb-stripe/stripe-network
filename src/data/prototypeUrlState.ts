/**
 * Serialize / parse prototype configuration from URL query params (shareable links).
 */

import type {
  AccountRoleId,
  BillingFlavor,
  CapabilityGroupId,
  CapabilityStatus,
  FinancingProductSelection,
  RelationshipFlags,
  RiskLevel,
} from './configMatrix'
import { DEFAULT_FINANCING_POPOVER } from './configMatrix'
import { capabilityGroupsWithStatus, resolveCapabilityGroups, suppressConnectPayoutSchedule } from './uadVisibility'

const ROLE_ORDER: AccountRoleId[] = [
  'merchant',
  'customer',
  'recipient',
  'gp_recipient',
  'storer',
  'borrower',
  'issuer',
  'card_holder',
]

const VALID_ROLES = new Set<AccountRoleId>(ROLE_ORDER)

const ALL_GROUPS: CapabilityGroupId[] = [
  'payments',
  'payouts',
  'transfers',
  'billing',
  'treasury',
  'capital',
  'issuing',
]

const VALID_STATUSES = new Set<CapabilityStatus>([
  'active',
  'pausing_soon',
  'limited',
  'paused',
])

const VALID_RISK = new Set<RiskLevel>(['low', 'elevated', 'high'])

const VALID_FLAVORS = new Set<BillingFlavor>([
  'invoicing',
  'subscriptions',
  'metered_billing',
])

const KNOWN_KEYS = new Set([
  'roles',
  'statuses',
  'risk',
  'billing',
  'flavors',
  'paymentMethod',
  'payoutSchedule',
  'financialAccounts',
  'businessFinancing',
  'financingType',
  'cardProgram',
  'subscriptionsWithPlatform',
  'expiredPaymentMethod',
])

function parseBool(v: string | null): boolean | undefined {
  if (v == null || v === '') return undefined
  const x = v.trim().toLowerCase()
  if (x === 'true') return true
  if (x === 'false') return false
  return undefined
}

function parseRoles(raw: string | null): AccountRoleId[] | undefined {
  if (raw == null || raw.trim() === '') return undefined
  const parts = raw.split(',').map((s) => s.trim()).filter(Boolean)
  const out: AccountRoleId[] = []
  for (const p of parts) {
    if (VALID_ROLES.has(p as AccountRoleId)) out.push(p as AccountRoleId)
  }
  return out.length > 0 ? out : undefined
}

function parseStatuses(raw: string | null): Partial<Record<CapabilityGroupId, CapabilityStatus>> | undefined {
  if (raw == null || raw.trim() === '') return undefined
  const segments = raw.split(',').map((s) => s.trim()).filter(Boolean)
  const out: Partial<Record<CapabilityGroupId, CapabilityStatus>> = {}
  for (const seg of segments) {
    const idx = seg.indexOf(':')
    if (idx <= 0) continue
    const gid = seg.slice(0, idx).trim() as CapabilityGroupId
    const st = seg.slice(idx + 1).trim() as CapabilityStatus
    if (!ALL_GROUPS.includes(gid)) continue
    if (!VALID_STATUSES.has(st)) continue
    out[gid] = st
  }
  return Object.keys(out).length > 0 ? out : undefined
}

function mergeCapabilityStatusesForGroupsInput(
  prev: Partial<Record<CapabilityGroupId, CapabilityStatus>>,
  groupIds: CapabilityGroupId[]
): Record<CapabilityGroupId, CapabilityStatus> {
  const o = {} as Record<CapabilityGroupId, CapabilityStatus>
  for (const id of groupIds) {
    o[id] = prev[id] ?? 'active'
  }
  return o
}

export type InitialPrototypeFromUrl = {
  activeRoleList: AccountRoleId[]
  riskLevel: RiskLevel
  /** True when `risk` query param was present and valid — skips mock-account risk overwrite. */
  riskSpecified: boolean
  billingEnabled: boolean
  billingFlavors: Set<BillingFlavor>
  relationship: RelationshipFlags
  financingProducts: FinancingProductSelection
  hasPaymentMethodOnFile: boolean
  hasPayoutSchedule: boolean
  hasFinancialAccounts: boolean
  capabilityStatuses: Record<CapabilityGroupId, CapabilityStatus>
}

const DEFAULT_RELATIONSHIP: RelationshipFlags = {
  hasActiveSubscriptions: false,
  hasIssuedCard: false,
  expiredPaymentMethod: false,
}

const ALL_ACTIVE: Record<CapabilityGroupId, CapabilityStatus> = ALL_GROUPS.reduce(
  (acc, id) => {
    acc[id] = 'active'
    return acc
  },
  {} as Record<CapabilityGroupId, CapabilityStatus>
)

function ensureStorerRecipient(roles: Set<AccountRoleId>): Set<AccountRoleId> {
  const next = new Set(roles)
  if (next.has('storer')) next.add('recipient')
  return next
}

/** Strip issuer from serialized UI roles (matches configure modal). */
function rolesForSerialize(roles: ReadonlySet<AccountRoleId>): AccountRoleId[] {
  const next = ensureStorerRecipient(new Set(roles))
  next.delete('issuer')
  return [...next].sort((a, b) => ROLE_ORDER.indexOf(a) - ROLE_ORDER.indexOf(b))
}

export function hasPrototypeQueryParams(search: string): boolean {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  for (const k of KNOWN_KEYS) {
    if (params.has(k)) return true
  }
  return false
}

function defaultBuiltFromScratch(): InitialPrototypeFromUrl {
  const roleSet = ensureStorerRecipient(new Set<AccountRoleId>(['merchant', 'customer']))
  const billingEnabled = false
  const resolvedGroups = resolveCapabilityGroups(roleSet, billingEnabled)
  const groupsWithStatus = capabilityGroupsWithStatus(resolvedGroups)
  const capabilityStatuses = mergeCapabilityStatusesForGroupsInput(ALL_ACTIVE, groupsWithStatus)
  return {
    activeRoleList: [...roleSet],
    riskLevel: 'low',
    riskSpecified: false,
    billingEnabled,
    billingFlavors: new Set<BillingFlavor>(),
    relationship: { ...DEFAULT_RELATIONSHIP },
    financingProducts: { ...DEFAULT_FINANCING_POPOVER },
    hasPaymentMethodOnFile: true,
    hasPayoutSchedule: true,
    hasFinancialAccounts: true,
    capabilityStatuses,
  }
}

/**
 * Hydrate initial prototype fields from `window.location.search`.
 * Invalid values fall back to defaults silently.
 */
export function getInitialPrototypeStateFromSearch(search: string): InitialPrototypeFromUrl {
  const qs = search.startsWith('?') ? search.slice(1) : search
  if (!qs.trim() || !hasPrototypeQueryParams(search)) {
    return defaultBuiltFromScratch()
  }

  const params = new URLSearchParams(qs)

  let roles = parseRoles(params.get('roles'))
  if (!roles || roles.length === 0) {
    roles = ['merchant', 'customer']
  }
  let roleSet = ensureStorerRecipient(new Set(roles))

  const cardProgram = parseBool(params.get('cardProgram'))
  if (cardProgram === true) roleSet.add('card_holder')
  if (cardProgram === false) roleSet.delete('card_holder')

  const billingEnabled = parseBool(params.get('billing')) ?? false

  let billingFlavors = new Set<BillingFlavor>()
  const flavorsRaw = params.get('flavors')
  if (flavorsRaw != null && flavorsRaw.trim() !== '') {
    for (const f of flavorsRaw.split(',').map((s) => s.trim()).filter(Boolean)) {
      if (VALID_FLAVORS.has(f as BillingFlavor)) billingFlavors.add(f as BillingFlavor)
    }
  }

  let riskSpecified = false
  let riskLevel: RiskLevel = 'low'
  const riskRaw = params.get('risk')
  if (riskRaw != null && riskRaw.trim() !== '') {
    const r = riskRaw.trim() as RiskLevel
    if (VALID_RISK.has(r)) {
      riskLevel = r
      riskSpecified = true
    }
  }

  const relationship: RelationshipFlags = { ...DEFAULT_RELATIONSHIP }
  const subs = parseBool(params.get('subscriptionsWithPlatform'))
  if (subs !== undefined) relationship.hasActiveSubscriptions = subs
  const expired = parseBool(params.get('expiredPaymentMethod'))
  if (expired !== undefined) relationship.expiredPaymentMethod = expired

  let financingProducts: FinancingProductSelection = { ...DEFAULT_FINANCING_POPOVER }
  const bf = parseBool(params.get('businessFinancing'))
  const ft = params.get('financingType')?.trim().toLowerCase()
  if (bf === false) {
    financingProducts = { loan: false, cashAdvance: false }
  } else {
    if (ft === 'loan') financingProducts = { loan: true, cashAdvance: false }
    else if (ft === 'cashadvance' || ft === 'cash_advance') financingProducts = { loan: false, cashAdvance: true }
    else if (ft === 'both') financingProducts = { loan: true, cashAdvance: true }
    else if (bf === true && ft == null) financingProducts = { loan: true, cashAdvance: false }
  }

  const hasPaymentMethodOnFile = parseBool(params.get('paymentMethod')) ?? true
  let hasPayoutSchedule = parseBool(params.get('payoutSchedule')) ?? true
  if (suppressConnectPayoutSchedule(roleSet)) hasPayoutSchedule = false
  const hasFinancialAccounts = parseBool(params.get('financialAccounts')) ?? true

  const resolvedGroups = resolveCapabilityGroups(roleSet, billingEnabled)
  const groupsWithStatus = capabilityGroupsWithStatus(resolvedGroups)

  let capabilityStatuses = mergeCapabilityStatusesForGroupsInput(ALL_ACTIVE, groupsWithStatus)
  const parsedStatuses = parseStatuses(params.get('statuses'))
  if (parsedStatuses) {
    const merged = { ...capabilityStatuses }
    for (const g of groupsWithStatus) {
      const ps = parsedStatuses[g]
      if (ps != null) merged[g] = ps
    }
    capabilityStatuses = merged
  }

  return {
    activeRoleList: [...roleSet],
    riskLevel,
    riskSpecified,
    billingEnabled,
    billingFlavors,
    relationship,
    financingProducts,
    hasPaymentMethodOnFile,
    hasPayoutSchedule,
    hasFinancialAccounts,
    capabilityStatuses,
  }
}

export type SerializablePrototypeSnapshot = {
  activeRoles: ReadonlySet<AccountRoleId>
  capabilityStatuses: Record<CapabilityGroupId, CapabilityStatus>
  riskLevel: RiskLevel
  billingEnabled: boolean
  billingFlavors: ReadonlySet<BillingFlavor>
  hasPaymentMethodOnFile: boolean
  hasPayoutSchedule: boolean
  hasFinancialAccounts: boolean
  financingProducts: FinancingProductSelection
  relationship: RelationshipFlags
}

/** Build query string (without leading `?`) from applied prototype snapshot. */
export function serializePrototypeStateToSearchString(s: SerializablePrototypeSnapshot): string {
  const params = new URLSearchParams()

  params.set('roles', rolesForSerialize(s.activeRoles).join(','))

  const statusPairs = ALL_GROUPS.map((gid) => {
    const st = s.capabilityStatuses[gid]
    return st != null ? `${gid}:${st}` : null
  }).filter(Boolean) as string[]
  if (statusPairs.length > 0) params.set('statuses', statusPairs.join(','))

  params.set('risk', s.riskLevel)
  params.set('billing', String(s.billingEnabled))

  const flavors = [...s.billingFlavors].sort()
  if (flavors.length > 0) params.set('flavors', flavors.join(','))

  params.set('paymentMethod', String(s.hasPaymentMethodOnFile))
  params.set('payoutSchedule', String(s.hasPayoutSchedule))
  params.set('financialAccounts', String(s.hasFinancialAccounts))

  const bf = !!(s.financingProducts.loan || s.financingProducts.cashAdvance)
  params.set('businessFinancing', String(bf))
  let financingType = 'loan'
  if (!bf) financingType = 'loan'
  else if (s.financingProducts.loan && s.financingProducts.cashAdvance) financingType = 'both'
  else if (s.financingProducts.cashAdvance && !s.financingProducts.loan) financingType = 'cashAdvance'
  else financingType = 'loan'
  params.set('financingType', financingType)

  params.set('cardProgram', String(s.activeRoles.has('card_holder')))
  params.set('subscriptionsWithPlatform', String(s.relationship.hasActiveSubscriptions))
  params.set('expiredPaymentMethod', String(s.relationship.expiredPaymentMethod))

  return params.toString()
}

/** Updates location search via `history.replaceState` (does not push history entries). */
export function replacePrototypeUrlSearch(searchString: string): void {
  if (typeof window === 'undefined') return
  const { pathname, hash } = window.location
  const next = searchString.length > 0 ? `?${searchString}` : ''
  window.history.replaceState(window.history.state, '', `${pathname}${next}${hash}`)
}
