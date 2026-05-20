/**
 * Unified roadmap drawers — detail (Mode A), milestone plan (Mode B).
 */

import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { CalendarOutlineIcon } from '../icons/CalendarOutlineIcon'
import { ExternalLinkIcon } from '../icons/ExternalLinkIcon'
import { GanttWorkstreamAvatar } from './GanttWorkstreamAvatar'
import {
  milestones,
  markers,
  formatWorkstreamStatusLabel,
  formatDriLabel,
  milestoneDisplayLabel,
  milestoneKeyInvalid,
  markerDisplayLabel,
  formatMilestoneKeyWithRelease,
  milestoneSortIndex,
  resolveKickoff,
  getPhaseMilestones,
  workstreamsForMilestoneRowIndex,
  workstreamMilestoneSpan,
  milestonesInWorkstreamSpan,
  parseYmd,
  sortMarkers,
  markersForWorkstream,
  phaseDateRange,
  markersInDateRange,
  type Marker,
  type Phase,
  type Workstream,
  type WorkstreamStatus,
} from '../data/ganttData'
import { statusPillColors } from '../data/statusPill'

/** Milestone plan: wide enough for table + padding, capped to viewport (no horizontal drawer scroll). */
const MILESTONE_DRAWER_WIDTH = 'min(1120px, calc(100vw - 32px))'

const SHELL = {
  right: 16,
  top: 16,
  bottom: 16,
  radius: 12,
  animMs: 200,
} as const

const PANEL_BG = '#F5F4F0'
const PANEL_BORDER = '#E0DDD8'
const TEXT_DARK = '#1A1A1A'
const TEXT_MUTED = '#888780'
const LINK_COLOR = '#6366F1'
/** DRI @handle in detail panel — light purple aligned to bar palette. */
const DRI_HANDLE_COLOR = 'rgba(155, 143, 232, 0.8)'

const SECTION_HEADER_ROW: CSSProperties = {
  background: '#E8E5E0',
  borderRadius: 6,
  padding: '6px 10px',
  marginBottom: 8,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}

const SECTION_HEADER_LABEL: CSSProperties = {
  fontSize: 10,
  fontWeight: 500,
  textTransform: 'uppercase',
  color: '#888780',
  letterSpacing: '0.05em',
}

const SECTION_HEADER_ACTION: CSSProperties = {
  fontSize: 10,
  fontWeight: 500,
  color: LINK_COLOR,
}

/** Horizontal inset for content below each section header (detail drawer). */
const DETAIL_SECTION_BODY_PAD_X = 8

/** Past dates: label + value + icon (medium gray). */
const DATE_ROW_PAST = '#888780'
/** Today and future: label + value + icon (dark gray). */
const DATE_ROW_UPCOMING = '#454542'
/** DATES block: vertical rhythm (12px type + air between rows). */
const DATE_PANEL_ROW_MIN_HEIGHT = 32
const DATE_PANEL_ROW_GAP_PX = 10
const DATE_PANEL_ROW_LINE_HEIGHT = 1.45

export type GanttDetailDrawerState =
  | { kind: 'workstream'; ws: Workstream }
  | { kind: 'phase'; ws: Workstream; phase: Phase }

export type GanttOverlayMode = 'milestones'

type StatusTones = { bar: string; track: string; stop: string; pill: string }

function startOfTodayLocal(): Date {
  const n = new Date()
  return new Date(n.getFullYear(), n.getMonth(), n.getDate(), 0, 0, 0, 0)
}

/** Calendar day strictly before today → past. */
function isPastCalendarDay(d: Date): boolean {
  const day = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)
  return day.getTime() < startOfTodayLocal().getTime()
}

function formatDisplayDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function releaseDateForMilestoneKey(key: string): Date | null {
  if (milestoneKeyInvalid(key)) return null
  const row = milestones.find((m) => m.milestone.trim() === key.trim())
  if (!row) return null
  return parseYmd(row.release_date)
}

function milestoneKeyFromHandoffLabel(label: string): string | null {
  const t = label.trim()
  const m = /^(.+?)\s+handoff$/i.exec(t)
  return m ? m[1]!.trim() : null
}

function handoffDateForMilestoneKey(milestoneKey: string, ms: Marker[]): Date | null {
  const want = `${milestoneKey.trim().toLowerCase()} handoff`
  for (const x of ms) {
    if (x.type !== 'handoff') continue
    if (x.label.trim().toLowerCase() === want) return parseYmd(x.date)
  }
  return null
}

function milestoneKeysForSpan(span: { lo: number; hi: number }): Set<string> {
  const s = new Set<string>()
  for (let i = span.lo; i <= span.hi; i++) {
    const row = milestones[i]
    if (row) s.add(row.milestone.trim())
  }
  return s
}

function milestoneDrawerPillStyle(status: WorkstreamStatus): CSSProperties {
  switch (status) {
    case 'not started':
      return { backgroundColor: '#2A2A2A', color: '#888780' }
    case 'in progress':
      return { backgroundColor: '#3D3660', color: '#9B8FE8' }
    case 'at risk':
      return { backgroundColor: '#4A3A10', color: '#F9BC45' }
    case 'blocked':
      return { backgroundColor: '#4A2020', color: '#F0A090' }
    case 'completed':
      return { backgroundColor: '#1A4030', color: '#7FD4B8' }
    case 'paused':
      return { backgroundColor: '#2A2A2A', color: '#888780' }
    default:
      return { backgroundColor: '#2A2A2A', color: '#888780' }
  }
}

