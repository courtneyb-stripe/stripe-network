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
  type AccountRoleId,
  type BillingFlavor,
  type CapabilityGroupId,
  type CapabilityStatus,
  type FinancingProductSelection,
  type RelationshipFlags,
  type RiskLevel,
} from '../data/configMatrix'
import { getAccountById } from '../data/mockAccounts'
import {
  capabilityGroupsWithStatus,
  resolveCapabilityGroups,
  suppressConnectPayoutSchedule,
} from '../data/uadVisibility'
import { getInitialPrototypeStateFromSearch } from '../data/prototypeUrlState'

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

const ALL_CAPABILITY_GROUPS: CapabilityGroupId[] = [
  'payments',
  'payouts',
  'transfers',
  'billing',
  'treasury',
  'capital',
  'issuing',
]

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
  /** Tax capability group (separate from `CapabilityGroupId` chips). Drives compliance / Actions required when not active. */
  taxCapabilityStatus: CapabilityStatus
  setTaxCapabilityStatus: (status: CapabilityStatus) => void
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

  const initialProto = useMemo(
    () =>
      getInitialPrototypeStateFromSearch(
        typeof window !== 'undefined' ? window.location.search : ''
      ),
    []
  )

  const [activityFilter, setActivityFilter] = useState<ActivityFilterMode>('viewChip')
  const [includeThirdPartyActivity, setIncludeThirdPartyActivity] = useState(false)
  const [iaVersion, setIaVersion] = useState<IaVersionId>('v2-money-movement')
  const [fidelity, setFidelity] = useState<FidelityId>('low')

  const [activeRoleList, setActiveRoleList] = useState<AccountRoleId[]>(() => [
    ...initialProto.activeRoleList,
  ])
  const [riskLevel, setRiskLevel] = useState<RiskLevel>(() => initialProto.riskLevel)
  const [billingEnabled, setBillingEnabled] = useState(() => initialProto.billingEnabled)
  const [billingFlavors, setBillingFlavors] = useState<Set<BillingFlavor>>(
    () => new Set(initialProto.billingFlavors)
  )
  const [relationship, setRelationship] = useState<RelationshipFlags>(() => ({
    ...initialProto.relationship,
  }))
  const [financingProducts, setFinancingProducts] = useState<FinancingProductSelection>(() => ({
    ...initialProto.financingProducts,
  }))
  const [hasPaymentMethodOnFile, setHasPaymentMethodOnFile] = useState(
    () => initialProto.hasPaymentMethodOnFile
  )
  const [hasPayoutSchedule, setHasPayoutSchedule] = useState(() => initialProto.hasPayoutSchedule)
  const [hasFinancialAccounts, setHasFinancialAccounts] = useState(
    () => initialProto.hasFinancialAccounts
  )
  const [capabilityStatuses, setCapabilityStatuses] = useState<
    Record<CapabilityGroupId, CapabilityStatus>
  >(() => ({ ...initialProto.capabilityStatuses }))
  const [taxCapabilityStatus, setTaxCapabilityStatus] = useState<CapabilityStatus>('active')

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

  /** GP recipient or Connect recipient-alone — never persist Connect payout schedule on prototype state. */
  useEffect(() => {
    if (suppressConnectPayoutSchedule(activeRoles)) {
      setHasPayoutSchedule(false)
    }
  }, [activeRoles])

  /** Default risk Low; mock may set elevated/high (e.g. Radar). Skipped when URL supplied `risk`. */
  useEffect(() => {
    if (networkAccountId == null) return
    if (initialProto.riskSpecified) return
    const mock = getAccountById(networkAccountId)
    setRiskLevel(mock?.riskLevel ?? 'low')
  }, [networkAccountId, initialProto.riskSpecified])

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
      taxCapabilityStatus,
      setTaxCapabilityStatus,
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
      taxCapabilityStatus,
      setTaxCapabilityStatus,
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
