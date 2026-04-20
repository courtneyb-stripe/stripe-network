/**
 * PrototypeContext — Activity filter, IA version, fidelity, and UAD composition (roles, capabilities).
 */

import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react'
import { useLocation } from 'react-router-dom'
import {
  DEFAULT_FINANCING_POPOVER,
  type AccountRoleId,
  type BillingFlavor,
  type CapabilityGroupId,
  type CapabilityStatus,
  type FinancingProductSelection,
  type RelationshipFlags,
  type RiskLevel,
} from '../data/configMatrix'
import { getAccountById } from '../data/mockAccounts'
import { capabilityGroupsWithStatus, resolveCapabilityGroups } from '../data/uadVisibility'

export type ActivityFilterMode = 'viewChip' | 'universalToggle'

export type IaVersionId = 'v0-base' | 'v1-global-ia' | 'v2-money-movement'

export const IA_VERSION_OPTIONS: { id: IaVersionId; label: string }[] = [
  { id: 'v0-base', label: 'V0 (Base)' },
  { id: 'v1-global-ia', label: 'V1 (Global IA)' },
  { id: 'v2-money-movement', label: 'V2 (Money movement)' },
]

export type FidelityId = 'low' | 'mid'

export const FIDELITY_OPTIONS: { id: FidelityId; label: string }[] = [
  { id: 'low', label: 'Low' },
  { id: 'mid', label: 'Mid' },
]

/** @deprecated Use `RiskLevel` from `configMatrix` — kept for existing imports. */
export type RiskLevelId = RiskLevel

const DEFAULT_ROLES: AccountRoleId[] = ['merchant', 'customer']

const ALL_CAPABILITY_GROUPS: CapabilityGroupId[] = [
  'payments',
  'payouts',
  'transfers',
  'billing',
  'treasury',
  'capital',
  'issuing',
]

const ALL_ACTIVE_CAPABILITY_STATUSES: Record<CapabilityGroupId, CapabilityStatus> =
  ALL_CAPABILITY_GROUPS.reduce(
    (acc, id) => {
      acc[id] = 'active'
      return acc
    },
    {} as Record<CapabilityGroupId, CapabilityStatus>
  )

const DEFAULT_RELATIONSHIP: RelationshipFlags = {
  hasActiveSubscriptions: false,
  hasIssuedCard: false,
  expiredPaymentMethod: false,
}

function mergeCapabilityStatusesForGroups(
  prev: Partial<Record<CapabilityGroupId, CapabilityStatus>>,
  groupIds: CapabilityGroupId[]
): Record<CapabilityGroupId, CapabilityStatus> {
  const out = {} as Record<CapabilityGroupId, CapabilityStatus>
  for (const id of groupIds) {
    out[id] = prev[id] ?? 'active'
  }
  return out
}

type PrototypeState = {
  activityFilter: ActivityFilterMode
  includeThirdPartyActivity: boolean
  iaVersion: IaVersionId
  fidelity: FidelityId
  setActivityFilter: (mode: ActivityFilterMode) => void
  setIncludeThirdPartyActivity: (value: boolean) => void
  setIaVersion: (id: IaVersionId) => void
  setFidelity: (id: FidelityId) => void

  /** Applied configuration roles (source of truth for resolver). Default: merchant + customer. */
  activeRoles: Set<AccountRoleId>
  /** Replace applied roles; capability list follows roles + billing. */
  applyActiveRoles: (roles: Set<AccountRoleId>) => void
  riskLevel: RiskLevel
  setRiskLevel: (v: RiskLevel) => void
  /** Same as `billingEnabled`; kept for existing consumers. */
  hasBilling: boolean
  setHasBilling: (v: boolean) => void
  billingEnabled: boolean
  setBillingEnabled: (v: boolean) => void
  billingFlavors: Set<BillingFlavor>
  setBillingFlavors: Dispatch<SetStateAction<Set<BillingFlavor>>>
  relationship: RelationshipFlags
  setRelationship: Dispatch<SetStateAction<RelationshipFlags>>
  capabilityStatuses: Record<CapabilityGroupId, CapabilityStatus>
  setCapabilityStatus: (groupId: CapabilityGroupId, status: CapabilityStatus) => void
  /** Configure account → Financing: Loan / Cash advance (drives Financing popover chips). */
  financingProducts: FinancingProductSelection
  setFinancingProducts: Dispatch<SetStateAction<FinancingProductSelection>>
  /** Configure account → Payments: show payment methods block in Payments popover. */
  hasPaymentMethodOnFile: boolean
  setHasPaymentMethodOnFile: (v: boolean) => void
  /** Configure account → Payouts: show payout schedule / bank destinations well in Payouts popover. */
  hasPayoutSchedule: boolean
  setHasPayoutSchedule: (v: boolean) => void
  /** Configure account → Treasury: show financial accounts well in Financial accounts popover. */
  hasFinancialAccounts: boolean
  setHasFinancialAccounts: (v: boolean) => void
}

