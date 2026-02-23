/**
 * PropertyList capability variant — Figma baby/prop-list (node 1413-35584).
 * Single row: icon + title; indented description + link; trailing action button.
 */

import { Link } from './Link'

type PropertyListCapabilityItemProps = {
  /** Status/type icon (e.g. checkCircleFilled, or paused icon). */
  icon: React.ReactNode
  /** Capability name (e.g. "Card payments"). */
  title: string
  /** Optional body text below title, indented. */
  description?: string
  /** Optional doc link href. */
  linkHref?: string
  /** Link label (e.g. "Read docs"). Shown only when linkHref is set. */
  linkLabel?: string
  /** Trailing action (e.g. Remove button). */
  action: React.ReactNode
}

export function PropertyListCapabilityItem({
  icon,
  title,
  description,
  linkHref,
  linkLabel = 'Read docs',
  action,
}: PropertyListCapabilityItemProps) {
  return (
    <div
      className="flex gap-4 items-start w-full min-w-0"
      data-name="PropertyListCapabilityItem"
    >
      <div className="flex flex-1 flex-col gap-0.5 items-start min-w-0 min-h-0" data-name="baby/prop-list">
        <div className="flex gap-2 items-center w-full min-w-0">
          <span className="shrink-0 flex items-center justify-center" aria-hidden>
            {icon}
          </span>
          <p className="flex-1 min-w-0 font-label-medium-emphasized text-[14px] leading-5 tracking-[-0.15px] text-subdued truncate">
            {title}
          </p>
        </div>
        {(description != null || linkHref != null) && (
          <div className="flex flex-col gap-2 pl-5 w-full min-w-0">
            {description != null && (
              <p className="font-label-medium text-[14px] leading-5 tracking-[-0.15px] text-subdued w-full min-w-0">
                {description}
              </p>
            )}
            {linkHref != null && (
              <Link href={linkHref} type="primary">
                {linkLabel}
              </Link>
            )}
          </div>
        )}
      </div>
      <div className="shrink-0">
        {action}
      </div>
    </div>
  )
}
