import { useCallback, useRef, useState } from 'react'
import type { CapabilityGroupId, ConfigurationId, ProductId } from '../../../data/capabilityModel'
import BabySegmentedControl from '../../BabySegmentedControl'
import CapabilityGroupsColumn from './CapabilityGroupsColumn'
import ConfigsColumn from './ConfigsColumn'
import GranularCapsColumn from './GranularCapsColumn'
import ProductsColumn from './ProductsColumn'
import ProductsMeshEdges, { type CapabilitiesMapEntityMode } from './ProductsMeshEdges'

/**
 * Capabilities map — three-column reference with product or config → group edges.
 */
export default function ProductsTab() {
  const meshRef = useRef<HTMLDivElement>(null)
  const [mapEntityMode, setMapEntityMode] = useState<CapabilitiesMapEntityMode>('products')
  const [selectedProductId, setSelectedProductId] = useState<ProductId | null>(null)
  const [selectedConfigurationId, setSelectedConfigurationId] = useState<ConfigurationId | null>(
    null
  )
  const [focusedGroupId, setFocusedGroupId] = useState<CapabilityGroupId | null>(null)

  const onMapEntityModeChange = useCallback((mode: CapabilitiesMapEntityMode) => {
    setMapEntityMode(mode)
    setSelectedProductId(null)
    setSelectedConfigurationId(null)
    setFocusedGroupId(null)
  }, [])

  const onSelectProduct = useCallback((id: ProductId) => {
    setSelectedConfigurationId(null)
    setFocusedGroupId(null)
    setSelectedProductId((prev) => (prev === id ? null : id))
  }, [])

  const onSelectConfiguration = useCallback((id: ConfigurationId) => {
    setSelectedProductId(null)
    setFocusedGroupId(null)
    setSelectedConfigurationId((prev) => (prev === id ? null : id))
  }, [])

  const onSelectGroup = useCallback((id: CapabilityGroupId) => {
    setSelectedProductId(null)
    setSelectedConfigurationId(null)
    setFocusedGroupId((prev) => (prev === id ? null : id))
  }, [])

  return (
    <div className="flex w-full min-w-0 flex-col gap-4" data-name="ProductsTab">
      <p className="m-0 max-w-2xl text-subdued font-label-small leading-relaxed">
        Select a product or configuration to see which capability groups back it and which granular
        caps it uses. In Products mode, solid edges mean a product backs a group and dashed edges
        mean it requires one. In Configs mode, dotted edges indicate partial mapping — the role only
        needs some caps from that group.
      </p>
      <BabySegmentedControl<CapabilitiesMapEntityMode>
        aria-label="Capabilities map entity type"
        options={[
          { id: 'products', label: 'Products' },
          { id: 'configs', label: 'Configs' },
        ]}
        selectedId={mapEntityMode}
        onChange={onMapEntityModeChange}
      />
      <div className="flex w-full min-w-0 flex-col gap-36">
        <div
          ref={meshRef}
          className="capability-explorer-mesh relative w-full min-w-0 min-h-[200px]"
        >
          <ProductsMeshEdges
            meshRef={meshRef}
            mapEntityMode={mapEntityMode}
            selectedProductId={selectedProductId}
            selectedConfigurationId={selectedConfigurationId}
          />
          <div className="relative z-[1] flex w-full min-w-0 flex-wrap gap-8 lg:flex-nowrap lg:items-start">
            {mapEntityMode === 'products' ? (
              <ProductsColumn selectedProductId={selectedProductId} onSelectProduct={onSelectProduct} />
            ) : (
              <ConfigsColumn
                selectedConfigurationId={selectedConfigurationId}
                onSelectConfiguration={onSelectConfiguration}
              />
            )}
            <CapabilityGroupsColumn
              mapEntityMode={mapEntityMode}
              selectedProductId={selectedProductId}
              selectedConfigurationId={selectedConfigurationId}
              focusedGroupId={focusedGroupId}
              onSelectGroup={onSelectGroup}
            />
            <GranularCapsColumn
              mapEntityMode={mapEntityMode}
              selectedProductId={selectedProductId}
              selectedConfigurationId={selectedConfigurationId}
              focusedGroupId={focusedGroupId}
            />
          </div>
        </div>
        <p className="m-0 max-w-2xl text-subdued font-label-small leading-relaxed">
          Capability groupings derived from{' '}
          <a
            href="https://docs.google.com/document/d/10UiqF4j7_oSo2D6t5Rg5rOI-CfG6pPiuvr44xgdaVfE/edit?usp=sharing"
            className="text-action-primary underline underline-offset-2 decoration-neutral-300 transition-opacity hover:opacity-90"
            target="_blank"
            rel="noopener noreferrer"
          >
            Stripe Capability ↔ Product Mapping — Summary & Key Takeaways
          </a>
          .
        </p>
      </div>
    </div>
  )
}
