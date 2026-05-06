/**
 * Transactions-only section for V1 (Global IA) account detail tab.
 * Money movement label + skeleton table (25 rows, no checkbox).
 */

import SectionHeader from '../SectionHeader'
import TableSkeleton from '../TableSkeleton'
import InlineListPagination from '../InlineListPagination'
import { MONEY_MOVEMENT_TABLE_SKELETON_ROW_COUNT } from '../../data/moneyMovementTransactionTabs'
import { totalResultsForMoneyMovementChip } from '../../constants/inlineListMocks'
import { slugToDisplayName } from '../../utils/string'
import {
  buildTransactionsListPath,
  transactionsListLinkState,
} from '../../utils/transactionsDeepLinks'

const TOYBOX_LABS_ACCOUNT_ID = 'toybox-labs'
const TOYBOX_LABS_ACCOUNT_NAME = 'Toybox Labs'

export type TransactionsSectionProps = {
  onRowClick?: () => void
  accountId?: string
  accountName?: string
}

export default function TransactionsSection({
  onRowClick,
  accountId,
  accountName,
}: TransactionsSectionProps = {}) {
  const routeId = accountId ?? TOYBOX_LABS_ACCOUNT_ID
  const routeLabel =
    accountId === TOYBOX_LABS_ACCOUNT_ID
      ? TOYBOX_LABS_ACCOUNT_NAME
      : accountId != null
        ? slugToDisplayName(accountId)
        : accountName ?? TOYBOX_LABS_ACCOUNT_NAME

  const listPath = buildTransactionsListPath('payments', {
    savedList: 'toybox',
    accountId: routeId,
    accountName: routeLabel,
  })
  const listState = transactionsListLinkState({
    tab: 'payments',
    savedListId: 'toybox',
    accountId: routeId,
    accountName: routeLabel,
  })

  return (
    <div className="flex min-w-0 max-w-[1120px] flex-1 flex-col gap-4">
      <SectionHeader title="Money movement" size="small" />
      <TableSkeleton
        rowCount={MONEY_MOVEMENT_TABLE_SKELETON_ROW_COUNT}
        showCheckboxColumn={false}
        onRowClick={onRowClick}
      />
      <InlineListPagination
        pageStart={1}
        pageEnd={MONEY_MOVEMENT_TABLE_SKELETON_ROW_COUNT}
        totalResults={totalResultsForMoneyMovementChip('payments')}
        to={listPath}
        linkState={listState}
      />
    </div>
  )
}
