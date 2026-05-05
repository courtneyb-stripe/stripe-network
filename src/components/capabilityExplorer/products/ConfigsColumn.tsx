import type { ConfigurationId } from '../../../data/capabilityModel'
import { getConfiguration } from '../../../data/capabilityModel'
import { CONFIGURATION_DOT_COLOR } from '../configColors'

/** Configs mode order for Capabilities map (derived configs omitted). Customer is rendered separately as a plain row. */
export const CAPABILITIES_MAP_CONFIG_PILL_IDS: readonly ConfigurationId[] = [
  'merchant',
  'recipient',
  'gp_recipient',
  'storer',
  'borrower',
  'card_issuer',
] as const

type ConfigsColumnProps = {
  selectedConfigurationId: ConfigurationId | null
  onSelectConfiguration: (id: ConfigurationId) => void
}

export default function ConfigsColumn({
  selectedConfigurationId,
  onSelectConfiguration,
}: ConfigsColumnProps) {
  const customer = getConfiguration('customer')
  const customerLabel = customer?.label ?? 'Customer'

  return (
    <div className="flex min-w-0 max-w-sm flex-1 flex-col gap-2" data-name="Configurations column">
      <h3 className="m-0 font-label-small-emphasized text-subdued">Configurations</h3>
      <div className="flex flex-col gap-2" role="list" aria-label="Platform-network configurations">
        {CAPABILITIES_MAP_CONFIG_PILL_IDS.map((id) => {
          const config = getConfiguration(id)
          const label = config?.label ?? id
          const isActive = selectedConfigurationId === id
          const dot = isActive
            ? (CONFIGURATION_DOT_COLOR[id] ?? 'var(--color-icon-subdued)')
            : 'var(--color-neutral-300)'

          return (
            <button
              key={id}
              type="button"
              role="listitem"
              data-mesh-anchor={`p1-cfg-${id}`}
              onClick={() => onSelectConfiguration(id)}
              className={`flex min-h-10 w-full max-w-[280px] flex-col items-stretch justify-center rounded-form border px-3 py-2 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-1 ${
                isActive
                  ? 'border-default bg-neutral-700 text-neutral-0'
                  : 'border-neutral-100 bg-surface text-default hover:border-neutral-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: dot }}
                  aria-hidden
                />
                <span className="font-label-medium leading-tight">{label}</span>
              </span>
            </button>
          )
        })}
      </div>
      <div
        className="flex w-full max-w-[280px] items-start gap-2 rounded-form px-3 py-2 text-left text-subdued"
        role="listitem"
        aria-label={`${customerLabel} — relationship only`}
      >
        <span
          className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-neutral-300"
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p className="m-0 font-label-medium leading-tight text-default">{customerLabel}</p>
          <p className="m-0 mt-0.5 font-label-small leading-snug text-subdued">
            no backing capabilities — relationship only
          </p>
        </div>
      </div>
    </div>
  )
}
