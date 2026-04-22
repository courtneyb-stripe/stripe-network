import BabySegmentedControl from '../BabySegmentedControl'

export type ExplorerTabId = 'signals' | 'products'

const TAB_OPTIONS: { id: ExplorerTabId; label: string }[] = [
  { id: 'signals', label: 'UAD–status signals' },
  { id: 'products', label: 'Products ↔ capabilities' },
]

type TabSwitcherProps = {
  activeId: ExplorerTabId
  onChange: (id: ExplorerTabId) => void
}

export default function TabSwitcher({ activeId, onChange }: TabSwitcherProps) {
  return (
    <BabySegmentedControl<ExplorerTabId>
      options={TAB_OPTIONS}
      selectedId={activeId}
      onChange={onChange}
      aria-label="Capability explorer views"
    />
  )
}
