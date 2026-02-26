/**
 * PrototypeFloatie — Collapsible GUI to control prototype options.
 * Floats bottom-left; trigger is IconButton (floatieTrigger variant) with settings icon.
 * Panel uses whites, light grays, standard dark gray text. Not in component inventory.
 */

import { useState, useRef, useEffect } from 'react'
import { Icon } from '../icons/SailIcons'
import { IconButton } from './IconButton'
import { usePrototypeOptional } from '../context/PrototypeContext'
import { FIDELITY_OPTIONS, type FidelityId } from '../context/PrototypeContext'

export default function PrototypeFloatie() {
  const [open, setOpen] = useState(false)
  const prototype = usePrototypeOptional()
  const containerRef = useRef<HTMLDivElement>(null)
  const hasContext = prototype != null

  useEffect(() => {
    if (!open) return
    const handleMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [open])

  return (
    <div
      ref={containerRef}
      className="fixed bottom-6 left-6 z-[9999] flex flex-col items-start gap-2"
      data-name="PrototypeFloatie"
    >
      {open && (
        <div
          className="flex min-w-[220px] flex-col gap-3 rounded-[12px] border border-neutral-100 bg-white px-4 py-3 shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
          data-name="PrototypeFloatie-panel"
        >
          <p className="font-label-medium-emphasized text-[var(--color-default)]">
            Prototype options
          </p>
          {hasContext ? (
            <div className="flex flex-col gap-3 border-t border-neutral-100 pt-3">
              <label
                htmlFor="prototype-fidelity"
                className="text-[12px] leading-4 font-label-medium-emphasized text-[var(--color-default)]"
              >
                Fidelity
              </label>
              <select
                id="prototype-fidelity"
                value={prototype!.fidelity}
                onChange={(e) => prototype!.setFidelity(e.target.value as FidelityId)}
                className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-[14px] leading-5 text-[var(--color-default)] focus:border-action-primary focus:outline-none focus:ring-1 focus:ring-action-primary"
                data-name="PrototypeFloatie-fidelity"
              >
                {FIDELITY_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <p className="border-t border-neutral-100 pt-3 text-[12px] leading-4 text-[var(--color-subdued)]">
              Unavailable. Refresh the page.
            </p>
          )}
        </div>
      )}
      <IconButton
        label="Prototype options"
        tooltipId="prototype-floatie-tooltip"
        variant="floatieTrigger"
        tooltipPlacement="right"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <Icon name="settings" size={16} fill="white" />
      </IconButton>
    </div>
  )
}
