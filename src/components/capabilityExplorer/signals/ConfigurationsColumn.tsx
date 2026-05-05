import type { ConfigurationId } from '../../../data/capabilityModel'
import NotPlatformNetwork from './NotPlatformNetwork'
import PlatformNetwork from './PlatformNetwork'

type ConfigurationsColumnProps = {
  userSelected: ReadonlySet<ConfigurationId>
  onToggleConfig: (id: ConfigurationId) => void
  expandedConfigs: ReadonlySet<ConfigurationId>
  billingEnabled: boolean
  taxEnabled: boolean
}

export default function ConfigurationsColumn({
  userSelected,
  onToggleConfig,
  expandedConfigs,
  billingEnabled,
  taxEnabled,
}: ConfigurationsColumnProps) {
  return (
    <div className="min-w-0 max-w-sm flex-1" data-name="Configurations column">
      <PlatformNetwork userSelected={userSelected} onToggle={onToggleConfig} />
      <NotPlatformNetwork
        expandedConfigs={expandedConfigs}
        billingEnabled={billingEnabled}
        taxEnabled={taxEnabled}
      />
    </div>
  )
}
