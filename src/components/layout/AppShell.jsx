import { useLocation } from 'react-router-dom'
import BottomNav from '../ui/BottomNav'
import SideNav from '../ui/SideNav'

const NO_NAV_PAGES = ['/scan', '/']

export default function AppShell({ children, showNav = true, purpleBackground = false }) {
  const location = useLocation()
  const hideNav = !showNav || NO_NAV_PAGES.includes(location.pathname)

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'row',
      background: 'var(--bg-primary)',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Medical dot-grid background */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'radial-gradient(circle, rgba(26,111,219,0.07) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />

      {/* Blue gradient accent top-right */}
      <div style={{
        position: 'fixed', top: -100, right: -100, width: 400, height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(26,111,219,0.08) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Desktop/Tablet Sidebar (≥768px) */}
      {!hideNav && (
        <div id="side-nav" style={{
          display: 'none',
          flexShrink: 0,
        }}>
          <SideNav />
        </div>
      )}

      {/* Main content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 1,
        minWidth: 0,
      }}>
        {children}
      </div>

      {/* Mobile Bottom nav (<768px) */}
      {!hideNav && <BottomNav />}

      {/* Responsive CSS for sidebar */}
      <style>{`
        @media (min-width: 768px) {
          #side-nav { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
