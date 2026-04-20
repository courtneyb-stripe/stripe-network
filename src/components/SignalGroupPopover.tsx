/**
 * Popover for header signal group chips — anchored below the pill row.
 *
 * **Shared mode** (account header): one portal, `left: 0` + `transform: translateX(x)` so the shell
 * slides along X; content swaps immediately. **Legacy mode**: single `anchorEl`, fixed top/left.
 */

import type { CSSProperties, ReactNode } from 'react'
import { useLayoutEffect, useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

import {
  SIGNAL_GROUP_POPOVER_INNER_CLASS,
  SIGNAL_GROUP_POPOVER_SHELL_CLASS,
} from './PaymentsPopoverPanel'

/** Vertical gap between pill row and popover; keep in sync with header measurement. */
export const SIGNAL_GROUP_POPOVER_ANCHOR_GAP_PX = 4
const SHARED_SHELL_TRANSITION = 'transform 100ms linear, height 100ms linear'

export type SignalGroupSharedPlacement = {
  /** Viewport X passed to translateX (pill left edge). */
  translateX: number
  /** Viewport Y for fixed `top` (row bottom + gap). */
  top: number
}

type SignalGroupPopoverProps = {
  open: boolean
  onClose: () => void
  /** Dialog label (e.g. signal group chip name). */
  title: string
  /** When set, replaces default heading + placeholder (e.g. Payments Figma panel). */
  children?: ReactNode
  /** Current pill id when open — body content key. */
  activeContentId?: string | null
  /** Panel body by pill id (shared mode). */
  renderBody?: (id: string) => ReactNode
  /**
   * Single shared popover: viewport `top` + `translateX` from measured pill positions.
   * When set, `anchorEl` is ignored.
   */
  sharedPlacement?: SignalGroupSharedPlacement | null
  /** For outside-click: true if target is inside the signal pill row (any pill). */
  isTargetInsidePillRow?: (node: Node) => boolean
  /** Legacy: single anchor (e.g. components demo). Ignored when `sharedPlacement` is set. */
  anchorEl?: HTMLElement | null
  /** Keep popover open when pointer moves from anchor into panel (bridge gap). */
  onPointerEnter?: () => void
  /** Schedule close when pointer leaves panel (parent uses delay from anchor leave). */
  onPointerLeave?: () => void
}

export default function SignalGroupPopover({
  open,
  onClose,
  title,
  children,
  activeContentId = null,
  renderBody,
  sharedPlacement = null,
  isTargetInsidePillRow,
  anchorEl = null,
  onPointerEnter,
  onPointerLeave,
}: SignalGroupPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null)
  const sharedContentInnerRef = useRef<HTMLDivElement>(null)
  const sharedLastHeightRef = useRef(0)
  const sharedPrevContentIdRef = useRef<string | null>(null)
  const [sharedPanelHeight, setSharedPanelHeight] = useState<number | null>(null)

  const useShared =
    sharedPlacement != null &&
    typeof sharedPlacement.translateX === 'number' &&
    typeof sharedPlacement.top === 'number'

  const [anchorPos, setAnchorPos] = useState({ top: 0, left: 0 })

  const updateAnchorPos = useCallback(() => {
    if (!anchorEl || useShared) return
    const rect = anchorEl.getBoundingClientRect()
    setAnchorPos({ top: rect.bottom + SIGNAL_GROUP_POPOVER_ANCHOR_GAP_PX, left: rect.left })
  }, [anchorEl, useShared])

  useLayoutEffect(() => {
    if (!open || useShared) return
    updateAnchorPos()
  }, [open, anchorEl, updateAnchorPos, useShared])

  useEffect(() => {
    if (!open || useShared) return
    const onScrollOrResize = () => updateAnchorPos()
    window.addEventListener('scroll', onScrollOrResize, true)
    window.addEventListener('resize', onScrollOrResize)
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true)
      window.removeEventListener('resize', onScrollOrResize)
    }
  }, [open, updateAnchorPos, useShared])

  useEffect(() => {
    if (!open) return
    const onDocMouseDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (popoverRef.current?.contains(t)) return
      if (useShared) {
        if (isTargetInsidePillRow?.(t)) return
      } else if (anchorEl?.contains(t)) {
        return
      }
      onClose()
    }
    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [open, onClose, anchorEl, useShared, isTargetInsidePillRow])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useLayoutEffect(() => {
    if (!open || !useShared) {
      sharedPrevContentIdRef.current = null
      sharedLastHeightRef.current = 0
      setSharedPanelHeight(null)
      return
    }
    if (!activeContentId || !renderBody || !sharedContentInnerRef.current) return

    const inner = sharedContentInnerRef.current
    const toH = Math.ceil(inner.getBoundingClientRect().height)
    const prevId = sharedPrevContentIdRef.current
    const idChanged = prevId !== null && prevId !== activeContentId

    if (!idChanged) {
      setSharedPanelHeight(toH)
      sharedLastHeightRef.current = toH
      sharedPrevContentIdRef.current = activeContentId
      return
    }

    const fromH = sharedLastHeightRef.current
    setSharedPanelHeight(fromH)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setSharedPanelHeight(toH)
        sharedLastHeightRef.current = toH
        sharedPrevContentIdRef.current = activeContentId
      })
    })
  }, [open, useShared, activeContentId, renderBody])

  if (!open) return null

  const hasCustomBodyLegacy = !useShared && children != null

  const sharedShellStyle: CSSProperties = useShared
    ? {
        position: 'fixed',
        left: 0,
        top: sharedPlacement!.top,
        transform: `translate3d(${sharedPlacement!.translateX}px, 0, 0)`,
        transition: SHARED_SHELL_TRANSITION,
        zIndex: 10000,
        overflow: 'visible',
        height: sharedPanelHeight ?? undefined,
        boxSizing: 'border-box',
      }
    : {}

  const legacyShellStyle: CSSProperties =
    !useShared && anchorEl
      ? {
          position: 'fixed',
          top: anchorPos.top,
          left: anchorPos.left,
          zIndex: 10000,
        }
      : {}

  if (useShared) {
    if (!activeContentId || !renderBody) return null
    return createPortal(
      <div
        ref={popoverRef}
        role="dialog"
        aria-label={title}
        className="w-[360px] max-w-[calc(100vw-24px)]"
        style={sharedShellStyle}
        onMouseEnter={onPointerEnter}
        onMouseLeave={onPointerLeave}
      >
        <div ref={sharedContentInnerRef} className="w-[360px] max-w-[calc(100vw-24px)]">
          {renderBody(activeContentId)}
        </div>
      </div>,
      document.body
    )
  }

  if (!anchorEl) return null

  return createPortal(
    <div
      ref={popoverRef}
      role="dialog"
      aria-label={title}
      className={hasCustomBodyLegacy ? 'fixed z-[10000]' : `fixed z-[10000] ${SIGNAL_GROUP_POPOVER_SHELL_CLASS}`}
      style={legacyShellStyle}
      onMouseEnter={onPointerEnter}
      onMouseLeave={onPointerLeave}
    >
      {hasCustomBodyLegacy ? (
        children
      ) : (
        <div className={SIGNAL_GROUP_POPOVER_INNER_CLASS}>
          <h3 className="m-0 font-label-medium text-[14px] leading-5 text-default">{title}</h3>
          <p className="m-0 mt-1 font-label-small leading-4 text-[#50617a]">Popover content coming soon</p>
        </div>
      )}
    </div>,
    document.body
  )
}
