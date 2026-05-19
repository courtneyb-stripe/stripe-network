/**
 * Roadmap Gantt — workstreams, milestones, and markers for 2026 (dark timeline UI).
 */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type Dispatch,
  type MouseEvent,
  type SetStateAction,
} from 'react'
import { createPortal } from 'react-dom'
import { GanttBarDetailPanel } from '../components/GanttBarDetailPanel'
import {
  workstreams,
  milestoneDisplayLabel,
  milestones,
  markers,
  formatWorkstreamStatusLabel,
  formatDriLabel,
  type Phase,
  type Workstream,
  type WorkstreamStatus,
  type Marker,
} from '../data/ganttData'
import { statusPillColors } from '../data/statusPill'

const RANGE_YEAR = 2026
const RANGE_START = new Date(RANGE_YEAR, 0, 1, 0, 0, 0, 0)
const RANGE_END = new Date(RANGE_YEAR, 11, 31, 23, 59, 59, 999)

const SURFACE = '#1A1A1A'
/** Section / group header rows only. */
const SECTION_BG = '#212121'
const ROW_HOVER = '#222222'
const TEXT_PRIMARY = '#F0EEE9'
const TEXT_MUTED = '#888780'
const TEXT_SECTION = '#555553'
const SIDEBAR_NAME = '#D4D0CA'
const SIDEBAR_DRI = '#555553'
const CARD_BG = '#2A2A2A'
const CARD_BORDER = '#3A3A3A'
const ACCENT_LINK = '#9B8FE8'
const TODAY_LINE = '#6366F1'
const MILESTONE_LINE = '#3A3A3A'
const TOOLBAR_BG = '#212121'
const TOOLBAR_BORDER = '#2A2A2A'
const TOOLBAR_HEIGHT = 44
const PILL_INACTIVE_BG = '#2A2A2A'

/** Timeline header (zoom controls live in toolbar above). */
const HEADER_H_DETAIL = 40
const HEADER_H_YEAR = 28
const ROW_HEIGHT = 52
const ROW_HEIGHT_EXPANDED_PARENT = 32
const PHASE_ROW_HEIGHT = 44
const SECTION_HEIGHT = 40
const BAR_RADIUS = 6
/** Horizontal inset of the track pill from the bar edges (4px each side). */
const TRACK_BAR_INSET_X = 4
/** Gap between stop circle edge and the track pill’s inner left/right edge. */
const TRACK_STOP_PAD_PX = 4
const BAR_TRACK_HEIGHT_PX = 12
/** Parent row track when workstream phases are expanded. */
const PHASE_PARENT_TRACK_HEIGHT_PX = 10
const STOP_DIAMETER_PX = 8
const STOP_MIN_GAP_PX = 16
const BAR_LABEL_MIN_PX = 40
const SIDEBAR_W = 220
const TIMELINE_MIN_W = 960
const YEAR_COL_MIN = 80
const QUARTER_WEEK_MIN = 60
/** Day column width in week zoom (7 days). */
const WEEK_DAY_COL_MIN = 48

const ZOOM_ACTIVE_TEXT = '#9B8FE8'
const ZOOM_ACTIVE_BG = '#3D3660'
const ZOOM_INACTIVE_TEXT = '#555553'

type ZoomLevel = 'year' | 'quarter' | 'week'
type ViewBy = 'group' | 'milestone' | 'status' | 'dri'

const STATUS_VIEW_ORDER: WorkstreamStatus[] = [
  'in progress',
  'at risk',
  'blocked',
  'not started',
  'paused',
  'completed',
]

type StatusTones = { bar: string; track: string; stop: string; pill: string }

/** Ramp: bar (Gantt bar) → track (track pill) → stop (markers / pill text) → pill (lightest; status chip fill on cream UI). */
const STATUS_TONES: Record<WorkstreamStatus, StatusTones> = {
  'in progress': { bar: '#7B6FD4', track: '#5B50A8', stop: '#2C2058', pill: '#D8D2F4' },
  'at risk': { bar: '#C49A2A', track: '#A07A10', stop: '#5A4200', pill: '#F2E4C4' },
  blocked: { bar: '#C45030', track: '#A03018', stop: '#5A1000', pill: '#F0D0CC' },
  completed: { bar: '#2EA882', track: '#1A8060', stop: '#0A4030', pill: '#C4EFE0' },
  paused: { bar: '#5A7A96', track: '#3A5A76', stop: '#1A3A56', pill: '#D0DEE8' },
  'not started': { bar: '#2E2E2E', track: '#3A3A3A', stop: '#1A1A1A', pill: '#E4E2DE' },
}

function percentAlongBar(d: Date, barStart: Date, barEnd: Date): number {
  const a = barStart.getTime()
  const b = barEnd.getTime()
  if (b <= a) return 0
  const t = d.getTime()
  return Math.min(100, Math.max(0, ((t - a) / (b - a)) * 100))
}

function parseYmd(ymd: string): Date | null {
  const t = ymd.trim()
  if (!t) return null
  const [y, m, d] = t.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d, 12, 0, 0, 0)
}

function clampDate(d: Date): Date {
  if (d.getTime() < RANGE_START.getTime()) return RANGE_START
  if (d.getTime() > RANGE_END.getTime()) return RANGE_END
  return d
}

/** Position within [viewStart, viewEnd] as 0–100%. Dates clamp to view. */
function percentInView(d: Date, viewStart: Date, viewEnd: Date): number {
  const vs = viewStart.getTime()
  const ve = viewEnd.getTime()
  const ms = ve - vs
  if (ms <= 0) return 0
  const t = Math.min(Math.max(d.getTime(), vs), ve)
  return ((t - vs) / ms) * 100
}

/** Bar span clipped to view window. */
function spanInView(
  barStart: Date,
  barEnd: Date,
  viewStart: Date,
  viewEnd: Date,
): { left: number; width: number } {
  const vs = viewStart.getTime()
  const ve = viewEnd.getTime()
  const ms = ve - vs
  if (ms <= 0) return { left: 0, width: 0 }
  const visStart = Math.max(barStart.getTime(), vs)
  const visEnd = Math.min(barEnd.getTime(), ve)
  if (visEnd < visStart) return { left: 0, width: 0 }
  const left = ((visStart - vs) / ms) * 100
  const right = ((visEnd - vs) / ms) * 100
  return { left, width: Math.max(right - left, 0.12) }
}

/** Square corners on sides clipped by the visible date window; round only visible corners. */
function barBorderRadiusCss(
  barStart: Date,
  barEnd: Date,
  viewStart: Date,
  viewEnd: Date,
  r: number,
): string {
  const clipLeft = barStart.getTime() <= viewStart.getTime()
  const clipRight = barEnd.getTime() >= viewEnd.getTime()
  if (clipLeft && clipRight) return '0'
  if (clipLeft) return `0 ${r}px ${r}px 0`
  if (clipRight) return `${r}px 0 0 ${r}px`
  return `${r}px`
}

/** Monday 00:00 local of the calendar week containing `d`. */
function mondayOfWeekContaining(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)
  const dow = x.getDay()
  x.setDate(x.getDate() + (dow === 0 ? -6 : 1 - dow))
  return x
}

/** First Monday suitable as week-view anchor (week intersects roadmap range). */
function firstWeekViewMonday(): Date {
  const m = mondayOfWeekContaining(RANGE_START)
  if (m.getTime() < RANGE_START.getTime()) {
    const n = new Date(m)
    n.setDate(n.getDate() + 7)
    return n
  }
  return m
}

function lastWeekViewMonday(): Date {
  return mondayOfWeekContaining(RANGE_END)
}

function clampWeekWindowMonday(d: Date): Date {
  const mon = mondayOfWeekContaining(d)
  const lo = firstWeekViewMonday().getTime()
  const hi = lastWeekViewMonday().getTime()
  return new Date(Math.min(Math.max(mon.getTime(), lo), hi))
}

function initialWeekWindowMonday(): Date {
  return clampWeekWindowMonday(mondayOfWeekContaining(clampDate(new Date())))
}

function shiftWeekWindowMonday(current: Date, deltaWeeks: number): Date {
  const n = new Date(current.getFullYear(), current.getMonth(), current.getDate(), 0, 0, 0, 0)
  n.setDate(n.getDate() + 7 * deltaWeeks)
  return clampWeekWindowMonday(n)
}

function endOfWeekSunday(weekMonday: Date): Date {
  const e = new Date(weekMonday)
  e.setDate(e.getDate() + 6)
  e.setHours(23, 59, 59, 999)
  return e
}

