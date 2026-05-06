/**
 * Nested list — Payments collected under an account.
 */

import { useState } from 'react'
import { useParams } from 'react-router-dom'
import TableSkeleton from '../components/TableSkeleton'
import { NestedObjectListFilterGroup } from '../components/NetworkFilterGroup'
import {
  ListViewBody,
  NestedDetailViewHeaderStack,
  NestedDetailViewRoot,
} from '../components/listView/ListViewTemplates'
import InlineListPagination from '../components/InlineListPagination'
import NestedPageHeader from '../components/NestedPageHeader'
import { getAccountById } from '../data/mockAccounts'
import { NESTED_PAYMENTS_COLLECTED_VIEW_CHIPS } from '../data/nestedListViewChips'
import { slugToDisplayName } from '../utils/string'
import { INLINE_LIST_TOTALS } from '../constants/inlineListMocks'

const ROWS = 10

export default function AccountPaymentsCollectedList() {
  const { id } = useParams<{ id: string }>()
  const mockAccount = getAccountById(id)
  const accountName = mockAccount?.name ?? (id ? slugToDisplayName(id) : '—')
  const [selectedChipId, setSelectedChipId] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const breadcrumbs = [
    { label: 'Network', href: '/network' },
    { label: accountName, href: id ? `/network/${id}` : null },
  ]

  const chips = NESTED_PAYMENTS_COLLECTED_VIEW_CHIPS.map((c) => ({ ...c }))

  return (
    <NestedDetailViewRoot dataName="AccountPaymentsCollectedList">
      <NestedDetailViewHeaderStack>
        <NestedPageHeader breadcrumbs={breadcrumbs} title="Payments collected" />
        <NestedObjectListFilterGroup
          chips={chips}
          selectedChipId={selectedChipId}
          onChipSelect={setSelectedChipId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search payments…"
        />
      </NestedDetailViewHeaderStack>
      <ListViewBody className="pb-9 pt-9">
        <div className="flex min-w-0 max-w-[1120px] flex-1 flex-col gap-4">
          <TableSkeleton rowCount={ROWS} showCheckboxColumn={false} />
          <InlineListPagination
            pageStart={1}
            pageEnd={ROWS}
            totalResults={INLINE_LIST_TOTALS.paymentsCollected}
          />
        </div>
      </ListViewBody>
    </NestedDetailViewRoot>
  )
}
