import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { api } from '../services/api'

function Settings() {
  const navigate = useNavigate()
  const { serverUrl, setServerUrl } = useStore()
  const [url, setUrl] = useState(serverUrl)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [detectedIp, setDetectedIp] = useState('')

  useEffect(() => {
    // Auto-detect local IP
    fetch('https://api.ipify.org?format=json')
      .then(r => r.json())
      .then(data => {
        // Try common local IP patterns
        const parts = data.ip.split('.')
        if (parts.length === 4) {
          // Guess local IP (replace last octet with common patterns)
          setDetectedIp(`192.168.1.${parts[3]}`)
        }
      })
      .catch(() => {})
  }, [])

  const handleSave = () => {
    setServerUrl(url)
    localStorage.setItem('serverUrl', url)
    navigate('/')
  }

  const useDetectedIp = () => {
    if (detectedIp) {
      setUrl(`http://${detectedIp}:9000`)
    }
  }

  const testConnection = async () => {
    setTesting(true)
    setTestResult(null)
    
    try {
      const oldUrl = api.getServerUrl()
      api.setServerUrl(url)
      
      await api.healthCheck()
      setTestResult({ success: true, message: 'Connected! ✓' })
      api.setServerUrl(oldUrl)
    } catch (err) {
      setTestResult({ success: false, message: err.message })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div>
      <header className="header">
        <button className="back-btn" onClick={() => navigate('/')}>←</button>
        <h1 style={{ flex: 1, marginLeft: '0.5rem' }}>Setup</h1>
      </header>

      <main>
        {/* Quick Setup */}
        <div className="card" style={{ background: 'linear-gradient(135deg, var(--surface), var(--bg-light))' }}>
          <h3 style={{ marginBottom: '1rem' }}>🚀 Quick Connect</h3>
          
          {detectedIp && (
            <button 
              className="btn btn-primary"
              onClick={useDetectedIp}
              style={{ width: '100%', marginBottom: '1rem' }}
            >
              Use detected IP: {detectedIp}
            </button>
          )}
          
          <div className="settings-section">
            <div className="settings-label">Server URL</div>
            <input
              type="text"
              className="settings-input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="http://192.168.1.x:9000"
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className="btn btn-secondary"
              onClick={testConnection}
              disabled={testing}
              style={{ flex: 1 }}
            >
              {testing ? 'Testing...' : 'Test'}
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleSave}
              style={{ flex: 1 }}
            >
              Save & Go
            </button>
          </div>

          {testResult && (
            <div style={{ 
              marginTop: '1rem', 
              padding: '0.75rem',
              borderRadius: 8,
              background: testResult.success ? 'rgba(0, 184, 148, 0.2)' : 'rgba(231, 76, 60, 0.2)',
              color: testResult.success ? 'var(--success)' : 'var(--danger)',
              textAlign: 'center'
            }}>
              {testResult.message}
            </div>
          )}
        </div>

        {/* Setup Guide */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>📋 Setup Guide</h3>
          
          <div style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
            <details style={{ marginBottom: '0.75rem' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600 }}>1. Run server on Mac</summary>
              <div style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>
                Open Terminal and run:<br/>
                <code style={{ background: 'var(--bg)', padding: '0.2rem 0.4rem', borderRadius: 4, fontSize: '0.8rem' }}>
                  cd voicepages-server && ./start.sh
                </code>
              </div>
            </details>
            
            <details style={{ marginBottom: '0.75rem' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600 }}>2. Find Mac's IP</summary>
              <div style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>
                System Settings → Network → Wi-Fi → IP Address<br/>
                Looks like: 192.168.1.xxx
              </div>
            </details>
            
            <details style={{ marginBottom: '0.75rem' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600 }}>3. Open on iPhone</summary>
              <div style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>
                Safari → http://YOUR_IP:3000<br/>
                Then tap Share → Add to Home Screen
              </div>
            </details>
            
            <details>
              <summary style={{ cursor: 'pointer', fontWeight: 600 }}>4. Enter Server URL</summary>
              <div style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>
                This page → Enter: http://YOUR_IP:9000
              </div>
            </details>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="card">
          <h3 style={{ marginBottom: '0.5rem' }}>🔧 Troubleshooting</h3>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>Can't connect?</strong><br/>
              • Make sure Mac and iPhone on same WiFi<br/>
              • Check firewall allows port 9000
            </p>
            <p>
              <strong>No audio?</strong><br/>
              • TTS needs Kokoro or macOS Speech<br/>
              • Server generates placeholder audio by default
            </p>
          </div>
        </div>

        {/* About */}
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎧</div>
          <div style={{ fontWeight: 600 }}>VoicePages</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            AI-Powered Multi-Voice Audiobook
          </div>
        </div>
      </main>
    </div>
  )
}

export default Settings
