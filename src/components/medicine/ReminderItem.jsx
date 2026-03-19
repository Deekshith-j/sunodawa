import { motion } from 'framer-motion'

export default function ReminderItem({ reminder, onToggle, onDelete }) {
  const { medicineName, time, dose, active } = reminder

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="rounded-2xl px-4 py-4 flex items-center gap-4"
      style={{
        backdropFilter: 'blur(12px)',
        background: active ? 'rgba(0,229,255,0.05)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${active ? 'rgba(0,229,255,0.2)' : 'rgba(255,255,255,0.06)'}`,
      }}
    >
      {/* Time + Medicine */}
      <div className="flex-1 min-w-0">
        <p className="font-mono font-semibold text-lg" style={{ color: active ? '#00E5FF' : '#7BB8D4' }}>
          {time}
        </p>
        <p className="font-sans font-medium text-sm text-text-primary truncate">
          {medicineName}
        </p>
        <p className="font-sans text-xs text-text-secondary mt-0.5">{dose}</p>
      </div>

      {/* Toggle */}
      <button
        onClick={() => onToggle(reminder.id)}
        className="relative rounded-full flex-shrink-0 focus:outline-none"
        style={{ width: 52, height: 28 }}
        aria-label="Toggle reminder"
      >
        <div
          className="absolute inset-0 rounded-full transition-all duration-300"
          style={{
            background: active ? '#00E5FF' : 'rgba(255,255,255,0.1)',
            boxShadow: active ? '0 0 12px rgba(0,229,255,0.5)' : 'none',
          }}
        />
        <div
          className="absolute top-1 rounded-full transition-all duration-300"
          style={{
            width: 20,
            height: 20,
            background: active ? '#050B18' : '#7BB8D4',
            left: active ? 28 : 4,
          }}
        />
      </button>

      {/* Delete */}
      <button
        onClick={() => onDelete(reminder.id)}
        className="p-2 rounded-xl flex-shrink-0"
        style={{ color: '#FF4444', background: 'rgba(255,68,68,0.08)' }}
        aria-label="Delete reminder"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </motion.div>
  )
}
