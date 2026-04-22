import {
  capabilityGroups,
  getCapabilitiesInGroup,
  getCapabilityGroupsForSignals,
  getProductsForSignals,
  products,
  type CapabilityGroup,
  type CapabilityGroupId,
  type Product,
  type StatusSignalId,
} from '../../../data/capabilityModel'

const GROUP_ORDER = new Map(capabilityGroups.map((g, i) => [g.id, i]))
const PRODUCT_ORDER = new Map(products.map((p, i) => [p.id, i]))

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
      visibleGroups: capabilityGroups,
      visibleProducts: products,
      nothingActive: true,
    }
  }
  return {
    visibleGroups: sortCapabilityGroups(getCapabilityGroupsForSignals(activeSignals)),
    visibleProducts: sortProductsList(getProductsForSignals(activeSignals)),
    nothingActive: false,
  }
}

export function capabilityGroupLinksSignal(
  groupId: CapabilityGroupId,
  signalId: StatusSignalId
): boolean {
  return getCapabilitiesInGroup(groupId).some((c) => c.signals.includes(signalId))
}
