// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// In-memory token bucket per IP
const rateLimits = new Map<string, { tokens: number, resetAt: number }>()
const MAX_TOKENS_PER_MIN = 1000

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // ── RATE LIMITING LOGIC ──
    // Get IP from headers (works in Supabase Edge Functions)
    const ip = req.headers.get('x-forwarded-for') || 'anonymous'
    const now = Date.now()
    
    let userQuota = rateLimits.get(ip)
    
    // If no quota exists or 1 minute has passed, reset their bucket
    if (!userQuota || userQuota.resetAt < now) {
      userQuota = { tokens: MAX_TOKENS_PER_MIN, resetAt: now + 60000 }
      rateLimits.set(ip, userQuota)
    }

    // If bucket is empty, block the request
    if (userQuota.tokens <= 0) {
      return new Response(JSON.stringify({ error: 'rate limit exceeded: 1000 tokens per minute' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { provider, payload } = await req.json()

    // ── 1. GEMINI PROXY ──
    if (provider === 'gemini') {
      const apiKey = Deno.env.get('GEMINI_API_KEY')
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY secret is missing in Supabase Edge Function')
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      )

      const data = await response.json()
      
      // Deduct actual tokens used by Gemini
      // If error, usageMetadata might be missing, so default to 0
      const usedTokens = data?.usageMetadata?.totalTokenCount || 0
      userQuota.tokens -= usedTokens

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: response.status
      })
    }

    // ── 2. MURF PROXY ──
    if (provider === 'murf') {
      const apiKey = Deno.env.get('MURF_API_KEY')
      if (!apiKey) {
        throw new Error('MURF_API_KEY secret is missing in Supabase Edge Function')
      }

      const response = await fetch('https://api.murf.ai/v1/speech/generate-with-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()
      
      // Deduct approximate tokens based on text length (assume 1 token ~= 4 chars)
      const textLen = payload?.text?.length || 0
      userQuota.tokens -= Math.ceil(textLen / 4)

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: response.status
      })
    }

    throw new Error('Invalid provider specified (must be "gemini" or "murf")')

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
