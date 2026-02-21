import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { api } from '../services/api'

function Library() {
  const navigate = useNavigate()
  const { books, loadBooks, serverUrl, setServerUrl } = useStore()
  const [uploading, setUploading] = useState(false)
  const [connected, setConnected] = useState(null)

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    try {
      await api.healthCheck()
      setConnected(true)
    } catch {
      setConnected(false)
    }
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const result = await api.uploadBook(file)
      await loadBooks()
      navigate(`/book/${result.book_id}`)
    } catch (err) {
      alert(`Upload failed: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  if (connected === false) {
    return (
      <div>
        <header className="header">
          <h1>📚 VoicePages</h1>
        </header>

        <main style={{ padding: '1rem' }}>
          <div className="card" style={{ 
            textAlign: 'center', 
            padding: '2rem',
            background: 'linear-gradient(135deg, #1a1a2e, #16213e)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔌</div>
            <h2 style={{ marginBottom: '0.5rem' }}>Server Not Connected</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Set up your server to start listening
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/settings')}
              style={{ padding: '0.75rem 2rem' }}
            >
              Setup Now ⚡
            </button>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '0.75rem' }}>Quick Start</h3>
            <ol style={{ paddingLeft: '1.25rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
              <li>Run <code style={{ background: 'var(--bg)', padding: '0.1rem 0.3rem' }}>./start.sh</code> on your Mac</li>
              <li>Find your IP: System Settings → Network → IP Address</li>
              <li>Enter server URL in Settings</li>
            </ol>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div>
      <header className="header">
        <h1>📚 VoicePages</h1>
        <div className="header-actions">
          <button className="btn btn-icon" onClick={() => navigate('/settings')}>
            ⚙️
          </button>
        </div>
      </header>

      <main>
        {/* Connection status */}
        <div style={{ 
          padding: '0.5rem 1rem', 
          fontSize: '0.8rem', 
          color: connected ? 'var(--success)' : 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span style={{ 
            width: 6, 
            height: 6, 
            borderRadius: '50%', 
            background: connected ? 'var(--success)' : 'var(--text-muted)',
            display: 'inline-block'
          }} />
          Server: {serverUrl}
        </div>

        {/* Upload Zone */}
        <div className="upload-zone" onClick={() => document.getElementById('fileInput').click()}>
          <div className="upload-icon">📖</div>
          <div>Tap to upload a book</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Supports EPUB, PDF, TXT, DOC
          </div>
          <input
            id="fileInput"
            type="file"
            accept=".epub,.pdf,.txt,.doc,.docx"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>

        {uploading && (
          <div className="loading">
            <div className="spinner"></div>
            <span style={{ marginLeft: '0.5rem' }}>Uploading...</span>
          </div>
        )}

        {/* Book List */}
        {books.length > 0 && (
          <div className="book-list" style={{ marginTop: '1rem' }}>
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Your Library</h3>
            {books.map((book) => (
              <div
                key={book.id}
                className="book-item"
                onClick={() => navigate(`/book/${book.id}`)}
              >
                <div className="book-cover">📕</div>
                <div className="book-info">
                  <div className="book-title">{book.title}</div>
                  <div className="book-meta">
                    {book.author} • {book.chapter_count} chapters
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {books.length === 0 && !uploading && (
          <div className="empty-state">
            <div className="empty-icon">🎧</div>
            <div>No books yet</div>
            <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Upload an ebook to get started
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default Library