/** Design workstreams column: plain names; dotted underline only on “+K more” (tooltip shows full list). */
const MILESTONE_DRAWER_WS_INLINE_MAX = 2
const MILESTONE_DRAWER_WS_NAME = '#9B8FE8'
const MILESTONE_DRAWER_WS_DOT = '#7A6FB0'

function WorkstreamsListCell({ names }: { names: string[] }) {
  const anchorRef = useRef<HTMLSpanElement>(null)
  const [tip, setTip] = useState<{ left: number; top: number } | null>(null)
  const show = useCallback(() => {
    const el = anchorRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setTip({ left: r.left + r.width / 2, top: r.bottom + 6 })
  }, [])
  const hide = useCallback(() => setTip(null), [])

  const truncated = names.length > MILESTONE_DRAWER_WS_INLINE_MAX
  const shown = names.slice(0, MILESTONE_DRAWER_WS_INLINE_MAX)
  const extra = names.length - shown.length

  if (!names.length) {
    return (
      <span className="tabular-nums" style={{ fontSize: 12, color: '#888780' }}>
        —
      </span>
    )
  }

  const moreDotted: CSSProperties = { borderBottom: `1px dotted ${MILESTONE_DRAWER_WS_DOT}` }

  return (
    <>
      <span
        ref={anchorRef}
        className="inline-block min-w-0 max-w-full"
        style={{
          fontSize: 12,
          color: MILESTONE_DRAWER_WS_NAME,
          wordBreak: 'break-word',
          overflowWrap: 'anywhere',
          cursor: truncated ? 'default' : undefined,
        }}
        aria-label={truncated ? names.join(', ') : undefined}
        onMouseEnter={truncated ? show : undefined}
        onMouseLeave={truncated ? hide : undefined}
      >
        {shown.map((n, i) => (
          <Fragment key={`${n}-${i}`}>
            {i > 0 ? (
              <span style={{ color: '#6B6A66' }} aria-hidden>
                ,{' '}
              </span>
            ) : null}
            {n}
          </Fragment>
        ))}
        {truncated ? (
          <>
            <span style={{ color: '#6B6A66' }} aria-hidden>
              ,{' '}
            </span>
            <span className="pb-px" style={moreDotted}>{`+${extra} more`}</span>
          </>
        ) : null}
      </span>
      {tip != null && truncated
        ? createPortal(
            <div
              role="tooltip"
              className="pointer-events-none fixed z-[9999] flex max-w-[min(360px,calc(100vw-24px))] flex-col gap-1 rounded px-2 py-1.5 shadow-md"
              style={{
                left: tip.left,
                top: tip.top,
                transform: 'translateX(-50%)',
                backgroundColor: '#1A1A1A',
                color: '#F0EEE9',
                fontSize: 11,
                lineHeight: 1.35,
              }}
            >
              {names.map((n, i) => (
                <div key={`${n}-${i}`} className="break-words whitespace-pre-wrap">
                  {n}
                </div>
              ))}
            </div>,
            document.body,
          )
        : null}
    </>
  )
}

function TablerXIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden className="text-current">
      <path
        d="M18 6L6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

type DrawerShellProps = {
  width: number | string
  zIndex: number
  backgroundColor: string
  borderColor: string
  padding: number
  open: boolean
  onClose: () => void
  children: React.ReactNode
  'data-testid'?: string
  variant: 'light' | 'dark'
}

function DrawerShell({
  width,
  zIndex,
  backgroundColor,
  borderColor,
  padding,
  open,
  onClose,
  children,
  'data-testid': dataTestId,
  variant,
}: DrawerShellProps) {
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    if (!open) {
      setEntered(false)
      return
    }
    const id = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(id)
  }, [open])

  const shellStyle: CSSProperties = {
    position: 'fixed',
    right: SHELL.right,
    top: SHELL.top,
    bottom: SHELL.bottom,
    height: 'calc(100vh - 32px)',
    width,
    borderRadius: SHELL.radius,
    zIndex,
    overflowY: 'auto',
    backgroundColor,
    border: `1px solid ${borderColor}`,
    padding,
    fontFamily: 'Inter, system-ui, sans-serif',
    boxSizing: 'border-box',
    transform: entered ? 'translateX(0)' : 'translateX(100%)',
    transition: `transform ${SHELL.animMs}ms ease-out`,
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-gantt-drawer
      data-testid={dataTestId}
      style={shellStyle}
    >
      <button
        type="button"
        aria-label="Close"
        className={`absolute right-3 top-3 z-[1] border-0 bg-transparent p-1 transition-colors ${
          variant === 'light' ? 'text-[#555553] hover:text-[#1A1A1A]' : 'text-[#888780] hover:text-[#F0EEE9]'
        }`}
        style={{ cursor: 'pointer' }}
        onClick={onClose}
      >
        <TablerXIcon size={18} />
      </button>
      {children}
    </div>
  )
}

function DetailDateRow({ label, value, valueDate }: { label: string; value: string; valueDate: Date | null }) {
  if (!value.trim() || value.trim() === '—') return null
  const tone =
    valueDate != null && isPastCalendarDay(valueDate) ? DATE_ROW_PAST : DATE_ROW_UPCOMING
  const rowText: CSSProperties = {
    fontSize: 12,
    lineHeight: DATE_PANEL_ROW_LINE_HEIGHT,
    color: tone,
  }
  return (
    <div className="flex items-center gap-2" style={{ minHeight: DATE_PANEL_ROW_MIN_HEIGHT }}>
      <span className="inline-flex h-[14px] w-[14px] shrink-0 items-center justify-center self-center" aria-hidden>
        <CalendarOutlineIcon size={14} color={tone} />
      </span>
      <span className="shrink-0" style={rowText}>
        {label}
      </span>
      <span className="min-w-0 flex-1 text-right tabular-nums" style={rowText}>
        {value}
      </span>
    </div>
  )
}

