import {
  foldRules,
  getStatusSignal,
  statusSignals,
  type StatusSignalId,
} from '../../../data/capabilityModel'

const HEADER_SIGNALS = statusSignals.filter((s) => s.surfacesAs === 'header')
const TAX_SIGNAL = statusSignals.find((s) => s.id === 'tax_reporting')!

const TRANSFERS_FOLD = foldRules.find((r) => r.signal === 'transfers')
const FOLD_INTO_CAPTION = TRANSFERS_FOLD
  ? `→ ${getStatusSignal(TRANSFERS_FOLD.foldInto)?.label ?? 'Financial accounts'}`
  : '→ Financial accounts'

type SignalsColumnProps = {
  activeSignals: ReadonlySet<StatusSignalId>
  preFoldSignals: ReadonlySet<StatusSignalId>
}

function SignalPill({
  id,
  label,
  isLit,
  variant = 'default',
  caption,
  suppressed,
}: {
  id: StatusSignalId
  label: string
  isLit: boolean
  variant?: 'default' | 'actions_required_dotted'
  /** Sub-label (e.g. fold destination) — triggers stacked layout */
  caption?: string
  /** e.g. Transfers when folded: whole control at 50% including caption */
  suppressed?: boolean
}) {
  const isDotted = variant === 'actions_required_dotted'
  const borderStyle = isDotted
    ? {
        borderWidth: isLit ? '1px' : '0.75px',
        borderStyle: 'dotted' as const,
        borderColor: isLit ? 'var(--explorer-edge-dot)' : 'var(--explorer-signal-border-muted)',
      }
    : {
        borderWidth: isLit ? '1px' : '0.75px',
        borderStyle: 'solid' as const,
        borderColor: isLit ? 'var(--explorer-edge-dot)' : 'var(--explorer-signal-border-muted)',
      }

  if (caption) {
    return (
      <div
        className={`box-border w-full min-w-0 max-w-[280px] ${
          suppressed ? 'opacity-50' : ''
        }`}
        data-mesh-anchor={`signal-${id}`}
        data-signal={id}
        data-lit={isLit}
      >
        <div
          className={`box-border flex w-full min-w-0 max-w-[280px] items-baseline gap-2 rounded-form px-3 py-2 ${
            isLit ? 'font-label-medium-emphasized text-default' : 'font-label-medium text-subdued'
          }`}
          style={borderStyle}
        >
          <span
            className="h-2 w-2 shrink-0 self-center rounded-full"
            style={{
              background: isLit ? 'var(--explorer-edge-dot)' : 'var(--explorer-signal-border-muted)',
            }}
            aria-hidden
          />
          <span className="min-w-0 flex-1 truncate line-through">
            {label}
          </span>
          <span
            className="shrink-0 text-right text-[10px] font-label-small leading-none text-subdued"
            title={caption}
            aria-label={`Folded into ${caption.replace(/^→\s*/, '')}`}
          >
            {caption}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`box-border flex w-full min-w-0 max-w-[280px] items-center gap-2 rounded-form px-3 py-2 ${
        isLit ? 'font-label-medium-emphasized text-default' : 'font-label-medium text-subdued'
      } ${suppressed ? 'opacity-50' : ''}`}
      style={borderStyle}
      data-mesh-anchor={`signal-${id}`}
      data-signal={id}
      data-lit={isLit}
    >
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{
          background: isLit ? 'var(--explorer-edge-dot)' : 'var(--explorer-signal-border-muted)',
        }}
        aria-hidden
      />
      <span className="min-w-0 truncate">{label}</span>
    </div>
  )
}

function transfersPillState(
  preFold: ReadonlySet<StatusSignalId>,
  active: ReadonlySet<StatusSignalId>
): { isLit: boolean; caption?: string; suppressed: boolean } {
  const hasPre = preFold.has('transfers')
  if (!hasPre) {
    return { isLit: false, suppressed: false }
  }
  if (active.has('transfers')) {
    return { isLit: true, suppressed: false }
  }
  return { isLit: true, caption: FOLD_INTO_CAPTION, suppressed: true }
}

export default function SignalsColumn({ activeSignals, preFoldSignals }: SignalsColumnProps) {
  return (
    <div className="flex min-w-0 max-w-sm flex-1 flex-col gap-4" data-name="Status signals">
      <div>
        <p className="m-0 mb-2 font-label-small text-subdued">UAD - Header and Actions required</p>
        <div className="flex flex-col gap-2">
          {HEADER_SIGNALS.map((s) => {
            if (s.id === 'transfers') {
              const { isLit, caption, suppressed } = transfersPillState(preFoldSignals, activeSignals)
              return (
                <SignalPill
                  key={s.id}
                  id={s.id}
                  label={s.label}
                  isLit={isLit}
                  caption={caption}
                  suppressed={suppressed}
                />
              )
            }
            return (
              <SignalPill
                key={s.id}
                id={s.id}
                label={s.label}
                isLit={activeSignals.has(s.id)}
              />
            )
          })}
        </div>
      </div>
      <div>
        <p className="m-0 mb-2 font-label-small text-subdued">UAD - Actions required only</p>
        <SignalPill
          id={TAX_SIGNAL.id as StatusSignalId}
          label={TAX_SIGNAL.label}
          isLit={activeSignals.has('tax_reporting')}
          variant="actions_required_dotted"
        />
      </div>
    </div>
  )
}
