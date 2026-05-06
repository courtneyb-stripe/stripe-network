/**
 * NetworkList — Network list view. Renders page header (title, actions, primary audience tabs like Transactions),
 * filter group (saved-view chips + search), and table.
 */

import { useState, useEffect } from 'react'
import { useMatch, useNavigate } from 'react-router-dom'
import NetworkPageHeader from '../components/NetworkPageHeader'
import NetworkFilterGroup, { ALL_TAB_MERCHANT_VIEW_IDS } from '../components/NetworkFilterGroup'
import {
  ListViewBody,
  ListViewHeaderStack,
  ListViewRoot,
} from '../components/listView/ListViewTemplates'
import NetworkTable, {
  getFilteredRows,
  type SavedViewId,
  type CustomerViewId,
} from '../components/NetworkTable'
import type { NetworkTabId } from '../data/networkAudience'
import {
  browseAudienceFromPath,
  browsePathForAudience,
  networkListUsesSimplifiedSecondaryFilters,
} from '../data/networkAudience'

const VIEW_IDS: SavedViewId[] = ['1', '2', '3', '4', '5', '6', '7']
const CUSTOMER_VIEW_IDS: CustomerViewId[] = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7']

export default function NetworkList() {
  const navigate = useNavigate()
  const browseMatch = useMatch('/network/browse/:audience')
  const activeTab: NetworkTabId = browseAudienceFromPath(browseMatch?.params.audience)

  const [selectedMerchant, setSelectedMerchant] = useState('Shopify')
  const [selectedViewId, setSelectedViewId] = useState<SavedViewId>('1')
  const [selectedCustomerViewId, setSelectedCustomerViewId] = useState<CustomerViewId>('c1')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (networkListUsesSimplifiedSecondaryFilters(activeTab)) {
      if (selectedViewId !== '1') setSelectedViewId('1')
      return
    }
    if (activeTab === 'all' && !ALL_TAB_MERCHANT_VIEW_IDS.includes(selectedViewId)) {
      setSelectedViewId('1')
    }
  }, [activeTab, selectedViewId])

  const onMerchantChange = (name: string) => {
    setSelectedMerchant(name)
  }

  const merchantViewIdsForCounts: SavedViewId[] = networkListUsesSimplifiedSecondaryFilters(activeTab)
    ? ['1']
    : activeTab === 'all'
      ? ALL_TAB_MERCHANT_VIEW_IDS
      : VIEW_IDS

  const viewCounts =
    activeTab === 'customers'
      ? ({} as Record<SavedViewId, number>)
      : merchantViewIdsForCounts.reduce(
          (acc, id) => {
            acc[id] = getFilteredRows(activeTab, id, '').length
            return acc
          },
          {} as Record<SavedViewId, number>,
        )

  const customerViewCounts =
    activeTab === 'customers'
      ? CUSTOMER_VIEW_IDS.reduce(
          (acc, id) => {
            acc[id] = getFilteredRows(activeTab, '1', '', id).length
            return acc
          },
          {} as Record<CustomerViewId, number>,
        )
      : ({} as Record<CustomerViewId, number>)

  return (
    <ListViewRoot dataName="NetworkList">
      <ListViewHeaderStack>
        <NetworkPageHeader
          selectedMerchant={selectedMerchant}
          onMerchantChange={onMerchantChange}
          activeTab={activeTab}
          onAudienceTabChange={(id) => navigate(browsePathForAudience(id))}
        />
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
      </ListViewHeaderStack>
      <ListViewBody>
        <NetworkTable
          activeTab={activeTab}
          statusViewId={selectedViewId}
          customerViewId={selectedCustomerViewId}
          searchQuery={searchQuery}
          selectedMerchant={selectedMerchant}
        />
      </ListViewBody>
    </ListViewRoot>
  )
}
