import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ConfigurationId } from '../../../data/capabilityModel'
import {
  expandConfigurationsWithAutoSelect,
  isRelationshipOnly,
  resolveSignalsBeforeFold,
  resolveSignalsForConfigurations,
} from '../../../data/capabilityModel'
import { PLATFORM_NETWORK_CONFIG_IDS } from '../configColors'
import ConfigurationsColumn from './ConfigurationsColumn'
import ConfigSignalEdges from './ConfigSignalEdges'
import InfoBox from './InfoBox'
import PlaygroundControls from './PlaygroundControls'
import RightColumn from './RightColumn'
import SignalsColumn from './SignalsColumn'

const PLATFORM_ID_SET = new Set<ConfigurationId>(PLATFORM_NETWORK_CONFIG_IDS)

export default function SignalsTab() {
  const meshRef = useRef<HTMLDivElement>(null)
  const [userSelected, setUserSelected] = useState<Set<ConfigurationId>>(() => new Set())
  const [billingEnabled, setBillingEnabled] = useState(false)
  const [taxEnabled, setTaxEnabled] = useState(false)

  const expandedConfigs = useMemo(
    () => expandConfigurationsWithAutoSelect(userSelected),
    [userSelected]
  )

  useEffect(() => {
    if (!expandedConfigs.has('merchant')) {
      setBillingEnabled(false)
      setTaxEnabled(false)
    }
  }, [expandedConfigs])

  const onToggleConfig = useCallback((id: ConfigurationId) => {
    if (!PLATFORM_ID_SET.has(id)) return
    setUserSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const activeSignals = useMemo(
    () => resolveSignalsForConfigurations(userSelected, billingEnabled),
    [userSelected, billingEnabled]
  )

  const preFoldSignals = useMemo(
    () => resolveSignalsBeforeFold(userSelected, billingEnabled),
    [userSelected, billingEnabled]
  )

  const merchantActive = expandedConfigs.has('merchant')
  const relationshipOnly =
    expandedConfigs.size > 0 && isRelationshipOnly(expandedConfigs)

  const onClearAll = useCallback(() => {
    setUserSelected(new Set())
    setBillingEnabled(false)
    setTaxEnabled(false)
  }, [])

  const showClearAll =
    userSelected.size > 0 || billingEnabled || taxEnabled

  return (
    <div
      className="flex w-full min-w-0 flex-col gap-4"
      data-name="SignalsTab"
    >
      <p className="m-0 max-w-2xl text-subdued font-label-small leading-relaxed">
        Toggle configurations to see which status signals light up (solid = required capabilities and
        dotted = does not require capabilities).
      </p>
      <PlaygroundControls
        merchantActive={merchantActive}
        billingEnabled={billingEnabled}
        taxEnabled={taxEnabled}
        onBillingChange={setBillingEnabled}
        onTaxChange={setTaxEnabled}
        showClearAll={showClearAll}
        onClearAll={onClearAll}
      />
      <div
        ref={meshRef}
        className="capability-explorer-mesh relative w-full min-w-0 min-h-[200px]"
      >
        <ConfigSignalEdges
          meshRef={meshRef}
          expandedConfigs={expandedConfigs}
          billingEnabled={billingEnabled}
          activeSignals={activeSignals}
          relationshipOnly={relationshipOnly}
        />
        <div className="relative z-[1] flex w-full min-w-0 flex-wrap gap-8 lg:flex-nowrap lg:items-start">
          <ConfigurationsColumn
            userSelected={userSelected}
            onToggleConfig={onToggleConfig}
            expandedConfigs={expandedConfigs}
            billingEnabled={billingEnabled}
            taxEnabled={taxEnabled}
          />
          <SignalsColumn activeSignals={activeSignals} preFoldSignals={preFoldSignals} />
          <RightColumn activeSignals={activeSignals} />
        </div>
      </div>
      <InfoBox expandedConfigs={expandedConfigs} />
    </div>
  )
}
