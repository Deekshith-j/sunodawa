import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useAppStore from '../store/useAppStore'

const LANGUAGES = ['Hindi', 'Marathi', 'Tamil', 'Telugu', 'Bengali', 'Gujarati', 'Kannada', 'English']
const LANG_FLAGS = { Hindi: '🇮🇳', Marathi: '🟠', Tamil: '🔵', Telugu: '🟡', Bengali: '🟢', Gujarati: '🟣', Kannada: '🔴', English: '🌍' }

const STEPS = [
  { title: 'Welcome to SunoDawa', subtitle: 'Your AI medicine companion', icon: '💊', color: 'var(--blue-primary)' },
  { title: 'Choose Your Language', subtitle: 'We speak your language', icon: '🌐', color: 'var(--purple-accent)' },
  { title: "You're all set!", subtitle: 'Start scanning medicine labels', icon: '✅', color: 'var(--green-health)' },
]

export default function Splash() {
  const navigate = useNavigate()
  const { setSelectedLanguage, setHasOnboarded, selectedLanguage } = useAppStore()
  const [step, setStep] = useState(0)

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1)
    else { setHasOnboarded(true); navigate('/home') }
  }

  return (
    <div style={{
      height: '100%', width: '100%', overflow: 'hidden', position: 'relative',
      background: 'linear-gradient(180deg, #EBF3FF 0%, #F0F6FF 50%, #FFFFFF 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
      padding: 'max(32px, env(safe-area-inset-top)) 24px max(32px, env(safe-area-inset-bottom))',
    }}>
      {/* Decorative circles */}
      <div style={{ position: 'absolute', top: -80, right: -80, width: 240, height: 240, borderRadius: '50%', background: 'rgba(26,111,219,0.06)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -60, left: -60, width: 180, height: 180, borderRadius: '50%', background: 'rgba(22,199,132,0.06)', pointerEvents: 'none' }} />

      {/* Logo */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          background: 'var(--bg-surface)', borderRadius: 16, padding: '8px 20px',
          border: '1.5px solid var(--card-border)', boxShadow: 'var(--card-shadow)',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--blue-primary), var(--blue-deep))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} width={18} height={18}>
              <path d="M9 2H5a1 1 0 00-1 1v4a6 6 0 006 6 6 6 0 006-6V3a1 1 0 00-1-1h-4" strokeLinecap="round"/>
              <line x1="12" y1="18" x2="12" y2="22" strokeLinecap="round"/>
              <line x1="8" y1="22" x2="16" y2="22" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--blue-primary)' }}>SunoDawa</span>
        </div>
      </motion.div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{ width: '100%', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
            style={{
              width: 120, height: 120, borderRadius: 32,
              background: 'var(--bg-surface)',
              border: `2px solid ${STEPS[step].color}25`,
              boxShadow: `0 8px 40px ${STEPS[step].color}20`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 52,
            }}
          >
            {STEPS[step].icon}
          </motion.div>

          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 8 }}>
              {STEPS[step].title}
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {STEPS[step].subtitle}
            </p>
          </div>

          {/* Language Picker —  step 1 */}
          {step === 1 && (
            <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, maxWidth: 380 }}>
              {LANGUAGES.map(lang => (
                <motion.button
                  key={lang}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedLanguage(lang)}
                  style={{
                    padding: '12px 10px', borderRadius: 12, border: 'none', cursor: 'pointer',
                    background: selectedLanguage === lang
                      ? 'linear-gradient(135deg, var(--blue-primary), var(--blue-deep))'
                      : 'var(--bg-surface)',
                    border: `1.5px solid ${selectedLanguage === lang ? 'var(--blue-primary)' : 'var(--card-border)'}`,
                    color: selectedLanguage === lang ? 'white' : 'var(--text-primary)',
                    fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 8,
                    boxShadow: selectedLanguage === lang ? '0 4px 16px rgba(26,111,219,0.3)' : 'var(--card-shadow)',
                  }}
                >
                  <span>{LANG_FLAGS[lang]}</span> {lang}
                </motion.button>
              ))}
            </div>
          )}

          {/* Features list — step 0 */}
          {step === 0 && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 340 }}>
              {[
                { icon: '🔍', text: 'Scan any medicine label with AI' },
                { icon: '🔊', text: 'Hear instructions in your language' },
                { icon: '⏰', text: 'Set dose reminders' },
                { icon: '👨‍⚕️', text: 'Consult AI doctor Dr. Ananya' },
              ].map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.08 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                    background: 'var(--bg-surface)', borderRadius: 12,
                    border: '1.5px solid var(--card-border)', boxShadow: 'var(--card-shadow)',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: 20 }}>{f.icon}</span>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{f.text}</p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Progress dots + CTA */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        {/* Dots */}
        <div style={{ display: 'flex', gap: 6 }}>
          {STEPS.map((_, i) => (
            <motion.div
              key={i}
              animate={{ width: i === step ? 20 : 6, background: i === step ? 'var(--blue-primary)' : 'var(--card-border)' }}
              style={{ height: 6, borderRadius: 3 }}
            />
          ))}
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleNext}
          className="btn-primary"
          style={{ width: '100%', maxWidth: 380, padding: '16px', fontSize: 16, borderRadius: 14 }}
        >
          {step < STEPS.length - 1 ? (step === 1 ? `Continue with ${selectedLanguage}` : 'Get Started') : 'Start Using SunoDawa'}
        </motion.button>
      </div>
    </div>
  )
}
