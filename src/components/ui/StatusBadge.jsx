const BADGE_COLORS = {
  safe:    { bg: 'rgba(0,255,136,0.08)', border: 'rgba(0,255,136,0.22)', color: '#00FF88', label: '✓ Safe' },
  warning: { bg: 'rgba(255,184,0,0.08)', border: 'rgba(255,184,0,0.22)', color: '#FFB800', label: '⚠ Warning' },
  danger:  { bg: 'rgba(255,59,59,0.08)',  border: 'rgba(255,59,59,0.22)',  color: '#FF3B3B', label: '✕ Danger' },
}

export default function StatusBadge({ type = 'safe', text, size = 'sm' }) {
  const c = BADGE_COLORS[type] || BADGE_COLORS.safe
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: c.bg, border: `1px solid ${c.border}`,
      color: c.color, borderRadius: 20,
      padding: size === 'sm' ? '3px 10px' : '6px 14px',
      fontSize: size === 'sm' ? 12 : 13,
      fontFamily: 'var(--font-body)', fontWeight: 600,
    }}>
      {text || c.label}
    </span>
  )
}
