import { type MouseEvent, type ReactNode, useRef } from 'react'
import { cn } from '../../lib/cn'

/** Aceternity-style mouse-tracking spotlight on a card border. CSS custom
 * properties updated on pointer move, masked with a radial-gradient --
 * cheap (no re-render per mouse move, just a style write) and only wired
 * up for pointer devices; touch/mobile gets the plain card look via the
 * `group-[]` fallback (no JS listener fires, nothing to disable). */
export function CardSpotlight({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--spotlight-x', `${e.clientX - rect.left}px`)
    el.style.setProperty('--spotlight-y', `${e.clientY - rect.top}px`)
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={cn(
        'group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm',
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(400px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), rgba(15,118,110,0.08), transparent 70%)',
        }}
      />
      <div className="relative">{children}</div>
    </div>
  )
}
