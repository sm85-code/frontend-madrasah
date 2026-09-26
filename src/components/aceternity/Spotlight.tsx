import { motion } from 'framer-motion'
import { cn } from '../../lib/cn'

/** Aceternity-style "Spotlight": a large soft radial glow that fades in
 * behind hero content. Pure CSS gradient + one entrance animation --
 * intentionally NOT a mouse-follow/canvas effect, so it costs nothing on
 * the low-end Android phones this app is mostly used on (see PortalLayout
 * mobile-nav fix -- most real usage here is a phone in one hand). */
export function Spotlight({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      aria-hidden="true"
    >
      <div
        className="absolute left-1/2 top-[-10%] h-[60rem] w-[60rem] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(20,184,166,0.35) 0%, rgba(15,118,110,0.15) 35%, transparent 70%)',
        }}
      />
      <div
        className="absolute left-[15%] top-[20%] h-[30rem] w-[30rem] rounded-full opacity-30 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(45,212,191,0.3) 0%, transparent 70%)',
        }}
      />
    </motion.div>
  )
}