/** Per-milestone handoff: always listed; `—` until a handoff marker exists (tint from handoff or gate release). */
function DetailMilestoneHandoffRow({
  label,
  value,
  valueDate,
  toneAnchorDate,
}: {
  label: string
  value: string
  valueDate: Date | null
  toneAnchorDate: Date | null
}) {
  const anchor = valueDate ?? toneAnchorDate
  const tone =
    anchor != null && isPastCalendarDay(anchor) ? DATE_ROW_PAST : DATE_ROW_UPCOMING
  const rowText: CSSProperties = {
    fontSize: 12,
    lineHeight: DATE_PANEL_ROW_LINE_HEIGHT,
    color: tone,
  }
  return (
    <div className="flex items-center gap-2" style={{ minHeight: DATE_PANEL_ROW_MIN_HEIGHT }}>
      <span className="inline-flex h-[14px] w-[14px] shrink-0 items-center justify-center self-center" aria-hidden>
        <CalendarOutlineIcon size={14} color={tone} />
      </span>
      <span className="shrink-0" style={rowText}>
        {label}
      </span>
      <span className="min-w-0 flex-1 text-right tabular-nums" style={rowText}>
        {value}
      </span>
    </div>
  )
}

/** First / GA gate line: calendar + `M2.5 · Oct 15, 2026` (from milestones SSOT). */
function DetailMilestoneGateRow({ text, toneDate }: { text: string; toneDate: Date | null }) {
  const tone =
    toneDate != null && isPastCalendarDay(toneDate) ? DATE_ROW_PAST : DATE_ROW_UPCOMING
  const rowText: CSSProperties = {
    fontSize: 12,
    lineHeight: DATE_PANEL_ROW_LINE_HEIGHT,
    color: tone,
  }
  return (
    <div className="flex items-center gap-2" style={{ minHeight: DATE_PANEL_ROW_MIN_HEIGHT }}>
      <span className="inline-flex h-[14px] w-[14px] shrink-0 items-center justify-center self-center" aria-hidden>
        <CalendarOutlineIcon size={14} color={tone} />
      </span>
      <span className="min-w-0 flex-1" style={rowText}>
        {text}
      </span>
    </div>
  )
}

/**
 * DATES list glyphs: reviews/crits → dot (open = upcoming, closed = past);
 * milestone handoffs → calendar (same as phase start/end and milestone rows).
 */
function MarkerRowGlyph({
  markerType,
  eventDate,
  dark,
  lightTone,
}: {
  markerType: Marker['type']
  eventDate: Date | null
  dark?: boolean
  lightTone: string
}) {
  const past = eventDate != null && isPastCalendarDay(eventDate)
  const calColor = dark ? '#888780' : lightTone
  if (markerType === 'handoff') {
    return (
      <span className="inline-flex h-[14px] w-[14px] shrink-0 items-center justify-center" aria-hidden>
        <CalendarOutlineIcon size={14} color={calColor} />
      </span>
    )
  }
  const ring = dark ? '#F0EEE9' : lightTone
  const fill = dark ? '#F0EEE9' : lightTone
  if (past) {
    return (
      <span className="inline-flex h-[14px] w-[14px] shrink-0 items-center justify-center" aria-hidden>
        <span className="inline-block shrink-0 rounded-full" style={{ width: 8, height: 8, backgroundColor: fill }} />
      </span>
    )
  }
  return (
    <span className="inline-flex h-[14px] w-[14px] shrink-0 items-center justify-center" aria-hidden>
      <span
        className="inline-block shrink-0 rounded-full"
        style={{ width: 8, height: 8, border: `2px solid ${ring}`, backgroundColor: 'transparent' }}
      />
    </span>
  )
}

function DetailKeyDateRow({
  m,
  dark,
  rowHeight,
}: {
  m: Marker
  dark?: boolean
  rowHeight: number
}) {
  const d = parseYmd(m.date)
  const dateStr = d ? formatDisplayDate(d) : '—'
  const lightTone =
    d != null && isPastCalendarDay(d) ? DATE_ROW_PAST : DATE_ROW_UPCOMING
  return (
    <div
      className="flex items-center gap-2"
      style={{
        height: rowHeight,
        minHeight: rowHeight,
        fontSize: 12,
        lineHeight: DATE_PANEL_ROW_LINE_HEIGHT,
      }}
    >
      <span className="inline-flex shrink-0 justify-center self-center">
        <MarkerRowGlyph markerType={m.type} eventDate={d} dark={dark} lightTone={lightTone} />
      </span>
      <span
        className="min-w-0 flex-1 truncate"
        style={{
          color: dark ? '#F0EEE9' : lightTone,
          fontSize: 12,
          lineHeight: DATE_PANEL_ROW_LINE_HEIGHT,
        }}
      >
        {markerDisplayLabel(m.label)}
      </span>
      <span
        className="shrink-0 tabular-nums"
        style={{
          color: dark ? '#888780' : lightTone,
          fontSize: 12,
          lineHeight: DATE_PANEL_ROW_LINE_HEIGHT,
        }}
      >
        {dateStr}
      </span>
    </div>
  )
}

