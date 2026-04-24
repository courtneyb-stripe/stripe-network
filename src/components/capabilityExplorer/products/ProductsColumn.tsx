import type { ProductId } from '../../../data/capabilityModel'
import { getProduct } from '../../../data/capabilityModel'
import { EXPLORER_TAB1_PRODUCT_IDS } from './explorerProductIds'

type ProductsColumnProps = {
  selectedProductId: ProductId | null
  onSelectProduct: (id: ProductId) => void
}

export default function ProductsColumn({ selectedProductId, onSelectProduct }: ProductsColumnProps) {
  return (
    <div className="flex min-w-0 max-w-sm flex-1 flex-col gap-2" data-name="Products column">
      <div>
        <h3 className="m-0 font-label-small-emphasized text-subdued">Products</h3>
        <p className="m-0 mt-1 max-w-[280px] font-label-small leading-snug text-subdued">
          User-facing product lines; map each to capability groups and granular caps in this view.
        </p>
      </div>
      <div className="flex flex-col gap-2" role="list" aria-label="User-facing products">
        {EXPLORER_TAB1_PRODUCT_IDS.map((id) => {
          const product = getProduct(id)
          const label = product?.label ?? id
          const isActive = selectedProductId === id

          return (
            <button
              key={id}
              type="button"
              role="listitem"
              data-mesh-anchor={`p1-prod-${id}`}
              onClick={() => onSelectProduct(id)}
              className={`flex min-h-10 w-full max-w-[280px] items-center rounded-form border px-3 py-2 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-1 ${
                isActive
                  ? 'border-default bg-neutral-700 text-neutral-0'
                  : 'border-neutral-100 bg-surface text-default hover:border-neutral-300'
              }`}
            >
              <span className="font-label-medium leading-tight">{label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
