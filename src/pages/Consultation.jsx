import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AppShell from '../components/layout/AppShell'
import PageTransition from '../components/layout/PageTransition'
import useAppStore from '../store/useAppStore'
import { consultGemini, isGeminiConfigured } from '../services/gemini'
import { speakInstruction, stopAudio, getVoiceId, isMurfConfigured, VOICE_MAP } from '../services/murf'
import { useVoiceInput } from '../hooks/useVoiceInput'

// ── Consultation steps ──────────────────────────────────────────
const STEP_LABELS = ['Symptom', 'Duration', 'Severity', 'Details', 'History', 'Lifestyle', 'Assessment']

// ── No API Key Screen ──────────────────────────────────────────
function NoApiKeyScreen() {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16, textAlign: 'center' }}>
      <div style={{ width: 72, height: 72, borderRadius: 20, background: 'var(--amber-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>🔑</div>
      <div>
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--text-primary)', marginBottom: 6 }}>Gemini API Key Required</p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Set your real Gemini API key as a secure secret in your backend to talk to Dr. Ananya.
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', marginTop: 10 }}>
          Terminal command: <code style={{ background: 'var(--blue-pale)', padding: '2px 6px', borderRadius: 4, fontSize: 11, display: 'block', marginTop: 4 }}>npx supabase secrets set GEMINI_API_KEY=YOUR_REAL_KEY</code>
        </p>
      </div>
    </div>
  )
}