/** Hover date label — native `title` is delayed and unreliable inside transformed/overflow drawers. */
function MilestoneInlineLabel({ label, dateStr }: { label: string; dateStr: string }) {
  const anchorRef = useRef<HTMLSpanElement>(null)
  const [tip, setTip] = useState<{ left: number; top: number } | null>(null)

  const show = useCallback(() => {
    const el = anchorRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setTip({ left: r.left + r.width / 2, top: r.bottom + 6 })
  }, [])

  const hide = useCallback(() => setTip(null), [])

  return (
    <>
      <span
        ref={anchorRef}
        className="pb-px"
        aria-label={`${label}, release target ${dateStr}`}
        style={{ cursor: 'default', borderBottom: `1px dotted ${TEXT_MUTED}` }}
        onMouseEnter={show}
        onMouseLeave={hide}
      >
        {label}
      </span>
      {tip != null
        ? createPortal(
            <span
              role="tooltip"
              className="pointer-events-none fixed z-[9999] rounded px-2 py-1 text-[11px] leading-snug shadow-md"
              style={{
                left: tip.left,
                top: tip.top,
                transform: 'translateX(-50%)',
                backgroundColor: '#1A1A1A',
                color: '#F0EEE9',
              }}
            >
              {dateStr}
            </span>,
            document.body,
          )
        : null}
    </>
  )
}

function DetailSectionBody({ children }: { children: ReactNode }) {
  return (
    <div style={{ paddingLeft: DETAIL_SECTION_BODY_PAD_X, paddingRight: DETAIL_SECTION_BODY_PAD_X }}>{children}</div>
  )
}

function DetailSectionHeader({ label, right }: { label: string; right?: React.ReactNode }) {
  return (
    <div style={SECTION_HEADER_ROW}>
      <span style={SECTION_HEADER_LABEL}>{label}</span>
      {right != null ? <span className="flex shrink-0 items-center">{right}</span> : null}
    </div>
  )
}

function phaseAbbrevLabel(phase: Phase, index: number): string {
  const m = /^Phase\s*(\d+)/i.exec(phase.label.trim())
  if (m?.[1]) return `Phase ${m[1]}`
  return `Phase ${index + 1}`
}

function formatPhaseEndOnly(phase: Phase): string {
  const d = parseYmd(phase.end)
  return d ? formatDisplayDate(d) : '—'
}

function PhaseDrawerRow({
  phase,
  title,
  endDateText,
  dotColor,
  onSelect,
}: {
  phase: Phase
  title: string
  endDateText: string
  dotColor: string
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-2 border-0 bg-transparent text-left transition-colors duration-100 hover:bg-[#E0DDD8]"
      style={{
        cursor: 'pointer',
        borderRadius: 5,
        padding: '6px 8px',
      }}
      onClick={onSelect}
    >
      <span
        className="shrink-0 rounded-full"
        style={{ width: 6, height: 6, backgroundColor: dotColor }}
        aria-hidden
      />
      <span className="min-w-0 flex-1 text-[12px] font-normal leading-snug" style={{ color: TEXT_DARK }}>
        {title}
      </span>
      <span className="shrink-0 text-right text-[11px] tabular-nums leading-snug" style={{ color: TEXT_MUTED }}>
        {endDateText}
      </span>
    </button>
  )
}

/** Renders parent `docUrl`; phase detail passes the parent workstream URL so briefs stay in sync. */
function DetailLinksSection({ docUrl }: { docUrl: string }) {
  const trimmed = docUrl.trim()
  const hasDoc = Boolean(trimmed)
  return (
    <div className="mt-5">
      <DetailSectionHeader label="LINKS" />
      <DetailSectionBody>
        {hasDoc ? (
          <a
            href={trimmed}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              const ev = e.nativeEvent
              if (ev.defaultPrevented) return
              if (ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return
              e.preventDefault()
              window.open(trimmed, '_blank', 'noopener,noreferrer')
            }}
            className="inline-flex cursor-pointer items-center gap-2 bg-transparent no-underline transition-opacity hover:opacity-80"
            style={{ color: LINK_COLOR }}
          >
            <span className="ti-external-link inline-flex shrink-0 items-center justify-center" aria-hidden>
              <ExternalLinkIcon size={14} fill={LINK_COLOR} />
            </span>
            <span className="text-[13px]">Design brief</span>
          </a>
        ) : null}
        {/* FIGMA LINK */}
        {/* LOOM LINK */}
        {!hasDoc ? (
          <p className="m-0 text-[12px] leading-snug" style={{ color: '#AAAAAA' }}>
            No links yet
          </p>
        ) : null}
      </DetailSectionBody>
    </div>
  )
}

