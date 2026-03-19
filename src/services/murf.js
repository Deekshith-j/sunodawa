import { supabase, isSupabaseEnabled } from './supabase'

const MURF_API_KEY = import.meta.env.VITE_MURF_API_KEY

export function isMurfConfigured() {
  return isSupabaseEnabled || !!(MURF_API_KEY && MURF_API_KEY !== 'your_murf_api_key' && MURF_API_KEY.length > 10)
}

// Voice IDs by language and gender (verified Murf API voice IDs)
export const VOICE_MAP = {
  Hindi:    { female: 'hi-IN-ayushi',   male: 'hi-IN-rohan',    bcp47: 'hi-IN', name: 'हिंदी' },
  Marathi:  { female: 'mr-IN-aarohi',   male: 'mr-IN-shrikant', bcp47: 'mr-IN', name: 'मराठी' },
  Tamil:    { female: 'ta-IN-dhivya',   male: 'ta-IN-arjun',    bcp47: 'ta-IN', name: 'தமிழ்' },
  Telugu:   { female: 'te-IN-bhavani',  male: 'te-IN-charan',   bcp47: 'te-IN', name: 'తెలుగు' },
  Bengali:  { female: 'bn-IN-puja',     male: 'bn-IN-arnav',    bcp47: 'bn-IN', name: 'বাংলা' },
  Gujarati: { female: 'gu-IN-aashna',   male: 'gu-IN-yuvraj',   bcp47: 'gu-IN', name: 'ગુજરાતી' },
  Kannada:  { female: 'kn-IN-gowri',    male: 'kn-IN-varun',    bcp47: 'kn-IN', name: 'ಕನ್ನಡ' },
  English:  { female: 'en-IN-natalie',  male: 'en-IN-rohan',    bcp47: 'en-IN', name: 'English' },
  Malayalam:{ female: 'ml-IN-lakshmi',  male: 'ml-IN-arjun',    bcp47: 'ml-IN', name: 'മലയാളം' },
  Punjabi:  { female: 'pa-IN-priya',    male: 'pa-IN-gurpreet', bcp47: 'pa-IN', name: 'ਪੰਜਾਬੀ' },
}

let currentAudio = null
let analyserNode = null
let audioContext = null

export function getVoiceId(language, gender = 'female') {
  const lang = VOICE_MAP[language] || VOICE_MAP['Hindi']
  return lang[gender] || lang.female
}

export async function speakInstruction(text, voiceId, speed = 0, language = 'Hindi') {
  // Stop any currently playing audio
  stopAudio()

  if (!isMurfConfigured()) {
    // Fallback: use browser TTS with the correct language BCP-47 code
    return useBrowserTTS(text, language)
  }

  try {
    let data;

    if (isSupabaseEnabled) {
      const result = await supabase.functions.invoke('ai-proxy', {
        body: {
          provider: 'murf',
          payload: {
            text: text,
            voiceId: voiceId,
            format: 'MP3',
            sampleRate: 24000,
            speed: speed,
            pitch: 0,
            encodeAsBase64: false
          }
        }
      })
      if (result.error) throw new Error('API_ERROR_500')
      if (result.data?.error) throw new Error(result.data.error)
      data = result.data
    } else {
      const response = await fetch('https://api.murf.ai/v1/speech/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': MURF_API_KEY
        },
        body: JSON.stringify({
          text: text,
          voiceId: voiceId,
          format: 'MP3',
          sampleRate: 24000,
          speed: speed,
          pitch: 0,
          encodeAsBase64: false
        })
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        console.error('Murf API error:', err)
        return useBrowserTTS(text, language)
      }

      data = await response.json()
    }

    const audioUrl = data.audioFile

    if (!audioUrl) return useBrowserTTS(text, language)

    return playAudioWithAnalyser(audioUrl)
  } catch (error) {
    console.error('Murf speak error:', error)
    return useBrowserTTS(text, language)
  }
}

function useBrowserTTS(text, language = 'Hindi') {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) { resolve(null); return }
    const utterance = new SpeechSynthesisUtterance(text)
    // Use correct language code for each language
    const langMap = VOICE_MAP[language]
    utterance.lang = langMap?.bcp47 || 'hi-IN'
    utterance.rate = 0.85
    utterance.pitch = 1
    utterance.onend = () => resolve(null)
    utterance.onerror = () => resolve(null)
    window.speechSynthesis.speak(utterance)
  })
}


export async function playAudioWithAnalyser(audioUrl) {
  return new Promise((resolve, reject) => {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)()
      analyserNode = audioContext.createAnalyser()
      analyserNode.fftSize = 256
      analyserNode.connect(audioContext.destination)

      currentAudio = new Audio(audioUrl)
      currentAudio.crossOrigin = 'anonymous'

      const source = audioContext.createMediaElementSource(currentAudio)
      source.connect(analyserNode)

      currentAudio.play()
      currentAudio.onended = () => {
        audioContext?.close()
        audioContext = null
        analyserNode = null
        currentAudio = null
        resolve(null)
      }
      currentAudio.onerror = (e) => {
        console.error('Audio play error', e)
        reject(e)
      }
    } catch (e) {
      console.error('AudioContext error', e)
      reject(e)
    }
  })
}

export function getAnalyserNode() {
  return analyserNode
}

export function stopAudio() {
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.src = ''
    currentAudio = null
  }
  if (audioContext) {
    audioContext.close()
    audioContext = null
    analyserNode = null
  }
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
}

export function isAudioPlaying() {
  return currentAudio && !currentAudio.paused
}
