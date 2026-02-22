import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg, #0f0f17)',
          color: 'var(--text, #e8e8f0)',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ marginBottom: '0.5rem' }}>Something went wrong</h2>
          <p style={{ color: 'var(--text-muted, #888)', marginBottom: '1.5rem', maxWidth: 400 }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null })
              window.location.href = '/'
            }}
            style={{
              background: 'var(--primary, #7c3aed)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '0.75rem 2rem',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            Go Home
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
