/**
 * Simple label tooltip — Figma 13:6299 (Plain Tooltip).
 * Dark wrapper, 6px horizontal / 4px vertical padding, 4px radius.
 * Renders in a portal with fixed positioning and high z-index so it is never clipped by overflow. Default placement: above (so dropdowns below don’t cover it).
 */

import { useState, useRef, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'

export type TooltipPlacement = 'top' | 'bottom' | 'right' | 'left'

const TOOLTIP_OFFSET = 4
const TOOLTIP_Z_INDEX = 9999

type LabelTooltipProps = {
  children: React.ReactNode
  label: string
  tooltipId: string
  /** Placement relative to trigger. Default: 'top' (above) so dropdowns don't cover tooltip. */
  placement?: TooltipPlacement
  /** Dark (default) or light/white tooltip panel. */
  variant?: 'dark' | 'light'
  /** When set, controls visibility (e.g. show "Copied!" after click). undefined = hover only. */
  open?: boolean
  /** Optional max-width (px) for tooltip content. Use for light variant when label should wrap to a specific line count (e.g. 320 for two lines). */
  maxWidth?: number
}

/** Sail description tooltip — Figma 35:12077 / 35:12081. */
const DESCRIPTION_STYLE = {
  backgroundColor: 'var(--background-surface, #FFFFFF)',
  border: '1px solid var(--border-default, #D4DEE9)',
  borderRadius: 8,
  padding: 16,
  boxShadow: '0px 2px 5px 0px rgba(64,68,82,0.08), 0px 3px 9px 0px rgba(64,68,82,0.08)',
  color: 'var(--text-default, #1A2C44)',
  fontSize: 14,
  lineHeight: 1.43,
  letterSpacing: '-0.15px',
  maxWidth: 300,
  whiteSpace: 'pre-wrap' as const,
} as const

const TOOLTIP_STYLES = {
  dark: {
    padding: '4px 6px',
    borderRadius: 4,
    backgroundColor: '#322F35',
    color: '#F5EFF7',
    fontSize: 12,
    lineHeight: 1.2,
    whiteSpace: 'nowrap' as const,
  },
  light: DESCRIPTION_STYLE,
} as const

export default function LabelTooltip({
  children,
  label,
  tooltipId,
  placement = 'top',
  variant = 'dark',
  open: openControlled,
  maxWidth: maxWidthProp,
}: LabelTooltipProps) {
  const [visible, setVisible] = useState(false)
  const [coords, setCoords] = useState<{ left: number; top: number } | null>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const isVisible = openControlled === true || (openControlled == null && visible)

  useLayoutEffect(() => {
    if (!isVisible || !triggerRef.current) {
      setCoords(null)
      return
    }
    const rect = triggerRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    if (placement === 'right') {
      setCoords({ left: rect.right + TOOLTIP_OFFSET, top: centerY })
    } else if (placement === 'left') {
      setCoords({ left: rect.left - TOOLTIP_OFFSET, top: centerY })
    } else {
      const isTop = placement === 'top'
      setCoords({
        left: centerX,
        top: isTop ? rect.top : rect.bottom,
      })
    }
  }, [isVisible, placement])

  const getTooltipTransform = () => {
    if (placement === 'right') return 'translateY(-50%)'
    if (placement === 'left') return 'translate(-100%, -50%)'
    const isTop = placement === 'top'
    return isTop ? 'translate(-50%, -100%)' : 'translateX(-50%)'
  }

  const getTooltipPosition = () => {
    if (coords == null) return { left: 0, top: 0 }
    if (placement === 'right') {
      return { left: coords.left, top: coords.top }
    }
    if (placement === 'left') {
      return { left: coords.left, top: coords.top }
    }
    const isTop = placement === 'top'
    return {
      left: coords.left,
      top: isTop ? coords.top - TOOLTIP_OFFSET : coords.top + TOOLTIP_OFFSET,
    }
  }

  const tooltipStyle = {
    position: 'fixed' as const,
    ...getTooltipPosition(),
    transform: getTooltipTransform(),
    ...TOOLTIP_STYLES[variant],
    pointerEvents: 'none' as const,
    zIndex: TOOLTIP_Z_INDEX,
    ...(maxWidthProp != null && { maxWidth: maxWidthProp }),
  }

  const tooltipEl =
    isVisible && coords != null ? (
      <div
        id={tooltipId}
        role="tooltip"
        data-name={variant === 'light' ? 'Type=Description' : undefined}
        data-node-id={variant === 'light' ? '35:12077' : undefined}
        style={tooltipStyle}
      >
        {label}
      </div>
    ) : null

  return (
    <>
      <div
        ref={triggerRef}
        style={{ position: 'relative', display: 'inline-block' }}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      >
        {children}
      </div>
      {tooltipEl != null && createPortal(tooltipEl, document.body)}
    </>
  )
}
