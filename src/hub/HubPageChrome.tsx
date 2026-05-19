import type { ReactNode } from 'react'
import { HUB, HUB_FONT } from './hubTheme'

export default function HubPageChrome({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <div
      className="mx-auto w-full"
      style={{
        maxWidth: HUB.contentMax,
        padding: `${HUB.contentPadY}px ${HUB.contentPadX}px`,
        fontFamily: HUB_FONT,
      }}
    >
      <header style={{ marginBottom: 32 }}>
        <h1 className="text-[22px] font-medium leading-tight" style={{ color: HUB.title }}>
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-[13px] leading-snug" style={{ color: HUB.subtitle }}>
            {subtitle}
          </p>
        ) : null}
      </header>
      {children}
    </div>
  )
}