function GanttDetailDrawerContent({
  state,
  statusTones,
  onOpenMilestones,
  onDetailNavigate,
}: {
  state: GanttDetailDrawerState
  statusTones: Record<WorkstreamStatus, StatusTones>
  onOpenMilestones: () => void
  onDetailNavigate: (next: GanttDetailDrawerState) => void
}) {
  const phaseMode = state.kind === 'phase'
  const ws = state.ws
  const phase = phaseMode ? state.phase : undefined

  const statusForPanel: WorkstreamStatus = phaseMode && phase ? phase.status : ws.status
  const tones = statusTones[statusForPanel]
  const barColor = tones.bar

  const wsMarkersAll = useMemo(() => sortMarkers(markersForWorkstream(ws.id)), [ws.id])
  const phaseMarkersFiltered = useMemo(() => {
    if (!phaseMode || !phase) return []
    const r = phaseDateRange(phase)
    if (!r) return []
    return sortMarkers(markersInDateRange(wsMarkersAll, r.start, r.end))
  }, [phaseMode, phase, wsMarkersAll])

  const kickResolved = resolveKickoff(ws)
  const kick = parseYmd(kickResolved)
  const kickoffStr = kick ? formatDisplayDate(kick) : '—'

  const phaseStartDate = phaseMode && phase ? parseYmd(phase.start) : null
  const phaseEndDate = phaseMode && phase ? parseYmd(phase.end) : null
  const phaseStartStr = phaseStartDate ? formatDisplayDate(phaseStartDate) : '—'
  const phaseEndStr = phaseEndDate ? formatDisplayDate(phaseEndDate) : '—'

  /**
   * Phased workstreams (`ws.phases?.length`): parent DATES are phase-only (kickoff, each phase
   * start + handoff end) plus review markers — no milestone gate/handoff rows in DATES (noise).
   * The MILESTONES strip still lists gates for the parent bar. Non-phased parents keep gate rows
   * in DATES as well as the strip.
   */
  const workstreamChronologicalDateEntries = useMemo(() => {
    if (phaseMode) return []
    const FAR_FUTURE = new Date(2512, 0, 1, 12, 0, 0, 0)

    type Entry =
      | { kind: 'row'; key: string; label: string; value: string; valueDate: Date }
      | { kind: 'gate'; key: string; milestoneKey: string; sortDate: Date }
      | {
          kind: 'milestoneHandoff'
          key: string
          milestoneKey: string
          label: string
          value: string
          valueDate: Date | null
          sortDate: Date
        }
      | { kind: 'marker'; key: string; m: Marker }

    const entries: Entry[] = []

    const phases = ws.phases ?? []
    const hasPhases = phases.length > 0

    const sortTime = (e: Entry): number => {
      if (e.kind === 'row') return e.valueDate.getTime()
      if (e.kind === 'gate') return e.sortDate.getTime()
      if (e.kind === 'milestoneHandoff') return e.sortDate.getTime()
      return parseYmd(e.m.date)!.getTime()
    }

    if (hasPhases) {
      const kickDate = parseYmd(resolveKickoff(ws))
      if (kickDate) {
        entries.push({
          kind: 'row',
          key: 'ko',
          label: 'Kickoff',
          value: formatDisplayDate(kickDate),
          valueDate: kickDate,
        })
      }
      phases.forEach((ph, idx) => {
        const brief = phaseAbbrevLabel(ph, idx)
        const startD = parseYmd(ph.start)
        if (startD) {
          entries.push({
            kind: 'row',
            key: `ph-s-${idx}`,
            label: `${brief} start`,
            value: formatDisplayDate(startD),
            valueDate: startD,
          })
        }
        const endD = parseYmd(ph.end)
        if (!endD) return
        entries.push({
          kind: 'row',
          key: `ph-h-${idx}`,
          label: `${brief} handoff`,
          value: formatDisplayDate(endD),
          valueDate: endD,
        })
      })

      for (const m of wsMarkersAll) {
        const d = parseYmd(m.date)
        if (!d) continue
        if (m.type === 'handoff') continue
        entries.push({ kind: 'marker', key: `${m.date}-${m.label}-${m.type}`, m })
      }

      const phasedKindRank = (e: Entry): number => {
        if (e.kind === 'row' && e.key === 'ko') return 0
        if (e.kind === 'row' && e.key.startsWith('ph-s-')) {
          const n = Number(e.key.slice('ph-s-'.length))
          return 10 + (Number.isFinite(n) ? n * 2 : 0)
        }
        if (e.kind === 'row' && e.key.startsWith('ph-h-')) {
          const n = Number(e.key.slice('ph-h-'.length))
          return 11 + (Number.isFinite(n) ? n * 2 : 0)
        }
        if (e.kind === 'marker') return 1000
        return 500
      }

      entries.sort((a, b) => {
        const ta = sortTime(a)
        const tb = sortTime(b)
        if (ta !== tb) return ta - tb
        const ra = phasedKindRank(a)
        const rb = phasedKindRank(b)
        if (ra !== rb) return ra - rb
        if (a.kind === 'marker' && b.kind === 'marker') {
          if (a.m.type === b.m.type) return 0
          return a.m.type === 'review' ? -1 : 1
        }
        return 0
      })

      return entries
    }

    const span = workstreamMilestoneSpan(ws)
    const spanKeys = span ? milestoneKeysForSpan(span) : null

    const fk = ws.first_milestone.trim()
    const gk = ws.ga_milestone.trim()
    const firstInv = milestoneKeyInvalid(ws.first_milestone)
    const gaInv = milestoneKeyInvalid(ws.ga_milestone)

    if (kick) entries.push({ kind: 'row', key: 'ko', label: 'Kickoff', value: kickoffStr, valueDate: kick })
    if (!firstInv) {
      const rd = releaseDateForMilestoneKey(fk) ?? FAR_FUTURE
      entries.push({ kind: 'gate', key: `gate-f-${fk}`, milestoneKey: fk, sortDate: rd })
    }
    if (!gaInv && (firstInv || gk !== fk)) {
      const rd = releaseDateForMilestoneKey(gk) ?? FAR_FUTURE
      entries.push({ kind: 'gate', key: `gate-g-${gk}`, milestoneKey: gk, sortDate: rd })
    }
    if (span) {
      for (const row of milestonesInWorkstreamSpan(ws)) {
        const mk = row.milestone.trim()
        const hd = handoffDateForMilestoneKey(mk, wsMarkersAll)
        const release = parseYmd(row.release_date)
        const sortDate = hd ?? release ?? FAR_FUTURE
        entries.push({
          kind: 'milestoneHandoff',
          key: `mh-${ws.id}-${mk}`,
          milestoneKey: mk,
          label: `${mk} handoff`,
          value: hd ? formatDisplayDate(hd) : '—',
          valueDate: hd,
          sortDate,
        })
      }
    }

    for (const m of wsMarkersAll) {
      const d = parseYmd(m.date)
      if (!d) continue
      if (spanKeys && m.type === 'handoff') {
        const hk = milestoneKeyFromHandoffLabel(m.label)
        if (hk && spanKeys.has(hk)) continue
      }
      entries.push({ kind: 'marker', key: `${m.date}-${m.label}-${m.type}`, m })
    }

    const kindRank = (e: Entry): number => {
      if (e.kind === 'row' && e.key === 'ko') return 0
      if (e.kind === 'gate') return 1
      if (e.kind === 'milestoneHandoff') return 2
      if (e.kind === 'marker') return 3
      return 9
    }

    entries.sort((a, b) => {
      const ta = sortTime(a)
      const tb = sortTime(b)
      if (ta !== tb) return ta - tb
      const ra = kindRank(a)
      const rb = kindRank(b)
      if (ra !== rb) return ra - rb
      if (a.kind === 'gate' && b.kind === 'gate') {
        return milestoneSortIndex(a.milestoneKey) - milestoneSortIndex(b.milestoneKey)
      }
      if (a.kind === 'milestoneHandoff' && b.kind === 'milestoneHandoff') {
        return a.milestoneKey.localeCompare(b.milestoneKey, undefined, { sensitivity: 'base', numeric: true })
      }
      if (a.kind === 'row' && b.kind === 'row') return 0
      if (a.kind === 'row' && b.kind === 'marker') return -1
      if (a.kind === 'marker' && b.kind === 'row') return 1
      if (a.kind === 'marker' && b.kind === 'marker') {
        if (a.m.type === b.m.type) return 0
        return a.m.type === 'review' ? -1 : 1
      }
      return 0
    })

    return entries
  }, [phaseMode, wsMarkersAll, ws, kick, kickoffStr])

  const milestoneRows = useMemo(() => {
    if (phaseMode) return []
    return milestonesInWorkstreamSpan(ws).map((row) => {
      const key = row.milestone.trim()
      const d = parseYmd(row.release_date)
      return {
        key: `${ws.id}-strip-${key}`,
        label: milestoneDisplayLabel(key),
        dateStr: d ? formatDisplayDate(d) : '—',
      }
    })
  }, [phaseMode, ws])

  const showWorkstreamMilestonesSection = !phaseMode && milestoneRows.length > 0

  const phaseMilestonesStrip = useMemo(() => {
    if (!phaseMode || !phase) return []
    const hits = getPhaseMilestones(phase)
    if (hits.length > 0) {
      return hits.map((m) => {
        const d = parseYmd(m.release_date)
        return {
          key: `ph-${phase.id}-${m.milestone}`,
          label: milestoneDisplayLabel(m.milestone),
          dateStr: d ? formatDisplayDate(d) : '—',
        }
      })
    }
    // Parent workstream milestone span (same strip logic as workstream detail when phase dates hit no gates).
    return milestonesInWorkstreamSpan(ws).map((m) => {
      const d = parseYmd(m.release_date)
      return {
        key: `${ws.id}-phase-${phase.id}-strip-${m.milestone.trim()}`,
        label: milestoneDisplayLabel(m.milestone),
        dateStr: d ? formatDisplayDate(d) : '—',
      }
    })
  }, [phaseMode, phase, ws])

  const phasesList = ws.phases ?? []

  const detailDrawerTitle =
    phaseMode && phase
      ? phaseAbbrevLabel(phase, Math.max(0, phasesList.findIndex((p) => p.id === phase.id)))
      : ws.name

  const milestoneStripBlock = (rows: { key: string; label: string; dateStr: string }[]) => (
    <div className="flex flex-wrap items-baseline text-[12px] font-medium leading-snug" style={{ color: TEXT_DARK }}>
      {rows.map((row, i) => (
        <span key={row.key} className="inline-flex items-baseline">
          {i > 0 ? (
            <span className="mx-1 select-none font-normal" style={{ color: TEXT_MUTED }} aria-hidden>
              ,
            </span>
          ) : null}
          <MilestoneInlineLabel label={row.label} dateStr={row.dateStr} />
        </span>
      ))}
    </div>
  )

  return (
    <>
      <div className="pr-10">
        <div className="flex flex-wrap items-center justify-start gap-3">
          <h2
            id="gantt-detail-title"
            className="m-0 min-w-0 text-left text-[15px] font-medium leading-snug"
            style={{ color: TEXT_DARK }}
          >
            {detailDrawerTitle}
          </h2>
          <span
            className="inline-flex shrink-0 items-center rounded-[20px] px-2 py-0.5 text-[10px] font-medium leading-none"
            style={statusPillColors(tones)}
          >
            {formatWorkstreamStatusLabel(statusForPanel)}
          </span>
        </div>
      </div>

      {phaseMode && phase ? (
        <div className="mt-4 pr-10">
          <div
            style={{
              fontSize: 10,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#AAAAAA',
              marginBottom: 4,
            }}
          >
            PART OF
          </div>
          <button
            type="button"
            className="m-0 block w-full border-0 bg-transparent p-0 text-left text-[13px] leading-snug transition-opacity hover:opacity-80"
            style={{ color: LINK_COLOR, cursor: 'pointer' }}
            onClick={() => onDetailNavigate({ kind: 'workstream', ws })}
          >
            {ws.name}
          </button>
        </div>
      ) : null}

      <div className="mt-3 flex items-center gap-2 pr-10">
        <GanttWorkstreamAvatar ws={ws} barColor={barColor} size="panel" />
        <span className="text-[12px]" style={{ color: DRI_HANDLE_COLOR }}>
          {formatDriLabel(ws.dri)}
        </span>
      </div>

      {!phaseMode && phasesList.length > 0 ? (
        <div className="mt-5">
          <DetailSectionHeader label="PHASES" />
          <DetailSectionBody>
            <div className="flex flex-col gap-0.5">
              {phasesList.map((p, idx) => (
                <PhaseDrawerRow
                  key={p.id}
                  phase={p}
                  title={phaseAbbrevLabel(p, idx)}
                  endDateText={formatPhaseEndOnly(p)}
                  dotColor={statusTones[p.status].bar}
                  onSelect={() => onDetailNavigate({ kind: 'phase', ws, phase: p })}
                />
              ))}
            </div>
          </DetailSectionBody>
        </div>
      ) : null}

      {showWorkstreamMilestonesSection ? (
        <div className="mt-5">
          <DetailSectionHeader
            label="MILESTONES"
            right={
              <button
                type="button"
                className="m-0 shrink-0 border-0 bg-transparent p-0 font-medium leading-none transition-opacity hover:opacity-70"
                style={{ ...SECTION_HEADER_ACTION, cursor: 'pointer' }}
                onClick={onOpenMilestones}
              >
                View all
              </button>
            }
          />
          <DetailSectionBody>{milestoneStripBlock(milestoneRows)}</DetailSectionBody>
        </div>
      ) : null}

      {phaseMode && phase ? (
        <div className="mt-5">
          <DetailSectionHeader label="MILESTONES" />
          <DetailSectionBody>
            {phaseMilestonesStrip.length > 0 ? milestoneStripBlock(phaseMilestonesStrip) : null}
          </DetailSectionBody>
        </div>
      ) : null}

      <DetailLinksSection docUrl={ws.doc_url} />

      {!phaseMode ? (
        <div className="mt-5">
          <DetailSectionHeader label="DATES" />
          <DetailSectionBody>
            <div className="flex flex-col" style={{ gap: DATE_PANEL_ROW_GAP_PX }}>
              {workstreamChronologicalDateEntries.map((entry) =>
                entry.kind === 'row' ? (
                  <DetailDateRow
                    key={entry.key}
                    label={entry.label}
                    value={entry.value}
                    valueDate={entry.valueDate}
                  />
                ) : entry.kind === 'gate' ? (
                  <DetailMilestoneGateRow
                    key={entry.key}
                    text={formatMilestoneKeyWithRelease(entry.milestoneKey)}
                    toneDate={releaseDateForMilestoneKey(entry.milestoneKey)}
                  />
                ) : entry.kind === 'milestoneHandoff' ? (
                  <DetailMilestoneHandoffRow
                    key={entry.key}
                    label={entry.label}
                    value={entry.value}
                    valueDate={entry.valueDate}
                    toneAnchorDate={releaseDateForMilestoneKey(entry.milestoneKey)}
                  />
                ) : (
                  <DetailKeyDateRow key={entry.key} m={entry.m} rowHeight={DATE_PANEL_ROW_MIN_HEIGHT} />
                ),
              )}
            </div>
          </DetailSectionBody>
        </div>
      ) : phase ? (
        <div className="mt-5">
          <DetailSectionHeader label="DATES" />
          <DetailSectionBody>
            <div className="flex flex-col" style={{ gap: DATE_PANEL_ROW_GAP_PX }}>
              {phaseStartDate ? (
                <DetailDateRow label="Start" value={phaseStartStr} valueDate={phaseStartDate} />
              ) : null}
              {phaseEndDate ? (
                <DetailDateRow label="Handoff" value={phaseEndStr} valueDate={phaseEndDate} />
              ) : null}
              {phaseMarkersFiltered.map((m) => (
                <DetailKeyDateRow key={`${m.date}-${m.label}-${m.type}`} m={m} rowHeight={DATE_PANEL_ROW_MIN_HEIGHT} />
              ))}
            </div>
          </DetailSectionBody>
        </div>
      ) : null}
    </>
  )
}

