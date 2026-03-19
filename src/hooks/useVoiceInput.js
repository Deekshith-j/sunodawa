import { useState, useRef } from 'react'
import { LANG_CODES } from '../services/gemini'
import useAppStore from '../store/useAppStore'

export function useVoiceInput() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const recognitionRef = useRef(null)

  const { selectedLanguage } = useAppStore()

  async function startRecording() {
    setTranscript('')
    setIsRecording(true)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setIsRecording(false)
      return
    }
    const recognition = new SpeechRecognition()
    recognition.lang = LANG_CODES[selectedLanguage] || 'hi-IN'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognitionRef.current = recognition
    recognition.start()
  }

  function stopRecording() {
    setIsRecording(false)
    setIsProcessing(true)
    return new Promise((resolve) => {
      if (!recognitionRef.current) { setIsProcessing(false); resolve(''); return }
      recognitionRef.current.onresult = (e) => {
        const text = e.results[0]?.[0]?.transcript || ''
        setTranscript(text)
        setIsProcessing(false)
        resolve(text)
      }
      recognitionRef.current.onerror = () => { setIsProcessing(false); resolve('') }
      recognitionRef.current.onend = () => { setIsProcessing(false) }
      recognitionRef.current.stop()
    })
  }

  function cancel() {
    if (recognitionRef.current) recognitionRef.current.abort()
    setIsRecording(false)
    setIsProcessing(false)
  }

  return { isRecording, isProcessing, transcript, startRecording, stopRecording, cancel }
}
