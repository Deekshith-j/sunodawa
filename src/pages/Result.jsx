import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useAppStore from '../store/useAppStore'
import { speakInstruction, stopAudio, getVoiceId } from '../services/murf'
import { getScanFromIDB } from '../services/storage'
import { checkDrugInteraction, validateVoiceAnswer, translateInstruction, getAIMedicineAdvice, isGeminiConfigured } from '../services/gemini'
import GlassCard from '../components/ui/GlassCard'
import VoiceWaveform from '../components/ui/VoiceWaveform'
import AppShell from '../components/layout/AppShell'
import PageTransition from '../components/layout/PageTransition'
import StatusBadge from '../components/ui/StatusBadge'
import { useVoiceInput } from '../hooks/useVoiceInput'

const ResultMedicineScene = lazy(() => import('../components/3d/ResultMedicineScene'))
const LANGUAGES = ['Hindi', 'Marathi', 'Tamil', 'Telugu', 'Bengali', 'Gujarati', 'Kannada', 'English', 'Malayalam', 'Punjabi']

// ── Info Card ─────────────────────────────────────────────────────
function InfoCard({ label, value, icon, color = 'var(--cyan-bright)', delay = 0 }) {
  if (!value) return null
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="glass-card" style={{ padding: '12px 14px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}15`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: 14 }}>{icon}</span>
      </div>
      <div>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: 13, color: 'var(--text-primary)', fontFamily: 'var(--font-body)', lineHeight: 1.4 }}>{value}</p>
      </div>
    </motion.div>
  )
}

// ── Interaction Alert ─────────────────────────────────────────────
function InteractionAlert({ data, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(13,27,62,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        style={{ background: 'white', border: '2px solid rgba(239,68,68,0.3)', borderRadius: 18, padding: 20, maxWidth: 380, width: '100%', boxShadow: '0 8px 40px rgba(239,68,68,0.2)' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 22 }}>⚠️</span>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--red-danger)' }}>Drug Interaction Detected</p>
        </div>
        {data.interactions?.map((int, i) => (
          <div key={i} style={{ background: 'var(--red-light)', borderRadius: 10, padding: 12, marginBottom: 8, border: '1px solid rgba(239,68,68,0.2)' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--red-danger)', marginBottom: 4, fontWeight: 600 }}>{int.drug1} + {int.drug2}</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: 6 }}>{int.description}</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--amber-warn)' }}>👉 {int.recommendation}</p>
          </div>
        ))}
        <button onClick={onClose} style={{ width: '100%', marginTop: 8, padding: '11px', borderRadius: 10, background: 'var(--red-light)', border: '1.5px solid rgba(239,68,68,0.25)', color: 'var(--red-danger)', fontFamily: 'var(--font-body)', fontWeight: 600, cursor: 'pointer' }}>I Understand</button>
      </motion.div>
    </motion.div>
  )
}

