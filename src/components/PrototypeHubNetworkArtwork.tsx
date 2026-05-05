import { useCallback, useEffect, useRef, useState } from 'react'

/** Figma 160:13323 — `public/network-art.svg` + node pulses, ripple, subtle pointer follow. */
const HUB_NODE_DOTS: { left: string; bottom: string; delay: string }[] = [
  { left: '6%', bottom: '4%', delay: '0s' },
  { left: '14%', bottom: '11%', delay: '0.35s' },
  { left: '22%', bottom: '18%', delay: '0.7s' },
  { left: '32%', bottom: '26%', delay: '1.05s' },
  { left: '42%', bottom: '32%', delay: '1.4s' },
  { left: '50%', bottom: '35%', delay: '1.75s' },
  { left: '58%', bottom: '32%', delay: '2.1s' },
  { left: '68%', bottom: '26%', delay: '2.45s' },
  { left: '78%', bottom: '18%', delay: '2.8s' },
  { left: '86%', bottom: '11%', delay: '3.15s' },
  { left: '92%', bottom: '4%', delay: '3.5s' },
  { left: '50%', bottom: '8%', delay: '3.85s' },
]

export default function PrototypeHubNetworkArtwork() {
  const [nudge, setNudge] = useState({ x: 0, y: 0 })
  const raf = useRef(0)
  const last = useRef(0)
  const reduced = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  const onPointer = useCallback((e: PointerEvent) => {
    if (reduced.current) return
    const now = e.timeStamp
    if (now - last.current < 32) return
    last.current = now
    if (raf.current) cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(() => {
      const w = window.innerWidth
      const h = window.innerHeight
      if (w < 1 || h < 1) return
      setNudge({
        x: (e.clientX / w - 0.5) * 20,
        y: (e.clientY / h - 0.5) * 14,
      })
    })
  }, [])

  useEffect(() => {
    if (reduced.current) return
    window.addEventListener('pointermove', onPointer, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onPointer)
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [onPointer])

  return (
    <div
      className="pointer-events-none absolute bottom-0 left-0 right-0 z-[1] flex h-[min(50vh,560px)] max-h-[560px] min-h-[220px] justify-center overflow-hidden"
      data-name="Hub network artwork"
      aria-hidden
    >
      <div
        className="hub-network-art-layer relative h-full w-full max-w-[1600px] transition-transform duration-500 ease-out will-change-transform [mask-image:linear-gradient(to_top,_black_0%,_black_55%,_transparent_100%)]"
        style={
          reduced.current
            ? undefined
            : { transform: `translate3d(${nudge.x}px, ${nudge.y}px, 0)` }
        }
      >
        <div
          className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 motion-reduce:hidden"
          aria-hidden
        >
          <div
            className="hub-network-ripple-ring h-[min(100vw,1200px)] w-[min(100vw,1200px)] rounded-full border border-[#9498F6]/25 bg-transparent shadow-[0_0_60px_1px_rgba(148,152,246,0.12)] [animation-delay:2s] motion-reduce:animate-none"
          />
        </div>
        <img
          src="/network-art.svg"
          alt=""
          className="relative z-[1] h-full w-full object-contain object-bottom mix-blend-color-burn"
          decoding="async"
        />
        <div
          className="pointer-events-none absolute inset-0 z-[2] motion-reduce:hidden"
          aria-hidden
        >
          {HUB_NODE_DOTS.map((n, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: n.left,
                bottom: n.bottom,
                transform: 'translate(-50%, 50%)',
              }}
            >
              <span
                className="hub-node-dot block h-1.5 w-1.5 rounded-full bg-[#9498F6] opacity-90 shadow-[0_0_8px_rgba(148,152,246,0.45)]"
                style={{ animationDelay: n.delay }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
