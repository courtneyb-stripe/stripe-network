/**
 * Prototype Hub — Landing page at root URL.
 * Directory of Network prototype branches and resources; no sidebar or app nav.
 * Background: Figma node 45:11049 (Stripe Network Cursor SRC).
 */

import { useState } from 'react'
import { ROW_HEIGHT } from '../constants/table'
import { ViewChip } from '../components/NetworkFilterGroup'
import { PillBadge } from '../components/PillBadge'
import {
  PROTOTYPES,
  type PrototypeRow,
  type PrototypeCategory,
} from '../data/prototypes'

export type HubFilterId = 'all' | PrototypeCategory

const SLACK_CHANNEL_URL = 'https://join.slack.com/share/enQtMTA1NjkwNjA4NjU0NTktNmEyMzdiNGY1OGQ4NDBhOWJkMjFhYTdkNzEyOTJiNzBiYmE3ZGJkYTVhZDM5MmI4MWE1MWZmYWQxOWMxMGJmMQ'

/** Figma 45:11049 — radial gradient background (full opacity). */
const HUB_BACKGROUND_IMAGE = `url("data:image/svg+xml;utf8,<svg viewBox='0 0 1947.4 1570.1' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%25' width='100%25' fill='url(%23grad)' opacity='1'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(-0.021845 121 -213.37 -0.03852 973.72 1634)'><stop stop-color='rgba(203,131,255,1)' offset='0.0418'/><stop stop-color='rgba(255,144,185,1)' offset='0.17846'/><stop stop-color='rgba(255,173,152,1)' offset='0.23463'/><stop stop-color='rgba(255,201,119,1)' offset='0.29081'/><stop stop-color='rgba(255,215,156,1)' offset='0.37446'/><stop stop-color='rgba(255,230,193,1)' offset='0.45812'/><stop stop-color='rgba(255,249,240,1)' offset='0.57839'/><stop stop-color='rgba(255,255,255,1)' offset='0.688'/></radialGradient></defs></svg>")`

const COLUMNS = [
  { key: 'status', label: 'Status', width: 'w-[120px]' },
  { key: 'name', label: 'Name', width: 'w-[200px]' },
  { key: 'branch', label: 'Branch', width: 'w-[160px]' },
  { key: 'owner', label: 'Owner', width: 'w-[140px]' },
  { key: 'lastUpdated', label: 'Last updated (PST)', width: 'w-[200px]' },
] as const

const FILTER_CHIPS: { id: HubFilterId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'm0', label: 'M0' },
  { id: 'resources', label: 'Resources' },
  { id: 'archived', label: 'Archived' },
]

function splitByCategory(rows: PrototypeRow[]) {
  const m0 = rows.filter((r) => r.category === 'm0')
  const resources = rows.filter((r) => r.category === 'resources')
  const archived = rows.filter((r) => r.category === 'archived')
  return { m0, resources, archived }
}

