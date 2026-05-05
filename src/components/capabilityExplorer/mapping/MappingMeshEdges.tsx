import { useCallback, useLayoutEffect, useMemo, useState } from 'react'
import type { CapabilityGroupId, StatusSignalId } from '../../../data/capabilityModel'
import { capabilityGroups, getSignalsByCapabilityGroup } from '../../../data/capabilityModel'

/** End nodes sit this far to the **left** of the UAD signal pill’s left edge (into the column gap) */
const SIGNAL_PILL_INSET_PX = 8
/** Start nodes: shift out from the cap group row (right edge) into the gap, away from row fills */
const CAP_GROUP_ANCHOR_NUDGE_RIGHT_PX = 8

type MeshEdge = {
  groupId: CapabilityGroupId
  signalId: StatusSignalId
  d: string
  x0: number
  y0: number
  x1: number
  y1: number
}

function collectEdges(meshEl: HTMLElement): MeshEdge[] {
  const cr = meshEl.getBoundingClientRect()
  const el = (suffix: string) =>
    meshEl.querySelector<HTMLElement>(`[data-mesh-anchor="${suffix}"]`)

  const pointRight = (element: HTMLElement) => {
    const r = element.getBoundingClientRect()
    return {
      x: r.right - cr.left + CAP_GROUP_ANCHOR_NUDGE_RIGHT_PX,
      y: r.top - cr.top + r.height / 2,
    }
  }

  const pointLeftOfSignalPill = (element: HTMLElement) => {
    const r = element.getBoundingClientRect()
    return {
      x: r.left - cr.left - SIGNAL_PILL_INSET_PX,
      y: r.top - cr.top + r.height / 2,
    }
  }

  const cubic = (x0: number, y0: number, x1: number, y1: number) => {
    const mx = (x0 + x1) / 2
    return `M ${x0} ${y0} C ${mx} ${y0} ${mx} ${y1} ${x1} ${y1}`
  }

  const out: MeshEdge[] = []

  for (const g of capabilityGroups) {
    const signals = getSignalsByCapabilityGroup(g.id)
    const srcEl = el(`mapping-grp-${g.id}`)
    if (!srcEl) continue
    const s = pointRight(srcEl)

    for (const signalId of signals) {
      const dstEl = el(`mapping-sig-${signalId}`)
      if (!dstEl) continue
      const t = pointLeftOfSignalPill(dstEl)
      out.push({
        groupId: g.id,
        signalId,
        d: cubic(s.x, s.y, t.x, t.y),
        x0: s.x,
        y0: s.y,
        x1: t.x,
        y1: t.y,
      })
    }
  }

  return out
}

function edgeMatchesSelectedSignal(
  edgeSignalId: StatusSignalId,
  selectedSignalId: StatusSignalId | null
): boolean {
  if (selectedSignalId == null) return false
  if (edgeSignalId === selectedSignalId) return true
  // Storer fold: FA subsumes Transfers in the model — show both edge bundles when FA is selected
  if (selectedSignalId === 'financial_accounts' && edgeSignalId === 'transfers') return true
  return false
}

function edgeOpacity(
  e: MeshEdge,
  selectedGroupId: CapabilityGroupId | null,
  selectedSignalId: StatusSignalId | null
): number {
  if (selectedGroupId == null && selectedSignalId == null) return 0.28
  if (selectedGroupId != null) {
    return e.groupId === selectedGroupId ? 0.62 : 0.12
  }
  return edgeMatchesSelectedSignal(e.signalId, selectedSignalId) ? 0.62 : 0.12
}

type MappingMeshEdgesProps = {
  meshRef: React.RefObject<HTMLElement | null>
  selectedGroupId: CapabilityGroupId | null
  selectedSignalId: StatusSignalId | null
}

export default function MappingMeshEdges({
  meshRef,
  selectedGroupId,
  selectedSignalId,
}: MappingMeshEdgesProps) {
  const [svgState, setSvgState] = useState<{
    w: number
    h: number
    edges: MeshEdge[]
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
      edges: collectEdges(el),
    })
  }, [meshRef])

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

  const stroke = 'var(--explorer-mesh-downstream-stroke)'

  const rendered = useMemo(() => {
    return svgState.edges.map((e, i) => ({
      key: `${e.groupId}-${e.signalId}-${i}`,
      ...e,
      opacity: edgeOpacity(e, selectedGroupId, selectedSignalId),
    }))
  }, [svgState.edges, selectedGroupId, selectedSignalId])

  if (rendered.length === 0) return null

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-0 overflow-visible"
      width={svgState.w}
      height={svgState.h}
      viewBox={`0 0 ${svgState.w} ${svgState.h}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      data-name="Capability group → signal edges"
    >
      {rendered.map((e) => (
        <g key={e.key}>
          <path
            d={e.d}
            stroke={stroke}
            strokeWidth={0.9}
            strokeLinecap="butt"
            strokeLinejoin="miter"
            opacity={e.opacity}
          />
          <circle cx={e.x0} cy={e.y0} r={2} fill={stroke} opacity={Math.min(0.55, e.opacity + 0.15)} />
          <circle cx={e.x1} cy={e.y1} r={2} fill={stroke} opacity={Math.min(0.55, e.opacity + 0.15)} />
        </g>
      ))}
    </svg>
  )
}
