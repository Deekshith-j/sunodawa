import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { lazy, Suspense } from 'react'
import useAppStore from '../store/useAppStore'
import AppShell from '../components/layout/AppShell'

const MedicineHeroScene = lazy(() => import('../components/3d/MedicineHeroScene'))

function formatTimeAgo(isoString) {
  const diff = (Date.now() - new Date(isoString)) / 1000 / 60
  if (diff < 60) return `${Math.round(diff)}m ago`
  if (diff < 1440) return `${Math.round(diff / 60)}h ago`
  return `${Math.round(diff / 1440)}d ago`
}

function getNextDose(reminders) {
  if (!reminders.length) return null
  const active = reminders.filter(r => r.active)
  if (!active.length) return null
  return active.sort((a, b) => (a.time || '').localeCompare(b.time || ''))[0]
}

export default function Home() {
  const navigate = useNavigate()
  const { scanHistory, selectedLanguage, reminders, profile, activeMedicines } = useAppStore()
  const recentScans = scanHistory.slice(0, 3)
  const activeReminders = reminders.filter(r => r.active)
  const nextDose = getNextDose(activeReminders)
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })
  const name = profile?.name || 'Patient'

  return (
    <AppShell>
      <div className="page-container" style={{ padding: '0 16px' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            paddingTop: 'max(20px, env(safe-area-inset-top))', paddingBottom: 12,
          }}
        >
          <div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 500 }}>{today}</p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginTop: 2 }}>
              Hello, {name} 👋
            </h1>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/settings')}
            style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'var(--bg-surface)', border: '1.5px solid var(--card-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--card-shadow)', cursor: 'pointer',
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth={1.75} width={18} height={18}>
              <circle cx="12" cy="8" r="4"/>
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round"/>
            </svg>
          </motion.button>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}
        >
          {[
            { label: 'Active Meds', value: activeMedicines.length, color: 'var(--blue-primary)', bg: 'var(--blue-pale)', icon: '💊' },
            { label: 'Reminders', value: activeReminders.length, color: 'var(--green-health)', bg: 'var(--green-light)', icon: '🔔' },
            { label: 'Total Scans', value: scanHistory.length, color: 'var(--purple-accent)', bg: 'var(--purple-light)', icon: '📷' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 + i * 0.06 }}
              style={{
                background: stat.bg, borderRadius: 14,
                padding: '12px 10px',
                border: `1.5px solid ${stat.color}20`,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 20, marginBottom: 4 }}>{stat.icon}</div>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: stat.color, lineHeight: 1 }}>{stat.value}</p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-secondary)', marginTop: 3, fontWeight: 500 }}>{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ marginBottom: 14 }}
        >
          <Suspense fallback={
            <div style={{ height: 180, background: 'var(--blue-pale)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid var(--blue-primary)', borderTopColor: 'transparent', animation: 'scanRing 0.8s linear infinite' }} />
            </div>
          }>
            <MedicineHeroScene height={180} />
          </Suspense>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}
        >
          {/* Scan CTA */}
          <motion.div
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/scan')}
            style={{
              borderRadius: 18, padding: '16px 14px', cursor: 'pointer',
              background: 'linear-gradient(135deg, #1A6FDB 0%, #0B4EA8 100%)',
              boxShadow: '0 6px 24px rgba(26,111,219,0.4)',
              display: 'flex', flexDirection: 'column', gap: 10,
            }}
          >
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.75} width={22} height={22}>
                <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" strokeLinecap="round"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14, color: 'white' }}>Scan Label</p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>Camera + AI OCR</p>
            </div>
          </motion.div>

          {/* AI Doctor CTA */}
          <motion.div
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/consult')}
            style={{
              borderRadius: 18, padding: '16px 14px', cursor: 'pointer',
              background: 'var(--purple-light)',
              border: '1.5px solid rgba(124,58,237,0.2)',
              boxShadow: '0 4px 16px rgba(124,58,237,0.1)',
              display: 'flex', flexDirection: 'column', gap: 10,
            }}
          >
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: 'rgba(124,58,237,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--purple-accent)" strokeWidth={1.75} width={22} height={22}>
                <path d="M9 2H5a1 1 0 00-1 1v4a6 6 0 006 6 6 6 0 006-6V3a1 1 0 00-1-1h-4" strokeLinecap="round"/>
                <line x1="12" y1="18" x2="12" y2="22" strokeLinecap="round"/>
                <line x1="8" y1="22" x2="16" y2="22" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14, color: 'var(--purple-accent)' }}>AI Doctor</p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(124,58,237,0.7)', marginTop: 2 }}>Dr. Ananya</p>
            </div>
          </motion.div>
        </motion.div>

        {/* More Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}
        >
          {[
            { label: 'Reminders', path: '/reminders', color: 'var(--amber-warn)', bg: 'var(--amber-light)', icon: '🔔' },
            { label: 'History', path: '/history', color: 'var(--blue-primary)', bg: 'var(--blue-pale)', icon: '📋' },
            { label: 'Family', path: '/family', color: 'var(--green-health)', bg: 'var(--green-light)', icon: '👨‍👩‍👧' },
          ].map((action, i) => (
            <motion.div
              key={action.label}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(action.path)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              style={{
                borderRadius: 14, padding: '12px 8px',
                background: action.bg, cursor: 'pointer',
                border: `1.5px solid ${action.color}20`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
              }}
            >
              <span style={{ fontSize: 20 }}>{action.icon}</span>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: action.color, textAlign: 'center' }}>{action.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Today's Schedule */}
        {activeReminders.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Today's Schedule</p>
              <span className="badge-green">{activeReminders.length} active</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {activeReminders.slice(0, 3).map(r => (
                <div key={r.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                  background: 'var(--bg-surface)', borderRadius: 12,
                  border: '1.5px solid var(--card-border)',
                  boxShadow: 'var(--card-shadow)',
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green-health)', flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'var(--blue-primary)', minWidth: 72 }}>{r.time || '--:--'}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-primary)', flex: 1 }} className="truncate">{r.medicineName}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)' }}>{r.dose}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recent Scans */}
        {recentScans.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Recent Scans</p>
              <button onClick={() => navigate('/history')} style={{ fontSize: 12, color: 'var(--blue-primary)', fontFamily: 'var(--font-body)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>See all →</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentScans.map((scan) => (
                <motion.div
                  key={scan.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/result/${scan.id}`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                    background: 'var(--bg-surface)', borderRadius: 12,
                    border: '1.5px solid var(--card-border)',
                    boxShadow: 'var(--card-shadow)', cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, background: 'var(--blue-pale)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--blue-primary)" strokeWidth={1.75} width={18} height={18}>
                      <path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }} className="truncate">{scan.medicineName}</p>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{scan.language} · {formatTimeAgo(scan.timestamp)}</p>
                  </div>
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth={2} width={14} height={14}>
                    <path d="M9 18l6-6-6-6" strokeLinecap="round"/>
                  </svg>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {recentScans.length === 0 && activeReminders.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            style={{ textAlign: 'center', padding: '20px 16px' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>💊</div>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 4 }}>Ready to get started?</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Scan your first medicine label with AI</p>
            <motion.button whileTap={{ scale: 0.96 }} onClick={() => navigate('/scan')}
              className="btn-primary" style={{ padding: '12px 32px' }}>
              Scan Now
            </motion.button>
          </motion.div>
        )}
      </div>
    </AppShell>
  )
}
