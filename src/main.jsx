import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

class ErrorBoundary extends React.Component {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(err, info) {
    console.error('App error:', err, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, fontFamily: 'sans-serif', textAlign: 'center', direction: 'rtl' }}>
          <h1 style={{ color: '#1e293b' }}>حدث خطأ في التطبيق</h1>
          <p style={{ color: '#64748b', marginTop: 8 }}>افتح أدوات المطور (F12) → Console لرؤية التفاصيل</p>
          <button onClick={() => this.setState({ hasError: false })} style={{ marginTop: 16, padding: '12px 24px', cursor: 'pointer' }}>إعادة المحاولة</button>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
