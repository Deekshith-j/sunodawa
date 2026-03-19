import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { saveScanToDB, saveReminderToDB, deleteReminderFromDB, updateReminderInDB, saveConsultationToDB } from '../services/supabaseDB'

const useAppStore = create(
  persist(
    (set, get) => ({
      // Onboarding
      hasOnboarded: false,
      setHasOnboarded: (v) => set({ hasOnboarded: v }),

      // Language
      selectedLanguage: 'Hindi',
      setSelectedLanguage: (lang) => set({ selectedLanguage: lang }),

      // Voice settings
      voiceSpeed: 0,
      voiceGender: 'female',
      setVoiceSpeed: (speed) => set({ voiceSpeed: speed }),
      setVoiceGender: (gender) => set({ voiceGender: gender }),

      // Scan history
      scanHistory: [],
      addScan: (scan) => {
        const scans = get().scanHistory
        const newScan = { ...scan, id: Date.now().toString(), timestamp: new Date().toISOString() }
        set({ scanHistory: [newScan, ...scans].slice(0, 50) })
        // Sync to Supabase
        saveScanToDB(newScan).catch(e => console.warn('Supabase sync failed:', e))
        return newScan
      },
      getScan: (id) => get().scanHistory.find(s => s.id === id),
      clearHistory: () => set({ scanHistory: [] }),
      deleteScan: (id) => set({ scanHistory: get().scanHistory.filter(s => s.id !== id) }),

      // Active medicines (for drug interaction checking)
      activeMedicines: [],
      addActiveMedicine: (med) => {
        const existing = get().activeMedicines
        if (existing.find(m => m.medicineName === med.medicineName)) return
        set({ activeMedicines: [...existing, med].slice(0, 10) })
      },
      removeActiveMedicine: (medicineName) => {
        set({ activeMedicines: get().activeMedicines.filter(m => m.medicineName !== medicineName) })
      },

      // Reminders
      reminders: [],
      addReminder: (reminder) => {
        const reminders = get().reminders
        const newReminder = { ...reminder, id: Date.now().toString(), active: true, createdAt: new Date().toISOString() }
        set({ reminders: [...reminders, newReminder] })
        // Sync to Supabase
        saveReminderToDB(newReminder).catch(e => console.warn('Supabase sync failed:', e))
        return newReminder
      },
      toggleReminder: (id) => {
        const reminders = get().reminders.map(r => r.id === id ? { ...r, active: !r.active } : r)
        set({ reminders })
        const updated = reminders.find(r => r.id === id)
        if (updated) updateReminderInDB(id, updated).catch(e => console.warn('Supabase sync failed:', e))
      },
      deleteReminder: (id) => {
        set({ reminders: get().reminders.filter(r => r.id !== id) })
        deleteReminderFromDB(id).catch(e => console.warn('Supabase sync failed:', e))
      },
      updateReminder: (id, updates) => {
        const reminders = get().reminders.map(r => r.id === id ? { ...r, ...updates } : r)
        set({ reminders })
        const updated = reminders.find(r => r.id === id)
        if (updated) updateReminderInDB(id, updated).catch(e => console.warn('Supabase sync failed:', e))
      },

      // Dose logs
      doseLogs: [],
      logDose: (reminderId, medicineName) => {
        const log = { id: Date.now().toString(), reminderId, medicineName, takenAt: new Date().toISOString() }
        set({ doseLogs: [log, ...get().doseLogs].slice(0, 200) })
        return log
      },

      // Consultations history
      consultationHistory: [],
      addConsultation: (consultation) => {
        const newConsult = { ...consultation, id: Date.now().toString(), createdAt: new Date().toISOString() }
        set({ consultationHistory: [newConsult, ...get().consultationHistory].slice(0, 20) })
        // Sync to Supabase
        saveConsultationToDB(newConsult).catch(e => console.warn('Supabase sync failed:', e))
      },

      // Family Guard
      familyCode: null,
      setFamilyCode: (code) => set({ familyCode: code }),
      generateFamilyCode: () => {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase()
        set({ familyCode: code })
        return code
      },

      // Profile
      profile: { name: 'Patient', phone: '' },
      updateProfile: (updates) => set({ profile: { ...get().profile, ...updates } }),

      // Notifications
      notificationsEnabled: false,
      setNotificationsEnabled: (v) => set({ notificationsEnabled: v }),

      // Current scan result (transient)
      currentResult: null,
      setCurrentResult: (result) => set({ currentResult: result }),
    }),
    {
      name: 'sunodawa-store-v3',
      partialize: (state) => ({
        hasOnboarded: state.hasOnboarded,
        selectedLanguage: state.selectedLanguage,
        voiceSpeed: state.voiceSpeed,
        voiceGender: state.voiceGender,
        scanHistory: state.scanHistory,
        activeMedicines: state.activeMedicines,
        reminders: state.reminders,
        doseLogs: state.doseLogs.slice(0, 50),
        consultationHistory: state.consultationHistory,
        familyCode: state.familyCode,
        profile: state.profile,
        notificationsEnabled: state.notificationsEnabled,
      }),
    }
  )
)

export default useAppStore
