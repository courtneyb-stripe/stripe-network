import type { Capability, CapabilityGroupId, ConfigurationId, ProductId } from '../../../data/capabilityModel'
import {
  capabilityGroups,
  getCapabilityGroup,
  getConfiguration,
  getGranularCapabilitiesDisplay,
  getProduct,
  getRelevantCapsForConfigInGroup,
} from '../../../data/capabilityModel'
import type { CapabilitiesMapEntityMode } from './ProductsMeshEdges'

type GranularCapsColumnProps = {
  mapEntityMode: CapabilitiesMapEntityMode
  selectedProductId: ProductId | null
  selectedConfigurationId: ConfigurationId | null
  focusedGroupId: CapabilityGroupId | null
}

function formatCountBadge(count: number, approximate?: boolean): string {
  return `${count}${approximate ? '+' : ''}`
}

function groupSectionOrderForProduct(groupIds: readonly CapabilityGroupId[]): CapabilityGroupId[] {
  const rank = new Map(capabilityGroups.map((g, i) => [g.id, i]))
  return [...groupIds].sort((a, b) => (rank.get(a) ?? 999) - (rank.get(b) ?? 999))
}

type OneGroupBodyProps = { groupId: CapabilityGroupId }

function OneGroupCapsBody({ groupId }: OneGroupBodyProps) {
  const { displayed, approximateTailCount } = getGranularCapabilitiesDisplay(groupId)

  return (
    <>
      <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
        {displayed.map((c) => (
          <li
            key={c.id}
            className="font-mono text-[10.5px] leading-snug text-subdued"
            data-capability-id={c.id}
          >
            {c.id}
          </li>
        ))}
      </ul>
      {approximateTailCount > 0 && (
        <p className="m-0 mt-1 text-[10.5px] italic leading-snug text-subdued">
          +{approximateTailCount} more (approximate)
        </p>
      )}
    </>
  )
}

function OneGroupCapsBodyFromList({ caps }: { caps: readonly Capability[] }) {
  return (
    <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
      {caps.map((c) => (
        <li
          key={c.id}
          className="font-mono text-[10.5px] leading-snug text-subdued"
          data-capability-id={c.id}
        >
          {c.id}
        </li>
      ))}
    </ul>
  )
}

function SectionHeader({
  label,
  count,
  approximate,
}: {
  label: string
  count: number
  approximate?: boolean
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-2">
      <p className="m-0 min-w-0 flex-1 font-label-small-emphasized uppercase tracking-wide text-subdued">
        {label}
      </p>
      <span className="shrink-0 font-mono text-[10px] leading-snug tabular-nums text-subdued">
        {formatCountBadge(count, approximate)}
      </span>
    </div>
  )
}

export default function GranularCapsColumn({
  mapEntityMode,
  selectedProductId,
  selectedConfigurationId,
  focusedGroupId,
}: GranularCapsColumnProps) {
  const empty =
    selectedProductId == null &&
    selectedConfigurationId == null &&
    focusedGroupId == null

  if (empty) {
    return (
      <div className="flex min-w-0 max-w-sm flex-1 flex-col gap-2" data-name="Granular capabilities column">
        <h3 className="m-0 font-label-small-emphasized text-subdued">Granular capabilities</h3>
        <p className="m-0 mt-2 font-label-small leading-relaxed text-subdued">
          Click a product, configuration, or group to explore.
        </p>
      </div>
    )
  }

  if (mapEntityMode === 'products' && selectedProductId != null) {
    const product = getProduct(selectedProductId)
    const ordered = product ? groupSectionOrderForProduct(product.capabilityGroups) : []

    return (
      <div className="flex min-w-0 max-w-sm flex-1 flex-col gap-2" data-name="Granular capabilities column">
        <h3 className="m-0 font-label-small-emphasized text-subdued">Granular capabilities</h3>
        <div className="mt-1 flex flex-col gap-5">
          {ordered.map((gid) => {
            const meta = getCapabilityGroup(gid)
            if (!meta) return null
            return (
              <section key={gid} aria-label={meta.label}>
                <SectionHeader
                  label={meta.label.toUpperCase()}
                  count={meta.count}
                  approximate={meta.approximate}
                />
                <OneGroupCapsBody groupId={gid} />
              </section>
            )
          })}
        </div>
      </div>
    )
  }

  if (mapEntityMode === 'configs' && selectedConfigurationId != null) {
    const cfg = getConfiguration(selectedConfigurationId)
    const ordered = cfg ? groupSectionOrderForProduct(cfg.capabilityGroups) : []

    return (
      <div className="flex min-w-0 max-w-sm flex-1 flex-col gap-2" data-name="Granular capabilities column">
        <h3 className="m-0 font-label-small-emphasized text-subdued">Granular capabilities</h3>
        <div className="mt-1 flex flex-col gap-5">
          {ordered.map((gid) => {
            const meta = getCapabilityGroup(gid)
            if (!meta) return null
            const relevant = getRelevantCapsForConfigInGroup(selectedConfigurationId, gid)
            if (relevant.length === 0) return null
            return (
              <section key={gid} aria-label={meta.label}>
                <SectionHeader label={meta.label.toUpperCase()} count={relevant.length} />
                <OneGroupCapsBodyFromList caps={relevant} />
              </section>
            )
          })}
        </div>
      </div>
    )
  }

  if (focusedGroupId != null) {
    const meta = getCapabilityGroup(focusedGroupId)
    if (!meta) return null

    return (
      <div className="flex min-w-0 max-w-sm flex-1 flex-col gap-2" data-name="Granular capabilities column">
        <h3 className="m-0 font-label-small-emphasized text-subdued">Granular capabilities</h3>
        <div className="mt-1 flex flex-col gap-0">
          <section aria-label={meta.label}>
            <SectionHeader
              label={meta.label.toUpperCase()}
              count={meta.count}
              approximate={meta.approximate}
            />
            <OneGroupCapsBody groupId={focusedGroupId} />
          </section>
        </div>
      </div>
    )
  }

  return null
}
