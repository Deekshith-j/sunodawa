import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useAppStore from '../store/useAppStore'
import AppShell from '../components/layout/AppShell'
import PageTransition from '../components/layout/PageTransition'

function DoseCell({ status }) {
  if (status === 'taken')   return <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--green-light)', border: '1.5px solid rgba(22,199,132,0.35)', color: 'var(--green-health)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800 }}>✓</div>
  if (status === 'missed')  return <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--red-light)', border: '1.5px solid rgba(239,68,68,0.3)', color: 'var(--red-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800 }}>✕</div>
  return <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--amber-light)', border: '1.5px solid rgba(245,158,11,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>⏱</div>
}

function SectionCard({ title, children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--card-border)', borderRadius: 16, boxShadow: 'var(--card-shadow)', padding: '16px', marginBottom: 12 }}>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700, color: 'var(--blue-primary)', marginBottom: 12 }}>{title}</p>
      {children}
    </motion.div>
  )
}

export default function FamilyGuard() {
  const { familyCode, generateFamilyCode, doseLogs, reminders, profile } = useAppStore()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!familyCode) generateFamilyCode()
  }, [familyCode, generateFamilyCode])

  function copyCode() {
    navigator.clipboard.writeText(familyCode || '').catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Get today's dose status from logs
  const today = new Date().toDateString()
  const todayLogs = doseLogs.filter(l => new Date(l.takenAt).toDateString() === today)
  const activeRems = reminders.filter(r => r.active)

  const morning = activeRems.filter(r => r.period === 'morning' || r.time?.includes('08'))
  const afternoon = activeRems.filter(r => r.period === 'afternoon')
  const night = activeRems.filter(r => r.period === 'night')

  const getDoseStatus = (reminder) => {
    const takeLog = todayLogs.find(l => l.reminderId === reminder.id)
    if (takeLog) return 'taken'
    const now = new Date()
    const hour = now.getHours()
    if (reminder.period === 'morning' && hour > 11) return 'missed'
    if (reminder.period === 'afternoon' && hour > 17) return 'missed'
    if (reminder.period === 'night' && hour > 23) return 'missed'
    return 'pending'
  }

  const recentLogs = doseLogs.slice(0, 8)

  return (
    <AppShell>
      <PageTransition>
        <div className="page-container px-4">
          <div style={{ paddingTop: 'max(20px, env(safe-area-inset-top))', paddingBottom: 16 }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>SunoDawa</p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Family Guard 👨‍👩‍👧‍👦</h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', marginTop: 4, lineHeight: 1.4 }}>Real-time dose monitoring for your loved ones.</p>
          </div>

          {/* Family Code Card */}
          <SectionCard title="Your Family Code">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--blue-pale)', padding: '12px 14px', borderRadius: 12, border: '1.5px solid rgba(26,111,219,0.15)' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--blue-primary)', flex: 1 }}>{familyCode || '------'}</p>
              <motion.button whileTap={{ scale: 0.95 }} onClick={copyCode}
                style={{ padding: '8px 14px', borderRadius: 10, background: copied ? 'var(--blue-primary)' : 'white', border: `1.5px solid ${copied ? 'var(--blue-primary)' : 'var(--card-border)'}`, color: copied ? 'white' : 'var(--blue-primary)', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12, cursor: 'pointer', transition: 'all 0.2s', boxShadow: copied ? '0 4px 12px rgba(26,111,219,0.3)' : 'none' }}>
                {copied ? '✓ Copied' : '📋 Copy'}
              </motion.button>
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', marginTop: 10, lineHeight: 1.5 }}>
              Share this code with a family member so they can track your medicine doses remotely.
            </p>
          </SectionCard>

          {/* Today's Dose Grid */}
          <SectionCard title="Today's Dose Status">
            {activeRems.length === 0 ? (
              <div style={{ padding: '16px 0', textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)' }}>No active reminders set up.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {[{ label: 'Morning', emoji: '☀️', items: morning, bg: 'var(--amber-light)' }, 
                  { label: 'Afternoon', emoji: '🌤', items: afternoon, bg: 'var(--blue-pale)' }, 
                  { label: 'Night', emoji: '🌙', items: night, bg: 'var(--purple-light)' }
                ].map(({ label, emoji, items, bg }) => (
                  <div key={label} style={{ background: 'white', border: '1.5px solid var(--card-border)', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ background: bg, padding: '6px', textAlign: 'center', borderBottom: '1px solid var(--card-border)' }}>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>{emoji} {label}</p>
                    </div>
                    <div style={{ padding: '10px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 60 }}>
                      {items.length === 0 ? (
                        <p style={{ fontSize: 16, color: 'var(--text-muted)', marginTop: 8 }}>—</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', width: '100%' }}>
                          {items.map(r => (
                            <div key={r.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: '100%' }}>
                              <DoseCell status={getDoseStatus(r)} />
                              <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-secondary)', fontWeight: 500, width: '100%', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.medicineName}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Recent activity */}
          {recentLogs.length > 0 && (
            <SectionCard title="Recent Activity Logs">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {recentLogs.map(log => (
                  <div key={log.id} style={{ background: 'var(--green-light)', border: '1.5px solid rgba(22,199,132,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--green-health)', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>{log.medicineName}</p>
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--green-health)', marginTop: 2, fontWeight: 500 }}>Taken at {new Date(log.takenAt).toLocaleString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true, day: 'numeric', month: 'short' })}</p>
                    </div>
                    <span style={{ fontSize: 16, color: 'var(--green-health)', fontWeight: 800 }}>✓</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </div>
      </PageTransition>
    </AppShell>
  )
}