function milestoneMapStatusLabel(status: WorkstreamStatus): string {
  if (status === 'completed') return 'Complete'
  return formatWorkstreamStatusLabel(status)
}

function GanttMilestoneDrawerBody() {
  const rows = useMemo(() => {
    // Per-row workstreams are derived in ganttData from each stream’s first_milestone…ga_milestone span only.
    return milestones.map((m, rowIndex) => {
      const key = m.milestone.trim()
      const streams = workstreamsForMilestoneRowIndex(rowIndex)
      const d = parseYmd(m.release_date)
      return {
        key: m.milestone,
        milestone: key,
        dateStr: d ? formatDisplayDate(d) : '—',
        configs: m.configs,
        status: m.status,
        workstreamNames: streams.map((w) => w.name),
      }
    })
  }, [])

  return (
    <>
      <header className="pr-10" style={{ marginBottom: 0 }}>
        <h2 id="gantt-milestone-plan-title" className="m-0 text-[18px] font-medium leading-snug" style={{ color: '#F0EEE9' }}>
          2026 milestone plan
        </h2>
        <p className="m-0 mt-1 text-[13px] leading-snug" style={{ color: '#555553' }}>
          Network GA release schedule
        </p>
      </header>
      <div style={{ borderTop: '1px solid #2A2A2A', marginTop: 16, marginBottom: 24 }} aria-hidden />

      <table className="w-full border-collapse" style={{ tableLayout: 'auto', width: '100%' }}>
        <thead>
          <tr style={{ height: 40, borderBottom: '1px solid #2A2A2A' }}>
            <th className="text-left font-medium" style={{ minWidth: 72, fontSize: 10, color: '#555553', padding: '0 8px 8px 0' }}>
              Milestone
            </th>
            <th className="text-left font-medium" style={{ minWidth: 112, fontSize: 10, color: '#555553', padding: '0 8px 8px 0' }}>
              Release date
            </th>
            <th className="text-left font-medium" style={{ minWidth: 220, fontSize: 10, color: '#555553', padding: '0 8px 8px 0' }}>
              Supported configs
            </th>
            <th className="text-left font-medium" style={{ minWidth: 108, fontSize: 10, color: '#555553', padding: '0 8px 8px 0' }}>
              Design status
            </th>
            <th className="text-left font-medium" style={{ minWidth: 200, fontSize: 10, color: '#555553', padding: '0 0 8px 0' }}>
              Design workstreams
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.key}
              style={{
                height: 52,
                borderBottom: i < rows.length - 1 ? '1px solid #2A2A2A' : undefined,
                verticalAlign: 'middle',
              }}
            >
              <td className="align-middle font-medium" style={{ fontSize: 13, color: '#F0EEE9', paddingRight: 8 }}>
                {row.milestone}
              </td>
              <td className="align-middle tabular-nums" style={{ fontSize: 12, color: '#888780', paddingRight: 8 }}>
                {row.dateStr}
              </td>
              <td className="align-middle" style={{ fontSize: 12, color: '#888780', paddingRight: 8, wordBreak: 'break-word' }}>
                {row.configs.trim() ? row.configs : '—'}
              </td>
              <td className="align-middle" style={{ paddingRight: 8 }}>
                <span
                  className="inline-flex max-w-full items-center rounded-[20px] px-2 py-0.5 text-[10px] font-medium leading-none"
                  style={milestoneDrawerPillStyle(row.status)}
                >
                  {milestoneMapStatusLabel(row.status)}
                </span>
              </td>
              <td className="align-middle" style={{ paddingRight: 0 }}>
                <WorkstreamsListCell names={row.workstreamNames} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="m-0 mt-6 text-[11px] leading-snug" style={{ color: '#555553' }}>
        All milestone dates shifted +45 days from original plan to reflect current M0 target release date.
      </p>
    </>
  )
}

