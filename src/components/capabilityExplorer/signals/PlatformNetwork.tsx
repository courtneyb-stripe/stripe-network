import type { ConfigurationId } from '../../../data/capabilityModel'
import { getConfiguration } from '../../../data/capabilityModel'
import { CONFIGURATION_DOT_COLOR, PLATFORM_NETWORK_CONFIG_IDS } from '../configColors'

type PlatformNetworkProps = {
  userSelected: ReadonlySet<ConfigurationId>
  onToggle: (id: ConfigurationId) => void
}

export default function PlatformNetwork({ userSelected, onToggle }: PlatformNetworkProps) {
  return (
    <div className="flex flex-col gap-2" data-name="Platform network">
      <h3 className="m-0 font-label-small-emphasized text-subdued">Platform network</h3>
      <div className="flex flex-col gap-2" role="group" aria-label="Configuration roles">
        {PLATFORM_NETWORK_CONFIG_IDS.map((id) => {
          const isActive = userSelected.has(id)
          const config = getConfiguration(id)
          const label = config?.label ?? id
          const dot = isActive
            ? (CONFIGURATION_DOT_COLOR[id] ?? 'var(--color-icon-subdued)')
            : 'var(--color-neutral-300)'

          return (
            <button
              key={id}
              type="button"
              data-mesh-anchor={`config-${id}`}
              onClick={() => onToggle(id)}
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
    </div>
  )
}
