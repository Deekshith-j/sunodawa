import { supabase, isSupabaseEnabled } from './supabase'

// ===================== API CONFIG =====================
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`

export function isGeminiConfigured() {
  return isSupabaseEnabled || !!(GEMINI_KEY && GEMINI_KEY !== 'your_gemini_api_key' && GEMINI_KEY.length > 10)
}

// Internal helper to route Gemini calls to Edge Function OR fallback to local key
async function callGeminiApi(payload) {
  if (isSupabaseEnabled) {
    const { data, error } = await supabase.functions.invoke('ai-proxy', {
      body: { provider: 'gemini', payload }
    })
    
    if (error) throw new Error('API_ERROR_500')
    if (data?.error) {
      if (data.error.includes('rate limit') || data.error.includes('429')) throw new Error('RATE_LIMIT')
      if (data.error.includes('400')) throw new Error('INVALID_IMAGE')
      throw new Error('API_ERROR_' + data.error)
    }
    return data
  } else {
    // Fallback to direct client-side fetch if Supabase is not connected
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      const status = err?.error?.code || response.status
      if (status === 400) throw new Error('INVALID_IMAGE')
      if (status === 429) throw new Error('RATE_LIMIT')
      throw new Error(`API_ERROR_${status}`)
    }
    return await response.json()
  }
}

// ===================== MURF SUPPORTED LANGUAGES =====================
// Languages with verified Murf API voice IDs
export const MURF_SUPPORTED_LANGUAGES = [
  'Hindi', 'English', 'Tamil', 'Telugu', 'Kannada', 'Malayalam',
  'Bengali', 'Gujarati', 'Marathi', 'Punjabi',
]

// Full voice map — only these language/voice combos work in Murf API
export const VOICE_MAP = {
  Hindi:    { female: 'hi-IN-ayushi',  male: 'hi-IN-rohan',    langCode: 'hi-IN' },
  English:  { female: 'en-IN-natalie', male: 'en-IN-rohan',    langCode: 'en-IN' },
  Tamil:    { female: 'ta-IN-dhivya',  male: 'ta-IN-arjun',    langCode: 'ta-IN' },
  Telugu:   { female: 'te-IN-bhavani', male: 'te-IN-charan',   langCode: 'te-IN' },
  Bengali:  { female: 'bn-IN-puja',    male: 'bn-IN-arnav',    langCode: 'bn-IN' },
  Gujarati: { female: 'gu-IN-aashna',  male: 'gu-IN-yuvraj',   langCode: 'gu-IN' },
  Kannada:  { female: 'kn-IN-gowri',   male: 'kn-IN-varun',    langCode: 'kn-IN' },
  Marathi:  { female: 'mr-IN-aarohi',  male: 'mr-IN-shrikant', langCode: 'mr-IN' },
  Malayalam:{ female: 'ml-IN-lakshmi', male: 'ml-IN-arjun',    langCode: 'ml-IN' },
  Punjabi:  { female: 'pa-IN-priya',   male: 'pa-IN-gurpreet', langCode: 'pa-IN' },
}

// Languages available in app for selection (superset — browser TTS used for unsupported ones)
export const ALL_LANGUAGES = [
  'Hindi', 'English', 'Tamil', 'Telugu', 'Bengali',
  'Gujarati', 'Kannada', 'Marathi', 'Malayalam', 'Punjabi',
]

export const LANG_CODES = {
  Hindi: 'hi-IN', Marathi: 'mr-IN', Tamil: 'ta-IN', Telugu: 'te-IN',
  Bengali: 'bn-IN', Gujarati: 'gu-IN', Kannada: 'kn-IN', English: 'en-IN',
  Malayalam: 'ml-IN', Punjabi: 'pa-IN',
}

// ===================== MEDICINE LABEL PARSER =====================
// Throws error if no API key — caller must handle and show error UI
export async function parseMedicineLabel(imageBase64, language = 'Hindi') {
  if (!isGeminiConfigured()) {
    throw new Error('NO_API_KEY')
  }

  const prompt = `You are an expert medical label parser helping rural patients in India who cannot read.
