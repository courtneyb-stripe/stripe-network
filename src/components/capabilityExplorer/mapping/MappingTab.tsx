import { useCallback, useRef, useState } from 'react'
import type { CapabilityGroupId, StatusSignalId } from '../../../data/capabilityModel'
import {
  capabilityGroups,
  getCapabilityGroupsBySignal,
  getSignalsByCapabilityGroup,
  statusSignals,
} from '../../../data/capabilityModel'
import MappingMeshEdges from './MappingMeshEdges'

const HEADER_SIGNALS = statusSignals.filter(
  (s) => s.surfacesAs === 'header' && s.id !== 'billing'
)
const TAX_SIGNAL = statusSignals.find((s) => s.id === 'tax_reporting')!

const LABEL_DIM = 'text-[#a6a49b] font-normal'
const COUNT_DIM = 'text-[#a6a49b]'
const HIGHLIGHT_ROW =
  'bg-offset font-semibold text-default hover:bg-neutral-100/95 active:bg-neutral-100'
const HIGHLIGHT_COUNT = 'font-semibold text-default'
const ROW_DIM = 'opacity-[0.72]'

/** Omitted on this tab (shown on the Capabilities map as a product line instead). */
const MAPPING_TAB_HIDDEN_GROUP_IDS: ReadonlySet<CapabilityGroupId> = new Set(['atlas'])

const GROUP_RATIONALE: Partial<Record<CapabilityGroupId, string>> = {
  core:
    'Contains heterogeneous caps — each feeds different signals (e.g., `payouts` → Payouts only, `transfers` → Transfers only). Not every cap in Core feeds every listed signal.',
  crypto:
    'Feeds 3 signals (Payments, Transfers, Financial accounts — not Payouts). Cap group only — not a product.',
  storer:
    'Transfers contribution always folds into Financial accounts when Storer is active (see UAD tab).',
}

const SIGNAL_RATIONALE: Partial<Record<StatusSignalId, string>> = {
  billing:
    'No backing cap group — surfaces via product usage when Merchant uses Subscriptions/Invoices APIs.',
  tax_reporting: 'Surfaces in Actions Required area only, not as a header chip.',
}

type Selection =
  | { kind: 'group'; id: CapabilityGroupId }
  | { kind: 'signal'; id: StatusSignalId }
  | null

function formatCountBadge(count: number, approximate?: boolean): string {
  return `${count}${approximate ? '+' : ''}`
}

function isGroupHighlighted(gid: CapabilityGroupId, sel: Selection): boolean {
  if (!sel) return false
  if (sel.kind === 'group') return sel.id === gid
  if (getCapabilityGroupsBySignal(sel.id).some((g) => g.id === gid)) return true
  // Storer fold: FA signal selection also highlights cap groups that only map to Transfers
  if (sel.kind === 'signal' && sel.id === 'financial_accounts') {
    return getCapabilityGroupsBySignal('transfers').some((g) => g.id === gid)
  }
  return false
}

function isSignalHighlighted(sid: StatusSignalId, sel: Selection): boolean {
  if (!sel) return false
  if (sel.kind === 'signal') {
    if (sel.id === sid) return true
    if (sel.id === 'financial_accounts' && sid === 'transfers') return true
    return false
  }
  return getSignalsByCapabilityGroup(sel.id).includes(sid)
}

