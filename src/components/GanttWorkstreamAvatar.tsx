import { useState } from 'react'
import type { Workstream } from '../data/ganttData'
import { ganttAvatarHandleInitials, ganttAvatarSrcForDri } from '../data/ganttData'

const INITIALS_TEXT = '#1A1A1A'

export type GanttWorkstreamAvatarSize = 'tooltip' | 'panel' | 'drawer'

const SIZE_PX: Record<GanttWorkstreamAvatarSize, number> = {
  tooltip: 28,
  panel: 28,
  drawer: 32,
}

type GanttWorkstreamAvatarProps = {
  ws: Workstream
  barColor: string
  size?: GanttWorkstreamAvatarSize
}

/** Roadmap DRI avatar: photo when mapped, else initials on status-colored circle. */
export function GanttWorkstreamAvatar({ ws, barColor, size = 'panel' }: GanttWorkstreamAvatarProps) {
  const px = SIZE_PX[size]
  const src = ganttAvatarSrcForDri(ws.dri)
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-full font-semibold"
        style={{
          width: px,
          height: px,
          fontSize: px <= 28 ? 11 : 12,
          backgroundColor: barColor,
          color: INITIALS_TEXT,
        }}
      >
        {ganttAvatarHandleInitials(ws.dri)}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt=""
      width={px}
      height={px}
      className="shrink-0 rounded-full object-cover"
      style={{ width: px, height: px }}
      onError={() => setFailed(true)}
    />
  )
}
