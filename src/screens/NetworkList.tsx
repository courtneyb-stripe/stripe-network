/**
 * NetworkList — Network list view. Renders page header (title, actions, tabs) from Figma 2:10678,
 * filter group (saved views + search bar) from Figma 2:10679, and table from Figma 2:10689.
 */

import { useState } from 'react'
import NetworkPageHeader from '../components/NetworkPageHeader'
import NetworkFilterGroup from '../components/NetworkFilterGroup'
import NetworkMetrics from '../components/NetworkMetrics'
import NetworkTable, {
  getFilteredRows,
  type SavedViewId,
  type CustomerViewId,
} from '../components/NetworkTable'
import type { NetworkTabId } from '../components/NetworkPageHeader'

const VIEW_IDS: SavedViewId[] = ['1', '2', '3', '4', '5', '6', '7']
const CUSTOMER_VIEW_IDS: CustomerViewId[] = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7']

export default function NetworkList() {
  const [activeTab, setActiveTab] = useState<NetworkTabId>('all')
  const [selectedViewId, setSelectedViewId] = useState<SavedViewId>('1')
  const [selectedCustomerViewId, setSelectedCustomerViewId] = useState<CustomerViewId>('c1')
  const [searchQuery, setSearchQuery] = useState('')

  const viewCounts =
    activeTab === 'customers'
      ? ({} as Record<SavedViewId, number>)
      : VIEW_IDS.reduce(
          (acc, id) => {
            acc[id] = getFilteredRows(activeTab, id, '').length
            return acc
          },
          {} as Record<SavedViewId, number>
        )

  const customerViewCounts =
    activeTab === 'customers'
      ? CUSTOMER_VIEW_IDS.reduce(
          (acc, id) => {
            acc[id] = getFilteredRows(activeTab, '1', '', id).length
            return acc
          },
          {} as Record<CustomerViewId, number>
        )
      : ({} as Record<CustomerViewId, number>)

  return (
    <div className="flex h-full w-full flex-col gap-[8px]" data-name="NetworkList">
      {/* 8px between this block and table */}
      <div className="flex shrink-0 flex-col gap-0">
        <NetworkPageHeader activeTab={activeTab} onTabChange={setActiveTab} />
        <NetworkFilterGroup
          activeTab={activeTab}
          selectedViewId={selectedViewId}
          onViewChange={setSelectedViewId}
          viewCounts={viewCounts}
          selectedCustomerViewId={selectedCustomerViewId}
          onCustomerViewChange={setSelectedCustomerViewId}
          customerViewCounts={customerViewCounts}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <NetworkMetrics
          activeTab={activeTab}
          statusViewId={selectedViewId}
          customerViewId={selectedCustomerViewId}
          searchQuery={searchQuery}
        />
      </div>
      {/* 8px between metrics and table */}
      <div className="min-h-0 flex-1 overflow-auto">
        <NetworkTable
          activeTab={activeTab}
          statusViewId={selectedViewId}
          customerViewId={selectedCustomerViewId}
          searchQuery={searchQuery}
        />
      </div>
    </div>
  )
}
