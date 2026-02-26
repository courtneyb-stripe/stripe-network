/**
 * Commerce section — Network section with tabs (All, Customers, Recipients) and table skeleton.
 * Sidebar: Local Payment methods gray box.
 */

import { useState } from 'react'
import SectionHeader from '../SectionHeader'
import TabBar from '../TabBar'
import TableSkeleton from '../TableSkeleton'

const NETWORK_TABS = [
  { id: 'all' as const, label: 'All' },
  { id: 'customers' as const, label: 'Customers' },
  { id: 'recipients' as const, label: 'Recipients' },
] as const

type NetworkTabId = (typeof NETWORK_TABS)[number]['id']

export default function Commerce() {
  const [activeTab, setActiveTab] = useState<NetworkTabId>('all')

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-6">
      <div className="flex flex-col gap-0 pt-0">
        <SectionHeader title="Network" size="small" onAction={() => {}} actionLabel="View all" />
        <div className="flex w-full">
          <TabBar
            tabs={NETWORK_TABS.map((t) => ({ id: t.id, label: t.label }))}
            activeId={activeTab}
            onChange={(id) => setActiveTab(id as NetworkTabId)}
            variant="secondary"
            gap={6}
          />
        </div>
        <TableSkeleton rowCount={7} showCheckboxColumn={false} />
      </div>

      <div className="flex flex-col gap-0 pt-10">
        <SectionHeader title="Product list" size="small" onAction={() => {}} actionLabel="View all" />
        <TableSkeleton rowCount={5} showCheckboxColumn={false} />
      </div>
    </div>
  )
}

export function CommerceSidebar() {
  return (
    <div className="flex flex-col gap-4">
      <div
        className="flex items-center rounded-[12px] bg-offset px-4 py-3"
        data-name="Sidebar: Local Payment methods"
      >
        <p className="text-[14px] text-subdued">Local Payment methods</p>
      </div>
    </div>
  )
}
