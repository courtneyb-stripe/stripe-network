import { foldRules, type ConfigurationId } from '../../../data/capabilityModel'

function foldRuleActive(expanded: ReadonlySet<ConfigurationId>): boolean {
  return foldRules.some((r) => r.whenConfigurationsActive.every((c) => expanded.has(c)))
}

type InfoBoxProps = {
  expandedConfigs: ReadonlySet<ConfigurationId>
}

/**
 * Fold notice only — visible when a fold rule from `foldRules` is active (e.g. Storer: Transfers → FA).
 */
export default function InfoBox({ expandedConfigs }: InfoBoxProps) {
  if (!foldRuleActive(expandedConfigs)) return null

  return (
    <div
      className="mt-4 rounded-lg bg-offset/80 px-4 py-3 font-label-small leading-relaxed"
      data-name="Info box"
    >
      <p className="m-0 font-label-small-emphasized" style={{ color: 'var(--color-feedback-attention-on)' }}>
        ⚡ Transfers folded into Financial accounts.
      </p>
    </div>
  )
}
