// ResultMedicineScene — SVG medicine type illustration (replaces Three.js)
import { motion } from 'framer-motion'

const ICONS = {
  tablet:  { emoji: '💊', label: 'Tablet', color: '#1A6FDB', bg: '#EBF3FF' },
  capsule: { emoji: '💊', label: 'Capsule', color: '#7C3AED', bg: '#EDE9FE' },
  syrup:   { emoji: '🧪', label: 'Syrup', color: '#16C784', bg: '#D1FAE5' },
  injection: { emoji: '💉', label: 'Injection', color: '#EF4444', bg: '#FEE2E2' },
  drops:   { emoji: '💧', label: 'Drops', color: '#4CA3F5', bg: '#EBF3FF' },
  cream:   { emoji: '🧴', label: 'Cream', color: '#F59E0B', bg: '#FEF3C7' },
  other:   { emoji: '⚕️', label: 'Medicine', color: '#1A6FDB', bg: '#EBF3FF' },
}

export default function ResultMedicineScene({ medicineType = 'tablet', height = 110 }) {
  const info = ICONS[medicineType?.toLowerCase()] || ICONS.other
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{ width: height, height, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
    >
      <motion.div
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          width: height - 10, height: height - 10, borderRadius: '50%',
          background: info.bg, border: `2px solid ${info.color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
          boxShadow: `0 4px 16px ${info.color}20`,
        }}
      >
        <span style={{ fontSize: (height - 10) * 0.44 }}>{info.emoji}</span>
        <span style={{ fontSize: 9, fontFamily: 'var(--font-body)', fontWeight: 600, color: info.color, marginTop: 2 }}>{info.label}</span>
      </motion.div>
    </motion.div>
  )
}
