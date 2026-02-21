import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { api } from '../services/api'

function Settings() {
  const navigate = useNavigate()
  const { serverUrl, setServerUrl } = useStore()
  const [url, setUrl] = useState(serverUrl)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)

  const handleSave = () => {
    setServerUrl(url)
    localStorage.setItem('serverUrl', url)
    navigate('/')
  }

  const testConnection = async () => {
    setTesting(true)
    setTestResult(null)
    
    try {
      // Temporarily set URL
      const oldUrl = api.getServerUrl()
      api.setServerUrl(url)
      
      await api.healthCheck()
      setTestResult({ success: true, message: 'Connected!' })
      
      // Restore
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
        <h1 style={{ flex: 1, marginLeft: '0.5rem' }}>Settings</h1>
      </header>

      <main>
        {/* Server URL */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Server Configuration</h3>
          
          <div className="settings-section">
            <div className="settings-label">Server URL</div>
            <input
              type="text"
              className="settings-input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="http://192.168.1.x:9000"
            />
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Enter the IP address of your Mac server. Port is usually 9000.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className="btn btn-secondary"
              onClick={testConnection}
              disabled={testing}
            >
              {testing ? 'Testing...' : 'Test Connection'}
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleSave}
            >
              Save
            </button>
          </div>

          {testResult && (
            <div style={{ 
              marginTop: '1rem', 
              padding: '0.75rem',
              borderRadius: 8,
              background: testResult.success ? 'rgba(0, 184, 148, 0.2)' : 'rgba(231, 76, 60, 0.2)',
              color: testResult.success ? 'var(--success)' : 'var(--danger)'
            }}>
              {testResult.message}
            </div>
          )}
        </div>

        {/* Help */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>How to Use</h3>
          
          <div style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
            <p style={{ marginBottom: '0.75rem' }}>
              <strong>1. Run the server on your Mac:</strong><br/>
              <code style={{ background: 'var(--bg)', padding: '0.2rem 0.4rem', borderRadius: 4 }}>
                cd voicepages-server && pip install -r requirements.txt && uvicorn main:app --host 0.0.0.0 --port 9000
              </code>
            </p>
            
            <p style={{ marginBottom: '0.75rem' }}>
              <strong>2. Find your Mac's IP address:</strong><br/>
              System Settings → Network → Wi-Fi → IP Address (e.g., 192.168.1.100)
            </p>
            
            <p style={{ marginBottom: '0.75rem' }}>
              <strong>3. Open on mobile:</strong><br/>
              Enter {url.replace('localhost', 'YOUR_MAC_IP')}:9000 in your phone's browser
            </p>
            
            <p>
              <strong>4. For PWA:</strong><br/>
              Tap Share → Add to Home Screen for full-screen experience
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="card">
          <h3 style={{ marginBottom: '0.5rem' }}>About</h3>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <p>VoicePages v1.0.0</p>
            <p>AI-Powered Multi-Voice Audiobook Reader</p>
            <p style={{ marginTop: '0.5rem' }}>
              Built with FastAPI, React, and Kokoro TTS
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Settings
