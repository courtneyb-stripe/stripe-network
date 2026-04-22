import { useCallback, useLayoutEffect, useState } from 'react'
import {
  foldRules,
  getConfiguration,
  type ConfigurationId,
  type StatusSignalId,
} from '../../../data/capabilityModel'
import { CONFIGURATION_DOT_COLOR } from '../configColors'
import { capabilityGroupLinksSignal, resolveRightColumnLists } from './signalsLayout'

type EdgePath = {
  d: string
  stroke: string
  /** Short dash pattern (e.g. billing conditional edge) */
  dashed?: boolean
  /** Tighter pattern — config/signal link with no capability footprint */
  dotted?: boolean
  strokeWidth?: number
  opacity?: number
}

function foldedSignalTarget(
  sigId: StatusSignalId,
  expanded: ReadonlySet<ConfigurationId>
): StatusSignalId {
  for (const rule of foldRules) {
    if (rule.signal !== sigId) continue
    if (rule.whenConfigurationsActive.every((c) => expanded.has(c))) {
      return rule.foldInto
    }
  }
  return sigId
}

function buildConfigToSignalEdges(
  meshEl: HTMLElement,
  expanded: ReadonlySet<ConfigurationId>,
  billingEnabled: boolean
): EdgePath[] {
  const cr = meshEl.getBoundingClientRect()
  const out: EdgePath[] = []

  const elFor = (kind: 'config' | 'signal', id: string) =>
    meshEl.querySelector<HTMLElement>(`[data-mesh-anchor="${kind}-${id}"]`)

  const pointRight = (el: HTMLElement) => {
    const r = el.getBoundingClientRect()
    return { x: r.right - cr.left, y: r.top - cr.top + r.height / 2 }
  }

  const pointLeft = (el: HTMLElement) => {
    const r = el.getBoundingClientRect()
    return { x: r.left - cr.left, y: r.top - cr.top + r.height / 2 }
  }

  const cubic = (x0: number, y0: number, x1: number, y1: number) => {
    const mx = (x0 + x1) / 2
    return `M ${x0} ${y0} C ${mx} ${y0} ${mx} ${y1} ${x1} ${y1}`
  }

  for (const cfgId of expanded) {
    const cfg = getConfiguration(cfgId)
    if (!cfg) continue
    const stroke = CONFIGURATION_DOT_COLOR[cfgId] ?? 'var(--explorer-edge-dot)'

    const noComplianceCaps = cfg.hasCompliance === false

    for (const sigId of cfg.signals) {
      const targetSigId = foldedSignalTarget(sigId, expanded)
      const srcEl = elFor('config', cfgId)
      const dstEl = elFor('signal', targetSigId)
      if (!srcEl || !dstEl) continue
      const s = pointRight(srcEl)
      const t = pointLeft(dstEl)
      out.push({
        d: cubic(s.x, s.y, t.x, t.y),
        stroke,
        strokeWidth: 1.25,
        opacity: 0.5,
        ...(noComplianceCaps ? { dotted: true } : {}),
      })
    }

    if (cfgId === 'merchant' && billingEnabled) {
      const srcEl = elFor('config', 'merchant')
      const dstEl = elFor('signal', 'billing')
      if (srcEl && dstEl) {
        const s = pointRight(srcEl)
        const t = pointLeft(dstEl)
        const merchantStroke = CONFIGURATION_DOT_COLOR.merchant ?? '#3B82F6'
        out.push({
          d: cubic(s.x, s.y, t.x, t.y),
          stroke: merchantStroke,
          dashed: true,
          strokeWidth: 1.25,
          opacity: 0.5,
        })
      }
    }
  }

  return out
}

