import TabBar from '../TabBar'

export type ExplorerTabId = 'uad' | 'mapping' | 'map'

const TABS: readonly { id: string; label: string }[] = [
  { id: 'uad', label: 'UAD status groups' },
  { id: 'mapping', label: 'Capability groups ↔ Status groups' },
  { id: 'map', label: 'Capabilities map' },
]

type TabSwitcherProps = {
  activeId: ExplorerTabId
  onChange: (id: ExplorerTabId) => void
}

export default function TabSwitcher({ activeId, onChange }: TabSwitcherProps) {
  return (
    <div className="w-full min-w-0" aria-label="Capability explorer views" role="presentation">
      <TabBar
        tabs={TABS}
        activeId={activeId}
        onChange={(id) => onChange(id as ExplorerTabId)}
      />
    </div>
  )
}
