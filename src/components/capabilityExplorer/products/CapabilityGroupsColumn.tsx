import type { CapabilityGroupId, ConfigurationId, ProductId } from '../../../data/capabilityModel'
import { capabilityGroups, getConfiguration, getProduct } from '../../../data/capabilityModel'
import type { CapabilitiesMapEntityMode } from './ProductsMeshEdges'

type CapabilityGroupsColumnProps = {
  mapEntityMode: CapabilitiesMapEntityMode
  selectedProductId: ProductId | null
  selectedConfigurationId: ConfigurationId | null
  focusedGroupId: CapabilityGroupId | null
  onSelectGroup: (id: CapabilityGroupId) => void
}

function formatCountBadge(count: number, approximate?: boolean): string {
  return `${count}${approximate ? '+' : ''}`
}

const LABEL_DIM = 'text-[#a6a49b] font-normal'
const COUNT_DIM = 'text-[#a6a49b]'

/** Highlight: product-backed groups (all) or single group-only selection */
const HIGHLIGHT_ROW =
  'bg-offset font-semibold text-default hover:bg-neutral-100/95 active:bg-neutral-100'
const HIGHLIGHT_COUNT = 'font-semibold text-default'

export default function CapabilityGroupsColumn({
  mapEntityMode,
  selectedProductId,
  selectedConfigurationId,
  focusedGroupId,
  onSelectGroup,
}: CapabilityGroupsColumnProps) {
  const product = selectedProductId ? getProduct(selectedProductId) : undefined
  const configuration = selectedConfigurationId
    ? getConfiguration(selectedConfigurationId)
    : undefined
  const touchedByProduct = new Set(product?.capabilityGroups ?? [])
  const touchedByConfig = new Set(configuration?.capabilityGroups ?? [])

  return (
    <div className="flex min-w-0 max-w-sm flex-1 flex-col gap-2" data-name="Capability groups column">
      <h3 className="m-0 font-label-small-emphasized text-subdued">Capability groups</h3>
      <div className="flex flex-col gap-1" role="list" aria-label="Doc-level capability groups">
        {capabilityGroups.map((g) => {
          const litByProduct =
            mapEntityMode === 'products' && selectedProductId != null && touchedByProduct.has(g.id)
          const litByConfig =
            mapEntityMode === 'configs' &&
            selectedConfigurationId != null &&
            touchedByConfig.has(g.id)
          const focusedAlone =
            selectedProductId == null &&
            selectedConfigurationId == null &&
            focusedGroupId != null &&
            focusedGroupId === g.id
          const highlighted = litByProduct || litByConfig || focusedAlone

          const rowClass = highlighted
            ? HIGHLIGHT_ROW
            : `${LABEL_DIM} bg-transparent hover:bg-offset/40`
          const countClass = highlighted ? HIGHLIGHT_COUNT : COUNT_DIM

          return (
            <button
              key={g.id}
              type="button"
              role="listitem"
              data-mesh-anchor={`p1-grp-${g.id}`}
              onClick={() => onSelectGroup(g.id)}
              className={`flex w-full max-w-[320px] items-start justify-between gap-3 rounded-form border-0 px-3 py-2 text-left font-inherit cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-1 ${rowClass}`}
            >
              <span className="min-w-0 flex-1 whitespace-normal break-words text-[12.5px] leading-snug tracking-[-0.15px]">
                {g.label}
              </span>
              <span
                className={`shrink-0 self-start text-right font-mono text-[10px] leading-snug tabular-nums ${countClass}`}
              >
                {formatCountBadge(g.count, g.approximate)}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
