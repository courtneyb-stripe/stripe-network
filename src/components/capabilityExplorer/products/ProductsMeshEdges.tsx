import { useCallback, useLayoutEffect, useState } from 'react'
import type { ProductId } from '../../../data/capabilityModel'
import { getProduct } from '../../../data/capabilityModel'

const NODE_R = 2.5
/** Place group endpoint in the gutter left of the row so nodes don’t sit on the filled row background */
const GROUP_EDGE_INSET_PX = 10

type EdgePath = {
  d: string
  dashed?: boolean
  x0: number
  y0: number
  x1: number
  y1: number
}

function buildProductToGroupEdges(
  meshEl: HTMLElement,
  selectedProductId: ProductId | null
): EdgePath[] {
  if (selectedProductId == null) return []
  const product = getProduct(selectedProductId)
  if (!product) return []

  const cr = meshEl.getBoundingClientRect()
  const el = (suffix: string) =>
    meshEl.querySelector<HTMLElement>(`[data-mesh-anchor="${suffix}"]`)

  const pointRight = (element: HTMLElement) => {
    const r = element.getBoundingClientRect()
    return { x: r.right - cr.left, y: r.top - cr.top + r.height / 2 }
  }

  const pointLeft = (element: HTMLElement) => {
    const r = element.getBoundingClientRect()
    return {
      x: r.left - cr.left - GROUP_EDGE_INSET_PX,
      y: r.top - cr.top + r.height / 2,
    }
  }

  const cubic = (x0: number, y0: number, x1: number, y1: number) => {
    const mx = (x0 + x1) / 2
    return `M ${x0} ${y0} C ${mx} ${y0} ${mx} ${y1} ${x1} ${y1}`
  }

  const srcEl = el(`p1-prod-${selectedProductId}`)
  if (!srcEl) return []

  const s = pointRight(srcEl)
  const dashed = product.relationship === 'requires'
  const strokeEdges: EdgePath[] = []

  for (const gid of product.capabilityGroups) {
    const dstEl = el(`p1-grp-${gid}`)
    if (!dstEl) continue
    const t = pointLeft(dstEl)
    strokeEdges.push({
      d: cubic(s.x, s.y, t.x, t.y),
      dashed,
      x0: s.x,
      y0: s.y,
      x1: t.x,
      y1: t.y,
    })
  }

  return strokeEdges
}

type ProductsMeshEdgesProps = {
  meshRef: React.RefObject<HTMLElement | null>
  selectedProductId: ProductId | null
}

/**
 * Products → capability groups: neutral stroke + endpoint nodes; dashed when requires.
 */
export default function ProductsMeshEdges({ meshRef, selectedProductId }: ProductsMeshEdgesProps) {
  const [svgState, setSvgState] = useState<{
    w: number
    h: number
    edges: EdgePath[]
  }>({ w: 0, h: 0, edges: [] })

  const recompute = useCallback(() => {
    const el = meshRef.current
    if (!el) return
    const w = el.clientWidth
    const h = el.clientHeight
    if (w === 0 || h === 0) return
    setSvgState({
      w,
      h,
      edges: buildProductToGroupEdges(el, selectedProductId),
    })
  }, [meshRef, selectedProductId])

  useLayoutEffect(() => {
    recompute()
  }, [recompute])

  useLayoutEffect(() => {
    const el = meshRef.current
    if (!el) return
    const ro = new ResizeObserver(() => recompute())
    ro.observe(el)
    window.addEventListener('resize', recompute)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', recompute)
    }
  }, [meshRef, recompute])

  if (svgState.edges.length === 0) return null

  const stroke = 'var(--explorer-mesh-downstream-stroke)'

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-0 overflow-visible"
      width={svgState.w}
      height={svgState.h}
      viewBox={`0 0 ${svgState.w} ${svgState.h}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      data-name="Products → groups edges"
    >
      {svgState.edges.map((e, i) => (
        <g key={i}>
          <path
            d={e.d}
            stroke={stroke}
            strokeWidth={1.25}
            strokeLinecap="butt"
            strokeLinejoin="miter"
            opacity={0.5}
            strokeDasharray={e.dashed ? '3 2' : undefined}
          />
          <circle
            cx={e.x0}
            cy={e.y0}
            r={NODE_R}
            fill={stroke}
            opacity={0.55}
          />
          <circle
            cx={e.x1}
            cy={e.y1}
            r={NODE_R}
            fill={stroke}
            opacity={0.55}
          />
        </g>
      ))}
    </svg>
  )
}