function TableHeader() {
  return (
    <div
      className="flex w-full shrink-0 items-center overflow-hidden border-b border-neutral-100 bg-offset/60 px-4 pr-6"
      data-name="Table Header"
      style={{ height: ROW_HEIGHT }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-6">
        {COLUMNS.map((col) => (
          <div
            key={col.key}
            className={`flex min-w-0 shrink-0 items-center overflow-hidden ${col.width}`}
          >
            <span className="truncate font-label-small-emphasized text-subdued">
              {col.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PrototypeRowLink({
  row,
  isMuted,
}: {
  row: PrototypeRow
  isMuted: boolean
}) {
  const cellClass = 'flex min-w-0 shrink-0 items-center overflow-hidden'
  const textClass = isMuted ? 'text-subdued' : 'text-default'
  const content = (
    <>
      <div className={`${cellClass} ${COLUMNS[0].width}`}>
        <PillBadge label="In progress" variant="attention" />
      </div>
      <div className={`${cellClass} ${COLUMNS[1].width}`}>
        <span className={`truncate font-label-medium-emphasized ${textClass}`}>
          {row.name}
        </span>
      </div>
      <div className={`${cellClass} ${COLUMNS[2].width}`}>
        <code className={`truncate font-mono text-[13px] ${textClass}`}>
          {row.branch}
        </code>
      </div>
      <div className={`${cellClass} ${COLUMNS[3].width}`}>
        <span className={`truncate font-label-medium ${textClass}`}>
          {row.owner}
        </span>
      </div>
      <div className={`${cellClass} ${COLUMNS[4].width}`}>
        <span className={`truncate font-label-medium ${textClass}`}>
          {row.lastUpdated} PST
        </span>
      </div>
    </>
  )

  const fullUrl = row.url.startsWith('http') ? row.url : `${window.location.origin}${row.url}`
  const rowClass = 'flex w-full shrink-0 cursor-pointer items-center rounded-[length:var(--radius-action)] px-4 pr-6 transition-colors bg-surface hover:bg-offset'

  return (
    <a
      href={fullUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={rowClass}
      style={{ height: ROW_HEIGHT }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-6">{content}</div>
    </a>
  )
}

function TableSection({
  rows,
  isMuted,
}: {
  rows: PrototypeRow[]
  isMuted: boolean
}) {
  if (rows.length === 0) return null
  return (
    <div className="flex flex-col">
      {rows.map((row) => (
        <PrototypeRowLink key={row.id} row={row} isMuted={isMuted} />
      ))}
    </div>
  )
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div
      className="border-t border-neutral-100 bg-offset/50 px-4 py-2 flex items-center"
      style={{ minHeight: 40 }}
      role="separator"
      aria-label={label}
    >
      <span className="font-label-small-emphasized text-subdued">{label}</span>
    </div>
  )
}

function FilterChipsRow({
  activeFilter,
  onFilterChange,
  counts,
}: {
  activeFilter: HubFilterId
  onFilterChange: (id: HubFilterId) => void
  counts: { all: number; m0: number; resources: number; archived: number }
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {FILTER_CHIPS.map((chip) => (
        <ViewChip
          key={chip.id}
          label={chip.label}
          count={counts[chip.id]}
          active={activeFilter === chip.id}
          onClick={() => onFilterChange(chip.id)}
          size="compact"
        />
      ))}
    </div>
  )
}

export default function PrototypeHub() {
  const [activeFilter, setActiveFilter] = useState<HubFilterId>('m0')
  const { m0, resources, archived } = splitByCategory(PROTOTYPES)
  const counts = {
    all: PROTOTYPES.length,
    m0: m0.length,
    resources: resources.length,
    archived: archived.length,
  }

  const filteredRows: PrototypeRow[] =
    activeFilter === 'all'
      ? PROTOTYPES
      : activeFilter === 'm0'
        ? m0
        : activeFilter === 'resources'
          ? resources
          : archived

  const showSectionDividers = activeFilter === 'all'

  return (
    <div
      className="min-h-screen w-full relative"
      data-name="Prototype Hub"
    >
      <div
        className="hub-gradient-pulse absolute inset-0 size-full"
        style={{
          backgroundImage: HUB_BACKGROUND_IMAGE,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        aria-hidden
        data-node-id="45:11049"
      />
      <div className="relative z-10 mx-auto max-w-[1200px] px-8 py-12">
        <header className="mb-10">
          <h1 className="font-heading-xlarge text-default mb-4">
            Stripe Network prototypes
          </h1>
          <ul className="font-label-medium text-subdued list-none space-y-1">
            <li>
              Design DRI →{' '}
              <a
                href="https://home.corp.stripe.com/people/courtneyb"
                target="_blank"
                rel="noopener noreferrer"
                className="text-action-primary hover:underline"
              >
                @courtneyb
              </a>
            </li>
            <li>
              Contributors →{' '}
              <a
                href="https://home.corp.stripe.com/people/angelal"
                target="_blank"
                rel="noopener noreferrer"
                className="text-action-primary hover:underline"
              >
                @angelal
              </a>
              {' '}
              <a
                href="https://home.corp.stripe.com/people/robinfan"
                target="_blank"
                rel="noopener noreferrer"
                className="text-action-primary hover:underline"
              >
                @robinfan
              </a>
              {' '}
              <a
                href="https://home.corp.stripe.com/people/grabelnikov"
                target="_blank"
                rel="noopener noreferrer"
                className="text-action-primary hover:underline"
              >
                @grabelnikov
              </a>
            </li>
            <li>
              Questions? →{' '}
              <a
                href={SLACK_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-action-primary hover:underline"
              >
                #proj-dashboard-customer-detail-extended
              </a>
            </li>
          </ul>
        </header>

        <FilterChipsRow
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          counts={counts}
        />

        <div
          className="flex w-full flex-col overflow-auto rounded-[length:var(--radius-xlarge)] border border-neutral-100 bg-surface"
          data-name="Table 2.0"
        >
          <TableHeader />
          <div className="flex flex-col">
            {showSectionDividers ? (
              <>
                <TableSection rows={m0} isMuted={false} />
                {resources.length > 0 && (
                  <>
                    <SectionDivider label="Resources" />
                    <TableSection rows={resources} isMuted={false} />
                  </>
                )}
                {archived.length > 0 && (
                  <>
                    <SectionDivider label="Archived" />
                    <TableSection rows={archived} isMuted />
                  </>
                )}
              </>
            ) : (
              <TableSection
                rows={filteredRows}
                isMuted={activeFilter === 'archived'}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