// ── Doctor avatar ─────────────────────────────────────────────────
function DoctorAvatar({ isSpeaking, isThinking }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ position: 'relative', width: 72, height: 72 }}>
        {/* Speaking pulse rings */}
        {isSpeaking && (
          <>
            <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}
              style={{ position: 'absolute', inset: -8, borderRadius: '50%', border: '2px solid rgba(124,58,237,0.3)' }} />
            <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.25, 0, 0.25] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
              style={{ position: 'absolute', inset: -16, borderRadius: '50%', border: '2px solid rgba(124,58,237,0.15)' }} />
          </>
        )}
        {/* Main avatar circle */}
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)',
          border: `2.5px solid ${isSpeaking ? 'var(--purple-accent)' : 'rgba(124,58,237,0.3)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: isSpeaking ? '0 0 24px rgba(124,58,237,0.35)' : '0 2px 12px rgba(124,58,237,0.15)',
          transition: 'all 0.3s',
          position: 'relative', overflow: 'hidden',
        }}>
          {isThinking ? (
            // Thinking dots
            <div style={{ display: 'flex', gap: 4 }}>
              {[0, 1, 2].map(i => (
                <motion.div key={i} animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                  style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--purple-accent)' }} />
              ))}
            </div>
          ) : isSpeaking ? (
            // Waveform bars
            <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
              {[1, 1.5, 2, 1.5, 1].map((h, i) => (
                <motion.div key={i} animate={{ scaleY: [0.4, h, 0.4] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.12 }}
                  style={{ width: 4, height: 20, borderRadius: 2, background: 'var(--purple-accent)', transformOrigin: 'center' }} />
              ))}
            </div>
          ) : (
            // Doctor icon
            <svg viewBox="0 0 48 48" fill="none" width={40} height={40}>
              <circle cx="24" cy="16" r="10" stroke="#7C3AED" strokeWidth="2.5"/>
              <path d="M8 44c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M30 12c1.5 1 2.5 2.7 2.5 4.5" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
              {/* Stethoscope */}
              <circle cx="32" cy="28" r="3" stroke="#7C3AED" strokeWidth="1.5"/>
            </svg>
          )}
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--purple-accent)' }}>Dr. Ananya</p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)' }}>AI Medical Assistant</p>
      </div>
    </div>
  )
}

// ── Progress bar ─────────────────────────────────────────────────
function ConsultProgress({ step }) {
  return (
    <div style={{ padding: '4px 0 8px' }}>
      <div style={{ display: 'flex', gap: 3, marginBottom: 4 }}>
        {STEP_LABELS.map((label, i) => (
          <div key={label} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= step ? 'var(--purple-accent)' : 'var(--purple-light)', transition: 'all 0.4s' }} />
        ))}
      </div>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--purple-accent)', fontWeight: 600 }}>
        Step {step + 1}/{STEP_LABELS.length}: {STEP_LABELS[Math.min(step, STEP_LABELS.length - 1)]}
      </p>
    </div>
  )
}

// ── Message bubble ────────────────────────────────────────────────
function MessageBubble({ message, index, onSpeak }) {
  const isDoctor = message.role === 'assistant'
  // Parse assessment out of doctor messages
  const content = isDoctor ? message.content.replace(/---ASSESSMENT---[\s\S]*/g, '').trim() : message.content
  const hasAssessment = isDoctor && message.content.includes('---ASSESSMENT---')

  let assessment = null
  if (hasAssessment) {
    try {
      const jsonStr = message.content.split('---ASSESSMENT---')[1].trim()
      const match = jsonStr.match(/\{[\s\S]*\}/)
      if (match) assessment = JSON.parse(match[0])
    } catch { /* ignore */ }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.03, duration: 0.3, type: 'spring', stiffness: 300, damping: 30 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: isDoctor ? 'flex-start' : 'flex-end', marginBottom: 10 }}
    >
      {/* Doctor name label */}
      {isDoctor && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, marginLeft: 2 }}>
          <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--purple-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 16 16" fill="none" width={10} height={10}>
              <circle cx="8" cy="5" r="3" stroke="#7C3AED" strokeWidth="1.5"/>
              <path d="M2 15c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, color: 'var(--purple-accent)' }}>Dr. Ananya</p>
        </div>
      )}

      {/* Main bubble */}
      <div style={{
        maxWidth: '85%',
        padding: '11px 14px',
        borderRadius: isDoctor ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
        background: isDoctor ? 'white' : 'var(--blue-primary)',
        border: isDoctor ? '1.5px solid rgba(124,58,237,0.15)' : 'none',
        boxShadow: isDoctor ? '0 2px 10px rgba(124,58,237,0.08)' : '0 2px 10px rgba(26,111,219,0.25)',
        fontFamily: 'var(--font-body)', fontSize: 13.5, lineHeight: 1.6,
        color: isDoctor ? 'var(--text-primary)' : 'white',
        whiteSpace: 'pre-wrap',
      }}>
        {content}
        {/* Speak button for doctor messages */}
        {isDoctor && onSpeak && (
          <button onClick={() => onSpeak(content)} style={{
            display: 'flex', alignItems: 'center', gap: 4, marginTop: 8,
            padding: '3px 8px', borderRadius: 20,
            background: 'var(--purple-light)', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--purple-accent)', fontWeight: 600,
          }}>
            🔊 Speak
          </button>
        )}
      </div>

      {/* Assessment card */}
      {assessment && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            marginTop: 10, maxWidth: '95%',
            background: assessment.severity === 'emergency' ? 'var(--red-light)' :
                        assessment.severity === 'severe' ? 'var(--amber-light)' : 'var(--green-light)',
            border: `1.5px solid ${assessment.severity === 'emergency' ? 'rgba(239,68,68,0.3)' :
                        assessment.severity === 'severe' ? 'rgba(245,158,11,0.3)' : 'rgba(22,199,132,0.25)'}`,
            borderRadius: 14, padding: '14px 16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 20 }}>{assessment.severity === 'emergency' ? '🚨' : assessment.severity === 'severe' ? '⚠️' : '✅'}</span>
            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 14, color: 'var(--text-primary)' }}>
                {assessment.condition}
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-secondary)' }}>
                Severity: <strong>{assessment.severity}</strong> · See doctor: {assessment.urgency}
              </p>
            </div>
          </div>
          {assessment.advice && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: 8 }}>{assessment.advice}</p>
          )}
          {assessment.dietAdvice && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 6 }}>
              🥗 <strong>Diet:</strong> {assessment.dietAdvice}
            </p>
          )}
          {assessment.homeRemedies && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              🏠 <strong>Home remedy:</strong> {assessment.homeRemedies}
            </p>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}

export default function Consultation() {
  const { selectedLanguage, voiceGender, addConsultation } = useAppStore()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [step, setStep] = useState(0)
  const [consultSaved, setConsultSaved] = useState(false)
  const chatEndRef = useRef()
  const inputRef = useRef()
  const apiConfigured = isGeminiConfigured()
  const murfOk = isMurfConfigured()
  
  const { isRecording, startRecording, stopRecording } = useVoiceInput()

  // Start consultation on load
  useEffect(() => {
    if (!apiConfigured) return
    startConsultation()
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const startConsultation = async () => {
    setIsLoading(true)
    try {
      const greeting = await consultGemini({
        messages: [{ role: 'user', content: 'Hello, I need medical help.' }],
        language: selectedLanguage,
        isFirstMessage: true,
      })
      const msg = { role: 'assistant', content: greeting.response, id: Date.now() }
      setMessages([msg])
      speakMessage(greeting.response)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const speakMessage = async (text) => {
    setIsSpeaking(true)
    try {
      const voiceId = getVoiceId(selectedLanguage, voiceGender)
      await speakInstruction(text, voiceId, 0, selectedLanguage)
    } catch (e) { console.error(e) } finally {
      setIsSpeaking(false)
    }
  }

  const sendMessage = async (userText) => {
    if (!userText.trim() || isLoading) return
    setInput('')
    const userMsg = { role: 'user', content: userText.trim(), id: Date.now() }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setIsLoading(true)
    setStep(s => Math.min(s + 1, STEP_LABELS.length - 1))

    try {
      const result = await consultGemini({
        messages: updatedMessages,
        language: selectedLanguage,
        isFirstMessage: false,
      })
      const doctorMsg = { role: 'assistant', content: result.response, id: Date.now() + 1 }
      setMessages(prev => [...prev, doctorMsg])
      speakMessage(result.response.replace(/---ASSESSMENT---[\s\S]*/g, '').trim())

      // Save consultation if assessment reached
      if (result.response.includes('---ASSESSMENT---') && !consultSaved) {
        setConsultSaved(true)
        addConsultation({ messages: [...updatedMessages, doctorMsg], language: selectedLanguage })
      }
    } catch (e) {
      console.error(e)
      const errMsg = { role: 'assistant', content: 'Mujhe thodi takleef ho rahi hai jawab dene mein. Kripya dobara try karein.', id: Date.now() + 1 }
      setMessages(prev => [...prev, errMsg])
    } finally { setIsLoading(false) }
  }

  const handleReset = () => {
    stopAudio()
    setMessages([])
    setStep(0)
    setConsultSaved(false)
    if (apiConfigured) startConsultation()
  }

  // Quick symptom chips
  const QUICK_SYMPTOMS = selectedLanguage === 'Hindi'
    ? ['Sar mein dard', 'Bukhaar hai', 'Pet mein dard', 'Khansi']
    : ['Headache', 'Fever', 'Stomach pain', 'Cough']

  return (
    <AppShell>
      <PageTransition>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: 'var(--bg-primary)' }}>

          {/* Header */}
          <div style={{
            padding: 'max(16px, env(safe-area-inset-top)) 16px 10px',
            background: 'rgba(255,255,255,0.95)',
            borderBottom: '1.5px solid rgba(124,58,237,0.1)',
            backdropFilter: 'blur(16px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <DoctorAvatar isSpeaking={isSpeaking} isThinking={isLoading} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {/* Murf status badge */}
                <div style={{
                  padding: '3px 8px', borderRadius: 20, fontSize: 10, fontFamily: 'var(--font-body)', fontWeight: 600,
                  background: murfOk ? 'var(--green-light)' : 'var(--amber-light)',
                  color: murfOk ? 'var(--green-health)' : 'var(--amber-warn)',
                  border: `1px solid ${murfOk ? 'rgba(22,199,132,0.2)' : 'rgba(245,158,11,0.2)'}`,
                }}>
                  🔊 {murfOk ? 'Murf AI' : 'Browser TTS'}
                </div>
                <button onClick={() => stopAudio()}
                  style={{ padding: '4px 10px', borderRadius: 20, background: 'var(--red-light)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--red-danger)', fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>
                  ⏹ Stop
                </button>
                <button onClick={handleReset}
                  style={{ padding: '4px 10px', borderRadius: 20, background: 'var(--blue-pale)', border: '1px solid rgba(26,111,219,0.2)', color: 'var(--blue-primary)', fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>
                  New ↺
                </button>
              </div>
            </div>
            <ConsultProgress step={step} />
          </div>

          {/* No API key */}
          {!apiConfigured && <NoApiKeyScreen />}

          {/* Chat messages */}
          {apiConfigured && (
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column' }}>
              {messages.map((msg, i) => (
                <MessageBubble key={msg.id || i} message={msg} index={i} onSpeak={msg.role === 'assistant' ? speakMessage : null} />
              ))}

              {/* Thinking indicator */}
              {isLoading && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'white', borderRadius: '4px 16px 16px 16px', border: '1.5px solid rgba(124,58,237,0.15)', maxWidth: 120, marginBottom: 10 }}>
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--purple-accent)' }} />
                  ))}
                </motion.div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}

          {/* Input area */}
          {apiConfigured && (
            <div style={{
              padding: '10px 14px', paddingBottom: `max(calc(10px + env(safe-area-inset-bottom)), 80px)`,
              background: 'rgba(255,255,255,0.97)',
              borderTop: '1.5px solid rgba(124,58,237,0.1)',
              backdropFilter: 'blur(16px)',
            }}>
              {/* Quick symptom chips (only when no messages or just greeting) */}
              {messages.length <= 1 && (
                <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                  {QUICK_SYMPTOMS.map(s => (
                    <motion.button key={s} whileTap={{ scale: 0.95 }} onClick={() => sendMessage(s)}
                      style={{ padding: '6px 12px', borderRadius: 20, background: 'var(--purple-light)', border: '1px solid rgba(124,58,237,0.2)', color: 'var(--purple-accent)', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      {s}
                    </motion.button>
                  ))}
                </div>
              )}
              
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
                  placeholder={isRecording ? 'Listening...' : (selectedLanguage === 'Hindi' ? 'Dr. Ananya ko apni takleef batayein...' : 'Describe your symptoms to Dr. Ananya...')}
                  rows={1}
                  disabled={isLoading || isRecording}
                  style={{
                    flex: 1, padding: '10px 14px', borderRadius: 12,
                    background: isRecording ? 'var(--red-light)' : 'var(--purple-light)', 
                    border: `1.5px solid ${isRecording ? 'var(--red-danger)' : 'rgba(124,58,237,0.2)'}`,
                    color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: 14,
                    outline: 'none', resize: 'none', lineHeight: 1.5,
                    maxHeight: 100, overflowY: 'auto',
                  }}
                />
                
                {/* Voice Input Button */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={async () => {
                    if (isRecording) {
                      const text = await stopRecording()
                      if (text) sendMessage(text)
                    } else {
                      startRecording()
                    }
                  }}
                  disabled={isLoading}
                  style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: isRecording ? 'var(--red-danger)' : 'var(--purple-light)',
                    border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: isRecording ? '0 4px 16px rgba(239,68,68,0.35)' : 'none',
                    transition: 'all 0.2s', flexShrink: 0,
                  }}
                >
                  {isRecording ? (
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="6" y="6" width="12" height="12" rx="2" ry="2"></rect>
                      </svg>
                    </motion.div>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--purple-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                      <line x1="12" y1="19" x2="12" y2="23"></line>
                      <line x1="8" y1="23" x2="16" y2="23"></line>
                    </svg>
                  )}
                </motion.button>

                {/* Text Send Button */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => sendMessage(input)}
                  disabled={isLoading || !input.trim() || isRecording}
                  style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: (input.trim() && !isRecording) ? 'var(--purple-accent)' : 'var(--purple-light)',
                    border: 'none', cursor: (input.trim() && !isRecording) ? 'pointer' : 'default',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: (input.trim() && !isRecording) ? '0 4px 16px rgba(124,58,237,0.35)' : 'none',
                    transition: 'all 0.2s', flexShrink: 0,
                    opacity: isRecording ? 0.4 : 1,
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke={(input.trim() && !isRecording) ? 'white' : 'var(--purple-accent)'} strokeWidth={2} width={18} height={18}>
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </PageTransition>
    </AppShell>
  )
}
