import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { ExplorerTabId } from './TabSwitcher'
import TabSwitcher from './TabSwitcher'
import MappingTab from './mapping/MappingTab'
import ProductsTab from './products/ProductsTab'
import SignalsTab from './signals/SignalsTab'

function parseTabParam(raw: string | null): ExplorerTabId {
  if (raw === 'uad' || raw === 'mapping' || raw === 'map') return raw
  /** Legacy URLs */
  if (raw === 'signals') return 'uad'
  if (raw === 'products') return 'map'
  return 'uad'
}

export default function CapabilityExplorer() {
  const [searchParams, setSearchParams] = useSearchParams()

  const activeTab = useMemo(
    () => parseTabParam(searchParams.get('tab')),
    [searchParams]
  )

  const setTab = useCallback(
    (id: ExplorerTabId) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set('tab', id)
          return next
        },
        { replace: true }
      )
    },
    [setSearchParams]
  )

  return (
    <div className="flex w-full min-w-0 flex-col gap-4" data-name="Capability explorer">
      <div className="flex w-full min-w-0 flex-col items-start gap-2">
        <h2 className="m-0 font-heading-xlarge" id="capability-explorer-title">
          Capability explorer
        </h2>
        <TabSwitcher activeId={activeTab} onChange={setTab} />
      </div>
      {activeTab === 'uad' ? (
        <SignalsTab />
      ) : activeTab === 'mapping' ? (
        <MappingTab />
      ) : (
        <ProductsTab />
      )}
    </div>
  )
}
