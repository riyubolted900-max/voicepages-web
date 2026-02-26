import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { api } from '../services/api'
import { getCoverGradient } from '../utils/coverArt'
import { IconUpload } from '../components/Icons'

function Library() {
  const navigate = useNavigate()
  const { books, loadBooks } = useStore()
  const [uploading, setUploading] = useState(false)
  const [connected, setConnected] = useState(null)

  useEffect(() => { checkConnection() }, [])

  const checkConnection = async () => {
    try { await api.healthCheck(); setConnected(true); await loadBooks() }
    catch { setConnected(false) }
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const result = await api.uploadBook(file)
      await loadBooks()
      navigate(`/book/${result.book_id}`)
    } catch (err) { alert(`Upload failed: ${err.message}`) }
    finally { setUploading(false); e.target.value = '' }
  }

  const getInitials = (title = '') =>
    title.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase() || 'VP'

  return (
    <div className="page">
      <header className="header">
        <span className="header-title">VoicePages</span>
        <div className="header-actions">
          <div style={{ display:'flex', alignItems:'center', gap:5, color:'var(--text-3)', fontSize:'0.72rem', fontWeight:600 }}>
            <span className={`conn-dot ${connected ? 'on' : 'off'}`} />
            {connected === null ? 'Connecting' : connected ? 'Connected' : 'Offline'}
          </div>
        </div>
      </header>

      <div className="header-large">Library</div>
      <div className="sp-sm" />

      {/* Upload */}
      <div className="upload-zone" onClick={() => document.getElementById('vpFile').click()}>
        {uploading ? (
          <>
            <div style={{ display:'flex', justifyContent:'center', marginBottom:14 }}>
              <div className="spinner" />
            </div>
            <div className="upload-title">Processing your book…</div>
            <div className="upload-sub">Detecting characters & assigning voices</div>
          </>
        ) : (
          <>
            <div className="upload-icon-wrap">
              <IconUpload size={24} />
            </div>
            <div className="upload-title">Add a Book</div>
            <div className="upload-sub">EPUB · PDF · TXT · DOC</div>
          </>
        )}
        <input id="vpFile" type="file" accept=".epub,.pdf,.txt,.doc,.docx" onChange={handleFileSelect} style={{ display:'none' }} />
      </div>

      {/* Grid */}
      {books.length > 0 && (
        <div className="library-section anim-fade-up">
          <div className="section-header">{books.length === 1 ? '1 Book' : `${books.length} Books`}</div>
          <div className="book-grid">
            {books.map(book => (
              <div key={book.id} className="book-grid-item" onClick={() => navigate(`/book/${book.id}`)}>
                <div className="book-grid-cover" style={{ background: getCoverGradient(book.id) }}>
                  {getInitials(book.title)}
                </div>
                <div className="book-grid-title">{book.title}</div>
                <div className="book-grid-author">{book.author || 'Unknown'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty */}
      {books.length === 0 && !uploading && connected && (
        <div className="empty-state">
          <div className="empty-icon">
            <IconUpload size={28} color="var(--text-3)" />
          </div>
          <div className="empty-title">No books yet</div>
          <div className="empty-sub">Tap above to add your first ebook</div>
        </div>
      )}
    </div>
  )
}

export default Library
