/**
 * Nested list — Account directory segment (customers, recipients, card holders).
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
import { NESTED_DIRECTORY_SEGMENT_CHIPS } from '../data/nestedListViewChips'
import { slugToDisplayName } from '../utils/string'
import { INLINE_LIST_TOTALS } from '../constants/inlineListMocks'
import { accountDirectoryPath } from '../utils/accountNestedListPaths'

const ROWS = 10

type SegmentId = 'customers' | 'recipients' | 'card-holders'

const TITLE_BY_SEGMENT: Record<SegmentId, string> = {
  customers: 'Customers',
  recipients: 'Recipients',
  'card-holders': 'Card holders',
}

function isSegment(s: string | undefined): s is SegmentId {
  return s === 'customers' || s === 'recipients' || s === 'card-holders'
}

export default function AccountDirectoryList() {
  const navigate = useNavigate()
  const { id, segment } = useParams<{ id: string; segment: string }>()
  const safeSegment: SegmentId = isSegment(segment) ? segment : 'customers'
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (id != null && segment != null && !isSegment(segment)) {
      navigate(accountDirectoryPath(id, 'customers'), { replace: true })
    }
  }, [id, segment, navigate])

  const mockAccount = getAccountById(id)
  const accountName = mockAccount?.name ?? (id ? slugToDisplayName(id) : '—')

  const breadcrumbs = [
    { label: 'Network', href: '/network' },
    { label: accountName, href: id ? `/network/${id}` : null },
  ]

  const chips = NESTED_DIRECTORY_SEGMENT_CHIPS.map((c) => ({ ...c }))

  const chipMeta = NESTED_DIRECTORY_SEGMENT_CHIPS.find((c) => c.id === safeSegment)
  const total = chipMeta?.count ?? INLINE_LIST_TOTALS.network

  return (
    <NestedDetailViewRoot dataName="AccountDirectoryList">
      <NestedDetailViewHeaderStack>
        <NestedPageHeader breadcrumbs={breadcrumbs} title={TITLE_BY_SEGMENT[safeSegment]} />
        <NestedObjectListFilterGroup
          chips={chips}
          selectedChipId={safeSegment}
          onChipSelect={(chipId) =>
            id && isSegment(chipId) && navigate(accountDirectoryPath(id, chipId))
          }
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search network…"
        />
      </NestedDetailViewHeaderStack>
      <ListViewBody className="pb-9 pt-9">
        <div className="flex min-w-0 max-w-[1120px] flex-1 flex-col gap-4">
          <TableSkeleton rowCount={ROWS} showCheckboxColumn={false} />
          <InlineListPagination pageStart={1} pageEnd={ROWS} totalResults={total} />
        </div>
      </ListViewBody>
    </NestedDetailViewRoot>
  )
}
