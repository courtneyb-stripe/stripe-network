/**
 * Network design roadmap — workstreams, milestones, and markers for 2026 (dark timeline UI).
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
  type PointerEvent,
  type ReactNode,
  type SetStateAction,
} from 'react'
import { GanttDrawers, type GanttDetailDrawerState, type GanttOverlayMode } from '../components/GanttDrawer'
import { GanttWorkstreamAvatar } from '../components/GanttWorkstreamAvatar'
import { CalendarOutlineIcon } from '../icons/CalendarOutlineIcon'
import {
  workstreams,
  milestones,
  markers,
  formatWorkstreamStatusLabel,
  formatDriLabel,
  milestoneDisplayLabel,
  markerDisplayLabel,
  resolveKickoff,
  milestonesInWorkstreamSpan,
  parseYmd,
  phaseDateRange,
  markersForWorkstream,
  markersInDateRange,
  type Phase,
  type Workstream,
  type WorkstreamStatus,
  type Marker,
} from '../data/ganttData'
import { statusPillColors } from '../data/statusPill'
import './GanttPhasedWorkstreamGroup.css'

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
/** @handles on dark chrome (light purple); em dash stays subdued. */
const DRI_HANDLE = '#D4C4FA'
const DRI_HANDLE_EMPTY = '#555553'

function driHandleColor(label: string): string {
  return label.trim() === '—' ? DRI_HANDLE_EMPTY : DRI_HANDLE
}

const CARD_BG = '#2A2A2A'
const CARD_BORDER = '#3A3A3A'
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
/** Track height inside phase bars. */
const PHASE_TRACK_HEIGHT_PX = 10
const SECTION_HEIGHT = 40
const BAR_RADIUS = 6
/** Horizontal inset of the track pill from the bar edges (4px each side). */
const TRACK_BAR_INSET_X = 4
/** Gap between stop circle edge and the track pill’s inner left/right edge. */
const TRACK_STOP_PAD_PX = 4
const BAR_TRACK_HEIGHT_PX = 12
const STOP_DIAMETER_PX = 8
const STOP_MIN_GAP_PX = 16
const BAR_LABEL_MIN_PX = 40
const GANTT_SIDEBAR_WIDTH_KEY = 'gantt_sidebar_width'
const DEFAULT_SIDEBAR_W = 240
const MIN_SIDEBAR_W = 180
const MAX_SIDEBAR_W = 360
const TIMELINE_MIN_W = 960
const YEAR_COL_MIN = 80
const QUARTER_WEEK_MIN = 60
/** Day column width in week zoom (7 days). */
const WEEK_DAY_COL_MIN = 48

const ZOOM_ACTIVE_TEXT = '#9B8FE8'
const ZOOM_ACTIVE_BG = '#3D3660'
const ZOOM_INACTIVE_TEXT = '#555553'

type ZoomLevel = 'year' | 'quarter' | 'week'
type ViewBy = 'group' | 'status' | 'dri'

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

/** Sidebar section title; data `group` keys unchanged (e.g. `UAD` → display only here). */
function groupSectionHeaderLabel(group: string, viewBy: ViewBy): string {
  if (viewBy === 'group' && group === 'UAD') return 'Account detail'
  return group
}

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

/** Sort DRI group keys: alphabetical, `unknown` last, Tracey before Cameron (swap after alpha). */
function sortDriGroupKeys(keys: string[]): string[] {
  const unknown = keys.filter((k) => k === 'unknown')
  const rest = keys.filter((k) => k !== 'unknown')
  rest.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
  const idxT = rest.indexOf('traceyv')
  const idxC = rest.findIndex((k) => k === 'cameronsagey' || k === 'cameron')
  if (idxT !== -1 && idxC !== -1 && idxT > idxC) {
    const t = rest[idxT]!
    rest[idxT] = rest[idxC]!
    rest[idxC] = t
  }
  return [...rest, ...unknown]
}

function groupByDri(streams: Workstream[]): GroupedSection[] {
  const map = new Map<string, Workstream[]>()
  for (const ws of streams) {
    const k = driNorm(ws.dri)
    if (!map.has(k)) map.set(k, [])
    map.get(k)!.push(ws)
  }
  const keys = sortDriGroupKeys([...map.keys()])
  return keys.map((k) => ({ group: k === 'unknown' ? '—' : `@${k}`, items: map.get(k)! }))
}

function buildGroupedSections(viewBy: ViewBy, streams: Workstream[]): GroupedSection[] {
  if (viewBy === 'group') return groupWorkstreams(streams)
  if (viewBy === 'status') return groupByStatus(streams)
  return groupByDri(streams)
}

function workstreamTimelineHeight(ws: Workstream, expandedByWs: Record<string, boolean>): number {
  if (!ws.phases?.length) return ROW_HEIGHT
  const n = ws.phases.length
  if (!expandedByWs[ws.id]) return ROW_HEIGHT
  /** Matches last expanded phase `.timeline-cell` `padding-bottom: 6px`. */
  const LAST_PHASE_TIMELINE_PAD = 6
  return ROW_HEIGHT + n * ROW_HEIGHT + LAST_PHASE_TIMELINE_PAD
}

