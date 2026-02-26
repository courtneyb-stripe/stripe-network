/**
 * Section components for config-driven account detail.
 * Registry maps section id (from accountConfigs) to component.
 */

import type { ComponentType } from 'react'
import Overview from './Overview'
import MoneyMovement from './MoneyMovement'
import Billing from './Billing'
import Commerce from './Commerce'
import Products from './Products'
import PaymentMethods from './PaymentMethods'
import LoanDetails from './LoanDetails'
import Repayments from './Repayments'
import BalancesSection from './BalancesSection'
import TransactionsSection from './TransactionsSection'
import FinancialSnapshotSection from './FinancialSnapshotSection'
import MyRevenueSection from './MyRevenueSection'
import ToyboxRevenueSection from './ToyboxRevenueSection'

export { default as Overview } from './Overview'
export { default as MoneyMovement } from './MoneyMovement'
export { default as Billing, BillingSidebar } from './Billing'
export { default as Commerce, CommerceSidebar } from './Commerce'
export { default as Products } from './Products'
export { default as PaymentMethods } from './PaymentMethods'
export { default as LoanDetails } from './LoanDetails'
export { default as Repayments } from './Repayments'
export { default as BalancesSection } from './BalancesSection'
export { default as TransactionsSection } from './TransactionsSection'
export { default as FinancialSnapshotSection } from './FinancialSnapshotSection'
export { default as MyRevenueSection } from './MyRevenueSection'
export { default as ToyboxRevenueSection } from './ToyboxRevenueSection'

/** Section components may receive no props (e.g. Billing) or section-specific props (e.g. Overview). */
export const SECTION_COMPONENTS: Record<string, ComponentType<any>> = {
  overview: Overview,
  moneyMovement: MoneyMovement,
  billing: Billing,
  commerce: Commerce,
  products: Products,
  paymentMethods: PaymentMethods,
  loanDetails: LoanDetails,
  repayments: Repayments,
  balances: BalancesSection,
  transactions: TransactionsSection,
  network: Commerce,
  financialSnapshot: FinancialSnapshotSection,
  myRevenue: MyRevenueSection,
  toyboxRevenue: ToyboxRevenueSection,
}