function getViewBounds(zoom: ZoomLevel, weekWindowMonday: Date): { start: Date; end: Date } {
  if (zoom === 'year' || zoom === 'quarter') {
    return { start: new Date(RANGE_START), end: new Date(RANGE_END) }
  }
  const start = new Date(weekWindowMonday)
  start.setHours(0, 0, 0, 0)
  let end = endOfWeekSunday(start)
  if (end.getTime() > RANGE_END.getTime()) {
    end = new Date(RANGE_END)
  }
  if (start.getTime() < RANGE_START.getTime()) {
    return { start: new Date(RANGE_START), end }
  }
  return { start, end }
}

function formatDisplayDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/** Week row: day numbers only (e.g. 12–18; cross-month 28–3). */
function formatWeekRangeLabelNumericOnly(start: Date, end: Date): string {
  const nd = '\u2013'
  const sd = start.getDate()
  const ed = end.getDate()
  return `${sd}${nd}${ed}`
}

type GroupedSection = { group: string; items: Workstream[] }

function groupWorkstreams(streams: Workstream[]): GroupedSection[] {
  const order: string[] = []
  const map = new Map<string, Workstream[]>()
  for (const ws of streams) {
    if (!map.has(ws.group)) {
      order.push(ws.group)
      map.set(ws.group, [])
    }
    map.get(ws.group)!.push(ws)
  }
  return order.map((group) => ({ group, items: map.get(group)! }))
}

function driNorm(dri: string): string {
  return dri.replace(/^@/, '').trim().toLowerCase() || 'unknown'
}

function groupByMilestone(streams: Workstream[]): GroupedSection[] {
  const map = new Map<string, Workstream[]>()
  for (const ws of streams) {
    const raw = ws.first_milestone.trim()
    const key = milestoneKeyInvalid(raw) ? '__unscheduled__' : raw
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(ws)
  }
  const roadmapKeys = milestones.map((m) => m.milestone.trim())
  const seen = new Set<string>()
  const out: GroupedSection[] = []
  for (const mk of roadmapKeys) {
    const items = map.get(mk)
    if (items?.length) {
      out.push({ group: mk, items })
      seen.add(mk)
    }
  }
  const extras = [...map.keys()]
    .filter((k) => k !== '__unscheduled__' && !seen.has(k))
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
  for (const k of extras) {
    const items = map.get(k)!
    if (items.length) out.push({ group: k, items })
  }
  const uns = map.get('__unscheduled__')
  if (uns?.length) out.push({ group: 'Unscheduled', items: uns })
  return out
}

function groupByStatus(streams: Workstream[]): GroupedSection[] {
  const bucket = new Map<WorkstreamStatus, Workstream[]>()
  for (const s of STATUS_VIEW_ORDER) bucket.set(s, [])
  for (const ws of streams) {
    bucket.get(ws.status)!.push(ws)
  }
  return STATUS_VIEW_ORDER.filter((s) => (bucket.get(s)!.length > 0)).map((s) => ({
    group: formatWorkstreamStatusLabel(s),
    items: bucket.get(s)!,
  }))
}

/** Sort keys for View by DRI: unassigned (`unknown`) last; Tracey above Cameron; else alphabetical. */
function compareDriGroupKeys(a: string, b: string): number {
  const aUnassigned = a === 'unknown'
  const bUnassigned = b === 'unknown'
  if (aUnassigned !== bUnassigned) return aUnassigned ? 1 : -1
  if (a === 'traceyv' && b === 'cameronsagey') return -1
  if (a === 'cameronsagey' && b === 'traceyv') return 1
  return a.localeCompare(b, undefined, { sensitivity: 'base' })
}

function groupByDri(streams: Workstream[]): GroupedSection[] {
  const map = new Map<string, Workstream[]>()
  for (const ws of streams) {
    const k = driNorm(ws.dri)
    if (!map.has(k)) map.set(k, [])
    map.get(k)!.push(ws)
  }
  const keys = [...map.keys()].sort(compareDriGroupKeys)
  return keys.map((k) => ({ group: k === 'unknown' ? '—' : `@${k}`, items: map.get(k)! }))
}

function buildGroupedSections(viewBy: ViewBy, streams: Workstream[]): GroupedSection[] {
  if (viewBy === 'group') return groupWorkstreams(streams)
  if (viewBy === 'milestone') return groupByMilestone(streams)
  if (viewBy === 'status') return groupByStatus(streams)
  return groupByDri(streams)
}

function markersForWorkstream(wsId: string): Marker[] {
  return markers.filter((m) => m.workstream_id === wsId)
}

function phaseDateRange(phase: Phase): { start: Date; end: Date } | null {
  const a = parseYmd(phase.start)
  const b = parseYmd(phase.end)
  if (!a || !b) return null
  return a.getTime() <= b.getTime() ? { start: a, end: b } : { start: b, end: a }
}

function markersInDateRange(ms: Marker[], rangeStart: Date, rangeEnd: Date): Marker[] {
  return ms.filter((m) => {
    const d = parseYmd(m.date)
    if (!d) return false
    const t = d.getTime()
    return t >= rangeStart.getTime() && t <= rangeEnd.getTime()
  })
}

function workstreamTimelineHeight(ws: Workstream, expandedByWs: Record<string, boolean>): number {
  if (!ws.phases?.length) return ROW_HEIGHT
  return expandedByWs[ws.id]
    ? ROW_HEIGHT_EXPANDED_PARENT + ws.phases.length * PHASE_ROW_HEIGHT
    : ROW_HEIGHT
}

function milestoneKeyInvalid(key: string): boolean {
  const t = key.trim()
  return !t || t === '—'
}

function releaseDateForMilestoneKey(key: string): Date | null {
  if (milestoneKeyInvalid(key)) return null
  const row = milestones.find((m) => m.milestone.trim() === key.trim())
  if (!row) return null
  return parseYmd(row.release_date)
}

function notStartedPlaceholderRange(ws: Workstream): { start: Date; end: Date } {
  const dFirst = releaseDateForMilestoneKey(ws.first_milestone)
  const dGa = releaseDateForMilestoneKey(ws.ga_milestone)
  if (dFirst && dGa) {
    const start = dFirst.getTime() <= dGa.getTime() ? dFirst : dGa
    const end = dFirst.getTime() <= dGa.getTime() ? dGa : dFirst
    return { start, end }
  }
  return { start: RANGE_START, end: RANGE_END }
}

function startedSolidRange(ws: Workstream): { start: Date; end: Date } | null {
  const kick = parseYmd(ws.kickoff)
  if (!kick) return null
  const wsMarkers = markersForWorkstream(ws.id)
    .map((m) => parseYmd(m.date))
    .filter((d): d is Date => d !== null)
    .sort((a, b) => a.getTime() - b.getTime())
  const lastMarker = wsMarkers.length ? wsMarkers[wsMarkers.length - 1]! : null
  const barEnd = lastMarker ?? RANGE_END
  if (barEnd.getTime() < kick.getTime()) {
    return { start: kick, end: kick }
  }
  return { start: kick, end: barEnd }
}

type WorkstreamBar =
  | { kind: 'none' }
  | { kind: 'placeholder'; start: Date; end: Date; fill: string }
  | { kind: 'solid'; start: Date; end: Date; fill: string }

function workstreamBar(ws: Workstream): WorkstreamBar {
  if (ws.status === 'not started') {
    const { start, end } = notStartedPlaceholderRange(ws)
    return { kind: 'placeholder', start, end, fill: STATUS_TONES['not started'].bar }
  }
  const range = startedSolidRange(ws)
  if (!range) return { kind: 'none' }
  return { kind: 'solid', ...range, fill: STATUS_TONES[ws.status].bar }
}

function driInitials(dri: string): string {
  const t = dri.replace(/^@/, '').trim()
  if (!t || t.toLowerCase() === 'tbd') return '?'
  const parts = t.split(/[^a-zA-Z0-9]+/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[1]![0]!).toUpperCase()
  }
  return t.slice(0, 2).toUpperCase()
}

type WeekSlot = { label: string; start: Date; end: Date; flex: number }

