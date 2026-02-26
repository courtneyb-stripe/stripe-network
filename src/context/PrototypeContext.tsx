/**
 * PrototypeContext — State for prototype options (Activity filter, etc.).
 * Consumed by PrototypeFloatie and by account detail sections (Overview, Billing, Products).
 */

import { createContext, useContext, useState, useMemo, type ReactNode } from 'react'

export type ActivityFilterMode = 'viewChip' | 'universalToggle'

export type IaVersionId = 'v0-base' | 'v1-global-ia' | 'v2-money-movement'

export const IA_VERSION_OPTIONS: { id: IaVersionId; label: string }[] = [
  { id: 'v0-base', label: 'V0 (Base)' },
  { id: 'v1-global-ia', label: 'V1 (Global IA)' },
  { id: 'v2-money-movement', label: 'V2 (Money movement)' },
]

/** Low = simplified; Mid = current version. */
export type FidelityId = 'low' | 'mid'

export const FIDELITY_OPTIONS: { id: FidelityId; label: string }[] = [
  { id: 'low', label: 'Low' },
  { id: 'mid', label: 'Mid' },
]

type PrototypeState = {
  /** @deprecated Always ViewChips in UI; kept for backward compatibility. */
  activityFilter: ActivityFilterMode
  includeThirdPartyActivity: boolean
  iaVersion: IaVersionId
  /** Fidelity: Mid = current version; Low = simplified. */
  fidelity: FidelityId
  setActivityFilter: (mode: ActivityFilterMode) => void
  setIncludeThirdPartyActivity: (value: boolean) => void
  setIaVersion: (id: IaVersionId) => void
  setFidelity: (id: FidelityId) => void
}

const PrototypeContext = createContext<PrototypeState | null>(null)

export function PrototypeProvider({ children }: { children: ReactNode }) {
  const [activityFilter, setActivityFilter] = useState<ActivityFilterMode>('viewChip')
  const [includeThirdPartyActivity, setIncludeThirdPartyActivity] = useState(false)
  const [iaVersion, setIaVersion] = useState<IaVersionId>('v2-money-movement')
  const [fidelity, setFidelity] = useState<FidelityId>('low')

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
    }),
    [activityFilter, includeThirdPartyActivity, iaVersion, fidelity]
  )

  return (
    <PrototypeContext.Provider value={value}>
      {children}
    </PrototypeContext.Provider>
  )
}

export function usePrototype() {
  const ctx = useContext(PrototypeContext)
  if (ctx == null) {
    throw new Error('usePrototype must be used within PrototypeProvider')
  }
  return ctx
}

/** Safe hook for optional prototype context (e.g. sections that may render outside provider). */
export function usePrototypeOptional(): PrototypeState | null {
  return useContext(PrototypeContext)
}
