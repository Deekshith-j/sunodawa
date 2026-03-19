import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useAppStore from './store/useAppStore'

// Lazy load all pages so module-level crashes are isolated
const Splash       = lazy(() => import('./pages/Splash'))
const Home         = lazy(() => import('./pages/Home'))
const Scan         = lazy(() => import('./pages/Scan'))
const Result       = lazy(() => import('./pages/Result'))
const Consultation = lazy(() => import('./pages/Consultation'))
const Reminders    = lazy(() => import('./pages/Reminders'))
const History      = lazy(() => import('./pages/History'))
const FamilyGuard  = lazy(() => import('./pages/FamilyGuard'))
const Settings     = lazy(() => import('./pages/Settings'))

function PageLoader() {
  return (
    <div style={{ background: '#F0F6FF', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 44, height: 44, borderRadius: '50%', border: '3px solid rgba(26,111,219,0.15)', borderTopColor: '#1A6FDB', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#94A8C3', fontWeight: 500 }}>Loading...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

export default function App() {
  const { hasOnboarded } = useAppStore()

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/"          element={hasOnboarded ? <Navigate to="/home" replace /> : <Splash />} />
          <Route path="/home"      element={<Home />} />
          <Route path="/scan"      element={<Scan />} />
          <Route path="/result/:id" element={<Result />} />
          <Route path="/consult"   element={<Consultation />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/history"   element={<History />} />
          <Route path="/family"    element={<FamilyGuard />} />
          <Route path="/settings"  element={<Settings />} />
          <Route path="*"          element={<Navigate to={hasOnboarded ? '/home' : '/'} replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
