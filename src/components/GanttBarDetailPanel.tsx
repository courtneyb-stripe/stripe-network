/**
 * Floating workstream / phase detail panel for the roadmap Gantt (click-to-open).
 */

import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { CalendarOutlineIcon } from '../icons/CalendarOutlineIcon'
import { ExternalLinkIcon } from '../icons/ExternalLinkIcon'
import {
  milestones,
  formatWorkstreamStatusLabel,
  type Marker,
  type Phase,
  type Workstream,
  type WorkstreamStatus,
} from '../data/ganttData'
import { statusPillColors } from '../data/statusPill'

const PANEL_W = 320
const VIEW_MARGIN = 12
const GAP = 8

const PANEL_BG = '#F5F4F0'
const PANEL_BORDER = '#E0DDD8'
const TEXT_DARK = '#1A1A1A'
const TEXT_MUTED = '#888780'
const TEXT_LABEL = '#AAAAAA'
const LINK_COLOR = '#6366F1'
/** Key-dates value column: happened (before today). */
const DATE_VALUE_PAST = '#454542'
/** Key-dates value column: today and future, or TBD / —. */
const DATE_VALUE_UPCOMING = '#7D7D78'
const DATE_VALUE_SIZE_PX = 12

type StatusTones = { bar: string; track: string; stop: string; pill: string }

function computePanelPosition(
  anchorX: number,
  anchorY: number,
  panelW: number,
  panelH: number,
): { left: number; top: number } {
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1200
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800

  let left = anchorX - panelW / 2
  left = Math.min(Math.max(left, VIEW_MARGIN), Math.max(VIEW_MARGIN, vw - panelW - VIEW_MARGIN))

  let top = anchorY + GAP
  if (top + panelH > vh - VIEW_MARGIN) {
    top = anchorY - panelH - GAP
  }
  if (top < VIEW_MARGIN) {
    top = VIEW_MARGIN
  }
  if (top + panelH > vh - VIEW_MARGIN) {
    top = Math.max(VIEW_MARGIN, vh - panelH - VIEW_MARGIN)
  }
  return { left, top }
}

function startOfTodayLocal(): Date {
  const n = new Date()
  return new Date(n.getFullYear(), n.getMonth(), n.getDate(), 0, 0, 0, 0)
}

/** Calendar day strictly before today → past. */
function isPastCalendarDay(d: Date): boolean {
  const day = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)
  return day.getTime() < startOfTodayLocal().getTime()
}

function dateValueColor(d: Date | null): string {
  if (!d) return DATE_VALUE_UPCOMING
  return isPastCalendarDay(d) ? DATE_VALUE_PAST : DATE_VALUE_UPCOMING
}

function formatDisplayDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function driInitials(dri: string): string {
  const t = dri.replace(/^@/, '').trim()
  if (!t) return '?'
  const parts = t.split(/[^a-zA-Z0-9]+/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[1]![0]!).toUpperCase()
  }
  return t.slice(0, 2).toUpperCase()
}

function parseYmd(ymd: string): Date | null {
  const t = ymd.trim()
  if (!t) return null
  const [y, m, d] = t.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d, 12, 0, 0, 0)
}

function milestoneKeyInvalid(key: string): boolean {
  const k = key.trim()
  return !k || k === '—'
}

function releaseDateForMilestoneKey(key: string): Date | null {
  if (milestoneKeyInvalid(key)) return null
  const row = milestones.find((m) => m.milestone.trim() === key.trim())
  if (!row) return null
  return parseYmd(row.release_date)
}

function sortMarkersForPanel(ms: Marker[]): Marker[] {
  const rows = ms.slice()
  rows.sort((a, b) => {
    const da = parseYmd(a.date)?.getTime() ?? 0
    const db = parseYmd(b.date)?.getTime() ?? 0
    if (da !== db) return da - db
    if (a.type === b.type) return 0
    return a.type === 'review' ? -1 : 1
  })
  return rows
}

function PanelAvatar({ ws, barColor }: { ws: Workstream; barColor: string }) {
  const [failed, setFailed] = useState(false)
  if (!ws.avatar || failed) {
    return (
      <div
        className="flex size-[28px] shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
        style={{
          backgroundColor: barColor,
          color: TEXT_DARK,
        }}
      >
        {driInitials(ws.dri)}
      </div>
    )
  }
  return (
    <img
      src={ws.avatar}
      alt=""
      className="size-[28px] shrink-0 rounded-full object-cover"
      onError={() => setFailed(true)}
    />
  )
}