function buildWeekSlots(): WeekSlot[] {
  const out: WeekSlot[] = []
  let cur = new Date(RANGE_YEAR, 0, 1, 12, 0, 0, 0)
  while (cur.getTime() <= RANGE_END.getTime()) {
    const start = new Date(cur)
    const end = new Date(cur)
    end.setDate(end.getDate() + 6)
    end.setHours(12, 0, 0, 0)
    const cap = new Date(RANGE_END)
    const endClamped = end.getTime() > cap.getTime() ? cap : end
    const days =
      Math.floor((endClamped.getTime() - start.getTime()) / 86400000) + 1
    out.push({
      label: formatWeekRangeLabelNumericOnly(start, endClamped),
      start,
      end: endClamped,
      flex: Math.max(days, 1),
    })
    const next = new Date(endClamped)
    next.setDate(next.getDate() + 1)
    next.setHours(12, 0, 0, 0)
    cur = next
  }
  return out
}

function weekSlotsInView(viewStart: Date, viewEnd: Date): WeekSlot[] {
  const all = buildWeekSlots()
  return all
    .filter(
      (w) =>
        w.end.getTime() >= viewStart.getTime() && w.start.getTime() <= viewEnd.getTime(),
    )
    .map((w) => {
      const visStart = new Date(
        Math.max(w.start.getTime(), viewStart.getTime()),
      )
      const visEnd = new Date(Math.min(w.end.getTime(), viewEnd.getTime()))
      const days =
        Math.floor((visEnd.getTime() - visStart.getTime()) / 86400000) + 1
      return {
        start: visStart,
        end: visEnd,
        label: formatWeekRangeLabelNumericOnly(visStart, visEnd),
        flex: Math.max(days, 1),
      }
    })
}

type DaySlot = { start: Date; end: Date; label: string; flex: number }

function buildDaySlots(viewStart: Date, viewEnd: Date): DaySlot[] {
  const out: DaySlot[] = []
  const d = new Date(viewStart)
  d.setHours(0, 0, 0, 0)
  const endT = viewEnd.getTime()
  while (d.getTime() <= endT) {
    const dayStart = new Date(d)
    const dayEnd = new Date(d)
    dayEnd.setHours(23, 59, 59, 999)
    out.push({
      start: new Date(dayStart),
      end: dayEnd,
      label: String(dayStart.getDate()),
      flex: 1,
    })
    d.setDate(d.getDate() + 1)
  }
  return out
}

type MonthSeg = { key: string; label: string; flex: number }

function buildMonthSegments(): MonthSeg[] {
  const out: MonthSeg[] = []
  for (let m = 0; m < 12; m++) {
    const start = new Date(RANGE_YEAR, m, 1)
    const end = new Date(RANGE_YEAR, m + 1, 0, 12, 0, 0, 0)
    const days = Math.round((end.getTime() - start.getTime()) / 86400000) + 1
    out.push({
      key: `${m}`,
      label: start.toLocaleString(undefined, { month: 'short' }),
      flex: days,
    })
  }
  return out
}

function buildMonthSegmentsForView(viewStart: Date, viewEnd: Date): MonthSeg[] {
  const out: MonthSeg[] = []
  let cur = new Date(viewStart.getFullYear(), viewStart.getMonth(), 1, 0, 0, 0, 0)
  while (cur.getTime() <= viewEnd.getTime()) {
    const monthStart = new Date(cur.getFullYear(), cur.getMonth(), 1)
    const monthEnd = new Date(cur.getFullYear(), cur.getMonth() + 1, 0, 23, 59, 59, 999)
    const segStart =
      monthStart.getTime() < viewStart.getTime() ? new Date(viewStart) : monthStart
    const segEnd = monthEnd.getTime() > viewEnd.getTime() ? new Date(viewEnd) : monthEnd
    const days =
      Math.floor((segEnd.getTime() - segStart.getTime()) / 86400000) + 1
    out.push({
      key: `${cur.getFullYear()}-${cur.getMonth()}`,
      label: monthStart.toLocaleString(undefined, { month: 'short' }),
      flex: Math.max(days, 1),
    })
    cur.setMonth(cur.getMonth() + 1)
  }
  return out
}

type TooltipState =
  | {
      kind: 'bar'
      x: number
      y: number
      ws: Workstream
    }
  | {
      kind: 'marker'
      x: number
      y: number
      label: string
      date: Date
    }

type BarDetailState =
  | { kind: 'workstream'; ws: Workstream; anchorX: number; anchorY: number }
  | { kind: 'phase'; ws: Workstream; phase: Phase; anchorX: number; anchorY: number }

function barTooltipPillStyle(status: WorkstreamStatus): CSSProperties {
  return {
    ...statusPillColors(STATUS_TONES[status]),
    fontSize: 11,
    fontWeight: 500,
    padding: '2px 8px',
    borderRadius: 999,
  }
}

