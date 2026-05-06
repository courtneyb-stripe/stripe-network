/**
 * TransactionsPageHeader — Same parent list chrome as Network (Figma **6269:112533**).
 * Title + pill toolbar + overflow primary tabs.
 */

import {
  PAGE_HEADER_PARENT_LIST_HEADING_CLASS,
  PAGE_HEADER_PARENT_LIST_HEADING_STYLE,
  ParentListHeaderActions,
  ParentListHeaderChrome,
  ParentListHeaderCreateButton,
  ParentListHeaderIconPillButton,
  ParentListHeaderTabsRegion,
  ParentListHeaderTitleRow,
} from './pageHeader'
import { Icon } from '../icons/SailIcons'
import TransactionsOverflowTabBar from './TransactionsOverflowTabBar'
import type { TransactionsTabId } from '../data/transactionsPageTabs'

export type { TransactionsTabId } from '../data/transactionsPageTabs'
export {
  parseTransactionsTabFromUrl,
  TRANSACTIONS_PAGE_TABS,
} from '../data/transactionsPageTabs'

export default function TransactionsPageHeader({
  activeTab,
  onTabChange,
  initialMerchant: _initialMerchant,
  onMerchantChange: _onMerchantChange,
}: {
  activeTab: TransactionsTabId
  onTabChange: (tabId: TransactionsTabId) => void
  initialMerchant?: string
  onMerchantChange?: (merchant: string | null) => void
}) {
  return (
    <ParentListHeaderChrome>
      <ParentListHeaderTitleRow>
        <div className="flex min-w-0 shrink-0 flex-col items-start">
          <h1
            className={PAGE_HEADER_PARENT_LIST_HEADING_CLASS}
            style={PAGE_HEADER_PARENT_LIST_HEADING_STYLE}
            data-name="Page heading"
          >
            Transactions
          </h1>
        </div>
        <ParentListHeaderActions>
          <ParentListHeaderIconPillButton aria-label="Analytics">
            <Icon name="barChart" size={12} fill="var(--color-icon-default)" />
          </ParentListHeaderIconPillButton>
          <ParentListHeaderIconPillButton aria-label="Export">
            <Icon name="export" size={12} fill="var(--color-icon-default)" />
          </ParentListHeaderIconPillButton>
          <ParentListHeaderCreateButton
            aria-label="Create"
            icon={<Icon name="add" size={12} fill="var(--color-icon-default)" />}
          >
            Create
          </ParentListHeaderCreateButton>
        </ParentListHeaderActions>
      </ParentListHeaderTitleRow>
      <ParentListHeaderTabsRegion>
        <TransactionsOverflowTabBar activeTab={activeTab} onTabChange={onTabChange} />
      </ParentListHeaderTabsRegion>
    </ParentListHeaderChrome>
  )
}
