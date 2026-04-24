import {
  capabilityGroups,
  getCapabilitiesInGroup,
  getCapabilityGroupsForSignals,
  getProductsForSignals,
  products,
  type CapabilityGroup,
  type CapabilityGroupId,
  type Product,
  type ProductId,
  type StatusSignalId,
} from '../../../data/capabilityModel'

/** Omitted on UAD tab (Right column) — Atlas is surfaced on the Capabilities map / mapping tab. */
const UAD_RIGHT_EXCLUDED_CAP_GROUPS: ReadonlySet<CapabilityGroupId> = new Set(['atlas'])

const UAD_RIGHT_EXCLUDED_PRODUCTS: ReadonlySet<ProductId> = new Set(['climate', 'sigma', 'connect'])

const GROUP_ORDER = new Map(capabilityGroups.map((g, i) => [g.id, i]))
const PRODUCT_ORDER = new Map(products.map((p, i) => [p.id, i]))

function uadRightColumnGroups(gs: CapabilityGroup[]): CapabilityGroup[] {
  return gs.filter((g) => !UAD_RIGHT_EXCLUDED_CAP_GROUPS.has(g.id))
}

function uadRightColumnProducts(ps: Product[]): Product[] {
  return ps.filter((p) => !UAD_RIGHT_EXCLUDED_PRODUCTS.has(p.id))
}

export function sortCapabilityGroups(gs: CapabilityGroup[]): CapabilityGroup[] {
  return [...gs].sort((a, b) => (GROUP_ORDER.get(a.id) ?? 999) - (GROUP_ORDER.get(b.id) ?? 999))
}

export function sortProductsList(ps: Product[]): Product[] {
  return [...ps].sort((a, b) => (PRODUCT_ORDER.get(a.id) ?? 999) - (PRODUCT_ORDER.get(b.id) ?? 999))
}

export function resolveRightColumnLists(activeSignals: ReadonlySet<StatusSignalId>): {
  visibleGroups: CapabilityGroup[]
  visibleProducts: Product[]
  nothingActive: boolean
} {
  if (activeSignals.size === 0) {
    return {
      visibleGroups: uadRightColumnGroups(capabilityGroups),
      visibleProducts: uadRightColumnProducts(products),
      nothingActive: true,
    }
  }
  return {
    visibleGroups: uadRightColumnGroups(
      sortCapabilityGroups(getCapabilityGroupsForSignals(activeSignals))
    ),
    visibleProducts: uadRightColumnProducts(
      sortProductsList(getProductsForSignals(activeSignals))
    ),
    nothingActive: false,
  }
}

export function capabilityGroupLinksSignal(
  groupId: CapabilityGroupId,
  signalId: StatusSignalId
): boolean {
  return getCapabilitiesInGroup(groupId).some((c) => c.signals.includes(signalId))
}
