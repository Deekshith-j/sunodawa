import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useAppStore from '../store/useAppStore'
import AppShell from '../components/layout/AppShell'
import PageTransition from '../components/layout/PageTransition'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function ScansTab() {
  const { scanHistory, deleteScan } = useAppStore()
  const navigate = useNavigate()

  async function exportPDF() {
    const { default: jsPDF } = await import('jspdf')
    const pdf = new jsPDF()
    pdf.setFontSize(20)
    pdf.setTextColor(26, 111, 219)
    pdf.text('SunoDawa — Medicine History', 20, 30)
    pdf.setFontSize(11)
    pdf.setTextColor(100)
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 44)
    let y = 60
    scanHistory.forEach((scan) => {
      if (y > 260) { pdf.addPage(); y = 30 }
      pdf.setFontSize(10); pdf.setTextColor(120)
      pdf.text(formatDate(scan.timestamp), 20, y)
      pdf.setFontSize(13); pdf.setTextColor(13, 27, 62)
      pdf.text(scan.medicineName || 'Unknown', 60, y)
      pdf.setFontSize(10); pdf.setTextColor(80)
      pdf.text(`${scan.dosage || ''} — ${scan.frequency || ''}`, 60, y + 8)
      y += 24
    })
    pdf.save('SunoDawa-History.pdf')
  }

  if (!scanHistory.length) return (
    <div style={{ textAlign: 'center', padding: '60px 24px' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>📷</div>
      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 4 }}>No scans yet</p>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)' }}>Use the camera to scan a medicine label.</p>
    </div>
  )

  return (
    <div>
      <motion.button whileTap={{ scale: 0.96 }} onClick={exportPDF}
        className="btn-secondary" style={{ width: '100%', marginBottom: 12, fontSize: 13 }}>
        📄 Export as PDF
      </motion.button>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {scanHistory.map((scan, i) => (
          <motion.div
            key={scan.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => navigate(`/result/${scan.id}`)}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--bg-surface)', borderRadius: 12, border: '1.5px solid var(--card-border)', boxShadow: 'var(--card-shadow)', cursor: 'pointer' }}
          >
            {scan.image
              ? <img src={scan.image} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--card-border)' }} />
              : <div style={{ width: 44, height: 44, borderRadius: 8, background: 'var(--blue-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 20 }}>💊</div>
            }
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }} className="truncate">{scan.medicineName}</p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{scan.dosage} · {scan.frequency}</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{formatDate(scan.timestamp)}</p>
            </div>
            <span className="badge-blue">{scan.language || 'Hindi'}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth={2} width={14} height={14}><path d="M9 18l6-6-6-6" strokeLinecap="round"/></svg>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function ConsultationsTab() {
  const { consultationHistory } = useAppStore()
  if (!consultationHistory.length) return (
    <div style={{ textAlign: 'center', padding: '60px 24px' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🩺</div>
      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 4 }}>No consultations yet</p>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)' }}>Talk to Dr. Ananya from the AI Doctor page.</p>
    </div>
  )
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {consultationHistory.map((c, i) => (
        <div key={i} style={{ padding: '12px 14px', background: 'var(--bg-surface)', borderRadius: 12, border: '1.5px solid var(--card-border)', boxShadow: 'var(--card-shadow)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <p style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{c.title || 'Consultation'}</p>
            <span className={c.severity === 'mild' ? 'badge-green' : c.severity === 'severe' ? 'badge-red' : 'badge-blue'}>{c.severity || 'mild'}</span>
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)' }}>{formatDate(c.createdAt)}</p>
        </div>
      ))}
    </div>
  )
}

export default function History() {
  const [tab, setTab] = useState('scans')
  const { scanHistory, consultationHistory } = useAppStore()
  const TABS = [
    { id: 'scans', label: 'Scans', count: scanHistory.length },
    { id: 'consultations', label: 'Consults', count: consultationHistory.length },
  ]

  return (
    <AppShell>
      <PageTransition>
        <div className="page-container" style={{ padding: '0 16px' }}>
          <div style={{ paddingTop: 'max(20px, env(safe-area-inset-top))', paddingBottom: 12 }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Records</p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>History 📋</h1>
          </div>

          {/* Tab pills */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ padding: '8px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: tab === t.id ? 700 : 400, background: tab === t.id ? 'var(--blue-primary)' : 'var(--bg-surface)', color: tab === t.id ? 'white' : 'var(--text-muted)', border: `1.5px solid ${tab === t.id ? 'var(--blue-primary)' : 'var(--card-border)'}`, boxShadow: tab === t.id ? '0 4px 12px rgba(26,111,219,0.3)' : 'var(--card-shadow)', transition: 'all 0.2s' }}>
                {t.label} {t.count > 0 && <span style={{ marginLeft: 4, opacity: 0.8 }}>({t.count})</span>}
              </button>
            ))}
          </div>

          {tab === 'scans' && <ScansTab />}
          {tab === 'consultations' && <ConsultationsTab />}
        </div>
      </PageTransition>
    </AppShell>
  )
}
