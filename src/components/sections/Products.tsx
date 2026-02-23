/**
 * Products section — Figma 214:28398.
 * ViewChips (Sold by Cactus Practice / Sold by Toybox Labs), section header "Products" with View all,
 * table (Name, Pricing, Tax category, Created, Updated), row click opens product details drawer, 10 of NNN items at bottom.
 */

import { useState, useMemo } from 'react'
import AccountDrawer from '../AccountDrawer'
import { ViewChip } from '../NetworkFilterGroup'
import SectionHeader from '../SectionHeader'
import ProductsTable, { generateProductRows, generateProductRowsAlt } from '../ProductsTable'

const PRODUCT_CHIPS = [
  { id: 'cactus', label: 'Sold by Cactus Practice' },
  { id: 'toybox', label: 'Sold by Toybox Labs' },
] as const

const PRODUCT_ROWS = 10
const CACTUS_TOTAL = 198
const TOYBOX_TOTAL = 124

export default function Products() {
  const [activeChipId, setActiveChipId] = useState<string>(PRODUCT_CHIPS[0].id)
  const [productDrawerOpen, setProductDrawerOpen] = useState(false)

  const isCactus = activeChipId === 'cactus'
  const rows = useMemo(
    () => (isCactus ? generateProductRows(PRODUCT_ROWS) : generateProductRowsAlt(PRODUCT_ROWS)),
    [isCactus]
  )
  const totalCount = isCactus ? CACTUS_TOTAL : TOYBOX_TOTAL

  return (
    <div className="flex flex-col gap-6" data-node-id="214:28398">
      {/* ViewChips — above Products section header */}
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
      <div className="flex flex-col gap-3">
        <SectionHeader
          title="Products"
          size="small"
          onAction={() => {}}
          actionLabel="View all"
        />
        <ProductsTable
          rows={rows}
          onRowClick={() => setProductDrawerOpen(true)}
        />
        <p className="text-[14px] text-default">
          {rows.length} of <span className="text-action-primary">{totalCount}</span> items
        </p>
      </div>
      <AccountDrawer
        open={productDrawerOpen}
        onClose={() => setProductDrawerOpen(false)}
        variant="product-details"
      />
    </div>
  )
}
