/**
 * Nested list — Money received (payouts vs transfers) under an account.
 */

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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
import { NESTED_MONEY_RECEIVED_VIEW_CHIPS } from '../data/nestedListViewChips'
import { slugToDisplayName } from '../utils/string'
import { totalResultsForMoneyMovementChip } from '../constants/inlineListMocks'
import { accountMoneyReceivedPath } from '../utils/accountNestedListPaths'

const ROWS = 10

export default function AccountMoneyReceivedList() {
  const navigate = useNavigate()
  const { id, kind } = useParams<{ id: string; kind: string }>()
  const safeKind: 'payouts' | 'transfers' = kind === 'transfers' ? 'transfers' : 'payouts'
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (id != null && kind !== 'payouts' && kind !== 'transfers') {
      navigate(accountMoneyReceivedPath(id, 'payouts'), { replace: true })
    }
  }, [id, kind, navigate])

  const mockAccount = getAccountById(id)
  const accountName = mockAccount?.name ?? (id ? slugToDisplayName(id) : '—')

  const breadcrumbs = [
    { label: 'Network', href: '/network' },
    { label: accountName, href: id ? `/network/${id}` : null },
  ]

  const chips = NESTED_MONEY_RECEIVED_VIEW_CHIPS.map((c) => ({ ...c }))

  return (
    <NestedDetailViewRoot dataName="AccountMoneyReceivedList">
      <NestedDetailViewHeaderStack>
        <NestedPageHeader breadcrumbs={breadcrumbs} title="Money received" />
        <NestedObjectListFilterGroup
          chips={chips}
          selectedChipId={safeKind}
          onChipSelect={(chipId) =>
            id && navigate(accountMoneyReceivedPath(id, chipId as 'payouts' | 'transfers'))
          }
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder={`Search ${safeKind}…`}
        />
      </NestedDetailViewHeaderStack>
      <ListViewBody className="pb-9 pt-9">
        <div className="flex min-w-0 max-w-[1120px] flex-1 flex-col gap-4">
          <TableSkeleton rowCount={ROWS} showCheckboxColumn={false} />
          <InlineListPagination
            pageStart={1}
            pageEnd={ROWS}
            totalResults={totalResultsForMoneyMovementChip(safeKind)}
          />
        </div>
      </ListViewBody>
    </NestedDetailViewRoot>
  )
}
