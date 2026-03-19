import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useAppStore from '../store/useAppStore'
import GlassCard from '../components/ui/GlassCard'
import AppShell from '../components/layout/AppShell'
import PageTransition from '../components/layout/PageTransition'

function AddReminderModal({ onAdd, onClose }) {
  const [name, setName] = useState('')
  const [dose, setDose] = useState('')
  const [period, setPeriod] = useState('morning')

  const handleAdd = () => {
    if (!name.trim()) return
    const timeStr = period === 'morning' ? '08:00 AM' : period === 'afternoon' ? '02:00 PM' : '09:00 PM'
    onAdd({ medicineName: name.trim(), time: timeStr, dose: dose || '1 tablet', period })
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(13,27,62,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60 }} animate={{ y: 0 }} exit={{ y: 60 }}
        style={{ width: '100%', maxWidth: 480, background: 'var(--bg-surface)', borderRadius: '20px 20px 0 0', border: '1.5px solid var(--card-border)', padding: '20px 20px calc(20px + env(safe-area-inset-bottom))', boxShadow: '0 -8px 32px rgba(26,111,219,0.1)' }}
        onClick={e => e.stopPropagation()}
      >
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--text-primary)', marginBottom: 16, textAlign: 'center' }}>Add Reminder</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Medicine name *"
            style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--blue-pale)', border: '1.5px solid var(--card-border)', color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: 14, outline: 'none' }} />
          <input value={dose} onChange={e => setDose(e.target.value)} placeholder="Dose (e.g. 1 tablet)"
            style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--blue-pale)', border: '1.5px solid var(--card-border)', color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: 14, outline: 'none' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {[
              { id: 'morning', label: 'Morning', emoji: '☀️', color: 'var(--amber-warn)', bg: 'var(--amber-light)' },
              { id: 'afternoon', label: 'Afternoon', emoji: '🌤', color: 'var(--blue-primary)', bg: 'var(--blue-pale)' },
              { id: 'night', label: 'Night', emoji: '🌙', color: 'var(--purple-accent)', bg: 'var(--purple-light)' },
            ].map(p => (
              <button key={p.id} onClick={() => setPeriod(p.id)}
                style={{ padding: '10px 6px', borderRadius: 10, background: period === p.id ? p.bg : 'var(--bg-elevated)', border: `1.5px solid ${period === p.id ? p.color + '40' : 'var(--card-border)'}`, color: period === p.id ? p.color : 'var(--text-muted)', fontFamily: 'var(--font-body)', fontSize: 12, cursor: 'pointer', fontWeight: period === p.id ? 700 : 400, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <span style={{ fontSize: 18 }}>{p.emoji}</span> {p.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 16 }}>
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button onClick={handleAdd} className="btn-primary">Add Reminder</button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function ReminderCard({ reminder, onToggle, onDelete, onLogDose }) {
  const [logged, setLogged] = useState(false)
  const PERIOD_COLORS = {
    morning: { color: 'var(--amber-warn)', bg: 'var(--amber-light)' },
    afternoon: { color: 'var(--blue-primary)', bg: 'var(--blue-pale)' },
    night: { color: 'var(--purple-accent)', bg: 'var(--purple-light)' },
  }
  const pc = PERIOD_COLORS[reminder.period] || PERIOD_COLORS.morning

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ background: 'var(--bg-surface)', borderRadius: 14, border: '1.5px solid var(--card-border)', boxShadow: 'var(--card-shadow)', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}
    >
      <div style={{ width: 40, height: 40, borderRadius: 10, background: pc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg viewBox="0 0 24 24" fill="none" stroke={pc.color} strokeWidth={1.75} width={20} height={20}>
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round"/>
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }} className="truncate">{reminder.medicineName}</p>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: pc.color, marginTop: 1 }}>{reminder.time} · {reminder.dose}</p>
      </div>
      {reminder.active && !logged && (
        <button onClick={() => { onLogDose(reminder.id, reminder.medicineName); setLogged(true) }}
          style={{ padding: '5px 10px', borderRadius: 20, background: 'var(--green-light)', border: '1px solid rgba(22,199,132,0.2)', color: 'var(--green-health)', fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
          ✓ Taken
        </button>
      )}
      {logged && <span style={{ fontSize: 12, color: 'var(--green-health)', fontFamily: 'var(--font-body)', fontWeight: 700, flexShrink: 0 }}>✓ Done</span>}
      {/* Toggle switch */}
      <button onClick={() => onToggle(reminder.id)} style={{ width: 40, height: 22, borderRadius: 11, background: reminder.active ? 'var(--green-health)' : 'var(--card-border)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.25s', flexShrink: 0 }}>
        <div style={{ position: 'absolute', top: 3, left: reminder.active ? 20 : 3, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left 0.25s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
      </button>
    </motion.div>
  )
}

export default function Reminders() {
  const { reminders, addReminder, toggleReminder, deleteReminder, logDose } = useAppStore()
  const [showAdd, setShowAdd] = useState(false)

  const morning = reminders.filter(r => r.period === 'morning' || (!r.period && r.time?.includes('08')))
  const afternoon = reminders.filter(r => r.period === 'afternoon')
  const night = reminders.filter(r => r.period === 'night' || (!r.period && !afternoon.includes(r) && !morning.includes(r)))

  const Section = ({ title, emoji, items, color }) => (
    items.length > 0 ? (
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <span style={{ fontSize: 18 }}>{emoji}</span>
          <p style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14, color }}>{title}</p>
          <span style={{ marginLeft: 4, fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)' }}>{items.length}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map(r => <ReminderCard key={r.id} reminder={r} onToggle={toggleReminder} onDelete={deleteReminder} onLogDose={logDose} />)}
        </div>
      </div>
    ) : null
  )

  return (
    <AppShell>
      <PageTransition>
        <div className="page-container" style={{ padding: '0 16px' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 'max(20px, env(safe-area-inset-top))', paddingBottom: 16 }}>
            <div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Schedule</p>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Reminders 🔔</h1>
            </div>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowAdd(true)}
              className="btn-primary" style={{ padding: '8px 16px', minHeight: 38, fontSize: 13 }}>
              + Add
            </motion.button>
          </div>

          {/* Summary card */}
          {reminders.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              <div style={{ background: 'var(--blue-pale)', borderRadius: 12, padding: '12px 14px', border: '1.5px solid rgba(26,111,219,0.15)' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: 'var(--blue-primary)' }}>{reminders.filter(r => r.active).length}</p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500 }}>Active</p>
              </div>
              <div style={{ background: 'var(--green-light)', borderRadius: 12, padding: '12px 14px', border: '1.5px solid rgba(22,199,132,0.2)' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: 'var(--green-health)' }}>{reminders.length}</p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500 }}>Total</p>
              </div>
            </div>
          )}

          {reminders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 24px' }}>
              <div style={{ fontSize: 56, marginBottom: 12 }}>🔔</div>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--text-primary)', marginBottom: 6 }}>No reminders yet</p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Scan a medicine label and set a reminder, or add one manually.</p>
              <motion.button whileTap={{ scale: 0.96 }} onClick={() => setShowAdd(true)} className="btn-primary" style={{ padding: '12px 28px' }}>
                Add First Reminder
              </motion.button>
            </div>
          ) : (
            <>
              <Section title="Morning" emoji="☀️" items={morning} color="var(--amber-warn)" />
              <Section title="Afternoon" emoji="🌤" items={afternoon} color="var(--blue-primary)" />
              <Section title="Night" emoji="🌙" items={night} color="var(--purple-accent)" />
            </>
          )}
        </div>
        <AnimatePresence>{showAdd && <AddReminderModal onAdd={addReminder} onClose={() => setShowAdd(false)} />}</AnimatePresence>
      </PageTransition>
    </AppShell>
  )
}
