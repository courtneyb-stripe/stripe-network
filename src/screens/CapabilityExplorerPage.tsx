import CapabilityExplorer from '../components/capabilityExplorer/CapabilityExplorer'

/**
 * /network/capability-explorer — standalone UAD / capability model playground (no app chrome).
 */
export default function CapabilityExplorerPage() {
  return (
    <div
      className="box-border h-full w-full min-w-0 min-h-0 overflow-auto px-10 py-6"
      data-name="Capability explorer page"
    >
      <CapabilityExplorer />
    </div>
  )
}
