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
    setServerUrl(url.trim())
    navigate('/')
  }

  const testConnection = async () => {
    setTesting(true)
    setTestResult(null)
    const old = api.getServerUrl()
    api.setServerUrl(url.trim())
    try {
      await api.healthCheck()
      setTestResult({ ok: true, msg: 'Connected ✓' })
    } catch (e) {
      setTestResult({ ok: false, msg: e.message || 'Connection failed' })
    } finally {
      api.setServerUrl(old)
      setTesting(false)
    }
  }

  return (
    <div className="page">
      <header className="header">
        <button className="back-btn" onClick={() => navigate('/')}>‹ Library</button>
        <span className="header-title">Settings</span>
        <div style={{ width: 60 }} />
      </header>

      <div className="header-large">Settings</div>
      <div className="spacer-sm" />

      {/* Server */}
      <div className="settings-group">
        <div className="settings-group-title">Server</div>
        <div className="settings-list">
          <div className="settings-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 10 }}>
            <div className="settings-row-label">Server URL</div>
            <input
              type="text"
              className="settings-input"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="http://192.168.x.x:9000"
              onKeyDown={e => e.key === 'Enter' && handleSave()}
            />
            <div style={{ display: 'flex', gap: 8, width: '100%' }}>
              <button
                className="btn-secondary"
                onClick={testConnection}
                disabled={testing}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                {testing ? '...' : 'Test'}
              </button>
              <button className="btn-primary" onClick={handleSave} style={{ flex: 1, justifyContent: 'center' }}>
                Save
              </button>
            </div>
            {testResult && (
              <div style={{
                width: '100%', padding: '10px 14px', borderRadius: 'var(--r-sm)',
                background: testResult.ok ? 'rgba(48,209,88,0.12)' : 'rgba(255,55,95,0.12)',
                color: testResult.ok ? 'var(--success)' : 'var(--danger)',
                fontSize: '0.88rem', fontWeight: 600,
              }}>
                {testResult.msg}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Setup Guide */}
      <div className="settings-group">
        <div className="settings-group-title">Setup Guide</div>
        <div className="settings-list">
          {[
            { step: '1', title: 'Start the server on Mac', sub: 'cd voicepages-server && python -m uvicorn main:app --host 0.0.0.0 --port 9000' },
            { step: '2', title: 'Find your Mac IP', sub: 'System Settings → Network, or run: ipconfig getifaddr en0' },
            { step: '3', title: 'Enter IP above', sub: 'Format: http://192.168.x.x:9000' },
          ].map(({ step, title, sub }) => (
            <div key={step} className="settings-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: 700, flexShrink: 0,
                }}>{step}</div>
                <div className="settings-row-label">{title}</div>
              </div>
              <div style={{ paddingLeft: 30, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <code>{sub}</code>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* About */}
      <div className="settings-group">
        <div className="settings-group-title">About</div>
        <div className="settings-list">
          <div className="settings-row">
            <div className="settings-row-label">VoicePages</div>
            <div className="settings-row-value">Multi-Voice Audiobook</div>
          </div>
          <div className="settings-row">
            <div className="settings-row-label">TTS Engine</div>
            <div className="settings-row-value">macOS + Kokoro</div>
          </div>
        </div>
      </div>

      <div className="spacer-lg" />
    </div>
  )
}

export default Settings
