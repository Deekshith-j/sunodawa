export default function LoadingPulse({ message = 'Loading...' }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 16, padding: '40px 24px',
    }}>
      <div style={{ position: 'relative', width: 56, height: 56 }}>
        {/* Outer pulse rings */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: '1px solid var(--cyan-bright)',
          animation: 'pulse-ring 1.8s ease-out infinite',
          opacity: 0.6,
        }} />
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: '1px solid var(--cyan-bright)',
          animation: 'pulse-ring 1.8s ease-out 0.6s infinite',
          opacity: 0.4,
        }} />
        {/* Core dot */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 14, height: 14, borderRadius: '50%',
          background: 'var(--cyan-bright)',
          animation: 'breathe 1.5s ease-in-out infinite',
        }} />
      </div>
      <p style={{
        color: 'var(--text-secondary)',
        fontSize: 14,
        fontFamily: 'var(--font-body)',
        textAlign: 'center',
      }}>{message}</p>
    </div>
  )
}
