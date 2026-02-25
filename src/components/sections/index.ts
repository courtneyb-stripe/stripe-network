/**
 * Section components for config-driven account detail.
 * Registry maps section id (from accountConfigs) to component.
 */

import type { ComponentType } from 'react'
import Overview from './Overview'
import MoneyMovement from './MoneyMovement'
import Billing from './Billing'
import Products from './Products'
import PaymentMethods from './PaymentMethods'
import LoanDetails from './LoanDetails'
import Repayments from './Repayments'
import TheirBusiness from './TheirBusiness'

export { default as Overview } from './Overview'
export { default as MoneyMovement } from './MoneyMovement'
export { default as Billing, BillingSidebar } from './Billing'
export { default as Products } from './Products'
export { default as PaymentMethods } from './PaymentMethods'
export { default as LoanDetails } from './LoanDetails'
export { default as Repayments } from './Repayments'
export { default as TheirBusiness } from './TheirBusiness'

/** Section components may receive no props (e.g. Billing) or section-specific props (e.g. Overview). */
export const SECTION_COMPONENTS: Record<string, ComponentType<any>> = {
  overview: Overview,
  moneyMovement: MoneyMovement,
  billing: Billing,
  products: Products,
  theirBusiness: TheirBusiness,
  paymentMethods: PaymentMethods,
  loanDetails: LoanDetails,
  repayments: Repayments,
}
