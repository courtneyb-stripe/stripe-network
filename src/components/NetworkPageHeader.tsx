/**
 * NetworkPageHeader — Figma Page Title node 2:10678 (Stripe Network Cursor SRC).
 * Title row + action buttons + tabs. Merchant dropdown removed for now.
 * When merchant is not Shopify: tabs All, Customers, Recipients (no Merchants).
 */

import { Icon } from '../icons/SailIcons'
import { PageActionButton } from './PageActionButton'
import TabBar from './TabBar'

const TABS_SHOPIFY = [
  { id: 'all' as const, label: 'All' },
  { id: 'merchants' as const, label: 'Merchants' },
  { id: 'customers' as const, label: 'Customers' },
]

const TABS_OTHER = [
  { id: 'all' as const, label: 'All' },
  { id: 'customers' as const, label: 'Customers' },
  { id: 'recipients' as const, label: 'Recipients' },
]

export type NetworkTabId = 'all' | 'merchants' | 'customers' | 'recipients'

export default function NetworkPageHeader({
  activeTab,
  onTabChange,
  selectedMerchant,
}: {
  activeTab: NetworkTabId
  onTabChange: (tabId: NetworkTabId) => void
  selectedMerchant: string
  onMerchantChange?: (name: string) => void
}) {
  const isShopify = selectedMerchant === 'Shopify'
  const tabs = isShopify ? TABS_SHOPIFY : TABS_OTHER

  return (
    <div
      className="flex w-full flex-col gap-[4px] px-[40px] pt-[16px] pb-[8px]"
      data-name="Page Title"
      data-node-id="2:10678"
    >
      <div className="flex w-full items-center justify-between shrink-0" data-name="Title">
        <div className="flex shrink-0 items-center gap-2">
          <h1 className="font-heading-xlarge shrink-0" data-name="Page heading">
            Network
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-[8px]" data-name="Page Actions">
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

      <div className="flex w-full shrink-0 flex-col" data-name="Tabs">
        <TabBar
          tabs={tabs}
          activeId={activeTab}
          onChange={(id) => onTabChange(id as NetworkTabId)}
          variant="primary"
          gap={16}
        />
      </div>
    </div>
  )
}
