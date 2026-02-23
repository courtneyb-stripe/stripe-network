/**
 * Sail Accordion — Container for AccordionItem. Matches Sail UI API.
 * Use for expandable sections (title, optional subtitle, optional tooltip, panel). Chevron 12px left of title.
 */

type AccordionProps = {
  children: React.ReactNode
  className?: string
}

export function Accordion({ children, className = '' }: AccordionProps) {
  return (
    <div className={`flex min-w-0 flex-col gap-4 ${className}`.trim()} role="list">
      {children}
    </div>
  )
}

export { AccordionItem } from './AccordionItem'
