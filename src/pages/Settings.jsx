import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { api } from '../services/api'

function Settings() {
  const navigate = useNavigate()
  const { 
    serverUrl, setServerUrl,
    volume, setVolume,
    playbackSpeed, setPlaybackSpeed
  } = useStore()
  
  const [url, setUrl] = useState(serverUrl)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [theme, setTheme] = useState(() => localStorage.getItem('vp-theme') || 'dark')
  const [autoBookmark, setAutoBookmark] = useState(() => {
    return localStorage.getItem('autoBookmark') !== 'false'
  })

  useEffect(() => {
    // Match App.jsx behaviour: remove data-theme for dark, set 'light' for light
    theme === 'light'
      ? document.documentElement.setAttribute('data-theme', 'light')
      : document.documentElement.removeAttribute('data-theme')
    localStorage.setItem('vp-theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('autoBookmark', autoBookmark)
  }, [autoBookmark])

  const handleSave = () => {
    setServerUrl(url)
    navigate('/')
  }

  const testConnection = async () => {
    setTesting(true)
    setTestResult(null)

    const oldUrl = api.getServerUrl()
    api.setServerUrl(url)

    try {
      await api.healthCheck()
      setTestResult({ success: true, message: 'Connected!' })
    } catch (err) {
      setTestResult({ success: false, message: err.message })
    } finally {
      api.setServerUrl(oldUrl)
      setTesting(false)
    }
  }

  return (
    <div>
      <header className="header">
        <button className="back-btn" onClick={() => navigate('/')}>&#8592;</button>
        <h1 style={{ flex: 1, marginLeft: '0.5rem' }}>Settings</h1>
      </header>

      <main>
        {/* Server Connection */}
        <div className="card" style={{ background: 'linear-gradient(135deg, var(--surface), var(--bg-light))' }}>
          <h3 style={{ marginBottom: '1rem' }}>Connection</h3>

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
              Save
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

        {/* Playback Settings */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Playback</h3>

          {/* Volume */}
          <div className="settings-section">
            <div className="settings-label">Volume</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.25rem' }}>🔈</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                style={{ flex: 1, accentColor: 'var(--primary)' }}
              />
              <span style={{ fontSize: '1.25rem' }}>🔊</span>
              <span style={{ minWidth: 40, textAlign: 'right' }}>{Math.round(volume * 100)}%</span>
            </div>
          </div>

          {/* Default Speed */}
          <div className="settings-section">
            <div className="settings-label">Default Speed</div>
            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: 8,
                background: 'var(--bg)',
                color: 'var(--text)',
                border: '1px solid var(--surface)'
              }}
            >
              <option value="0.75">0.75x - Slow</option>
              <option value="1">1x - Normal</option>
              <option value="1.25">1.25x - Fast</option>
              <option value="1.5">1.5x - Very Fast</option>
              <option value="2">2x - Double Speed</option>
            </select>
          </div>

          {/* Auto Bookmark */}
          <div className="settings-section" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div className="settings-label">Auto Bookmark</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Save position automatically
              </div>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: 50, height: 28 }}>
              <input
                type="checkbox"
                checked={autoBookmark}
                onChange={(e) => setAutoBookmark(e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0, left: 0, right: 0, bottom: 0,
                background: autoBookmark ? 'var(--primary)' : 'var(--surface)',
                borderRadius: 28,
                transition: '0.3s'
              }}>
                <span style={{
                  position: 'absolute',
                  content: '""',
                  height: 20,
                  width: 20,
                  left: autoBookmark ? 24 : 4,
                  bottom: 4,
                  background: 'white',
                  borderRadius: '50%',
                  transition: '0.3s'
                }}></span>
              </span>
            </label>
          </div>
        </div>

        {/* Appearance */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Appearance</h3>

          <div className="settings-section">
            <div className="settings-label">Theme</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setTheme('light')}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: 8,
                  border: theme === 'light' ? '2px solid var(--primary)' : '1px solid var(--surface)',
                  background: theme === 'light' ? 'var(--surface)' : 'transparent',
                  color: 'var(--text)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                ☀️ Light
              </button>
              <button
                onClick={() => setTheme('dark')}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: 8,
                  border: theme === 'dark' ? '2px solid var(--primary)' : '1px solid var(--surface)',
                  background: theme === 'dark' ? 'var(--surface)' : 'transparent',
                  color: 'var(--text)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                🌙 Dark
              </button>
            </div>
          </div>
        </div>

        {/* Setup Guide */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Setup Guide</h3>

          <div style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
            <details style={{ marginBottom: '0.75rem' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600 }}>1. Run server on Mac</summary>
              <div style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>
                Open Terminal and run:<br/>
                <code style={{ background: 'var(--bg)', padding: '0.2rem 0.4rem', borderRadius: 4, fontSize: '0.8rem' }}>
                  cd voicepages-server && python -m uvicorn main:app --host 0.0.0.0 --port 9000
                </code>
              </div>
            </details>

            <details style={{ marginBottom: '0.75rem' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600 }}>2. Find Mac's IP address</summary>
              <div style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>
                In Terminal run: <code style={{ background: 'var(--bg)', padding: '0.2rem 0.4rem', borderRadius: 4, fontSize: '0.8rem' }}>
                  ipconfig getifaddr en0
                </code><br/>
                Result looks like: 192.168.1.xxx
              </div>
            </details>

            <details style={{ marginBottom: '0.75rem' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600 }}>3. Open on phone</summary>
              <div style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>
                Safari: http://YOUR_IP:9000<br/>
                Then tap Share → Add to Home Screen
              </div>
            </details>

            <details>
              <summary style={{ cursor: 'pointer', fontWeight: 600 }}>4. Enter Server URL above</summary>
              <div style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>
                Enter: http://YOUR_IP:9000 and tap "Test"
              </div>
            </details>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="card">
          <h3 style={{ marginBottom: '0.5rem' }}>Troubleshooting</h3>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>Can't connect?</strong><br/>
              • Make sure Mac and phone on same WiFi<br/>
              • Check firewall allows port 9000
            </p>
            <p>
              <strong>No audio?</strong><br/>
              • Kokoro TTS is required — download <code>kokoro-v1.0.onnx</code> and <code>voices-v1.0.bin</code> into the server's <code>storage/</code> folder<br/>
              • Check server logs for "Kokoro TTS not available" errors
            </p>
          </div>
        </div>

        {/* About */}
        <div className="card" style={{ textAlign: 'center' }}>
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