/** Signal right edge → target left edge (matches stripe-capability-mesh downstream paths). */
function buildSignalToRightEdges(
  meshEl: HTMLElement,
  activeSignals: ReadonlySet<StatusSignalId>,
  relationshipOnly: boolean
): EdgePath[] {
  if (activeSignals.size === 0) return []

  const { visibleGroups, visibleProducts } = resolveRightColumnLists(activeSignals)
  const cr = meshEl.getBoundingClientRect()
  const stroke = 'var(--explorer-mesh-downstream-stroke)'
  const out: EdgePath[] = []

  const elFor = (kind: 'signal' | 'capgroup' | 'product', id: string) =>
    meshEl.querySelector<HTMLElement>(`[data-mesh-anchor="${kind}-${id}"]`)

  const pointRight = (el: HTMLElement) => {
    const r = el.getBoundingClientRect()
    return { x: r.right - cr.left, y: r.top - cr.top + r.height / 2 }
  }

  const pointLeft = (el: HTMLElement) => {
    const r = el.getBoundingClientRect()
    return { x: r.left - cr.left, y: r.top - cr.top + r.height / 2 }
  }

  const cubic = (x0: number, y0: number, x1: number, y1: number) => {
    const mx = (x0 + x1) / 2
    return `M ${x0} ${y0} C ${mx} ${y0} ${mx} ${y1} ${x1} ${y1}`
  }

  for (const sigId of activeSignals) {
    const srcEl = elFor('signal', sigId)
    if (!srcEl) continue
    const s = pointRight(srcEl)

    for (const cg of visibleGroups) {
      if (!capabilityGroupLinksSignal(cg.id, sigId)) continue
      const dstEl = elFor('capgroup', cg.id)
      if (!dstEl) continue
      const t = pointLeft(dstEl)
      out.push({
        d: cubic(s.x, s.y, t.x, t.y),
        stroke,
        strokeWidth: 0.75,
        opacity: 0.45,
        ...(relationshipOnly ? { dotted: true } : {}),
      })
    }

    for (const p of visibleProducts) {
      if (!p.signals.includes(sigId)) continue
      const dstEl = elFor('product', p.id)
      if (!dstEl) continue
      const t = pointLeft(dstEl)
      out.push({
        d: cubic(s.x, s.y, t.x, t.y),
        stroke,
        strokeWidth: 0.75,
        opacity: 0.45,
        ...(relationshipOnly ? { dotted: true } : {}),
      })
    }
  }

  return out
}

type ConfigSignalEdgesProps = {
  meshRef: React.RefObject<HTMLElement | null>
  expandedConfigs: ReadonlySet<ConfigurationId>
  billingEnabled: boolean
  activeSignals: ReadonlySet<StatusSignalId>
  /** All active configs are non-compliance — downstream links are dotted (no cap backing). */
  relationshipOnly: boolean
}

/**
 * SVG overlay: config → signal (colored) + signal → cap group / product (neutral), same cubic as reference.
 */
export default function ConfigSignalEdges({
  meshRef,
  expandedConfigs,
  billingEnabled,
  activeSignals,
  relationshipOnly,
}: ConfigSignalEdgesProps) {
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
    const upstream = buildConfigToSignalEdges(el, expandedConfigs, billingEnabled)
    const downstream = buildSignalToRightEdges(el, activeSignals, relationshipOnly)
    setSvgState({
      w,
      h,
      edges: [...upstream, ...downstream],
    })
  }, [meshRef, expandedConfigs, billingEnabled, activeSignals, relationshipOnly])

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

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-0 overflow-visible"
      width={svgState.w}
      height={svgState.h}
      viewBox={`0 0 ${svgState.w} ${svgState.h}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      data-name="Signals mesh edges"
    >
      {svgState.edges.map((e, i) => (
        <path
          key={i}
          d={e.d}
          stroke={e.stroke}
          strokeWidth={e.strokeWidth ?? 1.25}
          opacity={e.opacity ?? 0.5}
          strokeDasharray={e.dotted ? '2 4' : e.dashed ? '3 2' : undefined}
        />
      ))}
    </svg>
  )
}
