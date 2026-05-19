import { Link } from 'react-router-dom'
import { PROTOTYPES, type PrototypeRow } from '../data/prototypes'
import { HUB, HUB_FONT } from './hubTheme'
import HubPageChrome from './HubPageChrome'
import { IconExternalLink, IconFigma, IconFileText } from './hubIcons'

function splitWorking(rows: PrototypeRow[]) {
  return rows.filter((r) => r.category === 'working')
}

function statusDotColor(status: string): string {
  const s = status.toLowerCase()
  if (s.includes('archiv')) return '#555553'
  return '#7B6FD4'
}

function vercelHref(row: PrototypeRow): string | null {
  if (row.url.startsWith('http')) return row.url
  return null
}

function briefHref(row: PrototypeRow): string | null {
  if (row.briefUrl) return row.briefUrl
  if (row.url === '/components' || row.url.startsWith('/components')) return row.url
  return null
}

function PrototypeCard({ row }: { row: PrototypeRow }) {
  const vercel = vercelHref(row)
  const brief = briefHref(row)
  const figma = row.figmaUrl

  return (
    <article
      className="flex flex-col transition-colors duration-[120ms]"
      style={{
        backgroundColor: HUB.cardBg,
        border: `1px solid ${HUB.cardBorder}`,
        borderRadius: 10,
        padding: 20,
        fontFamily: HUB_FONT,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = HUB.cardHoverBg
        e.currentTarget.style.borderColor = HUB.cardHoverBorder
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = HUB.cardBg
        e.currentTarget.style.borderColor = HUB.cardBorder
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="shrink-0 rounded-full"
          style={{ width: 6, height: 6, backgroundColor: statusDotColor(row.status) }}
          aria-hidden
        />
        <span className="text-[11px] leading-none" style={{ color: '#888780' }}>
          {row.status}
        </span>
      </div>
      <h2 className="mt-[10px] text-[14px] font-medium leading-snug" style={{ color: HUB.title }}>
        {row.name}
      </h2>
      <p
        className="mt-1 line-clamp-2 text-[12px] leading-snug"
        style={{ color: '#888780' }}
        title={row.description}
      >
        {row.description}
      </p>
      <div className="mt-4 flex items-center justify-between gap-2 text-[11px]" style={{ color: '#555553' }}>
        <span className="min-w-0 truncate">{row.owner}</span>
        <span className="shrink-0 whitespace-nowrap">{row.lastUpdated}</span>
      </div>
      <div className="mt-auto flex items-center gap-3 pt-4" style={{ gap: 12 }}>
        {vercel ? (
          <a
            href={vercel}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[#555553] no-underline transition-colors hover:text-[#9B8FE8]"
            style={{ fontSize: 14 }}
          >
            <IconExternalLink />
            <span>Vercel</span>
          </a>
        ) : row.url.startsWith('/') ? (
          <Link
            to={row.url}
            className="inline-flex items-center gap-1.5 text-[#555553] no-underline transition-colors hover:text-[#9B8FE8]"
            style={{ fontSize: 14 }}
          >
            <IconExternalLink />
            <span>Open</span>
          </Link>
        ) : null}
        {figma ? (
          <a
            href={figma}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[#555553] no-underline transition-colors hover:text-[#9B8FE8]"
            style={{ fontSize: 14 }}
          >
            <IconFigma />
            <span>Figma</span>
          </a>
        ) : null}
        {brief ? (
          brief.startsWith('http') ? (
            <a
              href={brief}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[#555553] no-underline transition-colors hover:text-[#9B8FE8]"
              style={{ fontSize: 14 }}
            >
              <IconFileText />
              <span>Brief</span>
            </a>
          ) : (
            <Link
              to={brief}
              className="inline-flex items-center gap-1.5 text-[#555553] no-underline transition-colors hover:text-[#9B8FE8]"
              style={{ fontSize: 14 }}
            >
              <IconFileText />
              <span>Brief</span>
            </Link>
          )
        ) : null}
      </div>
    </article>
  )
}

export default function HubPrototypesPage() {
  const working = splitWorking(PROTOTYPES)
  return (
    <HubPageChrome
      title="Prototypes"
      subtitle="Working branches and in-repo previews. Contributors: @courtneyb @angelal @robinfan @grabelnikov"
    >
      <div
        className="grid w-full gap-4"
        style={{
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        {working.map((row) => (
          <PrototypeCard key={row.id} row={row} />
        ))}
      </div>
    </HubPageChrome>
  )
}
