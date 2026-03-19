// MedicineHeroScene — SVG/CSS medical illustration (replaces Three.js 3D scene)
import { motion } from 'framer-motion'

export default function MedicineHeroScene({ height = 180 }) {
  return (
    <div style={{
      width: '100%', height, display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(135deg, #EBF3FF 0%, #F0F6FF 50%, #E8F1FC 100%)',
      borderRadius: 20,
      border: '1.5px solid rgba(26,111,219,0.1)',
    }}>
      {/* Floating decoration circles */}
      <motion.div
        animate={{ y: [-6, 6, -6], rotate: [0, 5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: 18, right: 24,
          width: 60, height: 60, borderRadius: '50%',
          background: 'rgba(26,111,219,0.08)',
          border: '1.5px solid rgba(26,111,219,0.15)',
        }}
      />
      <motion.div
        animate={{ y: [4, -4, 4], rotate: [0, -8, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        style={{
          position: 'absolute', bottom: 14, left: 20,
          width: 44, height: 44, borderRadius: '50%',
          background: 'rgba(22,199,132,0.1)',
          border: '1.5px solid rgba(22,199,132,0.2)',
        }}
      />

      {/* Central medical cross + stethoscope SVG */}
      <motion.div
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}
      >
        <div style={{ position: 'relative' }}>
          {/* Pulsing ring behind icon */}
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute', inset: -12,
              borderRadius: '50%',
              border: '2px solid rgba(26,111,219,0.25)',
            }}
          />
          {/* Main icon container */}
          <div style={{
            width: 80, height: 80, borderRadius: 24,
            background: 'linear-gradient(135deg, #1A6FDB 0%, #0B4EA8 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(26,111,219,0.35), 0 2px 8px rgba(26,111,219,0.2)',
          }}>
            <svg viewBox="0 0 48 48" fill="none" width={44} height={44}>
              {/* Stethoscope */}
              <path d="M14 8H10a2 2 0 00-2 2v8a12 12 0 0012 12 12 12 0 0012-12V10a2 2 0 00-2-2h-4" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="12" y1="8" x2="12" y2="14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="20" y1="8" x2="20" y2="14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              {/* Tube */}
              <path d="M20 30a14 14 0 0014 14 14 14 0 0014-14" stroke="white" strokeWidth="2.5" strokeLinecap="round" transform="translate(-6, -2)"/>
              {/* End circle */}
              <circle cx="38" cy="38" r="4" stroke="white" strokeWidth="2.5"/>
              {/* Cross */}
              <rect x="22" y="4" width="4" height="12" rx="2" fill="rgba(255,255,255,0.3)"/>
              <rect x="18" y="8" width="12" height="4" rx="2" fill="rgba(255,255,255,0.3)"/>
            </svg>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18,
            color: 'var(--blue-primary)', letterSpacing: '-0.02em',
          }}>AI Medicine Reader</p>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-secondary)', marginTop: 2,
          }}>Scan any label in your language</p>
        </div>
      </motion.div>

      {/* Corner pills info */}
      <div style={{ position: 'absolute', top: 14, left: 14 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '4px 9px', borderRadius: 20,
          background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(26,111,219,0.15)',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green-health)' }} />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)' }}>AI Active</span>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 14, right: 14 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '4px 9px', borderRadius: 20,
          background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(22,199,132,0.2)',
        }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--green-health)', fontWeight: 600 }}>OCR + NLP</span>
        </div>
      </div>
    </div>
  )
}
