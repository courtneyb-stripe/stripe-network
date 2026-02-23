/**
 * Sail Link — Primary or secondary link. Matches Sail UI API.
 */

export type LinkType = 'primary' | 'secondary'

type SailLinkProps = {
  type?: LinkType
  href: string
  children: React.ReactNode
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>

const TYPE_CLASSES: Record<LinkType, string> = {
  primary: 'text-action-primary underline hover:no-underline',
  secondary: 'text-subdued underline hover:text-default hover:no-underline',
}

export function Link({
  type = 'primary',
  href,
  children,
  className = '',
  ...props
}: SailLinkProps) {
  return (
    <a
      href={href}
      className={`focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary rounded-[length:var(--radius-xsmall)] ${TYPE_CLASSES[type]} ${className}`.trim()}
      {...props}
    >
      {children}
    </a>
  )
}
