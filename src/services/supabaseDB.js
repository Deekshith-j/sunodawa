import { supabase, isSupabaseEnabled } from './supabase'

// ── SCANS ──────────────────────────────────────────────────────────

export async function saveScanToDB(scan) {
  if (!isSupabaseEnabled) return null
  try {
    const { data, error } = await supabase.from('scans').upsert({
      id: scan.id,
      medicine_name: scan.medicineName || 'Unknown',
      language: scan.language || 'Hindi',
      data: scan,
      timestamp: scan.timestamp || new Date().toISOString(),
    })
    if (error) console.error('Supabase saveScan error:', error)
    return data
  } catch (e) {
    console.error('saveScanToDB failed:', e)
    return null
  }
}

export async function getScansFromDB(limit = 50) {
  if (!isSupabaseEnabled) return []
  try {
    const { data, error } = await supabase
      .from('scans')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit)
    if (error) { console.error('Supabase getScans error:', error); return [] }
    return data.map(row => row.data)
  } catch (e) {
    console.error('getScansFromDB failed:', e)
    return []
  }
}

export async function deleteScanFromDB(id) {
  if (!isSupabaseEnabled) return
  try {
    const { error } = await supabase.from('scans').delete().eq('id', id)
    if (error) console.error('Supabase deleteScan error:', error)
  } catch (e) { console.error('deleteScanFromDB failed:', e) }
}

// ── REMINDERS ──────────────────────────────────────────────────────

export async function saveReminderToDB(reminder) {
  if (!isSupabaseEnabled) return null
  try {
    const { data, error } = await supabase.from('reminders').upsert({
      id: reminder.id,
      medicine_name: reminder.medicineName,
      time: reminder.time,
      dose: reminder.dose,
      active: reminder.active,
      created_at: reminder.createdAt || new Date().toISOString(),
      data: reminder,
    })
    if (error) console.error('Supabase saveReminder error:', error)
    return data
  } catch (e) {
    console.error('saveReminderToDB failed:', e)
    return null
  }
}

export async function getRemindersFromDB() {
  if (!isSupabaseEnabled) return []
  try {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) { console.error('Supabase getReminders error:', error); return [] }
    return data.map(row => row.data)
  } catch (e) {
    console.error('getRemindersFromDB failed:', e)
    return []
  }
}

export async function deleteReminderFromDB(id) {
  if (!isSupabaseEnabled) return
  try {
    const { error } = await supabase.from('reminders').delete().eq('id', id)
    if (error) console.error('Supabase deleteReminder error:', error)
  } catch (e) { console.error('deleteReminderFromDB failed:', e) }
}

export async function updateReminderInDB(id, updates) {
  if (!isSupabaseEnabled) return
  try {
    const { error } = await supabase.from('reminders').update({ active: updates.active, data: updates }).eq('id', id)
    if (error) console.error('Supabase updateReminder error:', error)
  } catch (e) { console.error('updateReminderInDB failed:', e) }
}

// ── CONSULTATIONS ──────────────────────────────────────────────────

export async function saveConsultationToDB(consultation) {
  if (!isSupabaseEnabled) return null
  try {
    const { data, error } = await supabase.from('consultations').insert({
      id: consultation.id || Date.now().toString(),
      messages: consultation.messages,
      assessment: consultation.assessment,
      language: consultation.language,
      created_at: new Date().toISOString(),
    })
    if (error) console.error('Supabase saveConsultation error:', error)
    return data
  } catch (e) {
    console.error('saveConsultationToDB failed:', e)
    return null
  }
}

// ── HYDRATE: load from DB on first load ───────────────────────────

export async function hydrateFromDB() {
  if (!isSupabaseEnabled) return null
  try {
    const [scans, reminders] = await Promise.all([
      getScansFromDB(),
      getRemindersFromDB(),
    ])
    return { scans, reminders }
  } catch (e) {
    console.error('hydrateFromDB failed:', e)
    return null
  }
}
