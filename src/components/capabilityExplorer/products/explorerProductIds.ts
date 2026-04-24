import type { ProductId } from '../../../data/capabilityModel'

/** User-facing product lines for the Capabilities map (spec order; includes Atlas / formation). */
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
