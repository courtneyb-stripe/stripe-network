import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { ExplorerTabId } from './TabSwitcher'
import TabSwitcher from './TabSwitcher'
import ProductsTab from './products/ProductsTab'
import SignalsTab from './signals/SignalsTab'

function parseTabParam(raw: string | null): ExplorerTabId {
  if (raw === 'products' || raw === 'signals') return raw
  return 'signals'
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
          if (id === 'signals') next.set('tab', 'signals')
          else next.set('tab', 'products')
          return next
        },
        { replace: true }
      )
    },
    [setSearchParams]
  )

  return (
    <div className="flex w-full min-w-0 flex-col gap-4" data-name="Capability explorer">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="m-0 font-heading-xlarge" id="capability-explorer-title">
          Capability explorer
        </h2>
        <TabSwitcher activeId={activeTab} onChange={setTab} />
      </div>
      {activeTab === 'products' ? <ProductsTab /> : <SignalsTab />}
    </div>
  )
}
