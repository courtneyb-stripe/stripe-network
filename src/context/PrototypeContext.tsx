/**
 * PrototypeContext — State for prototype options (Activity filter, etc.).
 * Consumed by PrototypeFloatie and by account detail sections (Overview, Billing, Products).
 */

import { createContext, useContext, useState, useMemo, type ReactNode } from 'react'

export type ActivityFilterMode = 'viewChip' | 'universalToggle'

type PrototypeState = {
  activityFilter: ActivityFilterMode
  includeThirdPartyActivity: boolean
  setActivityFilter: (mode: ActivityFilterMode) => void
  setIncludeThirdPartyActivity: (value: boolean) => void
}

const PrototypeContext = createContext<PrototypeState | null>(null)

export function PrototypeProvider({ children }: { children: ReactNode }) {
  const [activityFilter, setActivityFilter] = useState<ActivityFilterMode>('viewChip')
  const [includeThirdPartyActivity, setIncludeThirdPartyActivity] = useState(false)

  const value = useMemo(
    () => ({
      activityFilter,
      includeThirdPartyActivity,
      setActivityFilter,
      setIncludeThirdPartyActivity,
    }),
    [activityFilter, includeThirdPartyActivity]
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