export default function Result() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getScan, selectedLanguage, setSelectedLanguage, voiceSpeed, voiceGender, addReminder, activeMedicines, addActiveMedicine } = useAppStore()
  const [result, setResult] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showSideEffects, setShowSideEffects] = useState(false)
  const [showLangPicker, setShowLangPicker] = useState(false)
  const [reminderSet, setReminderSet] = useState(false)
  const [interactionData, setInteractionData] = useState(null)
  const [showInteraction, setShowInteraction] = useState(false)
  const [checkingInteraction, setCheckingInteraction] = useState(false)
  const [addedToMeds, setAddedToMeds] = useState(false)
  const [voiceConfirmState, setVoiceConfirmState] = useState('idle') // idle | recording | confirming | passed | failed
  const [voiceConfirmFeedback, setVoiceConfirmFeedback] = useState('')
  const [expiryStatus, setExpiryStatus] = useState(null)
  const hasAutoPlayed = useRef(false)
  const [aiHealthAdvice, setAiHealthAdvice] = useState(null)
  const [loadingAdvice, setLoadingAdvice] = useState(false)
  const { isRecording, isProcessing, startRecording, stopRecording } = useVoiceInput()

  useEffect(() => {
    (async () => {
      let scan = getScan(id)
      if (!scan) scan = await getScanFromIDB(id)
      if (scan) setResult(scan)
    })()
  }, [id, getScan])

  const playVoice = useCallback(async (res = result, lang = selectedLanguage) => {
    if (!res) return
    setIsPlaying(true); stopAudio()
    const voiceId = getVoiceId(lang, voiceGender)
    const text = res.shortInstruction || `Take ${res.dosage} of ${res.medicineName} ${res.frequency}. ${res.timing}.`
    try { await speakInstruction(text, voiceId, voiceSpeed, lang) }
    finally { setIsPlaying(false) }
  }, [result, selectedLanguage, voiceSpeed, voiceGender])

  useEffect(() => {
    if (result && !hasAutoPlayed.current) {
      hasAutoPlayed.current = true
      playVoice(result, selectedLanguage)
      checkExpiry(result.expiryDate)
      runInteractionCheck(result)
      // Fetch AI health advice if not already in scan data
      if (isGeminiConfigured() && !result.aiHealthAdvice) {
        setLoadingAdvice(true)
        getAIMedicineAdvice(result, selectedLanguage)
          .then(advice => { if (advice) setAiHealthAdvice(advice) })
          .catch(() => {})
          .finally(() => setLoadingAdvice(false))
      } else if (result.aiHealthAdvice) {
        setAiHealthAdvice(result.aiHealthAdvice)
      }
    }
    return () => stopAudio()
  }, [result])

  function checkExpiry(expiryDate) {
    if (!expiryDate) return
    try {
      const [month, year] = expiryDate.split('/')
      const expiry = new Date(parseInt(year), parseInt(month) - 1)
      const now = new Date()
      const oneMonthFromNow = new Date(); oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1)
      if (expiry < now) setExpiryStatus('expired')
      else if (expiry < oneMonthFromNow) setExpiryStatus('expiring_soon')
    } catch {}
  }

  async function runInteractionCheck(newMed) {
    if (!newMed || activeMedicines.length === 0) return
    setCheckingInteraction(true)
    try {
      const result = await checkDrugInteraction([...activeMedicines, { medicineName: newMed.medicineName, genericName: newMed.genericName }], selectedLanguage)
      if (result.hasInteraction) {
        setInteractionData(result); setShowInteraction(true)
        const warnText = result.interactions[0]?.description || 'Medicine interaction detected. Please consult your doctor.'
        speakInstruction(warnText, getVoiceId(selectedLanguage, voiceGender), voiceSpeed)
      }
    } finally { setCheckingInteraction(false) }
  }

  function handleLanguageChange(lang) {
    setSelectedLanguage(lang); setShowLangPicker(false)
    playVoice(result, lang)
  }

  function handleSetReminder() {
    if (!result) return
    addReminder({ medicineName: result.medicineName, time: '08:00 AM', dose: result.dosage, frequency: result.frequency })
    setReminderSet(true)
  }

  function handleAddToMeds() {
    if (!result) return
    addActiveMedicine({ medicineName: result.medicineName, genericName: result.genericName })
    setAddedToMeds(true)
  }

  async function startVoiceConfirm() {
    setVoiceConfirmState('recording')
    await playVoice(result, selectedLanguage)
    await new Promise(r => setTimeout(r, 500))
    speakInstruction('Ab aap mujhe batao — yeh dawa kab aur kitni leni hai?', getVoiceId(selectedLanguage, voiceGender), voiceSpeed)
    await startRecording()
  }

  async function finishVoiceConfirm() {
    const answer = await stopRecording()
    if (!answer) { setVoiceConfirmState('idle'); return }
    setVoiceConfirmState('confirming')
    try {
      const check = await validateVoiceAnswer(result.shortInstruction, answer, selectedLanguage)
      setVoiceConfirmFeedback(check.feedback)
      setVoiceConfirmState(check.correct ? 'passed' : 'failed')
      speakInstruction(check.feedback, getVoiceId(selectedLanguage, voiceGender), voiceSpeed)
    } catch { setVoiceConfirmState('idle') }
  }

  if (!result) {
    return (
      <AppShell>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="waveform-bar" style={{ height: 32, animationDelay: `${i * 100}ms` }} />
            ))}
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <PageTransition>
        <div className="page-container px-4">
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 'max(14px, env(safe-area-inset-top))', paddingBottom: 10 }}>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => { stopAudio(); navigate(-1) }}
              style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,245,255,0.07)', border: '1px solid rgba(0,245,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--cyan-bright)" strokeWidth={2} width={16} height={16}><path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round"/></svg>
            </motion.button>
            {result.image && <img src={result.image} alt="Scan" style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', border: '1px solid rgba(0,245,255,0.2)', flexShrink: 0 }} />}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Scan Result</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }} className="truncate">{result.genericName || result.medicineName}</p>
            </div>
          </div>

          {/* Medicine Name + 3D model layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'center', marginBottom: 8 }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, color: 'var(--cyan-bright)', lineHeight: 1.1 }} className="text-glow">{result.medicineName}</h1>
              {result.medicineType && <StatusBadge type="safe" text={`● ${result.medicineType}`} size="sm" />}
            </div>
            <Suspense fallback={<div style={{ width: 100, height: 100 }} />}>
              <ResultMedicineScene medicineType={result.medicineType} height={110} />
            </Suspense>
          </div>

          {/* Expiry warning */}
          <AnimatePresence>
            {expiryStatus && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '10px 14px', borderRadius: 10, marginBottom: 8, background: expiryStatus === 'expired' ? 'rgba(255,59,59,0.1)' : 'rgba(255,184,0,0.08)', border: `1px solid ${expiryStatus === 'expired' ? 'rgba(255,59,59,0.3)' : 'rgba(255,184,0,0.25)'}` }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: expiryStatus === 'expired' ? 'var(--med-red)' : 'var(--med-amber)' }}>
                  {expiryStatus === 'expired' ? '🚫 This medicine has EXPIRED! Do not take it.' : '⚠️ This medicine expires within 1 month.'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Voice Player */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} style={{ marginBottom: 10 }}>
            <GlassCard style={{ padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-body)' }}>🔊 Voice Instructions</p>
                <button onClick={() => setShowLangPicker(!showLangPicker)}
                  style={{ padding: '3px 10px', borderRadius: 20, background: 'rgba(0,245,255,0.07)', border: '1px solid rgba(0,245,255,0.2)', color: 'var(--cyan-bright)', fontSize: 11, fontFamily: 'var(--font-body)', cursor: 'pointer' }}>
                  🌐 {selectedLanguage}
                </button>
              </div>
              <AnimatePresence>
                {showLangPicker && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10, overflow: 'hidden' }}>
                    {LANGUAGES.map(lang => (
                      <button key={lang} onClick={() => handleLanguageChange(lang)}
                        style={{ padding: '4px 10px', borderRadius: 20, background: selectedLanguage === lang ? 'var(--cyan-bright)' : 'rgba(0,245,255,0.06)', color: selectedLanguage === lang ? 'var(--bg-void)' : 'var(--cyan-bright)', border: `1px solid ${selectedLanguage === lang ? 'var(--cyan-bright)' : 'rgba(0,245,255,0.2)'}`, fontSize: 11, fontFamily: 'var(--font-body)', cursor: 'pointer' }}>
                        {lang}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, lineHeight: 1.55, color: 'var(--text-primary)', marginBottom: 10 }}>{result.shortInstruction}</p>
              <VoiceWaveform isPlaying={isPlaying} barCount={20} />
              <motion.button whileTap={{ scale: 0.96 }} onClick={() => playVoice()}
                style={{ width: '100%', marginTop: 10, padding: '13px', borderRadius: 12, fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: isPlaying ? 'rgba(0,245,255,0.08)' : 'linear-gradient(135deg, var(--cyan-bright), var(--cyan-mid))', color: isPlaying ? 'var(--cyan-bright)' : 'var(--bg-void)', border: isPlaying ? '2px solid var(--cyan-bright)' : 'none', boxShadow: '0 0 20px rgba(0,245,255,0.3)', minHeight: 50 }}>
                {isPlaying ? <>● Playing...</> : <>▶ Replay Voice</>}
              </motion.button>
            </GlassCard>
          </motion.div>

          {/* Dosage big display */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
            style={{ padding: '14px 16px', borderRadius: 16, marginBottom: 10, background: 'rgba(0,245,255,0.04)', border: '1px solid rgba(0,245,255,0.15)', display: 'flex', gap: 20 }}>
            <div>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dosage</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 600, color: 'var(--cyan-bright)', lineHeight: 1.1 }}>{result.dosage}</p>
            </div>
            <div style={{ width: 1, background: 'rgba(0,245,255,0.12)' }} />
            <div>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Frequency</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 500, color: 'var(--cyan-bright)', lineHeight: 1.2, marginTop: 4 }}>{result.frequency}</p>
            </div>
          </motion.div>

          {/* Info cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
            <InfoCard label="When to take" value={result.timing} icon="🕐" color="var(--cyan-bright)" delay={0.16} />
            <InfoCard label="Duration" value={result.duration} icon="📅" color="var(--bio-green)" delay={0.20} />
            {result.expiryDate && <InfoCard label="Expires" value={result.expiryDate} icon="⏱" color="var(--med-amber)" delay={0.24} />}
          </div>

          {/* Warnings */}
          {result.warnings?.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }} style={{ marginBottom: 8 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--med-amber)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-body)' }}>⚠️ Warnings</p>
              {result.warnings.map((w, i) => (
                <div key={i} style={{ padding: '8px 12px', borderRadius: 10, marginBottom: 4, background: 'rgba(255,184,0,0.06)', border: '1px solid rgba(255,184,0,0.2)' }}>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--med-amber)' }}>{w}</p>
                </div>
              ))}
            </motion.div>
          )}

          {/* AI Health Advice */}
          {(aiHealthAdvice || loadingAdvice) && (
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }} style={{ marginBottom: 10 }}>
              <div style={{ background: 'white', border: '1.5px solid rgba(26,111,219,0.15)', borderRadius: 14, padding: '14px 15px', boxShadow: 'var(--card-shadow)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--blue-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 14 }}>🤖</span>
                    </div>
                    <p style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 12, color: 'var(--blue-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Doctor Advice</p>
                  </div>
                  {aiHealthAdvice && (
                    <button onClick={() => speakInstruction(aiHealthAdvice, getVoiceId(selectedLanguage, voiceGender), 0, selectedLanguage)}
                      style={{ padding: '3px 10px', borderRadius: 20, background: 'var(--blue-pale)', border: '1px solid rgba(26,111,219,0.2)', color: 'var(--blue-primary)', fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>
                      🔊 Speak
                    </button>
                  )}
                </div>
                {loadingAdvice && !aiHealthAdvice ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                    {[0, 1, 2].map(i => (
                      <motion.div key={i} animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                        style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--blue-primary)' }} />
                    ))}
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)' }}>Getting AI advice...</p>
                  </div>
                ) : (
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{aiHealthAdvice}</p>
                )}
              </div>
            </motion.div>
          )}

          {result.sideEffects?.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34 }} style={{ marginBottom: 10 }}>
              <button onClick={() => setShowSideEffects(!showSideEffects)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,59,59,0.04)', border: '1px solid rgba(255,59,59,0.15)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500, color: 'var(--med-red)' }}>
                <span>Side Effects ({result.sideEffects.length})</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14} style={{ transform: showSideEffects ? 'rotate(180deg)' : 'none', transition: '0.2s' }}><path d="M6 9l6 6 6-6" strokeLinecap="round"/></svg>
              </button>
              <AnimatePresence>
                {showSideEffects && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 4, overflow: 'hidden' }}>
                    {result.sideEffects.map((se, i) => (
                      <div key={i} style={{ padding: '7px 12px', borderRadius: 8, background: 'rgba(255,59,59,0.04)', border: '1px solid rgba(255,59,59,0.1)' }}>
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)' }}>{se}</p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Drug interaction status */}
          {checkingInteraction && (
            <div style={{ padding: '8px 14px', borderRadius: 10, marginBottom: 8, background: 'rgba(0,245,255,0.04)', border: '1px solid rgba(0,245,255,0.1)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid var(--cyan-bright)', borderTopColor: 'transparent', animation: 'scanRing 0.8s linear infinite' }} />
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-secondary)' }}>Checking drug interactions...</p>
            </div>
          )}

          {/* Voice Confirm section */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.40 }} style={{ marginBottom: 10 }}>
            <GlassCard style={{ padding: 14 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>🎤 Confirm Understanding</p>
              {voiceConfirmState === 'idle' && (
                <motion.button whileTap={{ scale: 0.96 }} onClick={startVoiceConfirm}
                  style={{ width: '100%', padding: '10px', borderRadius: 10, background: 'rgba(0,245,255,0.06)', border: '1px solid rgba(0,245,255,0.2)', color: 'var(--cyan-bright)', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                  Tap to confirm you understood the instructions
                </motion.button>
              )}
              {voiceConfirmState === 'recording' && (
                <motion.button whileTap={{ scale: 0.96 }} onClick={finishVoiceConfirm}
                  style={{ width: '100%', padding: '10px', borderRadius: 10, background: 'rgba(0,245,255,0.12)', border: '2px solid var(--cyan-bright)', color: 'var(--cyan-bright)', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, cursor: 'pointer', boxShadow: '0 0 20px rgba(0,245,255,0.3)' }}>
                  🔴 Recording... Tap to stop
                </motion.button>
              )}
              {voiceConfirmState === 'confirming' && <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center', padding: 8 }}>Checking your answer...</p>}
              {(voiceConfirmState === 'passed' || voiceConfirmState === 'failed') && (
                <div style={{ padding: '10px 12px', borderRadius: 10, background: voiceConfirmState === 'passed' ? 'rgba(0,255,136,0.06)' : 'rgba(255,184,0,0.06)', border: `1px solid ${voiceConfirmState === 'passed' ? 'rgba(0,255,136,0.2)' : 'rgba(255,184,0,0.2)'}` }}>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: voiceConfirmState === 'passed' ? 'var(--bio-green)' : 'var(--med-amber)' }}>{voiceConfirmFeedback}</p>
                </div>
              )}
            </GlassCard>
          </motion.div>

          {/* CTAs */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.46 }} style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            <button onClick={handleSetReminder} disabled={reminderSet}
              style={{ padding: '14px', borderRadius: 12, fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14, cursor: reminderSet ? 'default' : 'pointer', background: reminderSet ? 'rgba(0,255,136,0.08)' : 'linear-gradient(135deg, var(--cyan-bright), var(--cyan-mid))', color: reminderSet ? 'var(--bio-green)' : 'var(--bg-void)', border: reminderSet ? '1px solid rgba(0,255,136,0.2)' : 'none', boxShadow: reminderSet ? 'none' : '0 0 20px rgba(0,245,255,0.3)', minHeight: 50 }}>
              {reminderSet ? '✓ Reminder Set!' : '🔔 Set Dose Reminder'}
            </button>
            <button onClick={handleAddToMeds} disabled={addedToMeds}
              style={{ padding: '12px', borderRadius: 12, fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, cursor: addedToMeds ? 'default' : 'pointer', background: 'rgba(0,245,255,0.06)', border: '1px solid rgba(0,245,255,0.18)', color: addedToMeds ? 'var(--bio-green)' : 'var(--cyan-bright)', minHeight: 46 }}>
              {addedToMeds ? '✓ Added to Active Medicines' : '+ Add to My Medicines'}
            </button>
          </motion.div>
        </div>

        {/* Interaction Alert Modal */}
        <AnimatePresence>
          {showInteraction && interactionData && (
            <InteractionAlert data={interactionData} onClose={() => setShowInteraction(false)} />
          )}
        </AnimatePresence>
      </PageTransition>
    </AppShell>
  )
}
