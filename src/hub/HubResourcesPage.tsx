import { Link } from 'react-router-dom'
import { getHubResourceGroups } from '../data/hubResources'
import { HUB, HUB_FONT } from './hubTheme'
import HubPageChrome from './HubPageChrome'
import { IconExternalLink } from './hubIcons'

export default function HubResourcesPage() {
  const groups = getHubResourceGroups()
  return (
    <HubPageChrome title="Resources" subtitle="Design system, engineering entry points, and external links.">
      <div style={{ fontFamily: HUB_FONT }}>
        {groups.map((group, gi) => (
          <section key={group.id} style={{ marginTop: gi === 0 ? 0 : 24 }}>
            <h2
              className="text-[10px] font-medium uppercase tracking-wide"
              style={{ color: '#555553', marginBottom: 12 }}
            >
              {group.label}
            </h2>
            <ul className="list-none space-y-0 p-0">
              {group.links.map((link) => {
                const inner = (
                  <>
                    <span className="flex w-[14px] shrink-0 justify-center text-[#555553]">
                      <IconExternalLink />
                    </span>
                    <span className="text-[13px] font-normal" style={{ color: HUB.accent }}>
                      {link.title}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[12px]" style={{ color: '#555553' }}>
                      {link.description}
                    </span>
                  </>
                )
                const rowClass =
                  'flex h-10 w-full items-center gap-2 rounded-md px-2 no-underline transition-colors hover:bg-[#222222]'
                return (
                  <li key={link.id}>
                    {link.external ? (
                      <a href={link.href} target="_blank" rel="noopener noreferrer" className={rowClass}>
                        {inner}
                      </a>
                    ) : (
                      <Link to={link.href} className={rowClass}>
                        {inner}
                      </Link>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>
    </HubPageChrome>
  )
}