/**
 * TransactionsTablePanel — Single abstraction for the main data table region on `/transactions`.
 * Low fidelity: skeleton only; swap here for tab-specific tables when wired.
 */

import TableSkeleton from './TableSkeleton'
import { MONEY_MOVEMENT_TABLE_SKELETON_ROW_COUNT } from '../data/moneyMovementTransactionTabs'
import type { TransactionsTabId } from '../data/transactionsPageTabs'

type TransactionsTablePanelProps = {
  activeTab: TransactionsTabId
}

export default function TransactionsTablePanel({ activeTab }: TransactionsTablePanelProps) {
  return (
    <div className="flex w-full flex-col" data-name="TransactionsTablePanel">
      <TableSkeleton
        key={activeTab}
        rowCount={MONEY_MOVEMENT_TABLE_SKELETON_ROW_COUNT}
        showCheckboxColumn={false}
      />
    </div>
  )
}
