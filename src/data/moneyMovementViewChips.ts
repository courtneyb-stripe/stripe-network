/**
 * Money movement type selector as View chips (replaces secondary TabBar on account detail).
 * First chip is always **All**; following chips mirror `getMoneyMovementTransactionTabs` / defaults.
 */

import type { MoneyMovementTransactionTab } from './moneyMovementTransactionTabs'

export type MoneyMovementViewChipOption = { id: string; label: string }

const ALL_CHIP: MoneyMovementViewChipOption = { id: 'all', label: 'All' }

export function getMoneyMovementTypeChips(tabs: MoneyMovementTransactionTab[]): MoneyMovementViewChipOption[] {
  return [ALL_CHIP, ...tabs.map((t) => ({ id: t.id, label: t.label }))]
}

export function isValidMoneyMovementTypeSelection(
  selection: string,
  tabs: MoneyMovementTransactionTab[]
): boolean {
  if (selection === ALL_CHIP.id) return true
  return tabs.some((t) => t.id === selection)
}
