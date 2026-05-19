import { NavLink } from 'react-router-dom'
import { HUB, HUB_FONT } from './hubTheme'

const LINKS: { to: string; label: string; end?: boolean }[] = [
  { to: '/gantt', label: 'Overview', end: true },
  { to: '/prototypes', label: 'Prototypes' },
  { to: '/decisions', label: 'Decisions' },
  { to: '/resources', label: 'Resources' },
  { to: '/archive', label: 'Archive' },
]

export default function HubTopNav() {
  return (
    <header
      className="flex w-full shrink-0 items-center justify-between border-b"
      style={{
        height: HUB.navHeight,
        paddingLeft: HUB.navPadX,
        paddingRight: HUB.navPadX,
        backgroundColor: HUB.navBg,
        borderColor: HUB.navBorder,
        fontFamily: HUB_FONT,
      }}
      data-hub-top-nav
    >
      <div className="flex min-w-0 items-baseline gap-1.5">
        <span className="shrink-0 text-[14px] font-medium leading-none" style={{ color: HUB.wordmarkPrimary }}>
          Network
        </span>
        <span className="shrink-0 text-[14px] font-normal leading-none" style={{ color: HUB.wordmarkSecondary }}>
          /
        </span>
        <span className="min-w-0 truncate text-[14px] font-normal leading-none" style={{ color: HUB.wordmarkSecondary }}>
          Design hub
        </span>
      </div>
      <nav className="flex shrink-0 items-center" style={{ gap: HUB.navGap }} aria-label="Design hub">
        {LINKS.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                'relative border-0 bg-transparent pb-[15px] pt-0 text-[13px] font-normal no-underline outline-none transition-colors',
                isActive ? 'text-[#F0EEE9]' : 'text-[#555553] hover:text-[#888780]',
                isActive ? 'border-b-[1.5px] border-[#9B8FE8]' : 'border-b-[1.5px] border-transparent',
                '-mb-px',
              ].join(' ')
            }
            style={{ fontFamily: HUB_FONT }}
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
