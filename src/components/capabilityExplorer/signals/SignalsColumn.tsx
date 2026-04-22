import { statusSignals, type StatusSignalId } from '../../../data/capabilityModel'

const HEADER_SIGNALS = statusSignals.filter((s) => s.surfacesAs === 'header')
const TAX_SIGNAL = statusSignals.find((s) => s.id === 'tax_reporting')!

type SignalsColumnProps = {
  activeSignals: ReadonlySet<StatusSignalId>
}

function SignalPill({
  id,
  label,
  isLit,
  variant = 'default',
}: {
  id: StatusSignalId
  label: string
  isLit: boolean
  variant?: 'default' | 'actions_required_dotted'
}) {
  const isDotted = variant === 'actions_required_dotted'
  const borderStyle = isDotted
    ? {
        borderWidth: isLit ? '1px' : '0.75px',
        borderStyle: 'dotted',
        borderColor: isLit ? 'var(--explorer-edge-dot)' : 'var(--explorer-signal-border-muted)',
      }
    : {
        borderWidth: isLit ? '1px' : '0.75px',
        borderStyle: 'solid',
        borderColor: isLit ? 'var(--explorer-edge-dot)' : 'var(--explorer-signal-border-muted)',
      }

  return (
    <div
      className={`box-border flex w-full min-w-0 max-w-[280px] items-center gap-2 rounded-form px-3 py-2 ${
        isLit ? 'font-label-medium-emphasized text-default' : 'font-label-medium text-subdued'
      }`}
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

export default function SignalsColumn({ activeSignals }: SignalsColumnProps) {
  return (
    <div className="flex min-w-0 max-w-sm flex-1 flex-col gap-4" data-name="Status signals">
      <div>
        <p className="m-0 mb-2 font-label-small text-subdued">UAD - Header and Actions required</p>
        <div className="flex flex-col gap-2">
          {HEADER_SIGNALS.map((s) => (
            <SignalPill
              key={s.id}
              id={s.id}
              label={s.label}
              isLit={activeSignals.has(s.id)}
            />
          ))}
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
