/**
 * Nested list — Money movement types that do not map to a dedicated `/transactions` tab
 * (e.g. Stripe balance payments, card transactions, issuing balance).
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
import { getMoneyMovementTransactionTabLabel } from '../data/moneyMovementTransactionTabs'
import { slugToDisplayName } from '../utils/string'
import { totalResultsForMoneyMovementChip } from '../constants/inlineListMocks'
import { accountMoneyMovementNestedListPath } from '../utils/accountNestedListPaths'
import {
  moneyMovementTypeUsesNestedFullList,
  NESTED_FULL_LIST_MONEY_MOVEMENT_TYPE_IDS,
} from '../utils/transactionsDeepLinks'

const ROWS = 10

export default function AccountMoneyMovementList() {
  const navigate = useNavigate()
  const { id, movementType } = useParams<{ id: string; movementType: string }>()
  const [searchQuery, setSearchQuery] = useState('')

  const validType =
    movementType != null &&
    movementType !== '' &&
    moneyMovementTypeUsesNestedFullList(movementType)

  useEffect(() => {
    if (id != null && movementType != null && movementType !== '' && !validType) {
      navigate(`/network/${id}`, { replace: true })
    }
  }, [id, movementType, navigate, validType])

  const mockAccount = getAccountById(id)
  const accountName = mockAccount?.name ?? (id ? slugToDisplayName(id) : '—')

  const pageTitle =
    validType && movementType != null
      ? getMoneyMovementTransactionTabLabel(movementType)
      : 'Money movement'

  const breadcrumbs = [
    { label: 'Network', href: '/network' },
    { label: accountName, href: id ? `/network/${id}` : null },
  ]

  const searchPlaceholder =
    validType && movementType != null
      ? `Search ${getMoneyMovementTransactionTabLabel(movementType).toLowerCase()}…`
      : 'Search…'

  /** Single-type page — chip row documents allowed nested MM types for quick sanity in prototype. */
  const typeChips = NESTED_FULL_LIST_MONEY_MOVEMENT_TYPE_IDS.map((tid) => ({
    id: tid,
    label: getMoneyMovementTransactionTabLabel(tid),
  }))

  return (
    <NestedDetailViewRoot dataName="AccountMoneyMovementList">
      <NestedDetailViewHeaderStack>
        <NestedPageHeader breadcrumbs={breadcrumbs} title={pageTitle} />
        {id != null && validType && movementType != null ? (
          <NestedObjectListFilterGroup
            chips={typeChips}
            selectedChipId={movementType}
            onChipSelect={(chipId) => {
              if (!moneyMovementTypeUsesNestedFullList(chipId) || id == null) return
              navigate(accountMoneyMovementNestedListPath(id, chipId))
            }}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder={searchPlaceholder}
          />
        ) : null}
      </NestedDetailViewHeaderStack>
      <ListViewBody className="pb-9 pt-9">
        <div className="flex min-w-0 max-w-[1120px] flex-1 flex-col gap-4">
          <TableSkeleton rowCount={ROWS} showCheckboxColumn={false} />
          {validType && movementType != null ? (
            <InlineListPagination
              pageStart={1}
              pageEnd={ROWS}
              totalResults={totalResultsForMoneyMovementChip(movementType)}
            />
          ) : null}
        </div>
      </ListViewBody>
    </NestedDetailViewRoot>
  )
}
