import { Link } from 'react-router-dom'
import { PROTOTYPES, type PrototypeRow } from '../data/prototypes'
import { HUB, HUB_FONT } from './hubTheme'
import HubPageChrome from './HubPageChrome'
import { IconExternalLink, IconFigma, IconFileText } from './hubIcons'

function statusDotColor(status: string): string {
  const s = status.toLowerCase()
  if (s.includes('archiv')) return '#555553'
  return '#555553'
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

function ArchiveCard({ row }: { row: PrototypeRow }) {
  const vercel = vercelHref(row)
  const brief = briefHref(row)
  const figma = row.figmaUrl

  return (
    <article
      className="relative flex flex-col transition-colors duration-[120ms]"
      style={{
        backgroundColor: HUB.archiveCardBg,
        border: `1px solid ${HUB.archiveCardBorder}`,
        borderRadius: 10,
        padding: 20,
        fontFamily: HUB_FONT,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#202020'
        e.currentTarget.style.borderColor = '#2a2a2a'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = HUB.archiveCardBg
        e.currentTarget.style.borderColor = HUB.archiveCardBorder
      }}
    >
      <span
        className="absolute right-3 top-3 rounded-[20px] px-2 py-0.5 text-[10px] font-medium"
        style={{ color: HUB.archivePillText, backgroundColor: HUB.archivePillBg }}
      >
        Archived
      </span>
      <div className="flex items-center gap-2 pr-16">
        <span
          className="shrink-0 rounded-full"
          style={{ width: 6, height: 6, backgroundColor: statusDotColor(row.status) }}
          aria-hidden
        />
        <span className="text-[11px] leading-none" style={{ color: '#555553' }}>
          {row.status}
        </span>
      </div>
      <h2 className="mt-[10px] text-[14px] font-medium leading-snug" style={{ color: '#888780' }}>
        {row.name}
      </h2>
      <p className="mt-1 line-clamp-2 text-[12px] leading-snug" style={{ color: '#555553' }} title={row.description}>
        {row.description}
      </p>
      <div className="mt-4 flex items-center justify-between gap-2 text-[11px]" style={{ color: '#555553' }}>
        <span className="min-w-0 truncate">{row.owner}</span>
        <span className="shrink-0 whitespace-nowrap">{row.lastUpdated}</span>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3" style={{ gap: 12 }}>
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

export default function HubArchivePage() {
  const archived = PROTOTYPES.filter((r) => r.category === 'archived')
  return (
    <HubPageChrome title="Archive" subtitle="Reference branches and frozen explorations.">
      <div
        className="grid w-full"
        style={{
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        {archived.map((row) => (
          <ArchiveCard key={row.id} row={row} />
        ))}
      </div>
    </HubPageChrome>
  )
}
