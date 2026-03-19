import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useAppStore from '../store/useAppStore'
import AppShell from '../components/layout/AppShell'
import PageTransition from '../components/layout/PageTransition'

const LANGUAGES = ['Hindi', 'Marathi', 'Tamil', 'Telugu', 'Bengali', 'Gujarati', 'Kannada', 'English']

const Toggle = ({ value, onChange }) => (
  <button onClick={onChange} style={{ width: 44, height: 24, borderRadius: 12, background: value ? 'var(--green-health)' : 'var(--card-border)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.25s', flexShrink: 0 }}>
    <div style={{ position: 'absolute', top: 3, left: value ? 22 : 3, width: 18, height: 18, borderRadius: '50%', background: 'white', transition: 'left 0.25s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
  </button>
)

const SettingRow = ({ label, subtitle, right }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 0' }}>
    <div>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>{label}</p>
      {subtitle && <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{subtitle}</p>}
    </div>
    {right}
  </div>
)

const SectionCard = ({ title, children, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--card-border)', borderRadius: 16, boxShadow: 'var(--card-shadow)', padding: '14px 16px', marginBottom: 12 }}>
    <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, color: 'var(--blue-primary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>{title}</p>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, borderTop: '1px solid var(--bg-elevated)', paddingTop: 8 }}>{children}</div>
  </motion.div>
)

export default function Settings() {
  const navigate = useNavigate()
  const { selectedLanguage, setSelectedLanguage, voiceSpeed, setVoiceSpeed, voiceGender, setVoiceGender, profile, updateProfile, clearHistory, familyCode, generateFamilyCode, notificationsEnabled, setNotificationsEnabled, setHasOnboarded } = useAppStore()
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [nameDraft, setNameDraft] = useState(profile?.name || '')

  async function handleNotifToggle() {
    if (!notificationsEnabled) {
      const perm = await Notification.requestPermission()
      setNotificationsEnabled(perm === 'granted')
    } else {
      setNotificationsEnabled(false)
    }
  }

  return (
    <AppShell>
      <PageTransition>
        <div className="page-container" style={{ padding: '0 16px' }}>
          <div style={{ paddingTop: 'max(20px, env(safe-area-inset-top))', paddingBottom: 12 }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>SunoDawa</p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Settings ⚙️</h1>
          </div>

          {/* Profile */}
          <SectionCard title="Profile" delay={0}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input value={nameDraft} onChange={e => setNameDraft(e.target.value)} onBlur={() => updateProfile({ name: nameDraft })} placeholder="Your name"
                style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--blue-pale)', border: '1.5px solid var(--card-border)', color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: 14, outline: 'none' }} />
            </div>
          </SectionCard>

          {/* Language */}
          <SectionCard title="Language" delay={0.05}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 4 }}>
              {LANGUAGES.map(lang => (
                <button key={lang} onClick={() => setSelectedLanguage(lang)}
                  style={{ padding: '6px 12px', borderRadius: 20, background: selectedLanguage === lang ? 'var(--blue-primary)' : 'var(--blue-pale)', color: selectedLanguage === lang ? 'white' : 'var(--blue-primary)', border: `1.5px solid ${selectedLanguage === lang ? 'var(--blue-primary)' : 'rgba(26,111,219,0.2)'}`, fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: selectedLanguage === lang ? 700 : 500, cursor: 'pointer', boxShadow: selectedLanguage === lang ? '0 2px 8px rgba(26,111,219,0.3)' : 'none' }}>
                  {lang}
                </button>
              ))}
            </div>
          </SectionCard>

          {/* Voice */}
          <SectionCard title="Voice Settings" delay={0.1}>
            <SettingRow label="Voice Gender" right={
              <div style={{ display: 'flex', gap: 6 }}>
                {['female', 'male'].map(g => (
                  <button key={g} onClick={() => setVoiceGender(g)}
                    style={{ padding: '6px 12px', borderRadius: 20, background: voiceGender === g ? 'var(--blue-primary)' : 'var(--blue-pale)', color: voiceGender === g ? 'white' : 'var(--blue-primary)', border: `1.5px solid ${voiceGender === g ? 'var(--blue-primary)' : 'rgba(26,111,219,0.2)'}`, fontFamily: 'var(--font-body)', fontSize: 12, cursor: 'pointer', textTransform: 'capitalize', fontWeight: voiceGender === g ? 700 : 400 }}>
                    {g}
                  </button>
                ))}
              </div>
            } />
            <SettingRow label={`Speed (${voiceSpeed > 0 ? '+' : ''}${voiceSpeed})`} subtitle="Adjust speech rate" right={
              <input type="range" min="-50" max="50" value={voiceSpeed} onChange={e => setVoiceSpeed(Number(e.target.value))} style={{ width: 110, accentColor: 'var(--blue-primary)' }} />
            } />
          </SectionCard>

          {/* Notifications & Family */}
          <SectionCard title="Notifications & Family" delay={0.15}>
            <SettingRow label="Dose Reminders" subtitle="Get notified on time" right={<Toggle value={notificationsEnabled} onChange={handleNotifToggle} />} />
            <SettingRow label="Family Code" subtitle="Share with caregivers" right={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--green-health)', letterSpacing: '0.08em', fontWeight: 700 }}>{familyCode || '------'}</span>
                <button onClick={generateFamilyCode} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 8, background: 'var(--green-light)', border: '1px solid rgba(22,199,132,0.2)', color: 'var(--green-health)', fontFamily: 'var(--font-body)', fontWeight: 600, cursor: 'pointer' }}>Regen</button>
              </div>
            } />
          </SectionCard>

          {/* Data */}
          <SectionCard title="Data" delay={0.2}>
            {!showClearConfirm ? (
              <button onClick={() => setShowClearConfirm(true)} style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--red-light)', border: '1.5px solid rgba(239,68,68,0.2)', color: 'var(--red-danger)', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, cursor: 'pointer', width: '100%', textAlign: 'left' }}>🗑 Clear All History</button>
            ) : (
              <div style={{ padding: '12px', borderRadius: 10, background: 'var(--red-light)', border: '1.5px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <p style={{ fontSize: 12, color: 'var(--red-danger)', fontFamily: 'var(--font-body)', flex: 1, fontWeight: 500 }}>Delete all scan history?</p>
                <button onClick={() => { clearHistory(); setShowClearConfirm(false) }} style={{ padding: '5px 12px', borderRadius: 8, background: 'var(--red-danger)', border: 'none', color: 'white', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Yes</button>
                <button onClick={() => setShowClearConfirm(false)} style={{ padding: '5px 12px', borderRadius: 8, background: 'white', border: '1px solid var(--card-border)', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', fontSize: 12, cursor: 'pointer' }}>No</button>
              </div>
            )}
          </SectionCard>

          {/* Reset */}
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
            onClick={() => { setHasOnboarded(false); navigate('/') }}
            style={{ width: '100%', padding: '12px', borderRadius: 12, border: '1.5px solid var(--card-border)', background: 'var(--bg-surface)', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, cursor: 'pointer', marginBottom: 6 }}>
            ← Reset Onboarding
          </motion.button>

          <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', marginBottom: 16 }}>
            SunoDawa v1.0 · AI Medical Voice Assistant 💊
          </p>
        </div>
      </PageTransition>
    </AppShell>
  )
}
