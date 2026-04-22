import type { ProductId } from '../../../data/capabilityModel'

/** Ten user-facing products for the Products ↔ capabilities explorer (spec order). */
export const EXPLORER_TAB1_PRODUCT_IDS: readonly ProductId[] = [
  'payments',
  'connect',
  'issuing',
  'treasury',
  'capital',
  'tax',
  'atlas',
  'billing',
  'checkout',
  'terminal',
] as const