Analyze this medicine label or prescription image very carefully.
Extract ALL visible medical information from the image and return ONLY a valid JSON object (no markdown, no code blocks, no extra text):
{
  "medicineName": "exact brand name as printed on label",
  "genericName": "generic/chemical name or INN if visible",
  "manufacturer": "manufacturer name if visible",
  "dosage": "exact amount per dose e.g. '1 tablet', '5ml', '500mg'",
  "frequency": "how many times per day e.g. 'twice daily', 'three times a day'",
  "timing": "when exactly to take e.g. 'after meals', 'morning and night', 'before breakfast'",
  "duration": "total course duration e.g. '7 days', '30 days', 'as directed'",
  "warnings": ["warning 1 in simple language", "warning 2 in simple language"],
  "sideEffects": ["common side effect 1", "common side effect 2"],
  "medicineType": "tablet|capsule|syrup|injection|drops|cream|ointment|inhaler|other",
  "expiryDate": "MM/YYYY format if visible, else empty string",
  "batchNumber": "batch/lot number if visible, else empty string",
  "storageInstructions": "how to store e.g. 'cool dry place', 'refrigerate', else empty string",
  "shortInstruction": "A single warm, caring instruction in ${language} spoken language (as if a kind family doctor is explaining to an uneducated patient). Use very simple everyday words. Maximum 3 sentences. Must include: medicine name, how many to take, when to take (morning/night/after food etc).",
  "aiHealthAdvice": "2-3 additional health tips in ${language} relevant to this medicine. E.g. diet tips, what to avoid, lifestyle changes. Simple language."
}
IMPORTANT: 
- Read EVERY word on the label carefully
- If a field is genuinely not visible, use empty string or empty array
- NEVER make up data that is not visible on the label
- Always return valid parseable JSON`

  const imageData = imageBase64.replace(/^data:image\/[a-z+]+;base64,/, '')

  const payload = {
    contents: [{
      parts: [
        { text: prompt },
        { inline_data: { mime_type: 'image/jpeg', data: imageData } }
      ]
    }],
    generationConfig: { temperature: 0.05, topP: 0.9, maxOutputTokens: 2048 }
  }

  const data = await callGeminiApi(payload)
  
  if (data.promptFeedback?.blockReason) throw new Error('BLOCKED')

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  const clean = text.replace(/```json|```/g, '').trim()
  const match = clean.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('PARSE_FAILED')

  const result = JSON.parse(match[0])

  // Ensure required fields exist
  if (!result.medicineName) result.medicineName = 'Unknown Medicine'
  if (!result.shortInstruction) {
    result.shortInstruction = `Apna doctor ke bataye anusar yeh dawa lijiye: ${result.dosage || 'prescribed amount'} ${result.frequency || 'as directed'}.`
  }
  return result
}

// ===================== AI HEALTH ADVICE FOR MEDICINE =====================
// Ask Gemini follow-up questions about a scanned medicine
export async function getAIMedicineAdvice(medicineData, language = 'Hindi') {
  if (!isGeminiConfigured()) return null
  try {
    const payload = {
      contents: [{ parts: [{ text: `You are a helpful medical advisor. A patient has been prescribed ${medicineData.medicineName} (${medicineData.genericName || 'generic'}), ${medicineData.dosage} ${medicineData.frequency}.

Provide a concise, helpful health advice response in ${language} covering:
1. Important do's while taking this medicine (max 2 points)
2. Important don'ts / what to avoid (max 2 points)
3. When to see a doctor immediately (1 point)
4. A warm encouraging closing message

Use very simple language, like a caring doctor talking to a village patient. Total response: 5-6 sentences. Do NOT repeat the dosage instructions already given.` }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 512 }
    }
    
    const data = await callGeminiApi(payload)
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null
  } catch { return null }
}

// ===================== TRANSLATE =====================
export async function translateInstruction(text, targetLanguage) {
  if (!isGeminiConfigured()) return text
  try {
    const payload = {
      contents: [{ parts: [{ text: `Translate this medicine instruction to ${targetLanguage} in simple spoken language (as a doctor speaks to a village patient). Max 3 sentences. Very simple words. Return ONLY the translated text:\n\n${text}` }] }]
    }
    const data = await callGeminiApi(payload)
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || text
  } catch { return text }
}

// ===================== AI DOCTOR CONSULTATION (IMPROVED) =====================
export async function consultGemini({ messages, language = 'Hindi', isFirstMessage = false }) {
  if (!isGeminiConfigured()) {
    await new Promise(r => setTimeout(r, 800))
    if (isFirstMessage) return {
      response: language === 'Hindi'
        ? `Namaste! Main Dr. Ananya hoon, aapka AI doctor. Aaj aapko kya takleef ho rahi hai? Please bataiye.`
        : `Hello! I am Dr. Ananya, your AI doctor. What health concern brings you here today?`
    }
    return { response: `API key configure karein Gemini se real AI doctor consultation ke liye.` }
  }

  const systemPrompt = `You are Dr. Ananya, a warm, experienced, and thorough AI doctor assistant in the SunoDawa app — built for rural India patients.

YOUR CONSULTATION STYLE:
1. Ask ONE focused question at a time — never multiple questions in one response
2. Listen carefully to each answer before asking the next question
3. Be warm, patient, and encouraging — never clinical or cold
4. Always respond in ${language} using spoken, everyday language a village patient easily understands
5. Use analogies familiar to rural life when explaining

