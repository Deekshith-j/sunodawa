import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, info) {
    console.error('App crashed:', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32, background: '#020812', color: '#00F5FF', height: '100%', fontFamily: 'monospace' }}>
          <p style={{ color: '#FF3B3B', fontSize: 20, marginBottom: 12 }}>⚠ App Error</p>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13, color: '#E2F4FF', background: '#0A1628', padding: 16, borderRadius: 8, border: '1px solid #FF3B3B33' }}>
            {this.state.error?.message}
            {'\n\n'}
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload() }}
            style={{ marginTop: 16, padding: '10px 20px', background: '#00F5FF', color: '#020812', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)
