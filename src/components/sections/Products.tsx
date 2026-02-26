/**
 * Products section — Figma 214:28398.
 * ViewChips (Sold by Shopify / Sold by Toybox Labs), section header "Products" with View all,
 * skeleton table (10 rows), row click opens product details drawer.
 */

import { useState } from 'react'
import AccountDrawer from '../AccountDrawer'
import { ViewChip } from '../NetworkFilterGroup'
import { usePrototypeOptional } from '../../context/PrototypeContext'
import SectionHeader from '../SectionHeader'
import TableSkeleton from '../TableSkeleton'

const PRODUCT_CHIPS = [
  { id: 'shopify', label: 'Sold by Shopify' },
  { id: 'toybox', label: 'Sold by Toybox Labs' },
] as const

export default function Products() {
  const prototype = usePrototypeOptional()
  const activityFilter = prototype?.activityFilter ?? 'viewChip'
  const [activeChipId, setActiveChipId] = useState<string>(PRODUCT_CHIPS[0].id)
  const [productDrawerOpen, setProductDrawerOpen] = useState(false)

  return (
    <div className="flex flex-col gap-6" data-node-id="214:28398">
      {/* ViewChips — above Products section header; hidden when Activity filter is Universal toggle */}
      {activityFilter === 'viewChip' && (
        <div className="flex flex-wrap items-center gap-2">
          {PRODUCT_CHIPS.map((chip) => (
            <ViewChip
              key={chip.id}
              label={chip.label}
              active={activeChipId === chip.id}
              onClick={() => setActiveChipId(chip.id)}
              size="compact"
            />
          ))}
        </div>
      )}
      <div className="flex flex-col gap-3">
        <SectionHeader
          title="Products"
          size="small"
          onAction={() => {}}
          onAdd={() => {}}
          actionLabel="View all"
        />
        <TableSkeleton
          rowCount={10}
          showCheckboxColumn={false}
          onRowClick={() => setProductDrawerOpen(true)}
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