export default function MappingTab() {
  const meshRef = useRef<HTMLDivElement>(null)
  const [selection, setSelection] = useState<Selection>(null)

  const onSelectGroup = useCallback((id: CapabilityGroupId) => {
    setSelection((prev) => {
      if (prev?.kind === 'group' && prev.id === id) return null
      return { kind: 'group', id }
    })
  }, [])

  const onSelectSignal = useCallback((id: StatusSignalId) => {
    setSelection((prev) => {
      if (prev?.kind === 'signal' && prev.id === id) return null
      return { kind: 'signal', id }
    })
  }, [])

  const selectedGroupId = selection?.kind === 'group' ? selection.id : null
  const selectedSignalId = selection?.kind === 'signal' ? selection.id : null

  return (
    <div className="flex w-full min-w-0 flex-col gap-4" data-name="MappingTab">
      <p className="m-0 max-w-2xl text-subdued font-label-small leading-relaxed">
        How capability groups map to UAD signal groups. All edges shown by default; click a cap group
        to raise its outbound mappings, or a signal to see which groups back it.
      </p>
      <div
        ref={meshRef}
        className="capability-explorer-mesh relative w-full min-w-0 min-h-[200px]"
      >
        <MappingMeshEdges
          meshRef={meshRef}
          selectedGroupId={selectedGroupId}
          selectedSignalId={selectedSignalId}
        />
        <div className="relative z-[1] mx-auto flex w-full max-w-5xl flex-wrap justify-center gap-20 py-10 lg:flex-nowrap lg:items-start">
          <div className="flex min-w-0 w-full max-w-sm flex-1 flex-col gap-2">
            <h3 className="m-0 font-label-small-emphasized text-subdued">Capability groups</h3>
            <div className="flex flex-col gap-1" role="list" aria-label="Capability groups">
              {capabilityGroups
                .filter((g) => !MAPPING_TAB_HIDDEN_GROUP_IDS.has(g.id))
                .map((g) => {
                const highlighted = isGroupHighlighted(g.id, selection)
                const dim = selection != null && !highlighted
                const rowClass = highlighted
                  ? HIGHLIGHT_ROW
                  : `${LABEL_DIM} bg-transparent hover:bg-offset/40`
                const countClass = highlighted ? HIGHLIGHT_COUNT : COUNT_DIM
                const rationale = GROUP_RATIONALE[g.id]

                return (
                  <div key={g.id} className={dim ? ROW_DIM : undefined}>
                    <button
                      type="button"
                      role="listitem"
                      data-mesh-anchor={`mapping-grp-${g.id}`}
                      onClick={() => onSelectGroup(g.id)}
                      className={`flex w-full max-w-[320px] flex-col items-stretch gap-1 rounded-form border-0 px-3 py-2 text-left font-inherit transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-1 ${rowClass}`}
                    >
                      <div className="flex w-full items-start justify-between gap-3">
                        <span className="flex min-w-0 flex-1 items-start gap-2">
                          <span
                            className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-current opacity-70"
                            aria-hidden
                          />
                          <span className="whitespace-normal break-words text-[12.5px] leading-snug tracking-[-0.15px]">
                            {g.label}
                          </span>
                        </span>
                        <span
                          className={`shrink-0 self-start text-right font-mono text-[10px] leading-snug tabular-nums ${countClass}`}
                        >
                          {formatCountBadge(g.count, g.approximate)}
                        </span>
                      </div>
                      {rationale ? (
                        <p className="m-0 pl-4 text-[10.5px] italic leading-snug text-subdued">
                          {rationale}
                        </p>
                      ) : null}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex min-w-0 w-full max-w-sm flex-1 flex-col gap-4">
            <h3 className="m-0 font-label-small-emphasized text-subdued">UAD signal groups</h3>
            <div>
              <p className="m-0 mb-2 font-label-small text-subdued">In header</p>
              <div className="flex flex-col gap-1" role="list">
                {HEADER_SIGNALS.map((s) => {
                  const highlighted = isSignalHighlighted(s.id, selection)
                  const dim = selection != null && !highlighted
                  const note = SIGNAL_RATIONALE[s.id]
                  const borderStyle = {
                    borderWidth: highlighted ? '1px' : '0.75px',
                    borderStyle: 'solid' as const,
                    borderColor: highlighted
                      ? 'var(--explorer-edge-dot)'
                      : 'var(--explorer-signal-border-muted)',
                  }

                  return (
                    <div key={s.id} className={dim ? ROW_DIM : undefined}>
                      <button
                        type="button"
                        role="listitem"
                        data-mesh-anchor={`mapping-sig-${s.id}`}
                        onClick={() => onSelectSignal(s.id)}
                        className={`box-border flex w-full max-w-[320px] flex-col gap-1 rounded-form px-3 py-2 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-1 ${
                          highlighted
                            ? 'bg-offset font-label-medium-emphasized text-default'
                            : 'bg-transparent font-label-medium text-subdued hover:bg-offset/40'
                        }`}
                        style={borderStyle}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{
                              background: highlighted
                                ? 'var(--explorer-edge-dot)'
                                : 'var(--explorer-signal-border-muted)',
                            }}
                            aria-hidden
                          />
                          <span className="min-w-0 flex-1">{s.label}</span>
                        </span>
                        {note ? (
                          <p className="m-0 pl-4 text-[10.5px] italic leading-snug text-subdued">
                            {note}
                          </p>
                        ) : null}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
            <div>
              <p className="m-0 mb-2 font-label-small text-subdued">Actions required</p>
              {TAX_SIGNAL ? (
                <div
                  className={
                    selection != null && !isSignalHighlighted(TAX_SIGNAL.id, selection)
                      ? ROW_DIM
                      : undefined
                  }
                >
                  <button
                    type="button"
                    role="listitem"
                    data-mesh-anchor={`mapping-sig-${TAX_SIGNAL.id}`}
                    onClick={() => onSelectSignal(TAX_SIGNAL.id)}
                    className={`box-border flex w-full max-w-[320px] flex-col gap-1 rounded-form px-3 py-2 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-1 ${
                      isSignalHighlighted(TAX_SIGNAL.id, selection)
                        ? 'bg-offset font-label-medium-emphasized text-default'
                        : 'bg-transparent font-label-medium text-subdued hover:bg-offset/40'
                    }`}
                    style={{
                      borderWidth: isSignalHighlighted(TAX_SIGNAL.id, selection) ? '1px' : '0.75px',
                      borderStyle: 'dotted',
                      borderColor: isSignalHighlighted(TAX_SIGNAL.id, selection)
                        ? 'var(--explorer-edge-dot)'
                        : 'var(--explorer-signal-border-muted)',
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{
                          background: isSignalHighlighted(TAX_SIGNAL.id, selection)
                            ? 'var(--explorer-edge-dot)'
                            : 'var(--explorer-signal-border-muted)',
                        }}
                        aria-hidden
                      />
                      <span className="min-w-0 flex-1">{TAX_SIGNAL.label}</span>
                    </span>
                    {SIGNAL_RATIONALE.tax_reporting ? (
                      <p className="m-0 pl-4 text-[10.5px] italic leading-snug text-subdued">
                        {SIGNAL_RATIONALE.tax_reporting}
                      </p>
                    ) : null}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
