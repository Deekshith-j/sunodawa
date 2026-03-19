import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useAppStore from '../store/useAppStore'
import { startCamera, stopCamera, captureFrame, hasCamera } from '../services/camera'
import { parseMedicineLabel, isGeminiConfigured } from '../services/gemini'
import { saveScanToIDB } from '../services/storage'
import ScanReticle from '../components/ui/ScanReticle'
import AppShell from '../components/layout/AppShell'

// ── No API Key screen ────────────────────────────────────────────────
function NoApiKeyScreen({ onBack }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: 24, gap: 20,
      background: '#F0F6FF',
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: 20,
        background: 'var(--amber-light)', border: '2px solid rgba(245,158,11,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36,
      }}>🔑</div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--text-primary)', marginBottom: 8 }}>
          Gemini API Key Required
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
          To scan real medicine labels with AI, you need a free Gemini API key.
        </p>
        <div style={{
          background: 'white', border: '1.5px solid var(--card-border)', borderRadius: 14,
          padding: 16, textAlign: 'left', marginBottom: 16,
        }}>
          <p style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13, color: 'var(--blue-primary)', marginBottom: 10 }}>
            How to set it up:
          </p>
          {[
            { step: '1', text: 'Go to aistudio.google.com', link: 'https://aistudio.google.com' },
            { step: '2', text: 'Click "Get API Key" (free)' },
            { step: '3', text: 'Copy the key' },
            { step: '4', text: 'Open .env file in project root' },
            { step: '5', text: 'Set VITE_GEMINI_API_KEY=your_key', mono: true },
            { step: '6', text: 'Restart the dev server' },
          ].map(s => (
            <div key={s.step} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--blue-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, color: 'var(--blue-primary)' }}>{s.step}</span>
              </div>
              <p style={{ fontFamily: s.mono ? 'var(--font-mono)' : 'var(--font-body)', fontSize: 12, color: s.mono ? 'var(--blue-primary)' : 'var(--text-secondary)', paddingTop: 2, lineHeight: 1.4 }}>
                {s.link ? <a href={s.link} target="_blank" rel="noreferrer" style={{ color: 'var(--blue-primary)', fontWeight: 600 }}>{s.text}</a> : s.text}
              </p>
            </div>
          ))}
        </div>
        <div style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--green-light)', border: '1px solid rgba(22,199,132,0.2)', textAlign: 'left' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--green-health)', fontWeight: 600 }}>
            ✓ Gemini API is FREE — 15 requests/minute on free tier
          </p>
        </div>
      </div>
      <button onClick={onBack} className="btn-ghost" style={{ padding: '10px 24px', width: '100%' }}>
        ← Go Back
      </button>
    </div>
  )
}

// ── Loading states ─────────────────────────────────────────────────
const LOADING_STEPS = [
  { label: 'Analyzing image...', icon: '🔍' },
  { label: 'Reading medicine name...', icon: '💊' },
  { label: 'Extracting dosage info...', icon: '📋' },
  { label: 'Generating instructions...', icon: '🗣️' },
]

