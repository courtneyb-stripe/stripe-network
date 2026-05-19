import { HUB_DECISIONS, type HubDecisionStatus } from '../data/hubDecisions'
import { HUB, HUB_FONT } from './hubTheme'
import HubPageChrome from './HubPageChrome'

function statusPill(status: HubDecisionStatus) {
  if (status === 'open') {
    return {
      label: 'Open',
      color: '#F9BC45',
      bg: '#4A3A10',
    }
  }
  if (status === 'resolved') {
    return {
      label: 'Resolved',
      color: '#3ECFAA',
      bg: '#0F3D30',
    }
  }
  return {
    label: 'Superseded',
    color: '#888780',
    bg: '#2A2A2A',
  }
}

export default function HubDecisionsPage() {
  return (
    <HubPageChrome title="Decisions" subtitle="Recorded product and UX direction for Network.">
      <div className="w-full overflow-x-auto" style={{ fontFamily: HUB_FONT }}>
        <table className="w-full border-collapse text-left">
          <thead>
            <tr>
              {['Decision', 'Rationale', 'DRI', 'Date', 'Status'].map((h) => (
                <th
                  key={h}
                  className="pb-3 text-[10px] font-medium uppercase tracking-wide"
                  style={{ color: '#555553' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HUB_DECISIONS.map((row) => {
              const pill = statusPill(row.status)
              return (
                <tr key={row.id} className="border-b" style={{ borderColor: HUB.navBorder, height: 52 }}>
                  <td className="py-2 pr-4 align-middle text-[14px] font-normal" style={{ color: HUB.title }}>
                    {row.decision}
                  </td>
                  <td className="max-w-[320px] py-2 pr-4 align-middle text-[12px] leading-snug" style={{ color: '#888780' }}>
                    {row.rationale}
                  </td>
                  <td className="py-2 pr-4 align-middle text-[12px]" style={{ color: '#555553' }}>
                    {row.dri}
                  </td>
                  <td className="py-2 pr-4 align-middle text-[12px]" style={{ color: '#555553' }}>
                    {row.date}
                  </td>
                  <td className="py-2 align-middle">
                    <span
                      className="inline-block rounded-[20px] px-2 py-0.5 text-[11px] font-medium"
                      style={{ color: pill.color, backgroundColor: pill.bg }}
                    >
                      {pill.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </HubPageChrome>
  )
}