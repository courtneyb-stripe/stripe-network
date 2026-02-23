/**
 * NetworkPageHeader — Figma Page Title node 2:10678 (Stripe Network Cursor SRC).
 * Title row + action buttons + tabs for the Network screen.
 */

import { Icon } from '../icons/SailIcons'
import { PageActionButton } from './PageActionButton'
import TabBar from './TabBar'

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'merchants', label: 'Merchants' },
  { id: 'customers', label: 'Customers' },
] as const

export type NetworkTabId = (typeof TABS)[number]['id']

export default function NetworkPageHeader({
  activeTab,
  onTabChange,
}: {
  activeTab: NetworkTabId
  onTabChange: (tabId: NetworkTabId) => void
}) {

  return (
    <div
      className="flex w-full flex-col gap-[4px] px-[40px] pt-[16px] pb-[8px]"
      data-name="Page Title"
      data-node-id="2:10678"
    >
      {/* Title row */}
      <div
        className="flex w-full items-center justify-between shrink-0"
        data-name="Title"
      >
        <h1 className="font-heading-xlarge shrink-0" data-name="Page heading">
          Network
        </h1>
        <div
          className="flex shrink-0 items-center gap-[8px]"
          data-name="Page Actions"
        >
          <PageActionButton iconOnly aria-label="More options">
            <Icon name="more" size={12} fill="var(--color-icon-default)" />
          </PageActionButton>
          <PageActionButton>Analyze</PageActionButton>
          <PageActionButton>
            <Icon name="add" size={12} fill="var(--color-icon-default)" />
            Add customer
          </PageActionButton>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex w-full shrink-0 flex-col" data-name="Tabs">
        <TabBar
          tabs={TABS}
          activeId={activeTab}
          onChange={onTabChange}
          variant="primary"
          gap={16}
        />
      </div>
    </div>
  )
}