CONSULTATION FLOW (follow this exactly):
- Step 1 [SYMPTOM]: Ask the main complaint — "kya takleef hai?" 
- Step 2 [DURATION]: Ask "kitne din se yeh takleef hai?" — Listen carefully, then empathize before next question
- Step 3 [SEVERITY]: Ask to rate pain/discomfort 1-10, or ask if it's mild/medium/severe
- Step 4 [LOCATION/DETAIL]: Ask a specific follow-up based on their symptom (e.g., for headache: "kahan dard hai — aage ya peeche?"; for stomach: "khana khane ke baad ya pehle hota hai?")
- Step 5 [ASSOCIATED SYMPTOMS]: Ask ONE related symptom (e.g., "kya bukhaar bhi hai?", "kya chakkar aata hai?")
- Step 6 [MEDICAL HISTORY]: Ask "kya aap pehle se koi dawa kha rahe hain?" and "kya aapko koi aur bimari hai jaise sugar, BP?"
- Step 7 [LIFESTYLE]: Ask ONE relevant lifestyle question based on symptom (e.g., "aap kitna paani peete hain roz?", "neend kaisi hoti hai?")
- Step 8 [ASSESSMENT]: Only after gathering above info, give comprehensive guidance

COUNTER-QUESTION RULES:
- Always acknowledge their answer first with a short empathetic phrase ("Samajh gaya", "Achha", "Haan, yeh common hai")
- Ask follow-up to clarify anything unclear
- If they say something concerning, ask a clarifying counter-question before moving on
- Example: Patient says "sir mein dard hai" → ask "Yeh dard kitna tez hai? Kya ankhon mein bhi kuch mehsoos hota hai?"

EMERGENCY PROTOCOL:
- For chest pain, difficulty breathing, unconsciousness, heavy bleeding → IMMEDIATELY say call 108 (emergency number India)
- Do NOT give advice for emergencies — just direct to hospital

FINAL ASSESSMENT FORMAT (Step 8 only):
After gathering all information above, provide your response then append:
---ASSESSMENT---
{"condition":"likely condition in simple words","severity":"mild|moderate|severe|emergency","advice":"clear action steps in ${language}","seeDoctor":true/false,"urgency":"today|this week|if worsens in 2 days|not needed","dietAdvice":"specific food/diet recommendation","homeRemedies":"1-2 safe home remedies if applicable"}

${isFirstMessage ? 'This is the START of a new consultation. Give a warm greeting and ask what is bothering them. Be friendly and welcoming.' : 'Continue the consultation based on the conversation history. Remember what was said before.'}`

  try {
    const payload = {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      })),
      generationConfig: { temperature: 0.5, topP: 0.92, maxOutputTokens: 800 }
    }
    
    const data = await callGeminiApi(payload)
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    return { response: text }
  } catch (e) {
    return {
      response: language === 'Hindi'
        ? `Mujhe maafi chahiye, abhi connection mein thodi dikkat hai. Kripya ek minute baad dobara try karein.`
        : `I apologize, there seems to be a connection issue. Please try again in a moment.`
    }
  }
}

// ===================== DRUG INTERACTION CHECK =====================
export async function checkDrugInteraction(medicines, language = 'Hindi') {
  if (!medicines || medicines.length < 2) return { hasInteraction: false, interactions: [] }
  if (!isGeminiConfigured()) return { hasInteraction: false, interactions: [] }

  const prompt = `You are a clinical pharmacist. Carefully check if any of these medicines have clinically significant interactions when taken together:
${medicines.map((m, i) => `${i + 1}. ${m.medicineName} (${m.genericName || 'unknown generic'})`).join('\n')}

Return ONLY a JSON object:
{
  "hasInteraction": true/false,
  "severity": "mild|moderate|severe|none",
  "interactions": [
    {
      "drug1": "name",
      "drug2": "name", 
      "description": "plain language explanation of what happens in ${language}",
      "recommendation": "what the patient should do in ${language}"
    }
  ]
}
Be thorough but practical. If genuinely no interaction, return hasInteraction:false.`

  try {
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 512 }
    }
    
    const data = await callGeminiApi(payload)
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const clean = text.replace(/```json|```/g, '').trim()
    const match = clean.match(/\{[\s\S]*\}/)
    if (!match) return { hasInteraction: false, interactions: [] }
    return JSON.parse(match[0])
  } catch { return { hasInteraction: false, interactions: [] } }
}

// ===================== VOICE CONFIRM VALIDATION =====================
export async function validateVoiceAnswer(correctInstruction, patientAnswer, language = 'Hindi') {
  if (!isGeminiConfigured()) return { correct: true, feedback: 'Bahut acha! Aapne samajh liya.' }
  try {
    const payload = {
      contents: [{ parts: [{ text: `The correct medicine instruction is: "${correctInstruction}". The patient said: "${patientAnswer}". Did they correctly understand the dosage and timing? Be lenient — partial understanding is OK. Reply with JSON only: {"correct": true/false, "feedback": "brief warm response in ${language} — encourage if correct, gently correct if wrong"}` }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 200 }
    }
    
    const data = await callGeminiApi(payload)
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return { correct: true, feedback: 'Bahut acha samjha!' }
    return JSON.parse(match[0])
  } catch { return { correct: true, feedback: 'Bahut acha!' } }
}