function detailDrawerContentKey(d: GanttDetailDrawerState): string {
  return d.kind === 'workstream' ? `ws:${d.ws.id}` : `ph:${d.ws.id}:${d.phase.id}`
}

type GanttDrawersProps = {
  detail: GanttDetailDrawerState | null
  overlay: GanttOverlayMode | null
  statusTones: Record<WorkstreamStatus, StatusTones>
  onCloseDetail: () => void
  onCloseOverlay: () => void
  onOpenMilestonesFromDetail: () => void
  onDetailNavigate: (next: GanttDetailDrawerState) => void
}

export function GanttDrawers({
  detail,
  overlay,
  statusTones,
  onCloseDetail,
  onCloseOverlay,
  onOpenMilestonesFromDetail,
  onDetailNavigate,
}: GanttDrawersProps) {
  const [detailExiting, setDetailExiting] = useState(false)
  const [overlayExiting, setOverlayExiting] = useState(false)
  const detailClosingRef = useRef(false)
  const overlayClosingRef = useRef(false)

  const runCloseDetail = useCallback(() => {
    if (detailClosingRef.current || detail == null) return
    detailClosingRef.current = true
    setDetailExiting(true)
    window.setTimeout(() => {
      detailClosingRef.current = false
      setDetailExiting(false)
      onCloseDetail()
    }, SHELL.animMs)
  }, [detail, onCloseDetail])

  const runCloseOverlay = useCallback(() => {
    if (overlayClosingRef.current || overlay == null) return
    overlayClosingRef.current = true
    setOverlayExiting(true)
    window.setTimeout(() => {
      overlayClosingRef.current = false
      setOverlayExiting(false)
      onCloseOverlay()
    }, SHELL.animMs)
  }, [overlay, onCloseOverlay])

  useEffect(() => {
    if (detail == null && overlay == null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (overlay) runCloseOverlay()
      else runCloseDetail()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [detail, overlay, runCloseDetail, runCloseOverlay])

  return (
    <>
      <style>
        {`
@keyframes gantt-detail-content-swap {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@media (prefers-reduced-motion: reduce) {
  @keyframes gantt-detail-content-swap {
    from {
      opacity: 1;
      transform: none;
    }
    to {
      opacity: 1;
      transform: none;
    }
  }
}
`}
      </style>
      {detail != null ? (
        <DrawerShell
          width={360}
          zIndex={40}
          backgroundColor={PANEL_BG}
          borderColor={PANEL_BORDER}
          padding={16}
          variant="light"
          open={detail != null && !detailExiting}
          onClose={runCloseDetail}
          data-testid="gantt-drawer-detail"
        >
          <div
            key={detailDrawerContentKey(detail)}
            style={{
              animation: 'gantt-detail-content-swap 150ms cubic-bezier(0.22, 1, 0.36, 1) both',
            }}
          >
            <GanttDetailDrawerContent
              state={detail}
              statusTones={statusTones}
              onOpenMilestones={onOpenMilestonesFromDetail}
              onDetailNavigate={onDetailNavigate}
            />
          </div>
        </DrawerShell>
      ) : null}

      {overlay === 'milestones' ? (
        <DrawerShell
          width={MILESTONE_DRAWER_WIDTH}
          zIndex={45}
          backgroundColor="#212121"
          borderColor="#2A2A2A"
          padding={32}
          variant="dark"
          open={overlay != null && !overlayExiting}
          onClose={runCloseOverlay}
          data-testid="gantt-drawer-milestones"
        >
          <GanttMilestoneDrawerBody />
        </DrawerShell>
      ) : null}
    </>
  )
}