function DateRow({
  label,
  value,
  valueDate,
}: {
  label: string
  value: string
  valueDate: Date | null
}) {
  const tone = dateValueColor(valueDate)
  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex shrink-0" aria-hidden>
        <CalendarOutlineIcon size={14} color={tone} />
      </span>
      <span className="shrink-0 tabular-nums" style={{ color: tone, fontSize: DATE_VALUE_SIZE_PX }}>
        {label}
      </span>
      <span
        className="min-w-0 flex-1 text-right tabular-nums"
        style={{ color: tone, fontSize: DATE_VALUE_SIZE_PX }}
      >
        {value}
      </span>
    </div>
  )
}

function ReviewSubwayDot({ stopColor }: { stopColor: string }) {
  return (
    <span
      className="box-border inline-block shrink-0 rounded-full"
      style={{
        width: 8,
        height: 8,
        border: `2px solid ${stopColor}`,
        backgroundColor: 'transparent',
      }}
      aria-hidden
    />
  )
}

export function GanttBarDetailPanel({
  mode = 'workstream',
  ws,
  phase,
  anchorX,
  anchorY,
  markers: wsMarkers,
  statusTones,
}: {
  mode?: 'workstream' | 'phase'
  ws: Workstream
  phase?: Phase
  anchorX: number
  anchorY: number
  markers: Marker[]
  statusTones: Record<WorkstreamStatus, StatusTones>
}) {
  const phaseMode = mode === 'phase' && phase != null
  const panelRef = useRef<HTMLDivElement>(null)
  const [layout, setLayout] = useState<{ left: number; top: number } | null>(null)
  const [entered, setEntered] = useState(false)

  const statusForPanel: WorkstreamStatus = phaseMode ? phase!.status : ws.status
  const tones = statusTones[statusForPanel]
  const barColor = tones.bar
  const sortedMarkers = useMemo(() => sortMarkersForPanel(wsMarkers), [wsMarkers])

  const layoutKey = phaseMode ? `${ws.id}:${phase!.id}` : ws.id

  useLayoutEffect(() => {
    const el = panelRef.current
    if (!el) return
    const h = el.offsetHeight
    const w = PANEL_W
    setLayout(computePanelPosition(anchorX, anchorY, w, h))
  }, [anchorX, anchorY, layoutKey])

  useLayoutEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const kickoffDate = parseYmd(ws.kickoff)
  const kickoffStr = kickoffDate ? formatDisplayDate(kickoffDate) : '—'

  const firstMilestoneInvalid = milestoneKeyInvalid(ws.first_milestone)
  const firstMilestoneDate = firstMilestoneInvalid
    ? null
    : releaseDateForMilestoneKey(ws.first_milestone)
  const firstMilestoneStr = firstMilestoneInvalid
    ? '—'
    : firstMilestoneDate
      ? formatDisplayDate(firstMilestoneDate)
      : 'TBD'

  const gaInvalid = milestoneKeyInvalid(ws.ga_milestone)
  const gaDate = gaInvalid ? null : releaseDateForMilestoneKey(ws.ga_milestone)
  const gaStr = gaInvalid ? '—' : gaDate ? formatDisplayDate(gaDate) : 'TBD'

  const phaseStart = phaseMode ? parseYmd(phase!.start) : null
  const phaseEnd = phaseMode ? parseYmd(phase!.end) : null
  const phaseStartStr = phaseStart ? formatDisplayDate(phaseStart) : '—'
  const phaseEndStr = phaseEnd ? formatDisplayDate(phaseEnd) : '—'

  const animStyle: CSSProperties = {
    opacity: entered ? 1 : 0,
    transform: entered ? 'translateY(0)' : 'translateY(6px)',
    transition: 'opacity 150ms ease-out, transform 150ms ease-out',
  }

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="gantt-detail-title"
      data-gantt-detail-panel
      className="fixed z-[60] box-border shadow-lg"
      style={{
        width: PANEL_W,
        visibility: layout ? 'visible' : 'hidden',
        left: layout?.left ?? 0,
        top: layout?.top ?? 0,
        backgroundColor: PANEL_BG,
        border: `1px solid ${PANEL_BORDER}`,
        borderRadius: 12,
        padding: 20,
        fontFamily: 'Inter, system-ui, sans-serif',
        ...animStyle,
      }}
    >
      <div className="flex items-start">
        <h2
          id="gantt-detail-title"
          className="min-w-0 flex-1 pr-2 text-[15px] font-medium leading-snug"
          style={{ color: TEXT_DARK }}
        >
          {phaseMode ? phase!.label : ws.name}
        </h2>
        <span
          className="ml-2 inline-flex shrink-0 items-center rounded-[20px] px-2 py-0.5 text-[10px] font-medium leading-none"
          style={statusPillColors(tones)}
        >
          {formatWorkstreamStatusLabel(statusForPanel)}
        </span>
      </div>

      {phaseMode ? (
        <div className="mt-2 text-[11px] leading-snug" style={{ color: TEXT_MUTED }}>
          {ws.name}
        </div>
      ) : null}

      <div className="mt-3 flex items-center gap-2">
        <PanelAvatar ws={ws} barColor={barColor} />
        {!phaseMode ? (
          <span className="text-[12px]" style={{ color: TEXT_MUTED }}>
            @{ws.dri.replace(/^@/, '')}
          </span>
        ) : null}
      </div>

      <div className="mt-3" style={{ borderTop: `1px solid ${PANEL_BORDER}` }} aria-hidden />

      <div className="mt-3">
        <div
          className="text-[10px] font-medium uppercase leading-none tracking-wide"
          style={{ color: TEXT_LABEL, marginBottom: 8 }}
        >
          Key dates
        </div>
        <div className="flex flex-col" style={{ gap: 10 }}>
          {phaseMode ? (
            <>
              <DateRow label="Phase start" value={phaseStartStr} valueDate={phaseStart} />
              <DateRow label="Phase end" value={phaseEndStr} valueDate={phaseEnd} />
            </>
          ) : (
            <>
              <DateRow label="Kickoff" value={kickoffStr} valueDate={kickoffDate} />
              <DateRow label="First milestone" value={firstMilestoneStr} valueDate={firstMilestoneDate} />
            </>
          )}
          {sortedMarkers.map((m) => {
            const d = parseYmd(m.date)
            const tone = dateValueColor(d)
            const lead =
              m.type === 'handoff' ? (
                <span className="inline-flex w-[14px] shrink-0 justify-center" aria-hidden>
                  <CalendarOutlineIcon size={14} color={tone} />
                </span>
              ) : (
                <span className="inline-flex w-[14px] shrink-0 justify-center" aria-hidden>
                  <ReviewSubwayDot stopColor={tone} />
                </span>
              )
            return (
              <div key={`${m.date}-${m.label}-${m.type}`} className="flex items-center gap-2">
                {lead}
                <span
                  className="min-w-0 flex-1 truncate tabular-nums"
                  style={{ color: tone, fontSize: DATE_VALUE_SIZE_PX }}
                >
                  {m.label}
                </span>
                <span
                  className="shrink-0 tabular-nums"
                  style={{ color: tone, fontSize: DATE_VALUE_SIZE_PX }}
                >
                  {d ? formatDisplayDate(d) : '—'}
                </span>
              </div>
            )
          })}
          {!phaseMode ? <DateRow label="Last milestone" value={gaStr} valueDate={gaDate} /> : null}
        </div>
      </div>

      <div className="mt-3">
        <div
          className="text-[10px] font-medium uppercase leading-none tracking-wide"
          style={{ color: TEXT_LABEL, marginBottom: 8 }}
        >
          Links
        </div>
        <div data-gantt-links-placeholder aria-hidden />
      </div>

      {ws.doc_url.trim() ? (
        <div
          style={{
            borderTop: `1px solid ${PANEL_BORDER}`,
            paddingTop: 12,
            marginTop: 12,
          }}
        >
          <a
            href={ws.doc_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full cursor-pointer items-center gap-2 bg-transparent text-left no-underline"
            style={{ color: LINK_COLOR }}
          >
            <span className="inline-flex shrink-0" aria-hidden>
              <ExternalLinkIcon size={14} fill={LINK_COLOR} />
            </span>
            <span className="text-[13px]">Design brief →</span>
          </a>
        </div>
      ) : null}

      <div data-gantt-edit-placeholder />
    </div>
  )
}
