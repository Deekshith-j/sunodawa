import { motion } from 'framer-motion'
import GlassCard from '../ui/GlassCard'

const ICONS = {
  pill: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
      <path d="M19.14 4.86a5 5 0 00-7.07 0L4.86 12.07a5 5 0 007.07 7.07l7.21-7.21a5 5 0 000-7.07z" strokeLinecap="round"/>
      <path d="M11.5 8.5l4 4" strokeLinecap="round"/>
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
      <circle cx="12" cy="12" r="9"/>
      <path d="M12 7v5l3 3" strokeLinecap="round"/>
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round"/>
    </svg>
  ),
  food: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
      <path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 9v4M12 17h.01" strokeLinecap="round"/>
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
      <circle cx="12" cy="12" r="9"/>
      <path d="M12 16v-4M12 8h.01" strokeLinecap="round"/>
    </svg>
  ),
}

const COLOR_MAP = {
  cyan: { icon: '#00E5FF', bg: 'rgba(0,229,255,0.05)', label: '#7BB8D4' },
  green: { icon: '#39FF14', bg: 'rgba(57,255,20,0.05)', label: '#7BB8D4' },
  amber: { icon: '#FFB300', bg: 'rgba(255,179,0,0.05)', label: '#FFB300' },
  red: { icon: '#FF4444', bg: 'rgba(255,68,68,0.05)', label: '#FF9090' },
}

export default function MedicineCard({ label, value, icon = 'info', color = 'cyan', delay = 0 }) {
  const c = COLOR_MAP[color]
  const IconEl = ICONS[icon]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: 'easeOut' }}
    >
      <GlassCard glowColor={color} className="flex items-start gap-4 py-4">
        <div
          className="rounded-xl p-2.5 flex-shrink-0"
          style={{ background: c.bg, color: c.icon }}
        >
          {IconEl}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold font-sans uppercase tracking-wider mb-1"
            style={{ color: c.label }}>
            {label}
          </p>
          <p className="font-sans font-medium text-text-primary leading-snug" style={{ fontSize: 16 }}>
            {value}
          </p>
        </div>
      </GlassCard>
    </motion.div>
  )
}
