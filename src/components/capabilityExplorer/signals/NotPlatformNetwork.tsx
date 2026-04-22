import {
  configurations,
  getConfiguration,
  type ConfigurationId,
} from '../../../data/capabilityModel'
import { CONFIGURATION_DOT_COLOR } from '../configColors'

const DERIVED_CONFIGS = configurations.filter(
  (c) => c.platformNetwork === false && c.derivedFrom != null
)

type NotPlatformNetworkProps = {
  expandedConfigs: ReadonlySet<ConfigurationId>
  billingEnabled: boolean
  taxEnabled: boolean
}

/**
 * Derived role indicators (not pills). Visible when parent is active, or in the
 * fully empty state as a dimmed structural preview (stripe-capability-mesh.html).
 */
export default function NotPlatformNetwork({
  expandedConfigs,
  billingEnabled,
  taxEnabled,
}: NotPlatformNetworkProps) {
  const nothingActiveAtAll =
    expandedConfigs.size === 0 && !billingEnabled && !taxEnabled

  return (
    <div className="mt-6 flex flex-col gap-2" data-name="Not platform network">
      <h3 className="m-0 font-label-small-emphasized text-subdued">Not platform network</h3>
      <div className="flex flex-col gap-3" role="list" aria-label="Derived configurations">
        {DERIVED_CONFIGS.map((cfg) => {
          const parentId = cfg.derivedFrom!
          const parent = getConfiguration(parentId)
          const parentActive = expandedConfigs.has(parentId)
          const visible = parentActive || nothingActiveAtAll
          if (!visible) return null

          const parentLabel = parent?.label ?? parentId
          const amber = CONFIGURATION_DOT_COLOR[cfg.id] ?? '#EAB308'
          const dotColor = parentActive
            ? CONFIGURATION_DOT_COLOR[parentId] ?? amber
            : amber

          return (
            <div
              key={cfg.id}
              className="flex max-w-[280px] flex-col gap-0.5 pl-0.5"
              role="listitem"
              data-derived-config={cfg.id}
            >
              <span className="flex items-start gap-2">
                <span
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                  style={{ background: dotColor }}
                  aria-hidden
                />
                <span className="min-w-0 flex flex-col gap-0.5">
                  <span
                    className={`font-label-medium italic leading-tight ${
                      parentActive ? 'text-default' : 'text-subdued'
                    }`}
                  >
                    {cfg.label}
                  </span>
                  <span className="font-label-small leading-tight text-subdued">
                    derived from {parentLabel}
                  </span>
                </span>
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