const PrototypeContext = createContext<PrototypeState | null>(null)

export function PrototypeProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  const networkAccountId = useMemo(
    () => /^\/network\/([^/]+)/.exec(location.pathname)?.[1],
    [location.pathname]
  )

  const [activityFilter, setActivityFilter] = useState<ActivityFilterMode>('viewChip')
  const [includeThirdPartyActivity, setIncludeThirdPartyActivity] = useState(false)
  const [iaVersion, setIaVersion] = useState<IaVersionId>('v2-money-movement')
  const [fidelity, setFidelity] = useState<FidelityId>('low')

  const [activeRoleList, setActiveRoleList] = useState<AccountRoleId[]>([...DEFAULT_ROLES])
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('low')
  const [billingEnabled, setBillingEnabled] = useState(false)
  const [billingFlavors, setBillingFlavors] = useState<Set<BillingFlavor>>(() => new Set())
  const [relationship, setRelationship] = useState<RelationshipFlags>({ ...DEFAULT_RELATIONSHIP })
  const [financingProducts, setFinancingProducts] = useState<FinancingProductSelection>(
    () => ({ ...DEFAULT_FINANCING_POPOVER })
  )
  const [hasPaymentMethodOnFile, setHasPaymentMethodOnFile] = useState(true)
  const [hasPayoutSchedule, setHasPayoutSchedule] = useState(true)
  const [hasFinancialAccounts, setHasFinancialAccounts] = useState(true)
  const [capabilityStatuses, setCapabilityStatuses] = useState<
    Record<CapabilityGroupId, CapabilityStatus>
  >(() =>
    mergeCapabilityStatusesForGroups(
      ALL_ACTIVE_CAPABILITY_STATUSES,
      capabilityGroupsWithStatus(resolveCapabilityGroups(new Set(DEFAULT_ROLES), false))
    )
  )

  const activeRoles = useMemo(() => new Set(activeRoleList), [activeRoleList])

  const resolvedCapabilityGroups = useMemo(
    () => resolveCapabilityGroups(new Set(activeRoleList), billingEnabled),
    [activeRoleList, billingEnabled]
  )

  const capabilityGroupsForState = useMemo(
    () => capabilityGroupsWithStatus(resolvedCapabilityGroups),
    [resolvedCapabilityGroups]
  )

  useEffect(() => {
    setCapabilityStatuses((prev) =>
      mergeCapabilityStatusesForGroups(prev, capabilityGroupsForState)
    )
  }, [capabilityGroupsForState])

  /** Default risk Low; mock may set elevated/high (e.g. Radar). Re-sync when the :id in /network/:id… changes only. */
  useEffect(() => {
    if (networkAccountId == null) return
    const mock = getAccountById(networkAccountId)
    setRiskLevel(mock?.riskLevel ?? 'low')
  }, [networkAccountId])

  const applyActiveRoles = useCallback((roles: Set<AccountRoleId>) => {
    setActiveRoleList([...roles])
  }, [])

  const setCapabilityStatus = useCallback((groupId: CapabilityGroupId, status: CapabilityStatus) => {
    setCapabilityStatuses((prev) => ({ ...prev, [groupId]: status }))
  }, [])

  const setHasBilling = useCallback((v: boolean) => {
    setBillingEnabled(v)
  }, [])

  const value = useMemo(
    () => ({
      activityFilter,
      includeThirdPartyActivity,
      iaVersion,
      fidelity,
      setActivityFilter,
      setIncludeThirdPartyActivity,
      setIaVersion,
      setFidelity,
      activeRoles,
      applyActiveRoles,
      riskLevel,
      setRiskLevel,
      hasBilling: billingEnabled,
      setHasBilling,
      billingEnabled,
      setBillingEnabled,
      billingFlavors,
      setBillingFlavors,
      relationship,
      setRelationship,
      capabilityStatuses,
      setCapabilityStatus,
      financingProducts,
      setFinancingProducts,
      hasPaymentMethodOnFile,
      setHasPaymentMethodOnFile,
      hasPayoutSchedule,
      setHasPayoutSchedule,
      hasFinancialAccounts,
      setHasFinancialAccounts,
    }),
    [
      activityFilter,
      includeThirdPartyActivity,
      iaVersion,
      fidelity,
      activeRoles,
      applyActiveRoles,
      riskLevel,
      billingEnabled,
      billingFlavors,
      relationship,
      capabilityStatuses,
      setCapabilityStatus,
      setHasBilling,
      financingProducts,
      hasPaymentMethodOnFile,
      hasPayoutSchedule,
      hasFinancialAccounts,
    ]
  )

  return <PrototypeContext.Provider value={value}>{children}</PrototypeContext.Provider>
}

export function usePrototype() {
  const ctx = useContext(PrototypeContext)
  if (ctx == null) {
    throw new Error('usePrototype must be used within PrototypeProvider')
  }
  return ctx
}

export function usePrototypeOptional(): PrototypeState | null {
  return useContext(PrototypeContext)
}
