/**
 * Money movement — transaction type selector using the same M1 list chip style as parent list views.
 */

import { getMoneyMovementTypeChips } from '../data/moneyMovementViewChips'
import type { MoneyMovementTransactionTab } from '../data/moneyMovementTransactionTabs'
import { ViewChip } from './NetworkFilterGroup'

export function MoneyMovementViewChipsRow({
  tabs,
  activeTypeId,
  onTypeChange,
}: {
  tabs: MoneyMovementTransactionTab[]
  activeTypeId: string
  onTypeChange: (id: string) => void
}) {
  const chips = getMoneyMovementTypeChips(tabs)

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      data-name="Money movement type chips"
    >
      {chips.map((c) => (
        <ViewChip
          key={c.id}
          visualVariant="list"
          label={c.label}
          active={activeTypeId === c.id}
          onClick={() => onTypeChange(c.id)}
        />
      ))}
    </div>
  )
}
