/**
 * Transactions-only section for V1 (Global IA) account detail tab.
 * Recent transactions label + skeleton table (10 rows, no checkbox).
 */

import { useNavigate } from 'react-router-dom'
import SectionHeader from '../SectionHeader'
import TableSkeleton from '../TableSkeleton'

const TOYBOX_LABS_ACCOUNT_ID = 'toybox-labs'
const TOYBOX_LABS_ACCOUNT_NAME = 'Toybox Labs'

export type TransactionsSectionProps = {
  onRowClick?: () => void
}

export default function TransactionsSection({ onRowClick }: TransactionsSectionProps = {}) {
  const navigate = useNavigate()

  const openTransactionsFilteredByToyboxLabs = () => {
    navigate('/transactions?tab=payments&savedList=toybox', {
      state: {
        tab: 'payments',
        savedListId: 'toybox',
        accountId: TOYBOX_LABS_ACCOUNT_ID,
        accountName: TOYBOX_LABS_ACCOUNT_NAME,
      },
    })
  }

  return (
    <div className="flex min-w-0 max-w-[1120px] flex-1 flex-col gap-4">
      <SectionHeader title="Recent transactions" size="small" onAction={openTransactionsFilteredByToyboxLabs} actionLabel="View all" />
      <TableSkeleton rowCount={10} showCheckboxColumn={false} onRowClick={onRowClick} />
    </div>
  )
}
