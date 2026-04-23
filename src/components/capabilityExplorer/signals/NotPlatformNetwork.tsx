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
 * Derived roles: same box shape as platform config pills, faint border, not selectable.
 * Visible when parent is active, or in the empty state as a dimmed preview.
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
      <div className="flex flex-col gap-2" role="list" aria-label="Derived configurations">
        {DERIVED_CONFIGS.map((cfg) => {
          const parentId = cfg.derivedFrom!
          const parent = getConfiguration(parentId)
          const parentActive = expandedConfigs.has(parentId)
          const visible = parentActive || nothingActiveAtAll
          if (!visible) return null

          const parentLabel = parent?.label ?? parentId
          const parentRoleColor =
            CONFIGURATION_DOT_COLOR[parentId] ?? (CONFIGURATION_DOT_COLOR[cfg.id] ?? '#EAB308')
          const dotColor = parentActive ? parentRoleColor : 'var(--color-neutral-300)'

          return (
            <div
              key={cfg.id}
              className="flex min-h-10 w-full max-w-[280px] flex-col justify-center rounded-form border border-neutral-50 bg-surface px-3 py-2"
              role="listitem"
              data-derived-config={cfg.id}
              data-mesh-anchor={`config-${cfg.id}`}
            >
              <div className="flex items-start gap-2">
                <span
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                  style={{ background: dotColor }}
                  aria-hidden
                />
                <div className="min-w-0 flex flex-col gap-0.5">
                  <span
                    className={`font-label-medium leading-tight ${
                      parentActive ? 'text-default' : 'text-subdued'
                    }`}
                  >
                    {cfg.label}
                  </span>
                  <span className="font-label-small leading-tight text-subdued">
                    derived from {parentLabel}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
