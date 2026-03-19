export default function GlassCard({ children, style, onClick, className }) {
  return (
    <div
      className={`glass-card${className ? ' ' + className : ''}`}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
