/**
 * Nested **detail** list (business invoices under an account).
 * Chrome: Figma nested header **6256:22471** + M1 chip row + search (see {@link NestedObjectListFilterGroup}).
 * Entry: Billing → Invoices on the account hub (“As a business”) tab.
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
import { NESTED_INVOICE_LIST_VIEW_CHIPS } from '../data/nestedListViewChips'
import { slugToDisplayName } from '../utils/string'
import { INLINE_LIST_TOTALS } from '../constants/inlineListMocks'

const INVOICE_TABLE_ROWS = 10

export default function AccountBusinessInvoicesList() {
  const { id } = useParams<{ id: string }>()
  const mockAccount = getAccountById(id)
  const accountName = mockAccount?.name ?? (id ? slugToDisplayName(id) : '—')
  const [selectedChipId, setSelectedChipId] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const breadcrumbs = [
    { label: 'Network', href: '/network' },
    { label: accountName, href: id ? `/network/${id}` : null },
  ]

  const chips = NESTED_INVOICE_LIST_VIEW_CHIPS.map((c) => ({ ...c }))

  return (
    <NestedDetailViewRoot dataName="AccountBusinessInvoicesList">
      <NestedDetailViewHeaderStack>
        <NestedPageHeader breadcrumbs={breadcrumbs} title="Invoices" />
        <NestedObjectListFilterGroup
          chips={chips}
          selectedChipId={selectedChipId}
          onChipSelect={setSelectedChipId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search invoices…"
        />
      </NestedDetailViewHeaderStack>
      <ListViewBody className="pb-9 pt-9">
        <div className="flex min-w-0 max-w-[1120px] flex-1 flex-col gap-4">
          <TableSkeleton rowCount={INVOICE_TABLE_ROWS} showCheckboxColumn={false} />
          <InlineListPagination
            pageStart={1}
            pageEnd={INVOICE_TABLE_ROWS}
            totalResults={INLINE_LIST_TOTALS.invoices}
          />
        </div>
      </ListViewBody>
    </NestedDetailViewRoot>
  )
}