function readStoredSidebarWidth(): number {
  try {
    const raw = localStorage.getItem(GANTT_SIDEBAR_WIDTH_KEY)
    if (!raw) return DEFAULT_SIDEBAR_W
    const n = Number.parseInt(raw, 10)
    if (!Number.isFinite(n)) return DEFAULT_SIDEBAR_W
    return Math.min(MAX_SIDEBAR_W, Math.max(MIN_SIDEBAR_W, n))
  } catch {
    return DEFAULT_SIDEBAR_W
  }
}

/** Fallback span when a `not started` stream has no kickoff and no derived kick from milestones. */
function notStartedPlaceholderRange(): { start: Date; end: Date } {
  return {
    start: new Date(RANGE_YEAR, 2, 1, 0, 0, 0, 0),
    end: new Date(RANGE_YEAR, 10, 1, 23, 59, 59, 999),
  }
}

/** Bar end from markers / timeline cap / year end; shared by solid and not-started planned bars. */
function barEndFromPlanning(ws: Workstream, kick: Date): { start: Date; end: Date } {
  const wsMarkers = markersForWorkstream(ws.id)
    .map((m) => parseYmd(m.date))
    .filter((d): d is Date => d !== null)
    .sort((a, b) => a.getTime() - b.getTime())
  const lastMarker = wsMarkers.length ? wsMarkers[wsMarkers.length - 1]! : null
  const capEnd = ws.timeline_end ? parseYmd(ws.timeline_end) : null
  const barEnd = capEnd ?? lastMarker ?? RANGE_END
  if (barEnd.getTime() < kick.getTime()) {
    return { start: kick, end: kick }
  }
  return { start: kick, end: barEnd }
}

function startedSolidRange(ws: Workstream): { start: Date; end: Date } | null {
  const kick = parseYmd(resolveKickoff(ws))
  if (!kick) return null
  return barEndFromPlanning(ws, kick)
}

type WorkstreamBar =
  | { kind: 'none' }
  | { kind: 'placeholder'; start: Date; end: Date; fill: string }
  | { kind: 'solid'; start: Date; end: Date; fill: string }

