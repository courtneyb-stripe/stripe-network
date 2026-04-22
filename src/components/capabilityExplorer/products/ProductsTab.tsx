import { useCallback, useRef, useState } from 'react'
import type { CapabilityGroupId, ProductId } from '../../../data/capabilityModel'
import CapabilityGroupsColumn from './CapabilityGroupsColumn'
import GranularCapsColumn from './GranularCapsColumn'
import ProductsColumn from './ProductsColumn'
import ProductsMeshEdges from './ProductsMeshEdges'

/**
 * Products ↔ capabilities — three-column reference with product → group edges.
 */
export default function ProductsTab() {
  const meshRef = useRef<HTMLDivElement>(null)
  const [selectedProductId, setSelectedProductId] = useState<ProductId | null>(null)
  const [focusedGroupId, setFocusedGroupId] = useState<CapabilityGroupId | null>(null)

  const onSelectProduct = useCallback((id: ProductId) => {
    setFocusedGroupId(null)
    setSelectedProductId((prev) => (prev === id ? null : id))
  }, [])

  const onSelectGroup = useCallback((id: CapabilityGroupId) => {
    setSelectedProductId(null)
    setFocusedGroupId((prev) => (prev === id ? null : id))
  }, [])

  return (
    <div
      className="flex w-full min-w-0 flex-col gap-4 rounded-lg border border-neutral-100 bg-surface p-5"
      data-name="ProductsTab"
    >
      <p className="m-0 max-w-2xl text-subdued font-label-small leading-relaxed">
        Click a product to see every capability group it backs or requires, with edges (solid =
        backed, dashed = requires) and all granular capabilities grouped by family. Or click a
        group alone to inspect just that family.
      </p>
      <div
        ref={meshRef}
        className="capability-explorer-mesh relative w-full min-w-0 min-h-[200px]"
      >
        <ProductsMeshEdges meshRef={meshRef} selectedProductId={selectedProductId} />
        <div className="relative z-[1] flex w-full min-w-0 flex-wrap gap-8 lg:flex-nowrap lg:items-start">
          <ProductsColumn selectedProductId={selectedProductId} onSelectProduct={onSelectProduct} />
          <CapabilityGroupsColumn
            selectedProductId={selectedProductId}
            focusedGroupId={focusedGroupId}
            onSelectGroup={onSelectGroup}
          />
          <GranularCapsColumn
            selectedProductId={selectedProductId}
            focusedGroupId={focusedGroupId}
          />
        </div>
      </div>
    </div>
  )
}
