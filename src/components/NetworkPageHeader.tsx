/**
 * NetworkPageHeader — Parent list chrome (Figma **6269:112533** — Stripe Network ’26 Working).
 * Title + offset icon pills + Create + primary audience tabs (same overflow pattern as Transactions).
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
import NetworkOverflowTabBar from './NetworkOverflowTabBar'
import type { NetworkTabId } from '../data/networkAudience'

export type { NetworkTabId } from '../data/networkAudience'

export default function NetworkPageHeader({
  selectedMerchant,
  activeTab,
  onAudienceTabChange,
}: {
  selectedMerchant: string
  onMerchantChange?: (name: string) => void
  activeTab: NetworkTabId
  onAudienceTabChange: (tabId: NetworkTabId) => void
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
            Network
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
        <NetworkOverflowTabBar activeTab={activeTab} onTabChange={onAudienceTabChange} />
      </ParentListHeaderTabsRegion>
    </ParentListHeaderChrome>
  )
}
