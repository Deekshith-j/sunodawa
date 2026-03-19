import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

const NAV_ITEMS = [
  { path: '/home',      label: 'Home',      icon: HomeIcon,   color: 'var(--blue-primary)', bg: 'var(--blue-pale)' },
  { path: '/scan',      label: 'Scan',      icon: ScanIcon,   color: 'var(--blue-primary)', bg: 'var(--blue-pale)' },
  { path: '/consult',   label: 'AI Doctor', icon: StethIcon,  color: 'var(--purple-accent)', bg: 'var(--purple-light)' },
  { path: '/reminders', label: 'Reminders', icon: BellIcon,   color: 'var(--amber-warn)', bg: 'var(--amber-light)' },
  { path: '/history',   label: 'History',   icon: HistoryIcon,color: 'var(--blue-primary)', bg: 'var(--blue-pale)' },
  { path: '/family',    label: 'Family',    icon: FamilyIcon, color: 'var(--green-health)', bg: 'var(--green-light)' },
  { path: '/settings',  label: 'Settings',  icon: SettingsIcon,color: 'var(--text-secondary)', bg: 'rgba(148,168,195,0.1)' },
]

function HomeIcon({ active, color }) {
  return <svg viewBox="0 0 24 24" fill={active ? color : 'none'} stroke={active ? color : 'var(--text-muted)'} strokeWidth={1.75} width={20} height={20}>
    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
}
function ScanIcon({ active, color }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke={active ? color : 'var(--text-muted)'} strokeWidth={1.75} width={20} height={20}>
    <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
}
function StethIcon({ active, color }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke={active ? color : 'var(--text-muted)'} strokeWidth={1.75} width={20} height={20}>
    <path d="M9 2H5a1 1 0 00-1 1v4a6 6 0 006 6 6 6 0 006-6V3a1 1 0 00-1-1h-4" strokeLinecap="round"/>
    <path d="M10 14a6 6 0 006 6 6 6 0 006-6" strokeLinecap="round"/>
    <circle cx="22" cy="14" r="2"/>
  </svg>
}
function BellIcon({ active, color }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke={active ? color : 'var(--text-muted)'} strokeWidth={1.75} width={20} height={20}>
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round"/>
  </svg>
}
function HistoryIcon({ active, color }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke={active ? color : 'var(--text-muted)'} strokeWidth={1.75} width={20} height={20}>
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 6v6l4 2" strokeLinecap="round"/>
  </svg>
}
function FamilyIcon({ active, color }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke={active ? color : 'var(--text-muted)'} strokeWidth={1.75} width={20} height={20}>
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87" strokeLinecap="round"/>
    <path d="M16 3.13a4 4 0 010 7.75" strokeLinecap="round"/>
  </svg>
}
function SettingsIcon({ active, color }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke={active ? color : 'var(--text-muted)'} strokeWidth={1.75} width={20} height={20}>
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
  </svg>
}

export default function SideNav() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div style={{
      width: 240, height: '100%',
      background: 'rgba(255,255,255,0.98)',
      borderRight: '1.5px solid rgba(26,111,219,0.1)',
      display: 'flex', flexDirection: 'column',
      padding: '0 12px',
      boxShadow: '4px 0 20px rgba(26,111,219,0.06)',
      zIndex: 50,
      overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '20px 8px 16px',
        borderBottom: '1.5px solid rgba(26,111,219,0.08)',
        marginBottom: 8,
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: 'linear-gradient(135deg, var(--blue-primary), var(--blue-deep))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(26,111,219,0.35)',
          flexShrink: 0,
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} width={20} height={20}>
            <path d="M9 2H5a1 1 0 00-1 1v4a6 6 0 006 6 6 6 0 006-6V3a1 1 0 00-1-1h-4" strokeLinecap="round"/>
            <line x1="12" y1="18" x2="12" y2="22" strokeLinecap="round"/>
            <line x1="8" y1="22" x2="16" y2="22" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: 'var(--blue-primary)', lineHeight: 1.1 }}>SunoDawa</p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>AI Medicine Assistant</p>
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.path || (item.path === '/home' && location.pathname === '/')
          const Icon = item.icon
          return (
            <motion.button
              key={item.path}
              onClick={() => navigate(item.path)}
              whileTap={{ scale: 0.97 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 10,
                border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%',
                background: active ? item.bg : 'transparent',
                transition: 'all 0.15s ease',
                position: 'relative',
              }}
            >
              {active && (
                <div style={{
                  position: 'absolute', left: 0, top: '20%', bottom: '20%',
                  width: 3, borderRadius: '0 3px 3px 0',
                  background: item.color,
                }} />
              )}
              <Icon active={active} color={item.color} />
              <span style={{
                fontFamily: 'var(--font-body)', fontSize: 13.5,
                fontWeight: active ? 700 : 400,
                color: active ? item.color : 'var(--text-secondary)',
              }}>
                {item.label}
              </span>
            </motion.button>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div style={{
        padding: '12px 8px',
        borderTop: '1.5px solid rgba(26,111,219,0.08)',
        marginTop: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 4px' }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--blue-pale), var(--blue-primary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--blue-primary)" strokeWidth={1.75} width={18} height={18}>
              <circle cx="12" cy="8" r="4"/>
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Patient</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)' }}>SunoDawa App</p>
          </div>
        </div>
      </div>
    </div>
  )
}
