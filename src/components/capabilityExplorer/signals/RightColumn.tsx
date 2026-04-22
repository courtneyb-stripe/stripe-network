import { useMemo } from 'react'
import type { StatusSignalId } from '../../../data/capabilityModel'
import { resolveRightColumnLists } from './signalsLayout'

type RightColumnProps = {
  activeSignals: ReadonlySet<StatusSignalId>
}

/**
 * Capability groups + products: full dimmed list when no signals active; otherwise
 * only rows whose signals intersect resolved UAD signals.
 */
export default function RightColumn({ activeSignals }: RightColumnProps) {
  const { visibleGroups, visibleProducts, nothingActive } = useMemo(
    () => resolveRightColumnLists(activeSignals),
    [activeSignals]
  )

  return (
    <div className="flex min-w-0 max-w-sm flex-1 flex-col gap-5" data-name="Right column">
      <div>
        <p className="m-0 mb-2 font-label-small-emphasized tracking-wide text-subdued">
          Capability groups
        </p>
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {visibleGroups.map((cg) => (
            <li
              key={cg.id}
              className="flex items-center gap-2"
              data-mesh-anchor={`capgroup-${cg.id}`}
              data-capability-group={cg.id}
            >
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{
                  background: nothingActive
                    ? 'var(--color-neutral-300)'
                    : 'var(--explorer-mesh-downstream-stroke)',
                }}
                aria-hidden
              />
              <span
                className={`min-w-0 truncate font-mono text-[11px] leading-snug ${
                  nothingActive ? 'text-subdued' : 'font-medium text-default'
                }`}
              >
                {cg.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="m-0 mb-2 font-label-small-emphasized tracking-wide text-subdued">Products</p>
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {visibleProducts.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-2"
              data-mesh-anchor={`product-${p.id}`}
              data-product={p.id}
            >
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{
                  background: nothingActive
                    ? 'var(--color-neutral-300)'
                    : 'var(--explorer-mesh-downstream-stroke)',
                }}
                aria-hidden
              />
              <span
                className={`min-w-0 truncate text-[12.5px] leading-snug ${
                  nothingActive ? 'text-subdued' : 'font-medium text-default'
                }`}
              >
                {p.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
