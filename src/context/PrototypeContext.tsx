/**
 * PrototypeContext — State for prototype options (Activity filter, etc.).
 * Consumed by PrototypeFloatie and by account detail sections (Overview, Billing, Products).
 */

import { createContext, useContext, useState, useMemo, type ReactNode } from 'react'

export type ActivityFilterMode = 'viewChip' | 'universalToggle' | 'viewActivityDropdown'

export type ViewActivityScope = 'all' | 'account'

export type IaVariant = 'v1' | 'v2' | 'v3'

type PrototypeState = {
  activityFilter: ActivityFilterMode
  includeThirdPartyActivity: boolean
  viewActivityScope: ViewActivityScope
  iaVariant: IaVariant
  loFiMode: boolean
  setActivityFilter: (mode: ActivityFilterMode) => void
  setIncludeThirdPartyActivity: (value: boolean) => void
  setViewActivityScope: (scope: ViewActivityScope) => void
  setIaVariant: (v: IaVariant) => void
  setLoFiMode: (v: boolean) => void
}

const PrototypeContext = createContext<PrototypeState | null>(null)

export function PrototypeProvider({ children }: { children: ReactNode }) {
  const [activityFilter, setActivityFilter] = useState<ActivityFilterMode>('viewChip')
  const [includeThirdPartyActivity, setIncludeThirdPartyActivity] = useState(false)
  const [viewActivityScope, setViewActivityScope] = useState<ViewActivityScope>('account')
  const [iaVariant, setIaVariant] = useState<IaVariant>('v1')
  const [loFiMode, setLoFiMode] = useState(false)

  const value = useMemo(
    () => ({
      activityFilter,
      includeThirdPartyActivity,
      viewActivityScope,
      iaVariant,
      loFiMode,
      setActivityFilter,
      setIncludeThirdPartyActivity,
      setViewActivityScope,
      setIaVariant,
      setLoFiMode,
    }),
    [activityFilter, includeThirdPartyActivity, viewActivityScope, iaVariant, loFiMode]
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
