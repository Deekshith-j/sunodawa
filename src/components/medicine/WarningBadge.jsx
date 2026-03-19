export default function WarningBadge({ text, type = 'warning' }) {
  const styles = {
    warning: { bg: 'rgba(255,179,0,0.08)', border: 'rgba(255,179,0,0.25)', color: '#FFB300', dot: '#FFB300' },
    danger: { bg: 'rgba(255,68,68,0.08)', border: 'rgba(255,68,68,0.25)', color: '#FF4444', dot: '#FF4444' },
  }
  const s = styles[type]

  return (
    <div
      className="flex items-start gap-3 rounded-xl px-4 py-3 font-sans text-sm"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}
    >
      <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: s.dot }} />
      <span className="leading-relaxed">{text}</span>
    </div>
  )
}