export default function Scan() {
  const navigate = useNavigate()
  const { selectedLanguage, addScan } = useAppStore()
  const videoRef = useRef()
  const [state, setState] = useState('idle') // idle | scanning | preview | loading | error | nokey
  const [capturedImage, setCapturedImage] = useState(null)
  const [error, setError] = useState('')
  const [loadingStep, setLoadingStep] = useState(0)

  const initCamera = useCallback(async () => {
    if (!isGeminiConfigured()) {
      setState('nokey')
      return
    }
    if (!hasCamera()) {
      setError('Camera not available on this device.')
      setState('error')
      return
    }
    try {
      await startCamera(videoRef.current, 'environment')
      setState('scanning')
    } catch (err) {
      console.error(err)
      setError('Could not access camera. Please allow camera permission.')
      setState('error')
    }
  }, [])

  useEffect(() => {
    initCamera()
    return () => stopCamera()
  }, [initCamera])

  const handleCapture = () => {
    if (!videoRef.current || state !== 'scanning') return
    const frame = captureFrame(videoRef.current)
    setCapturedImage(frame)
    setState('preview')
    stopCamera()
  }

  const handleRetake = async () => {
    setCapturedImage(null)
    setState('idle')
    await initCamera()
  }

  const handleConfirm = async () => {
    setState('loading')
    setLoadingStep(0)

    // Animate loading steps
    const stepTimer = setInterval(() => {
      setLoadingStep(s => {
        if (s >= LOADING_STEPS.length - 1) { clearInterval(stepTimer); return s }
        return s + 1
      })
    }, 1200)

    try {
      const result = await parseMedicineLabel(capturedImage, selectedLanguage)
      clearInterval(stepTimer)
      const scan = addScan({ ...result, image: capturedImage, language: selectedLanguage })
      await saveScanToIDB(scan)
      navigate(`/result/${scan.id}`)
    } catch (err) {
      clearInterval(stepTimer)
      console.error('Scan error:', err)
      if (err.message === 'NO_API_KEY') {
        setState('nokey')
      } else if (err.message === 'INVALID_IMAGE') {
        setError('The image is not clear enough. Please take a closer photo of the label.')
        setState('preview')
      } else if (err.message === 'RATE_LIMIT') {
        setError('Too many requests. Please wait 1 minute and try again.')
        setState('preview')
      } else if (err.message === 'PARSE_FAILED') {
        setError('Could not read the label. Make sure the medicine text is clearly visible and try again.')
        setState('preview')
      } else {
        setError('Could not analyze the image. Please try with better lighting.')
        setState('preview')
      }
    }
  }

  if (state === 'nokey') {
    return (
      <AppShell showNav={false}>
        <div style={{ position: 'relative', height: '100%' }}>
          <NoApiKeyScreen onBack={() => navigate(-1)} />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell showNav={false}>
      <div className="relative h-full flex flex-col" style={{ background: '#000' }}>
        {/* Camera / Preview */}
        <div className="relative flex-1 overflow-hidden">
          {/* Live camera */}
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            playsInline muted
            style={{ display: state === 'scanning' ? 'block' : 'none' }}
          />

          {/* Captured image */}
          {capturedImage && (
            <img src={capturedImage} alt="Captured" className="absolute inset-0 w-full h-full object-cover" />
          )}

          {/* Scan reticle */}
          {(state === 'scanning' || state === 'preview') && (
            <ScanReticle isScanning={state === 'scanning'} />
          )}

          {/* Instruction */}
          {state === 'scanning' && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 pb-4 pt-8 flex flex-col items-center gap-2"
              style={{ background: 'linear-gradient(to top, rgba(5,11,24,0.9) 0%, transparent 100%)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            >
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'white', textAlign: 'center' }}>
                📷 Point camera at medicine label or prescription
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
                Hold steady — ensure text is clearly visible
              </p>
            </motion.div>
          )}

          {/* Loading overlay */}
          <AnimatePresence>
            {state === 'loading' && (
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-8"
                style={{ background: 'rgba(248,250,255,0.97)' }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              >
                {/* Animated scanner */}
                <div style={{ position: 'relative', width: 90, height: 90 }}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                    style={{
                      position: 'absolute', inset: 0, borderRadius: '50%',
                      border: '3px solid transparent',
                      borderTopColor: 'var(--blue-primary)',
                      borderRightColor: 'rgba(26,111,219,0.3)',
                    }}
                  />
                  <div style={{
                    position: 'absolute', inset: 10, borderRadius: '50%',
                    background: 'var(--blue-pale)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30,
                  }}>
                    {LOADING_STEPS[loadingStep]?.icon}
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: 'var(--blue-primary)', marginBottom: 8 }}>
                    Reading Medicine Label
                  </p>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={loadingStep}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-secondary)' }}
                    >
                      {LOADING_STEPS[loadingStep]?.label}
                    </motion.p>
                  </AnimatePresence>
                </div>

                {/* Progress dots */}
                <div style={{ display: 'flex', gap: 6 }}>
                  {LOADING_STEPS.map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ scale: i === loadingStep ? 1.4 : 1, background: i <= loadingStep ? 'var(--blue-primary)' : 'var(--card-border)' }}
                      style={{ width: 8, height: 8, borderRadius: '50%' }}
                    />
                  ))}
                </div>

                <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)' }}>
                  Powered by Gemini AI 🤖
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error overlay */}
          {state === 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6"
              style={{ background: 'rgba(240,246,255,0.97)' }}>
              <div style={{ borderRadius: 20, padding: 20, background: 'var(--red-light)', border: '1.5px solid rgba(239,68,68,0.25)', textAlign: 'center', maxWidth: 300 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--red-danger)', fontWeight: 600, lineHeight: 1.5 }}>{error}</p>
              </div>
              <button onClick={() => { setState('idle'); setCapturedImage(null); initCamera() }} className="btn-primary" style={{ padding: '12px 28px' }}>
                Try Again
              </button>
            </div>
          )}

          {/* Back button */}
          <motion.button
            className="absolute z-20 rounded-full flex items-center justify-center"
            style={{
              top: 'max(16px, env(safe-area-inset-top))', left: 16,
              width: 44, height: 44,
              background: 'rgba(255,255,255,0.85)',
              border: '1.5px solid rgba(26,111,219,0.15)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 2px 12px rgba(26,111,219,0.1)',
            }}
            onClick={() => { stopCamera(); navigate(-1) }}
            whileTap={{ scale: 0.9 }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--blue-primary)" strokeWidth={2} className="w-5 h-5">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.button>

          {/* Language badge */}
          <div className="absolute z-20"
            style={{
              top: 'max(16px, env(safe-area-inset-top))', right: 16,
              padding: '6px 12px', borderRadius: 20,
              background: 'rgba(255,255,255,0.85)',
              border: '1.5px solid rgba(26,111,219,0.15)',
              color: 'var(--blue-primary)',
              backdropFilter: 'blur(10px)',
              fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700,
            }}>
            🌐 {selectedLanguage}
          </div>
        </div>

        {/* Bottom controls */}
        <div
          className="flex items-center justify-center gap-8 px-8 py-6"
          style={{
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
            borderTop: '1.5px solid rgba(26,111,219,0.1)',
            paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
          }}
        >
          {state === 'scanning' && (
            <motion.button
              className="rounded-full flex items-center justify-center"
              style={{
                width: 80, height: 80,
                background: 'var(--blue-pale)',
                border: '4px solid var(--blue-primary)',
                boxShadow: '0 0 0 6px rgba(26,111,219,0.12), 0 4px 20px rgba(26,111,219,0.3)',
              }}
              onClick={handleCapture}
              whileTap={{ scale: 0.9 }}
            >
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--blue-primary)' }} />
            </motion.button>
          )}

          {state === 'preview' && (
            <div className="flex items-center gap-4 w-full">
              <motion.button
                className="flex-1 py-3 rounded-xl font-sans font-semibold text-base"
                style={{
                  background: 'var(--bg-elevated)', border: '1.5px solid var(--card-border)',
                  color: 'var(--text-secondary)', minHeight: 52,
                  fontFamily: 'var(--font-body)', cursor: 'pointer',
                }}
                onClick={handleRetake}
                whileTap={{ scale: 0.96 }}
              >
                Retake
              </motion.button>
              <motion.button
                className="flex-1 py-3 rounded-xl font-bold text-base btn-primary"
                style={{ minHeight: 52 }}
                onClick={handleConfirm}
                whileTap={{ scale: 0.96 }}
              >
                ✓ Analyze with AI
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
