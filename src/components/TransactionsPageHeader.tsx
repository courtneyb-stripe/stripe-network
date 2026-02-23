/**
 * TransactionsPageHeader — Same structure as NetworkPageHeader (Figma 2:10678).
 * Title "Transactions" + action buttons + tabs: Payments, Payouts, Top ups, Platform fees, Transfers to connected accounts.
 */

import { Icon } from '../icons/SailIcons'
import { PageActionButton } from './PageActionButton'
import TabBar from './TabBar'

const TABS = [
  { id: 'payments', label: 'Payments' },
  { id: 'payouts', label: 'Payouts' },
  { id: 'top-ups', label: 'Top ups' },
  { id: 'platform-fees', label: 'Platform fees' },
  { id: 'transfers', label: 'Transfers to connected accounts' },
] as const

export type TransactionsTabId = (typeof TABS)[number]['id']

export default function TransactionsPageHeader({
  activeTab,
  onTabChange,
}: {
  activeTab: TransactionsTabId
  onTabChange: (tabId: TransactionsTabId) => void
}) {
  return (
    <div
      className="flex w-full flex-col gap-[4px] px-[40px] pt-[16px] pb-[8px]"
      data-name="Page Title"
      data-node-id="2:10678"
    >
      <div className="flex w-full items-center justify-between shrink-0" data-name="Title">
        <h1 className="font-heading-xlarge shrink-0" data-name="Page heading">
          Transactions
        </h1>
        <div className="flex shrink-0 items-center gap-[8px]" data-name="Page Actions">
          <PageActionButton iconOnly aria-label="More options">
            <Icon name="more" size={12} fill="var(--color-icon-default)" />
          </PageActionButton>
          <PageActionButton>Analyze</PageActionButton>
          <PageActionButton>
            <Icon name="add" size={12} fill="var(--color-icon-default)" />
            Add
          </PageActionButton>
        </div>
      </div>
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