function workstreamBar(ws: Workstream): WorkstreamBar {
  if (ws.status === 'not started') {
    const kick = parseYmd(resolveKickoff(ws))
    if (kick) {
      const { start, end } = barEndFromPlanning(ws, kick)
      return { kind: 'placeholder', start, end, fill: STATUS_TONES['not started'].bar }
    }
    const { start, end } = notStartedPlaceholderRange()
    return { kind: 'placeholder', start, end, fill: STATUS_TONES['not started'].bar }
  }
  const range = startedSolidRange(ws)
  if (!range) return { kind: 'none' }
  return { kind: 'solid', ...range, fill: STATUS_TONES[ws.status].bar }
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
  return (
    <GanttWorkstreamAvatar ws={ws} barColor={STATUS_TONES[ws.status].bar} size="tooltip" />
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
          <div className="mt-1 text-[11px]" style={{ color: driHandleColor(formatDriLabel(ws.dri)) }}>
            {formatDriLabel(ws.dri)}
          </div>
          <div className="mt-2 inline-block">
            <span style={pillStyle}>{formatWorkstreamStatusLabel(ws.status)}</span>
          </div>
          {(() => {
            const ms = milestonesInWorkstreamSpan(ws)
            if (!ms.length) return null
            return (
              <div className="mt-2 text-[10px] leading-snug break-words" style={{ color: TEXT_MUTED }}>
                {ms.map((m) => milestoneDisplayLabel(m.milestone)).join(' · ')}
              </div>
            )
          })()}
          {(() => {
            const k = resolveKickoff(ws).trim()
            if (!k) return null
            const kd = parseYmd(k)
            if (!kd) return null
            return (
              <div className="mt-2 text-[11px]" style={{ color: TEXT_MUTED }}>
                Kickoff {formatDisplayDate(kd)}
              </div>
            )
          })()}
        </div>
      </div>
    </div>
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
  milestonesDrawerActive,
  onMilestonesToolbarClick,
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
  milestonesDrawerActive: boolean
  onMilestonesToolbarClick: () => void
}) {
  const views: { id: ViewBy; label: string }[] = [
    { id: 'group', label: 'Group' },
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
        <button
          type="button"
          className="flex shrink-0 items-center gap-1.5 rounded-[20px] border-0 px-3 py-1 text-[11px] font-medium transition-colors hover:bg-[#333333]"
          style={{
            color: milestonesDrawerActive ? ZOOM_ACTIVE_TEXT : ZOOM_INACTIVE_TEXT,
            backgroundColor: milestonesDrawerActive ? ZOOM_ACTIVE_BG : PILL_INACTIVE_BG,
          }}
          onClick={onMilestonesToolbarClick}
        >
          <CalendarOutlineIcon
            size={16}
            color={milestonesDrawerActive ? ZOOM_ACTIVE_TEXT : ZOOM_INACTIVE_TEXT}
          />
          Milestones
        </button>
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

/** Calendar day key (noon local) for grouping milestones on the same release day. */
function milestoneDayKey(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0, 0).getTime()
}

/** One vertical line per calendar day; labels stacked in milestone table order (e.g. M1 then M1.5). */
function milestoneLineGroups(rows: { milestone: string; date: Date }[]): { date: Date; labels: string[] }[] {
  const groups: { date: Date; labels: string[] }[] = []
  const keyToIdx = new Map<number, number>()
  for (const row of rows) {
    const k = milestoneDayKey(row.date)
    const label = milestoneDisplayLabel(row.milestone)
    const idx = keyToIdx.get(k)
    if (idx === undefined) {
      keyToIdx.set(k, groups.length)
      groups.push({ date: row.date, labels: [label] })
    } else {
      groups[idx]!.labels.push(label)
    }
  }
  return groups
}

/** Full-height dashed milestone lines + labels (same horizontal scale as bars: view window). */
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
  const groups = useMemo(() => milestoneLineGroups(milestoneDates), [milestoneDates])

  return (
    <div
      className="pointer-events-none absolute left-0 right-0 z-[2]"
      style={{ top: 0, height: bodyHeight }}
      aria-hidden
    >
      {groups.map((g) => {
        const left = percentInView(g.date, viewStart, viewEnd)
        return (
          <div
            key={milestoneDayKey(g.date)}
            className="absolute top-0 flex h-full min-h-0 flex-col items-center"
            style={{ left: `${left}%`, transform: 'translateX(-50%)' }}
          >
            <div className="flex shrink-0 flex-col items-center" style={{ gap: 2 }}>
              {g.labels.map((label, i) => (
                <span
                  key={`${milestoneDayKey(g.date)}-${i}-${label}`}
                  className="max-w-[120px] shrink-0 truncate px-0.5 text-center font-medium leading-none"
                  style={{ fontSize: 10, color: '#555553' }}
                >
                  {label}
                </span>
              ))}
            </div>
            <div
              className="mt-0 min-h-0 w-0 flex-1"
              style={{
                borderLeft: `1.5px dashed ${MILESTONE_LINE}`,
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
      className="pointer-events-none absolute top-0 z-[20]"
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
  dense = false,
  noTrackInset = false,
  trackRootClassName,
  stopClassName,
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
  /** When true, omit bottom margin (tight phase bars). */
  dense?: boolean
  /** When true, omit horizontal inset (phased `.track` spec). */
  noTrackInset?: boolean
  /** Extra class on the track root (e.g. `track` for phased group CSS). */
  trackRootClassName?: string
  /** Extra class on each stop control (e.g. `stop`). */
  stopClassName?: string
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
      className={`track relative z-[1] shrink-0 overflow-visible ${dense ? '' : 'mb-1'} ${trackRootClassName ?? ''}`}
      style={{
        height: trackHeightPx,
        ...(noTrackInset
          ? {}
          : { marginLeft: TRACK_BAR_INSET_X, marginRight: TRACK_BAR_INSET_X }),
        borderRadius: 999,
        backgroundColor: trackColor,
      }}
    >
      {showStops
        ? stops.map((s) => (
            <button
              key={s.key}
              type="button"
              aria-label={`${markerDisplayLabel(s.marker.label)}, ${formatDisplayDate(s.date)}`}
              className={`stop absolute top-1/2 z-[2] box-border shrink-0 cursor-default rounded-full border-0 p-0 pointer-events-auto outline-none ${stopClassName ?? ''}`}
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
                onEnter(e, markerDisplayLabel(s.marker.label), s.date)
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

function LoadingShimmer({ sidebarWidthPx, trackWidthPx }: { sidebarWidthPx: number; trackWidthPx: number }) {
  const row = (
    <div
      className="gantt-shimmer-row grid"
      style={{ gridTemplateColumns: `${sidebarWidthPx}px 4px ${trackWidthPx}px` }}
    >
      <div className="shrink-0" style={{ height: ROW_HEIGHT, backgroundColor: SURFACE }} />
      <div className="shrink-0" style={{ height: ROW_HEIGHT, backgroundColor: SURFACE }} />
      <div className="min-w-0" style={{ height: ROW_HEIGHT, backgroundColor: SURFACE }} />
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
      <div className="flex min-h-0 min-w-0 flex-1 flex-col" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        {row}
        {row}
        {row}
      </div>
    </>
  )
}

type GanttRoadmapRow =
  | { kind: 'section'; group: string; collapsed: boolean }
  | { kind: 'workstream'; ws: Workstream }

function buildRoadmapRows(
  grouped: { group: string; items: Workstream[] }[],
  collapsed: Record<string, boolean>,
): GanttRoadmapRow[] {
  const out: GanttRoadmapRow[] = []
  for (const g of grouped) {
    const isCollapsed = !!collapsed[g.group]
    out.push({ kind: 'section', group: g.group, collapsed: isCollapsed })
    if (!isCollapsed) {
      for (const ws of g.items) out.push({ kind: 'workstream', ws })
    }
  }
  return out
}

/** Phased workstream: single full-width group (sidebar + timeline per spec). */
function GanttPhasedWorkstreamGroup({
  ws,
  sidebarWidthPx,
  trackWidthPx,
  phaseExpanded,
  setPhaseExpanded,
  barDetail,
  setBarDetail,
  viewStart,
  viewEnd,
  setTip,
  showBarTip,
  moveTip,
  hideTip,
  showMarkerTip,
  setHoveredWsId,
}: {
  ws: Workstream
  sidebarWidthPx: number
  trackWidthPx: number
  phaseExpanded: Record<string, boolean>
  setPhaseExpanded: Dispatch<SetStateAction<Record<string, boolean>>>
  barDetail: GanttDetailDrawerState | null
  setBarDetail: Dispatch<SetStateAction<GanttDetailDrawerState | null>>
  viewStart: Date
  viewEnd: Date
  setTip: Dispatch<SetStateAction<TooltipState | null>>
  showBarTip: (e: MouseEvent, w: Workstream) => void
  moveTip: (e: MouseEvent) => void
  hideTip: () => void
  showMarkerTip: (e: MouseEvent, label: string, date: Date) => void
  setHoveredWsId: Dispatch<SetStateAction<string | null>>
}) {
  const phases = ws.phases!
  const n = phases.length
  const exp = !!phaseExpanded[ws.id]
  const bar = workstreamBar(ws)
  const wsMarkers = markersForWorkstream(ws.id)
  const barLayout = bar.kind === 'none' ? null : spanInView(bar.start, bar.end, viewStart, viewEnd)
  const barWFrac = barLayout ? barLayout.width / 100 : 0
  const showBarName = barLayout ? barWFrac * trackWidthPx >= BAR_LABEL_MIN_PX : false

  const rowHoverHandlers = {
    onMouseEnter: () => setHoveredWsId(ws.id),
    onMouseLeave: (e: MouseEvent<HTMLDivElement>) => {
      const to = e.relatedTarget
      if (to instanceof Element && to.closest(`[data-ws-row="${ws.id}"]`)) return
      setHoveredWsId((h) => (h === ws.id ? null : h))
    },
  }

  const wrapStyle = {
    ['--sidebar-width' as string]: `${sidebarWidthPx}px`,
  } as CSSProperties

  const parentBarMuted = bar.kind === 'placeholder'

  const parentBarEl =
    barLayout && (bar.kind === 'solid' || bar.kind === 'placeholder') ? (
      <button
        type="button"
        data-gantt-bar={ws.id}
        className={`bar parent-bar${exp ? ' dimmed' : ''}`}
        style={{
          left: `${barLayout.left}%`,
          width: `${barLayout.width}%`,
          minWidth: 4,
          borderRadius: barBorderRadiusCss(bar.start, bar.end, viewStart, viewEnd, BAR_RADIUS),
          backgroundColor: bar.fill,
        }}
        aria-label={`${ws.name}${bar.kind === 'placeholder' ? ' planned window' : ''}`}
        onMouseEnter={(e) => showBarTip(e, ws)}
        onMouseMove={moveTip}
        onMouseLeave={hideTip}
        onClick={(e) => {
          e.stopPropagation()
          setTip(null)
          setPhaseExpanded((p) => ({ ...p, [ws.id]: !p[ws.id] }))
          setBarDetail({ kind: 'workstream', ws })
        }}
      >
        {showBarName ? (
          <div className="bar-top-row">
            <span className="bar-name" style={parentBarMuted ? { color: TEXT_SECTION } : undefined}>
              {ws.name}
            </span>
            <span
              role="button"
              tabIndex={0}
              data-gantt-expand-label
              className="expand-label"
              aria-expanded={exp}
              aria-label={exp ? 'Collapse phases' : `Expand ${n} phases`}
              style={parentBarMuted ? { color: TEXT_SECTION } : undefined}
              onClick={(e) => {
                e.stopPropagation()
                setPhaseExpanded((p) => ({ ...p, [ws.id]: !p[ws.id] }))
              }}
              onKeyDown={(e) => {
                if (e.key !== 'Enter' && e.key !== ' ') return
                e.preventDefault()
                e.stopPropagation()
                setPhaseExpanded((p) => ({ ...p, [ws.id]: !p[ws.id] }))
              }}
            >
              {exp ? '▾ collapse' : `▸ ${n} phase${n === 1 ? '' : 's'}`}
            </span>
          </div>
        ) : null}
        <BarTrackAndStops
          dense
          noTrackInset
          trackRootClassName=""
          stopClassName=""
          trackHeightPx={PHASE_TRACK_HEIGHT_PX}
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
    ) : null

  return (
    <div
      className={`group-wrap${exp ? ' expanded' : ''}`}
      data-gantt-sidebar
      data-ws-row={ws.id}
      data-expanded={exp ? 'true' : 'false'}
      style={wrapStyle}
      {...rowHoverHandlers}
    >
      <div className="group-row parent-row">
        <div
          className="sidebar-cell ws-sidebar-parent"
          onClick={(e) => {
            e.stopPropagation()
            setPhaseExpanded((p) => ({ ...p, [ws.id]: !p[ws.id] }))
            setBarDetail({ kind: 'workstream', ws })
          }}
        >
          <div className="ws-sidebar-text-stack">
            <div className="ws-name-row">
              <span className="ws-name">{ws.name}</span>
              <span className="chevron ti-chevron-right" aria-hidden>
                <svg
                  className="gantt-chevron-svg"
                  width={12}
                  height={12}
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M9 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
            <span className="ws-dri">{formatDriLabel(ws.dri)}</span>
          </div>
        </div>
        <div className="timeline-cell">
          <div className="timeline-cell-inner" style={{ width: trackWidthPx }}>
            {parentBarEl}
          </div>
        </div>
      </div>
      {exp
        ? phases.map((phase) => {
            const pr = phaseDateRange(phase)
            const tones = STATUS_TONES[phase.status]
            const ghost = phase.status === 'not started'
            const layout = pr ? spanInView(pr.start, pr.end, viewStart, viewEnd) : null
            const phaseMarkers = pr ? markersInDateRange(wsMarkers, pr.start, pr.end) : []
            return (
              <div key={phase.id} className="group-row phase-row" onClick={(e) => e.stopPropagation()}>
                <div className="sidebar-cell phase-sidebar">
                  <div className="phase-dot" style={{ backgroundColor: tones.bar }} aria-hidden />
                  <span className="phase-label">{phase.label}</span>
                </div>
                <div className="timeline-cell">
                  <div className="timeline-cell-inner" style={{ width: trackWidthPx }}>
                    {layout ? (
                      <button
                        type="button"
                        data-gantt-phase-bar
                        data-workstream-id={ws.id}
                        data-phase-id={phase.id}
                        className="bar phase-bar"
                        style={{
                          left: `${layout.left}%`,
                          width: `${layout.width}%`,
                          minWidth: 4,
                          borderRadius: BAR_RADIUS,
                          backgroundColor: tones.bar,
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
                          })
                        }}
                      >
                        <div className="bar-top-row">
                          <span className="bar-name" style={ghost ? { color: TEXT_SECTION } : undefined}>
                            {phase.label}
                          </span>
                        </div>
                        <BarTrackAndStops
                          dense
                          noTrackInset
                          trackRootClassName=""
                          stopClassName=""
                          trackHeightPx={PHASE_TRACK_HEIGHT_PX}
                          showStops={!ghost && phaseMarkers.length > 0}
                          trackColor={tones.track}
                          reviewStopColor={tones.stop}
                          handoffStopColor={tones.bar}
                          markers={phaseMarkers}
                          barStart={pr!.start}
                          barEnd={pr!.end}
                          onEnter={showMarkerTip}
                          onMove={moveTip}
                          onLeave={hideTip}
                        />
                      </button>
                    ) : (
                      <span className="phase-label" style={{ paddingLeft: 8 }}>
                        {phase.label}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        : null}
    </div>
  )
}

function GanttWorkstreamRow({
  ws,
  segment,
  phaseExpanded,
  setPhaseExpanded,
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
  hoveredWsId,
  setHoveredWsId,
}: {
  ws: Workstream
  segment: 'sidebar' | 'timeline'
  phaseExpanded: Record<string, boolean>
  setPhaseExpanded: Dispatch<SetStateAction<Record<string, boolean>>>
  barDetail: GanttDetailDrawerState | null
  setBarDetail: Dispatch<SetStateAction<GanttDetailDrawerState | null>>
  viewStart: Date
  viewEnd: Date
  trackWidthPx: number
  setTip: Dispatch<SetStateAction<TooltipState | null>>
  showBarTip: (e: MouseEvent, w: Workstream) => void
  moveTip: (e: MouseEvent) => void
  hideTip: () => void
  showMarkerTip: (e: MouseEvent, label: string, date: Date) => void
  hoveredWsId: string | null
  setHoveredWsId: Dispatch<SetStateAction<string | null>>
}) {
  void phaseExpanded
  void setPhaseExpanded
  void hoveredWsId
  void setHoveredWsId
  const rowH = ROW_HEIGHT
  const bar = workstreamBar(ws)
  const wsMarkers = markersForWorkstream(ws.id)
  const barLayout =
    bar.kind === 'none' ? null : spanInView(bar.start, bar.end, viewStart, viewEnd)
  const barWFrac = barLayout ? barLayout.width / 100 : 0
  const showBarName = barLayout ? barWFrac * trackWidthPx >= BAR_LABEL_MIN_PX : false

  const sidebarPlain = (
    <div className="gantt-ws-sidebar-text">
      <div className="gantt-ws-sidebar-name">{ws.name}</div>
      <div className="gantt-ws-sidebar-dri">{formatDriLabel(ws.dri)}</div>
    </div>
  )

  const timelineParentBar =
    barLayout && (bar.kind === 'solid' || bar.kind === 'placeholder') ? (
      <button
        type="button"
        data-gantt-bar={ws.id}
        className="absolute top-1/2 z-[3] flex -translate-y-1/2 cursor-pointer flex-col items-stretch overflow-hidden border-0 p-0 text-left pointer-events-auto hover:brightness-[1.12]"
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
          setBarDetail({ kind: 'workstream', ws })
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
          trackHeightPx={BAR_TRACK_HEIGHT_PX}
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
    ) : null

  const timelineInner = (
    <div className="relative shrink-0 overflow-visible" style={{ width: trackWidthPx, height: rowH }}>
      <div className="relative overflow-visible" style={{ height: ROW_HEIGHT }}>
        {timelineParentBar}
      </div>
    </div>
  )

  if (segment === 'sidebar') {
    return (
      <div data-gantt-sidebar data-ws-row={ws.id} className="gantt-ws-sidebar-cell min-w-0 cursor-default">
        {sidebarPlain}
      </div>
    )
  }

  return (
    <div data-ws-row={ws.id} className="min-w-0 transition-colors duration-[120ms] hover:bg-[#222222]">
      {timelineInner}
    </div>
  )
}

export default function GanttPage() {
  const [tip, setTip] = useState<TooltipState | null>(null)
  const [barDetail, setBarDetail] = useState<GanttDetailDrawerState | null>(null)
  const [drawerOverlay, setDrawerOverlay] = useState<GanttOverlayMode | null>(null)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [phaseExpanded, setPhaseExpanded] = useState<Record<string, boolean>>({})
  const [hoveredWsId, setHoveredWsId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewBy, setViewBy] = useState<ViewBy>('group')
  const [zoom, setZoom] = useState<ZoomLevel>('quarter')
  const [weekWindowMonday, setWeekWindowMonday] = useState<Date>(initialWeekWindowMonday)
  const [sidebarWidthPx, setSidebarWidthPx] = useState(() =>
    typeof window === 'undefined' ? DEFAULT_SIDEBAR_W : readStoredSidebarWidth(),
  )

  const scrollRef = useRef<HTMLDivElement>(null)
  const didQuarterScrollRef = useRef(false)
  const didWeekScrollRef = useRef(false)
  const sidebarResizeDragRef = useRef<{ startX: number; startW: number } | null>(null)
  const drawerOverlayRef = useRef<GanttOverlayMode | null>(null)
  drawerOverlayRef.current = drawerOverlay

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
    setHoveredWsId(null)
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
  const roadmapRows = useMemo(() => buildRoadmapRows(grouped, collapsed), [grouped, collapsed])
  const milestoneDates = useMemo(
    () =>
      milestones
        .map((x) => {
          const d = parseYmd(x.release_date)
          return d ? { milestone: x.milestone, date: d } : null
        })
        .filter((x): x is { milestone: string; date: Date } => x !== null),
    [milestones],
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

  const ganttInnerScrollWidthPx = sidebarWidthPx + 4 + trackWidthPx

  const ganttRoadmapGridCells = useMemo(() => {
    const stickyAside: CSSProperties = {
      position: 'sticky',
      left: 0,
      zIndex: 10,
      backgroundColor: SURFACE,
      alignSelf: 'stretch',
      minWidth: 0,
    }
    const wsRowProps = {
      phaseExpanded,
      setPhaseExpanded,
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
      hoveredWsId,
      setHoveredWsId,
    }
    const cells: ReactNode[] = []
    let gridRow = 2
    for (const row of roadmapRows) {
      if (row.kind === 'section') {
        cells.push(
          <div
            key={`aside-sec-${row.group}-r${gridRow}`}
            data-gantt-sidebar
            style={{ gridColumn: 1, gridRow, ...stickyAside }}
          >
            <div className="flex w-full shrink-0 items-center" style={{ height: SECTION_HEIGHT }}>
              <button
                type="button"
                className="flex w-full min-w-0 items-center gap-2 px-2 text-left transition-colors hover:bg-[#222222]"
                style={{
                  height: SECTION_HEIGHT,
                  backgroundColor: 'transparent',
                  color: TEXT_SECTION,
                }}
                onClick={() => toggleGroup(row.group)}
              >
                <Chevron collapsed={row.collapsed} />
                <span
                  className="min-w-0 flex-1 truncate text-[10px] font-medium uppercase tracking-[0.06em]"
                  style={{
                    color: viewBy === 'dri' ? driHandleColor(row.group) : TEXT_SECTION,
                  }}
                >
                  {groupSectionHeaderLabel(row.group, viewBy)}
                </span>
              </button>
            </div>
          </div>,
        )
        cells.push(
          <div
            key={`sep-sec-${row.group}-r${gridRow}`}
            style={{ gridColumn: 2, gridRow, backgroundColor: SURFACE }}
            aria-hidden
          />,
        )
        cells.push(
          <div
            key={`tl-sec-${row.group}-r${gridRow}`}
            style={{
              gridColumn: 3,
              gridRow,
              minWidth: 0,
              height: SECTION_HEIGHT,
              width: '100%',
              backgroundColor: SECTION_BG,
            }}
            aria-hidden
          />,
        )
        gridRow++
      } else if (row.ws.phases?.length) {
        cells.push(
          <div
            key={`ph-${row.ws.id}-r${gridRow}`}
            style={{ gridColumn: '1 / -1', gridRow, minWidth: 0, width: '100%', overflow: 'visible' }}
          >
            <GanttPhasedWorkstreamGroup
              ws={row.ws}
              sidebarWidthPx={sidebarWidthPx}
              trackWidthPx={trackWidthPx}
              phaseExpanded={phaseExpanded}
              setPhaseExpanded={setPhaseExpanded}
              barDetail={barDetail}
              setBarDetail={setBarDetail}
              viewStart={viewStart}
              viewEnd={viewEnd}
              setTip={setTip}
              showBarTip={showBarTip}
              moveTip={moveTip}
              hideTip={hideTip}
              showMarkerTip={showMarkerTip}
              setHoveredWsId={setHoveredWsId}
            />
          </div>,
        )
        gridRow++
      } else {
        cells.push(
          <div key={`aside-ws-${row.ws.id}-r${gridRow}`} style={{ gridColumn: 1, gridRow, ...stickyAside }}>
            <GanttWorkstreamRow segment="sidebar" ws={row.ws} {...wsRowProps} />
          </div>,
        )
        cells.push(
          <div key={`sep-ws-${row.ws.id}-r${gridRow}`} style={{ gridColumn: 2, gridRow, backgroundColor: SURFACE }} aria-hidden />,
        )
        cells.push(
          <div key={`tl-ws-${row.ws.id}-r${gridRow}`} style={{ gridColumn: 3, gridRow, minWidth: 0 }}>
            <GanttWorkstreamRow segment="timeline" ws={row.ws} {...wsRowProps} />
          </div>,
        )
        gridRow++
      }
    }
    return cells
  }, [
    roadmapRows,
    sidebarWidthPx,
    trackWidthPx,
    phaseExpanded,
    setPhaseExpanded,
    barDetail,
    setBarDetail,
    viewStart,
    viewEnd,
    setTip,
    showBarTip,
    moveTip,
    hideTip,
    showMarkerTip,
    hoveredWsId,
    setHoveredWsId,
    toggleGroup,
    viewBy,
  ])

  const closeBarDetail = useCallback(() => setBarDetail(null), [])

  const closeDrawerOverlay = useCallback(() => {
    setDrawerOverlay(null)
  }, [])

  const openMilestonesFromToolbar = useCallback(() => {
    if (drawerOverlayRef.current === 'milestones') {
      setDrawerOverlay(null)
      return
    }
    setBarDetail(null)
    setDrawerOverlay('milestones')
  }, [])

  const openMilestonesFromDetail = useCallback(() => {
    setBarDetail(null)
    setDrawerOverlay('milestones')
  }, [])

  /** Space / Shift+Space: horizontal scroll on the timeline (no trackpad). */
  useEffect(() => {
    if (loading) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space' && e.key !== ' ') return
      if (barDetail) return
      if (drawerOverlay) return
      const t = e.target
      if (!(t instanceof HTMLElement)) return
      const node =
        document.activeElement instanceof HTMLElement ? document.activeElement : t
      if (node.closest('[data-gantt-drawer]')) return
      if (node.closest('input, textarea, select, [contenteditable="true"]')) return
      if (node.closest('[role="toolbar"]')) return
      if (node.closest('[data-gantt-sidebar]')) return
      if (node.closest('[data-gantt-bar]') || node.hasAttribute('data-gantt-bar')) return
      if (node.closest('[data-gantt-phase-bar]') || node.hasAttribute('data-gantt-phase-bar')) return
      if (node.closest('[data-gantt-expand-label]')) return

      const el = scrollRef.current
      if (!el || el.scrollWidth <= el.clientWidth) return

      e.preventDefault()
      const page = Math.min(el.clientWidth * 0.88, 480)
      el.scrollBy({ left: e.shiftKey ? -page : page, behavior: 'smooth' })
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [loading, barDetail, drawerOverlay])

  /** Timeline horizontal wheel: native deltaX, Shift+vertical → horizontal; vertical wheel bubbles to page. */
  useEffect(() => {
    if (loading) return
    const el = scrollRef.current
    if (!el) return

    const PIXEL_PER_LINE = 24

    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth + 1) return

      const isHorizontalIntent = Math.abs(e.deltaX) > Math.abs(e.deltaY)
      const isVerticalIntent = Math.abs(e.deltaY) > Math.abs(e.deltaX)

      if (isHorizontalIntent) {
        e.preventDefault()
        let delta = e.deltaX
        if (e.deltaMode === WheelEvent.DOM_DELTA_LINE) delta *= PIXEL_PER_LINE
        if (e.deltaMode === WheelEvent.DOM_DELTA_PAGE) delta *= el.clientWidth
        el.scrollLeft += delta
        return
      }

      if (isVerticalIntent && e.shiftKey) {
        e.preventDefault()
        let delta = e.deltaY
        if (e.deltaMode === WheelEvent.DOM_DELTA_LINE) delta *= PIXEL_PER_LINE
        if (e.deltaMode === WheelEvent.DOM_DELTA_PAGE) delta *= el.clientWidth
        el.scrollLeft += delta
      }
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [loading])

  useEffect(() => {
    try {
      localStorage.setItem(GANTT_SIDEBAR_WIDTH_KEY, String(sidebarWidthPx))
    } catch {
      /* ignore */
    }
  }, [sidebarWidthPx])

  const onSidebarResizePointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return
      e.preventDefault()
      sidebarResizeDragRef.current = { startX: e.clientX, startW: sidebarWidthPx }
      e.currentTarget.setPointerCapture(e.pointerId)
    },
    [sidebarWidthPx],
  )

  const onSidebarResizePointerMove = useCallback((e: PointerEvent<HTMLDivElement>) => {
    const d = sidebarResizeDragRef.current
    if (!d) return
    const next = Math.min(MAX_SIDEBAR_W, Math.max(MIN_SIDEBAR_W, d.startW + e.clientX - d.startX))
    setSidebarWidthPx(next)
  }, [])

  const onSidebarResizePointerUp = useCallback((e: PointerEvent<HTMLDivElement>) => {
    sidebarResizeDragRef.current = null
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
  }, [])

  return (
    <div
      className="flex h-full min-h-0 w-full flex-col overflow-hidden"
      data-name="Gantt"
      style={{
        backgroundColor: SURFACE,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <div className="sticky top-0 z-[12] shrink-0">
        <GanttToolbar
          viewBy={viewBy}
          onViewBy={setViewBy}
          zoom={zoom}
          onZoom={onZoom}
          weekNav={weekNav}
          milestonesDrawerActive={drawerOverlay === 'milestones'}
          onMilestonesToolbarClick={openMilestonesFromToolbar}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="shrink-0 px-6 pb-4 pt-4" style={{ backgroundColor: SURFACE }}>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[22px] font-semibold leading-tight" style={{ color: TEXT_PRIMARY }}>
              Network design roadmap
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

        <div className="min-h-0 flex-1 px-6 pb-6">
          {loading ? (
            <div className="min-h-0 min-w-0">
              <LoadingShimmer sidebarWidthPx={sidebarWidthPx} trackWidthPx={trackWidthPx} />
            </div>
          ) : (
            <div ref={scrollRef} data-gantt-timeline-scroll className="min-h-0 w-full overflow-x-auto overflow-y-visible" style={{ touchAction: 'pan-y' }}>
              <div
                className="relative"
                style={{
                  width: ganttInnerScrollWidthPx,
                  minWidth: ganttInnerScrollWidthPx,
                  overflow: 'visible',
                }}
              >
                <div
                  role="separator"
                  aria-orientation="vertical"
                  aria-label="Resize sidebar"
                  className="pointer-events-auto absolute z-[20] cursor-col-resize border-0 bg-transparent p-0 hover:bg-[#3A3A3A]"
                  style={{
                    left: sidebarWidthPx,
                    top: headerHeight,
                    bottom: 0,
                    width: 4,
                    touchAction: 'none',
                  }}
                  onPointerDown={onSidebarResizePointerDown}
                  onPointerMove={onSidebarResizePointerMove}
                  onPointerUp={onSidebarResizePointerUp}
                  onPointerCancel={onSidebarResizePointerUp}
                />
                <div
                  className="pointer-events-none absolute z-0"
                  style={{
                    left: sidebarWidthPx + 4,
                    top: headerHeight,
                    width: trackWidthPx,
                    height: bodyHeight,
                    backgroundColor: SURFACE,
                  }}
                  aria-hidden
                />
                <div
                  className="grid min-h-0 w-full"
                  style={{
                    gridTemplateColumns: `${sidebarWidthPx}px 4px minmax(0, ${trackWidthPx}px)`,
                    gridAutoRows: 'auto',
                    alignItems: 'stretch',
                    overflow: 'visible',
                  }}
                >
                  <div
                    style={{
                      gridColumn: 1,
                      gridRow: 1,
                      position: 'sticky',
                      top: 0,
                      left: 0,
                      zIndex: 11,
                      backgroundColor: SURFACE,
                      alignSelf: 'start',
                    }}
                  >
                    <div style={{ height: headerHeight, width: sidebarWidthPx }} aria-hidden />
                  </div>
                  <div
                    style={{
                      gridColumn: 2,
                      gridRow: 1,
                      position: 'sticky',
                      top: 0,
                      zIndex: 11,
                      backgroundColor: SURFACE,
                      alignSelf: 'start',
                    }}
                    aria-hidden
                  >
                    <div style={{ width: 4, height: headerHeight }} />
                  </div>
                  <div
                    style={{
                      gridColumn: 3,
                      gridRow: 1,
                      minWidth: 0,
                      position: 'sticky',
                      top: 0,
                      zIndex: 9,
                      backgroundColor: SURFACE,
                      alignSelf: 'start',
                    }}
                  >
                    <div style={{ width: trackWidthPx }}>
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
                  </div>
                  {ganttRoadmapGridCells}
                </div>
                <div
                  className="pointer-events-none absolute z-[2]"
                  style={{
                    left: sidebarWidthPx + 4,
                    top: headerHeight,
                    width: trackWidthPx,
                    height: bodyHeight,
                  }}
                  aria-hidden
                >
                  <MilestoneLines
                    bodyHeight={bodyHeight}
                    milestoneDates={milestoneDates}
                    viewStart={viewStart}
                    viewEnd={viewEnd}
                  />
                </div>
                <div
                  className="pointer-events-none absolute z-[20]"
                  style={{
                    left: sidebarWidthPx + 4,
                    top: 0,
                    width: trackWidthPx,
                    height: headerHeight + bodyHeight,
                  }}
                  aria-hidden
                >
                  <TodayColumn totalHeight={headerHeight + bodyHeight} viewStart={viewStart} viewEnd={viewEnd} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Tooltip state={tip} />

      <GanttDrawers
        detail={barDetail}
        overlay={drawerOverlay}
        statusTones={STATUS_TONES}
        onCloseDetail={closeBarDetail}
        onCloseOverlay={closeDrawerOverlay}
        onOpenMilestonesFromDetail={openMilestonesFromDetail}
        onDetailNavigate={setBarDetail}
      />
    </div>
  )
}
