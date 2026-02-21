import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { api } from '../services/api'

function Library() {
  const navigate = useNavigate()
  const { books, loadBooks, serverUrl } = useStore()
  const [uploading, setUploading] = useState(false)

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
        {/* Server URL indicator */}
        <div style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
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
                  <div className="book-title</div>
                  <div className="book-meta">
                   ">{book.title} {book.author} • {book.chapter_count} chapters
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