function TooltipAvatar({ ws }: { ws: Workstream }) {
  const [failed, setFailed] = useState(false)
  if (!ws.avatar || failed) {
    return (
      <div
        className="flex size-[28px] shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
        style={{
          backgroundColor: STATUS_TONES[ws.status].bar,
          color: '#1A1A1A',
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

function Tooltip({ state }: { state: TooltipState | null }) {
  if (!state) return null
  const pad = 10
  const style: CSSProperties = {
    position: 'fixed',
    left: Math.min(
      state.x + pad,
      typeof window !== 'undefined' ? window.innerWidth - 300 : state.x,
    ),
    top: Math.min(
      state.y + pad,
      typeof window !== 'undefined' ? window.innerHeight - 200 : state.y,
    ),
    zIndex: 50,
    maxWidth: 300,
    backgroundColor: CARD_BG,
    border: `1px solid ${CARD_BORDER}`,
    borderRadius: 8,
    padding: '12px 14px',
    fontFamily: 'Inter, system-ui, sans-serif',
    boxShadow: 'none',
  }

  if (state.kind === 'marker') {
    return (
      <div role="tooltip" className="pointer-events-none" style={style}>
        <div className="text-[13px] font-medium leading-snug" style={{ color: TEXT_PRIMARY }}>
          {state.label}
        </div>
        <div className="mt-1 text-[11px]" style={{ color: TEXT_MUTED }}>
          {formatDisplayDate(state.date)}
        </div>
      </div>
    )
  }

  const { ws } = state
  const pillStyle = barTooltipPillStyle(ws.status)

  return (
    <div role="tooltip" className="pointer-events-none" style={style}>
      <div className="flex gap-3">
        <TooltipAvatar ws={ws} />
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-medium leading-snug" style={{ color: TEXT_PRIMARY }}>
            {ws.name}
          </div>
          <div className="mt-1 text-[11px]" style={{ color: SIDEBAR_DRI }}>
            {formatDriLabel(ws.dri)}
          </div>
          <div className="mt-2 inline-block">
            <span style={pillStyle}>{formatWorkstreamStatusLabel(ws.status)}</span>
          </div>
          {ws.kickoff.trim() ? (
            <div className="mt-2 text-[11px]" style={{ color: TEXT_MUTED }}>
              Kickoff {formatDisplayDate(parseYmd(ws.kickoff)!)}
            </div>
          ) : null}
          {ws.doc_url.trim() ? (
            <div className="mt-2">
              <a
                href={ws.doc_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12px] font-medium hover:underline pointer-events-auto"
                style={{ color: ACCENT_LINK }}
                onClick={(e) => e.stopPropagation()}
              >
                Design brief →
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

/** Flat timeline body fill — no column banding (today + milestones only). */
function WeekGridBackground({ bodyHeight }: { bodyHeight: number }) {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 z-0"
      style={{ height: bodyHeight, backgroundColor: SURFACE }}
      aria-hidden
    />
  )
}

function monthLabelLayout(monthSegs: MonthSeg[]): { key: string; label: string; left: number; width: number }[] {
  const totalDays = monthSegs.reduce((s, m) => s + m.flex, 0)
  let acc = 0
  return monthSegs.map((seg) => {
    const left = (acc / totalDays) * 100
    const width = (seg.flex / totalDays) * 100
    acc += seg.flex
    return { key: seg.key, label: seg.label, left, width }
  })
}

function ToolbarPill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`shrink-0 rounded-[20px] border-0 text-[11px] font-medium leading-none transition-colors ${
        active ? '' : 'hover:bg-[#333333]'
      }`}
      style={{
        padding: '4px 12px',
        color: active ? ZOOM_ACTIVE_TEXT : ZOOM_INACTIVE_TEXT,
        backgroundColor: active ? ZOOM_ACTIVE_BG : PILL_INACTIVE_BG,
      }}
    >
      {children}
    </button>
  )
}

function GanttToolbar({
  viewBy,
  onViewBy,
  zoom,
  onZoom,
  weekNav,
}: {
  viewBy: ViewBy
  onViewBy: (v: ViewBy) => void
  zoom: ZoomLevel
  onZoom: (z: ZoomLevel) => void
  weekNav: {
    onPrev: () => void
    onNext: () => void
    canPrev: boolean
    canNext: boolean
  }
}) {
  const views: { id: ViewBy; label: string }[] = [
    { id: 'group', label: 'Group' },
    { id: 'milestone', label: 'Milestone' },
    { id: 'status', label: 'Status' },
    { id: 'dri', label: 'DRI' },
  ]
  const zooms: { id: ZoomLevel; label: string }[] = [
    { id: 'year', label: 'Year' },
    { id: 'quarter', label: 'Quarter' },
    { id: 'week', label: 'Week' },
  ]
  return (
    <div
      className="flex w-full shrink-0 items-center justify-between gap-4"
      style={{
        height: TOOLBAR_HEIGHT,
        minHeight: TOOLBAR_HEIGHT,
        padding: '10px 20px',
        backgroundColor: TOOLBAR_BG,
        borderBottom: `1px solid ${TOOLBAR_BORDER}`,
      }}
      role="toolbar"
      aria-label="Roadmap toolbar"
    >
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        <span className="shrink-0 text-[11px] font-normal" style={{ color: ZOOM_INACTIVE_TEXT }}>
          View by
        </span>
        <div className="flex flex-wrap items-center gap-1" role="tablist" aria-label="View by">
          {views.map((v) => (
            <ToolbarPill key={v.id} active={viewBy === v.id} onClick={() => onViewBy(v.id)}>
              {v.label}
            </ToolbarPill>
          ))}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {zoom === 'week' ? (
          <>
            <button
              type="button"
              aria-label="Previous week"
              disabled={!weekNav.canPrev}
              onClick={weekNav.onPrev}
              className="shrink-0 rounded-[20px] border-0 px-2 py-1 text-[12px] font-medium transition-colors hover:bg-[#333333] disabled:opacity-30"
              style={{ color: ZOOM_INACTIVE_TEXT, backgroundColor: PILL_INACTIVE_BG }}
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next week"
              disabled={!weekNav.canNext}
              onClick={weekNav.onNext}
              className="shrink-0 rounded-[20px] border-0 px-2 py-1 text-[12px] font-medium transition-colors hover:bg-[#333333] disabled:opacity-30"
              style={{ color: ZOOM_INACTIVE_TEXT, backgroundColor: PILL_INACTIVE_BG }}
            >
              ›
            </button>
          </>
        ) : null}
        <div className="flex items-center gap-1" role="tablist" aria-label="Zoom level">
          {zooms.map((z) => (
            <ToolbarPill key={z.id} active={zoom === z.id} onClick={() => onZoom(z.id)}>
              {z.label}
            </ToolbarPill>
          ))}
        </div>
      </div>
    </div>
  )
}

function GanttTimelineHeader({
  zoom,
  viewStart,
  viewEnd,
  weekSlots,
  daySlots,
  monthSegsFull,
  headerHeight,
}: {
  zoom: ZoomLevel
  viewStart: Date
  viewEnd: Date
  weekSlots: WeekSlot[]
  daySlots: DaySlot[]
  monthSegsFull: MonthSeg[]
  headerHeight: number
}) {
  const monthSegsView = useMemo(
    () => buildMonthSegmentsForView(viewStart, viewEnd),
    [viewStart, viewEnd],
  )
  const monthsFull = useMemo(() => monthLabelLayout(monthSegsFull), [monthSegsFull])
  const monthsView = useMemo(() => monthLabelLayout(monthSegsView), [monthSegsView])

  return (
    <div
      className="flex shrink-0 flex-col"
      style={{
        height: headerHeight,
        backgroundColor: SURFACE,
      }}
    >
      {zoom === 'year' ? (
        <div className="flex min-h-0 flex-1 w-full">
          {Array.from({ length: 12 }, (_, m) => {
            const d = new Date(RANGE_YEAR, m, 1)
            const label = d.toLocaleString(undefined, { month: 'short' })
            return (
              <div
                key={m}
                className="flex min-w-[80px] flex-1 items-center justify-center px-0.5"
                style={{ flexBasis: 0 }}
              >
                <span
                  className="truncate text-center text-[11px] font-medium leading-none"
                  style={{ color: TEXT_MUTED }}
                >
                  {label}
                </span>
              </div>
            )
          })}
        </div>
      ) : null}

      {zoom === 'quarter' ? (
        <>
          <div className="relative h-[18px] w-full shrink-0">
            {monthsFull.map((m) => (
              <div
                key={m.key}
                className="absolute bottom-0 flex justify-center overflow-hidden"
                style={{ left: `${m.left}%`, width: `${m.width}%` }}
              >
                <span
                  className="truncate text-[11px] font-medium leading-none"
                  style={{ color: TEXT_MUTED }}
                >
                  {m.label}
                </span>
              </div>
            ))}
          </div>
          <div className="flex min-h-0 min-w-0 flex-1">
            {weekSlots.map((w) => (
              <div
                key={`${w.start.getTime()}-${w.end.getTime()}`}
                className="flex min-w-[60px] shrink-0 items-center justify-center px-0.5"
                style={{
                  flex: `${w.flex} 0 auto`,
                }}
              >
                <span
                  className="truncate text-center text-[10px] leading-tight"
                  style={{ color: TEXT_SECTION }}
                >
                  {w.label}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : null}

      {zoom === 'week' ? (
        <>
          <div className="relative h-[18px] w-full shrink-0">
            {monthsView.map((m) => (
              <div
                key={m.key}
                className="absolute bottom-0 flex justify-center overflow-hidden"
                style={{ left: `${m.left}%`, width: `${m.width}%` }}
              >
                <span
                  className="truncate text-[11px] font-medium leading-none"
                  style={{ color: TEXT_MUTED }}
                >
                  {m.label}
                </span>
              </div>
            ))}
          </div>
          <div className="flex min-h-0 min-w-0 flex-1">
            {daySlots.map((d) => (
              <div
                key={d.start.getTime()}
                className="flex shrink-0 items-center justify-center px-0.5"
                style={{ flex: `${d.flex} 0 auto`, minWidth: WEEK_DAY_COL_MIN }}
              >
                <span
                  className="truncate text-center text-[10px] leading-tight"
                  style={{ color: TEXT_SECTION }}
                >
                  {d.label}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}

/** Full-height dashed milestone line + top label only. */
function MilestoneLines({
  bodyHeight,
  milestoneDates,
  viewStart,
  viewEnd,
}: {
  bodyHeight: number
  milestoneDates: { milestone: string; date: Date }[]
  viewStart: Date
  viewEnd: Date
}) {
  return (
    <div
      className="pointer-events-none absolute left-0 right-0 z-[1]"
      style={{ top: 0, height: bodyHeight }}
      aria-hidden
    >
      {milestoneDates.map((m) => {
        const left = percentInView(m.date, viewStart, viewEnd)
        return (
          <div
            key={m.milestone}
            className="absolute top-0 flex h-full flex-col items-center"
            style={{ left: `${left}%`, transform: 'translateX(-50%)' }}
          >
            <span
              className="max-w-[120px] shrink-0 truncate px-0.5 text-center font-medium leading-none"
              style={{ fontSize: 10, color: TEXT_SECTION }}
            >
              {milestoneDisplayLabel(m.milestone)}
            </span>
            <div
              className="mt-0 min-h-0 flex-1"
              style={{
                width: 0,
                borderLeft: `1px dashed ${MILESTONE_LINE}`,
              }}
            />
          </div>
        )
      })}
    </div>
  )
}

function TodayColumn({
  totalHeight,
  viewStart,
  viewEnd,
}: {
  totalHeight: number
  viewStart: Date
  viewEnd: Date
}) {
  const now = new Date()
  if (now.getTime() < RANGE_START.getTime() || now.getTime() > RANGE_END.getTime()) {
    return null
  }
  if (now.getTime() < viewStart.getTime() || now.getTime() > viewEnd.getTime()) {
    return null
  }
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
  const dayEnd = new Date(dayStart)
  dayEnd.setDate(dayEnd.getDate() + 1)
  const { left, width } = spanInView(dayStart, dayEnd, viewStart, viewEnd)

  return (
    <div
      className="pointer-events-none absolute top-0 z-[12]"
      style={{
        left: `${left}%`,
        width: `${Math.max(width, 0.35)}%`,
        height: totalHeight,
      }}
      aria-hidden
    >
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(99,102,241,0.08)' }}
      />
      <div
        className="absolute left-1/2 top-0 h-full w-0 -translate-x-1/2"
        style={{ borderLeft: `1.5px solid ${TODAY_LINE}` }}
      />
      <span
        className="absolute left-1/2 top-0 size-[5px] -translate-x-1/2 rounded-full"
        style={{ backgroundColor: TODAY_LINE }}
      />
    </div>
  )
}

/** Min distance from stop center to track inner edge: radius + pad → 8px from stop edge to bar edge (4 + 4). */
function trackStopCenterEdgePadPx(): number {
  return STOP_DIAMETER_PX / 2 + TRACK_STOP_PAD_PX
}

/** Enforce minimum center-to-center gap (px); nudge later stops right then pull back if past track edge. */
function adjustStopCenters(idealCenters: number[], barW: number, minGap: number): number[] {
  if (!idealCenters.length) return []
  const edge = trackStopCenterEdgePadPx()
  const x = idealCenters.slice()
  for (let i = 1; i < x.length; i++) {
    if (x[i]! - x[i - 1]! < minGap) x[i] = x[i - 1]! + minGap
  }
  if (x[x.length - 1]! > barW - edge) {
    x[x.length - 1] = barW - edge
    for (let i = x.length - 2; i >= 0; i--) {
      x[i] = Math.min(x[i]!, x[i + 1]! - minGap)
    }
  }
  if (x[0]! < edge) {
    x[0] = edge
    for (let i = 1; i < x.length; i++) {
      x[i] = Math.max(x[i]!, x[i - 1]! + minGap)
    }
  }
  return x
}

/** Pill track + stops (stops sit in track; positions use track inner width). */
function BarTrackAndStops({
  showStops,
  trackColor,
  reviewStopColor,
  handoffStopColor,
  markers: ms,
  barStart,
  barEnd,
  onEnter,
  onMove,
  onLeave,
  trackHeightPx = BAR_TRACK_HEIGHT_PX,
}: {
  showStops: boolean
  /** Track pill fill (mid ramp). */
  trackColor: string
  /** Darkest ramp — review stops (must contrast with track fill). */
  reviewStopColor: string
  /** Lightest ramp — handoff stops on the track. */
  handoffStopColor: string
  markers: Marker[]
  barStart: Date
  barEnd: Date
  onEnter: (e: MouseEvent, label: string, date: Date) => void
  onMove: (e: MouseEvent) => void
  onLeave: () => void
  trackHeightPx?: number
}) {
  const measureRef = useRef<HTMLDivElement>(null)
  const [trackW, setTrackW] = useState(0)

  useLayoutEffect(() => {
    const el = measureRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      setTrackW(el.getBoundingClientRect().width)
    })
    ro.observe(el)
    setTrackW(el.getBoundingClientRect().width)
    return () => ro.disconnect()
  }, [])

  const stops = useMemo(() => {
    if (!showStops) return []
    type Row = {
      key: string
      marker: Marker
      date: Date
      isReview: boolean
      idealPct: number
    }
    const rows: Row[] = []
    for (const m of ms) {
      const d = parseYmd(m.date)
      if (!d) continue
      if (d.getTime() < barStart.getTime() || d.getTime() > barEnd.getTime()) continue
      rows.push({
        key: `${m.workstream_id}-${m.date}-${m.label}`,
        marker: m,
        date: d,
        isReview: m.type === 'review',
        idealPct: percentAlongBar(d, barStart, barEnd),
      })
    }
    rows.sort((a, b) => {
      const dt = a.date.getTime() - b.date.getTime()
      if (dt !== 0) return dt
      // Same calendar day: reviews left, handoffs right so the final stop reads as delivery.
      if (a.isReview === b.isReview) return 0
      return a.isReview ? -1 : 1
    })

    if (trackW <= 4) {
      return rows.map((r) => ({ ...r, leftPct: r.idealPct }))
    }
    const idealsPx = rows.map((r) => (r.idealPct / 100) * trackW)
    const centers = adjustStopCenters(idealsPx, trackW, STOP_MIN_GAP_PX)
    return rows.map((r, i) => ({ ...r, leftPct: (centers[i]! / trackW) * 100 }))
  }, [showStops, ms, barStart, barEnd, trackW, trackHeightPx])

  return (
    <div
      ref={measureRef}
      className="relative z-[1] mb-1 shrink-0 overflow-visible"
      style={{
        height: trackHeightPx,
        marginLeft: TRACK_BAR_INSET_X,
        marginRight: TRACK_BAR_INSET_X,
        borderRadius: 999,
        backgroundColor: trackColor,
      }}
    >
      {showStops
        ? stops.map((s) => (
            <button
              key={s.key}
              type="button"
              aria-label={`${s.marker.label}, ${formatDisplayDate(s.date)}`}
              className="absolute top-1/2 z-[2] box-border shrink-0 cursor-default rounded-full border-0 p-0 pointer-events-auto outline-none"
              style={{
                left: `${s.leftPct}%`,
                width: STOP_DIAMETER_PX,
                height: STOP_DIAMETER_PX,
                minWidth: STOP_DIAMETER_PX,
                minHeight: STOP_DIAMETER_PX,
                maxWidth: STOP_DIAMETER_PX,
                maxHeight: STOP_DIAMETER_PX,
                transform: 'translate(-50%, -50%)',
                backgroundColor: s.isReview ? reviewStopColor : handoffStopColor,
              }}
              onMouseEnter={(e) => {
                e.stopPropagation()
                onEnter(e, s.marker.label, s.date)
              }}
              onMouseMove={onMove}
              onMouseLeave={onLeave}
            />
          ))
        : null}
    </div>
  )
}

function Chevron({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 16 16"
      fill="none"
      className="shrink-0 transition-transform"
      style={{ transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)', color: TEXT_SECTION }}
      aria-hidden
    >
      <path
        d="M4 6 L8 10 L12 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

/** Right-pointing chevron for phase expand; rotates 90° when expanded. */
function PhaseExpandChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width={10}
      height={10}
      viewBox="0 0 16 16"
      fill="none"
      className="shrink-0"
      style={{
        color: '#555553',
        transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
        transition: 'transform 200ms ease',
      }}
      aria-hidden
    >
      <path
        d="M6 4 L10 8 L6 12"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

function LoadingShimmer() {
  const row = (
    <div className="gantt-shimmer-row flex">
      <div className="shrink-0" style={{ width: SIDEBAR_W, height: ROW_HEIGHT, backgroundColor: SURFACE }} />
      <div className="min-w-0 flex-1" style={{ height: ROW_HEIGHT, backgroundColor: SURFACE }} />
    </div>
  )
  return (
    <>
      <style>{`
        @keyframes ganttShimmer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.72; }
        }
        .gantt-shimmer-row > div {
          animation: ganttShimmer 1.2s ease-in-out infinite;
        }
      `}</style>
      <div className="flex min-h-0 flex-1 flex-col" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div
          className="shrink-0"
          style={{
            height: TOOLBAR_HEIGHT,
            minHeight: TOOLBAR_HEIGHT,
            backgroundColor: TOOLBAR_BG,
            borderBottom: `1px solid ${TOOLBAR_BORDER}`,
          }}
        />
        <div className="shrink-0" style={{ height: HEADER_H_DETAIL, backgroundColor: SURFACE }} />
        {row}
        {row}
        {row}
      </div>
    </>
  )
}

function GanttSidebarWorkstreamRow({
  ws,
  phaseExpanded,
  setPhaseExpanded,
}: {
  ws: Workstream
  phaseExpanded: Record<string, boolean>
  setPhaseExpanded: Dispatch<SetStateAction<Record<string, boolean>>>
}) {
  const hasPh = !!(ws.phases && ws.phases.length > 0)
  const exp = !!phaseExpanded[ws.id]
  if (!hasPh) {
    return (
      <div
        className="flex min-w-0 flex-col justify-center px-3 transition-colors hover:bg-[#222222]"
        style={{ height: ROW_HEIGHT, backgroundColor: SURFACE }}
      >
        <div
          className="truncate font-medium leading-tight"
          style={{ fontSize: 13, fontWeight: 500, color: SIDEBAR_NAME }}
        >
          {ws.name}
        </div>
        <div className="truncate text-[11px]" style={{ color: SIDEBAR_DRI }}>
          {formatDriLabel(ws.dri)}
        </div>
      </div>
    )
  }
  const rowH = workstreamTimelineHeight(ws, phaseExpanded)
  const parentH = exp ? ROW_HEIGHT_EXPANDED_PARENT : ROW_HEIGHT
  return (
    <div
      className="min-w-0 shrink-0 transition-colors hover:bg-[#222222]"
      style={{
        height: rowH,
        transition: 'height 150ms ease',
        backgroundColor: SURFACE,
      }}
    >
      <button
        type="button"
        className="flex w-full min-w-0 items-center gap-1 px-2 text-left"
        style={{
          height: parentH,
          transition: 'height 150ms ease',
          backgroundColor: 'transparent',
        }}
        onClick={() => setPhaseExpanded((p) => ({ ...p, [ws.id]: !p[ws.id] }))}
      >
        <span className="flex w-[10px] shrink-0 justify-center" aria-hidden>
          <PhaseExpandChevron expanded={exp} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col justify-center overflow-hidden">
          <div
            className="truncate leading-tight"
            style={{
              fontSize: exp ? 11 : 13,
              fontWeight: exp ? 400 : 500,
              color: exp ? '#888780' : SIDEBAR_NAME,
              transition: 'font-size 150ms ease, color 150ms ease',
            }}
          >
            {ws.name}
          </div>
          {!exp ? (
            <div className="truncate text-[11px]" style={{ color: SIDEBAR_DRI }}>
              {formatDriLabel(ws.dri)}
            </div>
          ) : null}
        </div>
      </button>
      <div
        style={{
          maxHeight: exp ? ws.phases!.length * PHASE_ROW_HEIGHT : 0,
          opacity: exp ? 1 : 0,
          transition: 'max-height 200ms ease-out, opacity 200ms ease-out',
          overflow: 'hidden',
        }}
      >
        {ws.phases!.map((phase) => (
          <div
            key={phase.id}
            className="flex items-center gap-2"
            style={{
              height: PHASE_ROW_HEIGHT,
              paddingLeft: 24,
              paddingRight: 12,
              boxSizing: 'border-box',
            }}
          >
            <span
              className="shrink-0 rounded-full"
              style={{
                width: 6,
                height: 6,
                backgroundColor: STATUS_TONES[phase.status].bar,
              }}
              aria-hidden
            />
            <span className="min-w-0 flex-1 truncate text-[11px]" style={{ color: '#888780' }}>
              {phase.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function GanttTimelineWorkstreamRow({
  ws,
  phaseExpanded,
  barDetail,
  setBarDetail,
  viewStart,
  viewEnd,
  trackWidthPx,
  setTip,
  showBarTip,
  moveTip,
  hideTip,
  showMarkerTip,
}: {
  ws: Workstream
  phaseExpanded: Record<string, boolean>
  barDetail: BarDetailState | null
  setBarDetail: Dispatch<SetStateAction<BarDetailState | null>>
  viewStart: Date
  viewEnd: Date
  trackWidthPx: number
  setTip: Dispatch<SetStateAction<TooltipState | null>>
  showBarTip: (e: MouseEvent, w: Workstream) => void
  moveTip: (e: MouseEvent) => void
  hideTip: () => void
  showMarkerTip: (e: MouseEvent, label: string, date: Date) => void
}) {
  const hasPh = !!(ws.phases && ws.phases.length > 0)
  const exp = !!phaseExpanded[ws.id]
  const rowH = workstreamTimelineHeight(ws, phaseExpanded)
  const bar = workstreamBar(ws)
  const wsMarkers = markersForWorkstream(ws.id)
  const barLayout =
    bar.kind === 'none' ? null : spanInView(bar.start, bar.end, viewStart, viewEnd)
  const barWFrac = barLayout ? barLayout.width / 100 : 0
  const showBarName = barLayout ? barWFrac * trackWidthPx >= BAR_LABEL_MIN_PX : false
  const parentSegH = hasPh ? (exp ? ROW_HEIGHT_EXPANDED_PARENT : ROW_HEIGHT) : ROW_HEIGHT

  return (
    <div
      className="group relative shrink-0 overflow-visible transition-colors hover:bg-[#222222]"
      style={{
        height: rowH,
        transition: 'height 150ms ease',
        backgroundColor: 'transparent',
      }}
    >
      <div
        className="relative overflow-visible"
        style={{
          height: parentSegH,
          transition: 'height 150ms ease',
        }}
      >
        {!exp && barLayout && (bar.kind === 'solid' || bar.kind === 'placeholder') ? (
          <button
            type="button"
            data-gantt-bar={ws.id}
            className="absolute top-1/2 z-[3] flex -translate-y-1/2 cursor-pointer flex-col items-stretch overflow-hidden border-0 p-0 text-left pointer-events-auto"
            style={{
              left: `${barLayout.left}%`,
              width: `${barLayout.width}%`,
              minWidth: 4,
              borderRadius: barBorderRadiusCss(bar.start, bar.end, viewStart, viewEnd, BAR_RADIUS),
              backgroundColor: bar.fill,
              boxSizing: 'border-box',
            }}
            aria-label={`${ws.name}${bar.kind === 'placeholder' ? ' planned window' : ''}`}
            onMouseEnter={(e) => showBarTip(e, ws)}
            onMouseMove={moveTip}
            onMouseLeave={hideTip}
            onClick={(e) => {
              e.stopPropagation()
              setTip(null)
              if (barDetail?.kind === 'workstream' && barDetail.ws.id === ws.id) return
              setBarDetail({ kind: 'workstream', ws, anchorX: e.clientX, anchorY: e.clientY })
            }}
          >
            {showBarName ? (
              <span
                className="relative z-[3] shrink-0 truncate px-[8px] pt-2 text-[12px] font-medium leading-none"
                style={{
                  color: bar.kind === 'placeholder' ? TEXT_SECTION : SURFACE,
                }}
              >
                {ws.name}
              </span>
            ) : (
              <div className="h-1 shrink-0" aria-hidden />
            )}
            {showBarName ? <div className="h-1 shrink-0" aria-hidden /> : null}
            <BarTrackAndStops
              showStops={bar.kind === 'solid' && ws.status !== 'not started'}
              trackColor={STATUS_TONES[ws.status].track}
              reviewStopColor={STATUS_TONES[ws.status].stop}
              handoffStopColor={STATUS_TONES[ws.status].bar}
              markers={wsMarkers}
              barStart={bar.start}
              barEnd={bar.end}
              onEnter={showMarkerTip}
              onMove={moveTip}
              onLeave={hideTip}
            />
          </button>
        ) : null}
        {exp && hasPh && barLayout && (bar.kind === 'solid' || bar.kind === 'placeholder') ? (
          <button
            type="button"
            data-gantt-bar={ws.id}
            className="absolute top-1/2 z-[3] flex -translate-y-1/2 cursor-pointer flex-col justify-center overflow-visible border-0 bg-transparent p-0 text-left pointer-events-auto"
            style={{
              left: `${barLayout.left}%`,
              width: `${barLayout.width}%`,
              minWidth: 4,
              height: ROW_HEIGHT_EXPANDED_PARENT,
              boxSizing: 'border-box',
            }}
            aria-label={`${ws.name} — timeline`}
            onMouseEnter={(e) => showBarTip(e, ws)}
            onMouseMove={moveTip}
            onMouseLeave={hideTip}
            onClick={(e) => {
              e.stopPropagation()
              setTip(null)
              if (barDetail?.kind === 'workstream' && barDetail.ws.id === ws.id) return
              setBarDetail({ kind: 'workstream', ws, anchorX: e.clientX, anchorY: e.clientY })
            }}
          >
            <BarTrackAndStops
              trackHeightPx={PHASE_PARENT_TRACK_HEIGHT_PX}
              showStops={bar.kind === 'solid' && ws.status !== 'not started'}
              trackColor={STATUS_TONES[ws.status].track}
              reviewStopColor={STATUS_TONES[ws.status].stop}
              handoffStopColor={STATUS_TONES[ws.status].bar}
              markers={wsMarkers}
              barStart={bar.start}
              barEnd={bar.end}
              onEnter={showMarkerTip}
              onMove={moveTip}
              onLeave={hideTip}
            />
          </button>
        ) : null}
      </div>
      {hasPh ? (
        <div
          style={{
            maxHeight: exp ? ws.phases!.length * PHASE_ROW_HEIGHT : 0,
            opacity: exp ? 1 : 0,
            transition: 'max-height 200ms ease-out, opacity 200ms ease-out',
            overflow: 'hidden',
          }}
        >
          {ws.phases!.map((phase) => {
            const pr = phaseDateRange(phase)
            if (!pr) return null
            const layout = spanInView(pr.start, pr.end, viewStart, viewEnd)
            const phaseMarkers = markersInDateRange(wsMarkers, pr.start, pr.end)
            const tones = STATUS_TONES[phase.status]
            const ghost = phase.status === 'not started'
            const showPhaseBarLabel = layout ? layout.width / 100 >= 0.14 : false
            return (
              <div key={phase.id} className="relative shrink-0" style={{ height: PHASE_ROW_HEIGHT }}>
                {layout ? (
                  <button
                    type="button"
                    data-gantt-phase-bar
                    data-workstream-id={ws.id}
                    data-phase-id={phase.id}
                    className="absolute top-1/2 z-[3] flex -translate-y-1/2 cursor-pointer flex-col items-stretch overflow-hidden border-0 p-0 text-left pointer-events-auto"
                    style={{
                      left: `${layout.left}%`,
                      width: `${layout.width}%`,
                      minWidth: 4,
                      borderRadius: barBorderRadiusCss(pr.start, pr.end, viewStart, viewEnd, BAR_RADIUS),
                      backgroundColor: ghost ? '#2E2E2E' : tones.bar,
                      border: ghost ? '1px solid #3A3A3A' : undefined,
                      boxSizing: 'border-box',
                    }}
                    aria-label={phase.label}
                    onClick={(e) => {
                      e.stopPropagation()
                      setTip(null)
                      if (
                        barDetail?.kind === 'phase' &&
                        barDetail.ws.id === ws.id &&
                        barDetail.phase.id === phase.id
                      ) {
                        return
                      }
                      setBarDetail({
                        kind: 'phase',
                        ws,
                        phase,
                        anchorX: e.clientX,
                        anchorY: e.clientY,
                      })
                    }}
                  >
                    {showPhaseBarLabel ? (
                      <span
                        className={`relative z-[3] shrink-0 truncate px-[8px] pt-2 text-[11px] font-medium leading-none ${ghost ? 'pointer-events-none' : ''}`}
                        style={{ color: ghost ? '#555553' : SURFACE }}
                      >
                        {phase.label}
                      </span>
                    ) : (
                      <div className="h-1 shrink-0" aria-hidden />
                    )}
                    {showPhaseBarLabel ? <div className="h-0.5 shrink-0" aria-hidden /> : null}
                    <BarTrackAndStops
                      showStops={phaseMarkers.length > 0}
                      trackColor={ghost ? '#252525' : tones.track}
                      reviewStopColor={tones.stop}
                      handoffStopColor={tones.bar}
                      markers={phaseMarkers}
                      barStart={pr.start}
                      barEnd={pr.end}
                      onEnter={showMarkerTip}
                      onMove={moveTip}
                      onLeave={hideTip}
                    />
                  </button>
                ) : null}
              </div>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

export default function GanttPage() {
  const [tip, setTip] = useState<TooltipState | null>(null)
  const [barDetail, setBarDetail] = useState<BarDetailState | null>(null)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [phaseExpanded, setPhaseExpanded] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [viewBy, setViewBy] = useState<ViewBy>('group')
  const [zoom, setZoom] = useState<ZoomLevel>('quarter')
  const [weekWindowMonday, setWeekWindowMonday] = useState<Date>(initialWeekWindowMonday)

  const scrollRef = useRef<HTMLDivElement>(null)
  const didQuarterScrollRef = useRef(false)
  const didWeekScrollRef = useRef(false)

  const { start: viewStart, end: viewEnd } = useMemo(
    () => getViewBounds(zoom, weekWindowMonday),
    [zoom, weekWindowMonday],
  )

  const headerHeight = zoom === 'year' ? HEADER_H_YEAR : HEADER_H_DETAIL

  const monthSegsFull = useMemo(() => buildMonthSegments(), [])
  const weekSlots = useMemo(() => weekSlotsInView(viewStart, viewEnd), [viewStart, viewEnd])
  const daySlots = useMemo(() => buildDaySlots(viewStart, viewEnd), [viewStart, viewEnd])

  const trackWidthPx = useMemo(() => {
    if (zoom === 'year') return Math.max(TIMELINE_MIN_W, 12 * YEAR_COL_MIN)
    if (zoom === 'quarter') return Math.max(TIMELINE_MIN_W, weekSlots.length * QUARTER_WEEK_MIN)
    return Math.max(TIMELINE_MIN_W, daySlots.length * WEEK_DAY_COL_MIN)
  }, [zoom, weekSlots.length, daySlots.length])

  const onZoom = useCallback((z: ZoomLevel) => {
    setZoom(z)
    if (z === 'week') {
      setWeekWindowMonday(initialWeekWindowMonday())
    }
  }, [])

  const weekNav = useMemo(() => {
    if (zoom !== 'week') {
      return {
        onPrev: () => {},
        onNext: () => {},
        canPrev: false,
        canNext: false,
      }
    }
    const prevM = shiftWeekWindowMonday(weekWindowMonday, -1)
    const nextM = shiftWeekWindowMonday(weekWindowMonday, 1)
    return {
      onPrev: () => setWeekWindowMonday((cur) => shiftWeekWindowMonday(cur, -1)),
      onNext: () => setWeekWindowMonday((cur) => shiftWeekWindowMonday(cur, 1)),
      canPrev: prevM.getTime() < weekWindowMonday.getTime(),
      canNext: nextM.getTime() > weekWindowMonday.getTime(),
    }
  }, [zoom, weekWindowMonday])

  useEffect(() => {
    setCollapsed({})
    setPhaseExpanded({})
  }, [viewBy])

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 650)
    return () => window.clearTimeout(t)
  }, [])

  useLayoutEffect(() => {
    if (loading || zoom !== 'quarter' || didQuarterScrollRef.current) return
    const el = scrollRef.current
    if (!el) return
    const run = () => {
      const now = clampDate(new Date())
      const p = percentInView(now, RANGE_START, RANGE_END) / 100
      const target = p * el.scrollWidth - el.clientWidth / 2
      el.scrollLeft = Math.max(0, Math.min(target, el.scrollWidth - el.clientWidth))
      didQuarterScrollRef.current = true
    }
    requestAnimationFrame(run)
  }, [loading, zoom])

  useLayoutEffect(() => {
    if (loading || zoom !== 'week' || didWeekScrollRef.current) return
    const el = scrollRef.current
    if (!el) return
    const run = () => {
      const now = clampDate(new Date())
      const p = percentInView(now, viewStart, viewEnd) / 100
      const target = p * el.scrollWidth - el.clientWidth / 2
      el.scrollLeft = Math.max(0, Math.min(target, el.scrollWidth - el.clientWidth))
      didWeekScrollRef.current = true
    }
    requestAnimationFrame(run)
  }, [loading, zoom, viewStart, viewEnd])

  const grouped = useMemo(() => buildGroupedSections(viewBy, workstreams), [viewBy])
  const detailPanelMarkers = useMemo((): Marker[] => {
    if (!barDetail) return []
    if (barDetail.kind === 'workstream') return markersForWorkstream(barDetail.ws.id)
    const r = phaseDateRange(barDetail.phase)
    if (!r) return []
    return markersInDateRange(markersForWorkstream(barDetail.ws.id), r.start, r.end)
  }, [barDetail])
  const milestoneDates = useMemo(
    () =>
      milestones
        .map((x) => {
          const d = parseYmd(x.release_date)
          return d ? { milestone: x.milestone, date: d } : null
        })
        .filter((x): x is { milestone: string; date: Date } => x !== null),
    [],
  )

  const bodyHeight = useMemo(() => {
    let h = 0
    for (const g of grouped) {
      h += SECTION_HEIGHT
      if (!collapsed[g.group]) {
        for (const ws of g.items) {
          h += workstreamTimelineHeight(ws, phaseExpanded)
        }
      }
    }
    return h
  }, [grouped, collapsed, phaseExpanded])

  const toggleGroup = useCallback((group: string) => {
    setCollapsed((prev) => ({ ...prev, [group]: !prev[group] }))
  }, [])

  const showBarTip = useCallback((e: MouseEvent, ws: Workstream) => {
    setTip({ kind: 'bar', x: e.clientX, y: e.clientY, ws })
  }, [])

  const showMarkerTip = useCallback((e: MouseEvent, label: string, date: Date) => {
    setTip({ kind: 'marker', x: e.clientX, y: e.clientY, label, date })
  }, [])

  const moveTip = useCallback((e: MouseEvent) => {
    setTip((prev) => (prev ? { ...prev, x: e.clientX, y: e.clientY } : null))
  }, [])

  const hideTip = useCallback(() => setTip(null), [])

  const closeBarDetail = useCallback(() => setBarDetail(null), [])

  useEffect(() => {
    if (!barDetail) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeBarDetail()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [barDetail, closeBarDetail])

  useEffect(() => {
    if (!barDetail) return
    const onDown = (e: Event) => {
      const t = e.target
      if (t instanceof Element) {
        if (t.closest('[data-gantt-detail-panel]')) return
        if (t.closest('[data-gantt-bar]')) return
        if (t.closest('[data-gantt-phase-bar]')) return
      }
      closeBarDetail()
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [barDetail, closeBarDetail])

  /** Space / Shift+Space: horizontal scroll on the timeline (no trackpad). */
  useEffect(() => {
    if (loading) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space' && e.key !== ' ') return
      if (barDetail) return
      const t = e.target
      if (!(t instanceof HTMLElement)) return
      const node =
        document.activeElement instanceof HTMLElement ? document.activeElement : t
      if (node.closest('[data-gantt-detail-panel]')) return
      if (node.closest('input, textarea, select, [contenteditable="true"]')) return
      if (node.closest('[role="toolbar"]')) return
      if (node.closest('[data-gantt-sidebar]')) return
      if (node.closest('[data-gantt-bar]') || node.hasAttribute('data-gantt-bar')) return
      if (node.closest('[data-gantt-phase-bar]') || node.hasAttribute('data-gantt-phase-bar')) return

      const el = scrollRef.current
      if (!el || el.scrollWidth <= el.clientWidth) return

      e.preventDefault()
      const page = Math.min(el.clientWidth * 0.88, 480)
      el.scrollBy({ left: e.shiftKey ? -page : page, behavior: 'smooth' })
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [loading, barDetail])

  /** Vertical mouse wheel pans the timeline horizontally (native deltaX unchanged for trackpads). */
  useEffect(() => {
    if (loading) return
    const el = scrollRef.current
    if (!el) return

    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth + 1) return

      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return

      const dy =
        e.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? e.deltaY * 16
          : e.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? e.deltaY * el.clientHeight
            : e.deltaY

      const maxLeft = Math.max(0, el.scrollWidth - el.clientWidth)
      const next = el.scrollLeft + dy

      if (dy > 0 && el.scrollLeft >= maxLeft - 0.5) return
      if (dy < 0 && el.scrollLeft <= 0.5) return

      e.preventDefault()
      el.scrollLeft = Math.max(0, Math.min(maxLeft, next))
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [loading])

  return (
    <div
      className="flex h-full min-h-0 w-full flex-col"
      data-name="Gantt"
      style={{
        backgroundColor: SURFACE,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <div className="shrink-0 px-6 py-4" style={{ backgroundColor: SURFACE }}>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-[22px] font-semibold leading-tight" style={{ color: TEXT_PRIMARY }}>
            Design Roadmap to Network GA
          </h1>
          <span
            className="inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
            style={{
              color: '#F9BC45',
              backgroundColor: '#4A3A10',
              border: '1px solid rgba(249, 188, 69, 0.35)',
            }}
            aria-label="Work in progress"
          >
            WIP
          </span>
        </div>
        <p className="mt-1 text-[13px]" style={{ color: TEXT_MUTED }}>
          Workstreams, releases, and key markers
        </p>
      </div>

      <GanttToolbar
        viewBy={viewBy}
        onViewBy={setViewBy}
        zoom={zoom}
        onZoom={onZoom}
        weekNav={weekNav}
      />

      <div className="min-h-0 flex-1 overflow-auto p-6">
        {loading ? (
          <LoadingShimmer />
        ) : (
          <div className="flex min-w-0">
            <div
              className="sticky left-0 z-[5] flex shrink-0 flex-col"
              data-gantt-sidebar
              style={{
                width: SIDEBAR_W,
                backgroundColor: SURFACE,
              }}
            >
              <div className="shrink-0" style={{ height: headerHeight, backgroundColor: SURFACE }} />
              {grouped.map((g) => {
                const isCollapsed = !!collapsed[g.group]
                return (
                  <div key={g.group}>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-2 text-left transition-colors hover:bg-[#222222]"
                      style={{
                        height: SECTION_HEIGHT,
                        backgroundColor: 'transparent',
                        color: TEXT_SECTION,
                      }}
                      onClick={() => toggleGroup(g.group)}
                    >
                      <Chevron collapsed={isCollapsed} />
                      <span
                        className="min-w-0 flex-1 truncate text-[10px] font-medium uppercase tracking-[0.06em]"
                        style={{ color: TEXT_SECTION }}
                      >
                        {viewBy === 'milestone' ? milestoneDisplayLabel(g.group) : g.group}
                      </span>
                    </button>
                    {!isCollapsed
                      ? g.items.map((ws) => (
                          <GanttSidebarWorkstreamRow
                            key={ws.id}
                            ws={ws}
                            phaseExpanded={phaseExpanded}
                            setPhaseExpanded={setPhaseExpanded}
                          />
                        ))
                      : null}
                  </div>
                )
              })}
            </div>

            <div
              ref={scrollRef}
              data-gantt-timeline-scroll
              className="min-w-0 flex-1 overflow-x-auto"
              title="Scroll wheel: pan timeline · Space: scroll right · Shift+Space: scroll left"
            >
              <div className="relative" style={{ width: '100%', minWidth: trackWidthPx }}>
                <div className="sticky top-0 z-[6]" style={{ backgroundColor: SURFACE }}>
                  <GanttTimelineHeader
                    zoom={zoom}
                    viewStart={viewStart}
                    viewEnd={viewEnd}
                    weekSlots={weekSlots}
                    daySlots={daySlots}
                    monthSegsFull={monthSegsFull}
                    headerHeight={headerHeight}
                  />
                </div>

                <div className="relative isolate" style={{ minHeight: bodyHeight }}>
                  <WeekGridBackground bodyHeight={bodyHeight} />
                  <MilestoneLines
                    bodyHeight={bodyHeight}
                    milestoneDates={milestoneDates}
                    viewStart={viewStart}
                    viewEnd={viewEnd}
                  />

                  {grouped.map((g) => {
                    const isCollapsed = !!collapsed[g.group]
                    return (
                      <div key={g.group}>
                        <div
                          style={{
                            height: SECTION_HEIGHT,
                            backgroundColor: SECTION_BG,
                          }}
                        />
                        {!isCollapsed
                          ? g.items.map((ws) => (
                              <GanttTimelineWorkstreamRow
                                key={ws.id}
                                ws={ws}
                                phaseExpanded={phaseExpanded}
                                barDetail={barDetail}
                                setBarDetail={setBarDetail}
                                viewStart={viewStart}
                                viewEnd={viewEnd}
                                trackWidthPx={trackWidthPx}
                                setTip={setTip}
                                showBarTip={showBarTip}
                                moveTip={moveTip}
                                hideTip={hideTip}
                                showMarkerTip={showMarkerTip}
                              />
                            ))
                          : null}
                      </div>
                    )
                  })}
                </div>
                <TodayColumn
                  totalHeight={headerHeight + bodyHeight}
                  viewStart={viewStart}
                  viewEnd={viewEnd}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <Tooltip state={tip} />

      {barDetail
        ? createPortal(
            barDetail.kind === 'workstream' ? (
              <GanttBarDetailPanel
                key={`ws-${barDetail.ws.id}`}
                mode="workstream"
                ws={barDetail.ws}
                anchorX={barDetail.anchorX}
                anchorY={barDetail.anchorY}
                markers={detailPanelMarkers}
                statusTones={STATUS_TONES}
              />
            ) : (
              <GanttBarDetailPanel
                key={`ph-${barDetail.ws.id}-${barDetail.phase.id}`}
                mode="phase"
                ws={barDetail.ws}
                phase={barDetail.phase}
                anchorX={barDetail.anchorX}
                anchorY={barDetail.anchorY}
                markers={detailPanelMarkers}
                statusTones={STATUS_TONES}
              />
            ),
            document.body,
          )
        : null}
    </div>
  )
}
