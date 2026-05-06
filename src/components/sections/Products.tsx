/**
 * Products section — Figma 214:28398.
 * ViewChips (Sold by Shopify / Sold by Toybox Labs), section header "Products",
 * skeleton table (10 rows), row click opens product details drawer.
 */

import { useState } from 'react'
import AccountDrawer from '../AccountDrawer'
import { ViewChip } from '../NetworkFilterGroup'
import { usePrototypeOptional } from '../../context/PrototypeContext'
import SectionHeader from '../SectionHeader'
import TableSkeleton from '../TableSkeleton'
import InlineListPagination from '../InlineListPagination'
import { INLINE_LIST_TOTALS } from '../../constants/inlineListMocks'

const PRODUCT_TABLE_ROWS = 10

const PRODUCT_CHIPS = [
  { id: 'shopify', label: 'Sold by Shopify' },
  { id: 'toybox', label: 'Sold by Toybox Labs' },
] as const

export default function Products() {
  const prototype = usePrototypeOptional()
  const activityFilter = prototype?.activityFilter ?? 'viewChip'
  const [activeChipId, setActiveChipId] = useState<string>(PRODUCT_CHIPS[0].id)
  const [productDrawerOpen, setProductDrawerOpen] = useState(false)

  const productsListPath = '/network'

  return (
    <div className="flex flex-col gap-6" data-node-id="214:28398">
      {/* ViewChips — above Products section header; hidden when Activity filter is Universal toggle */}
      {activityFilter === 'viewChip' && (
        <div className="flex flex-wrap items-center gap-2">
          {PRODUCT_CHIPS.map((chip) => (
            <ViewChip
              key={chip.id}
              visualVariant="list"
              label={chip.label}
              active={activeChipId === chip.id}
              onClick={() => setActiveChipId(chip.id)}
            />
          ))}
        </div>
      )}
      <div className="flex flex-col gap-4">
        <SectionHeader title="Products" size="small" />
        <TableSkeleton
          rowCount={PRODUCT_TABLE_ROWS}
          showCheckboxColumn={false}
          onRowClick={() => setProductDrawerOpen(true)}
        />
        <InlineListPagination
          pageStart={1}
          pageEnd={PRODUCT_TABLE_ROWS}
          totalResults={INLINE_LIST_TOTALS.products}
          to={productsListPath}
        />
      </div>
      <AccountDrawer
        open={productDrawerOpen}
        onClose={() => setProductDrawerOpen(false)}
        variant="product-details"
      />
    </div>
  )
}
