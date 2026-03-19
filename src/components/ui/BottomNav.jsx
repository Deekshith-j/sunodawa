import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

const NAV_ITEMS = [
  { path: '/home',      label: 'Home',     icon: HomeIcon },
  { path: '/scan',      label: 'Scan',     icon: ScanIcon },
  { path: '/consult',   label: 'Doctor',   icon: StethIcon },
  { path: '/reminders', label: 'Reminders',icon: BellIcon },
  { path: '/family',    label: 'Family',   icon: FamilyIcon },
]

function HomeIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" fill={active ? 'var(--blue-primary)' : 'none'} stroke={active ? 'var(--blue-primary)' : 'var(--text-muted)'} strokeWidth={1.75} width={22} height={22}>
      <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function ScanIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--blue-primary)' : 'var(--text-muted)'} strokeWidth={1.75} width={22} height={22}>
      <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}
function StethIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--purple-accent)' : 'var(--text-muted)'} strokeWidth={1.75} width={22} height={22}>
      <path d="M9 2H5a1 1 0 00-1 1v4a6 6 0 006 6 6 6 0 006-6V3a1 1 0 00-1-1h-4" strokeLinecap="round"/>
      <path d="M10 14a6 6 0 006 6 6 6 0 006-6" strokeLinecap="round"/>
      <circle cx="22" cy="14" r="2"/>
    </svg>
  )
}
function BellIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--amber-warn)' : 'var(--text-muted)'} strokeWidth={1.75} width={22} height={22}>
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round"/>
    </svg>
  )
}
function FamilyIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--green-health)' : 'var(--text-muted)'} strokeWidth={1.75} width={22} height={22}>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87" strokeLinecap="round"/>
      <path d="M16 3.13a4 4 0 010 7.75" strokeLinecap="round"/>
    </svg>
  )
}

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      height: `calc(64px + env(safe-area-inset-bottom))`,
      background: 'rgba(255,255,255,0.97)',
      backdropFilter: 'blur(20px)',
      borderTop: '1.5px solid rgba(26,111,219,0.12)',
      display: 'flex', alignItems: 'center',
      paddingBottom: 'env(safe-area-inset-bottom)',
      zIndex: 100,
      boxShadow: '0 -4px 20px rgba(26,111,219,0.08)',
    }}>
      {NAV_ITEMS.map((item) => {
        const active = location.pathname === item.path || (item.path === '/home' && location.pathname === '/')
        const Icon = item.icon
        const activeColor = item.path === '/consult' ? 'var(--purple-accent)' :
                            item.path === '/reminders' ? 'var(--amber-warn)' :
                            item.path === '/family' ? 'var(--green-health)' : 'var(--blue-primary)'
        return (
          <motion.button
            key={item.path}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 4, paddingTop: 8, paddingBottom: 4,
              border: 'none', background: 'transparent', cursor: 'pointer', position: 'relative',
            }}
            onClick={() => navigate(item.path)}
            whileTap={{ scale: 0.88 }}
          >
            {active && (
              <motion.div
                layoutId="bottom-nav-indicator"
                style={{
                  position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                  width: 28, height: 3, borderRadius: 2,
                  background: activeColor,
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
            {/* Active pill bg */}
            {active && (
              <div style={{
                position: 'absolute', top: 6, left: '50%', transform: 'translateX(-50%)',
                width: 44, height: 32, borderRadius: 10,
                background: item.path === '/consult' ? 'var(--purple-light)' :
                            item.path === '/reminders' ? 'var(--amber-light)' :
                            item.path === '/family' ? 'var(--green-light)' : 'var(--blue-pale)',
                zIndex: -1,
              }} />
            )}
            <Icon active={active} />
            <span style={{
              fontSize: 10, fontFamily: 'var(--font-body)', fontWeight: active ? 700 : 400,
              color: active ? activeColor : 'var(--text-muted)',
            }}>
              {item.label}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
