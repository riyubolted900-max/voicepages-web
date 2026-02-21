import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { api } from '../services/api'

function BookDetail() {
  const { bookId } = useParams()
  const navigate = useNavigate()
  const { setCurrentBook, loadCharacters } = useStore()
  
  const [book, setBook] = useState(null)
  const [chapters, setChapters] = useState([])
  const [characters, setCharacters] = useState([])
  const [loading, setLoading] = useState(true)
  const [showVoices, setShowVoices] = useState(null)

  useEffect(() => {
    loadBookData()
  }, [bookId])

  const loadBookData = async () => {
    try {
      const [bookData, chars] = await Promise.all([
        api.getBook(bookId),
        api.getCharacters(bookId)
      ])
      
      setBook(bookData)
      setChapters(bookData.chapters || [])
      setCharacters(chars)
      setCurrentBook(bookData)
      loadCharacters(bookId)
    } catch (err) {
      alert(`Failed to load book: ${err.message}`)
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const handleVoiceChange = async (charName, voiceId) => {
    try {
      await api.updateCharacterVoice(bookId, charName, voiceId)
      await loadBookData() // Refresh
      setShowVoices(null)
    } catch (err) {
      alert(`Failed to update voice: ${err.message}`)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this book?')) return
    
    try {
      await api.deleteBook(bookId)
      navigate('/')
    } catch (err) {
      alert(`Failed to delete: ${err.message}`)
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div>
      <header className="header">
        <button className="back-btn" onClick={() => navigate('/')}>←</button>
        <h1 style={{ flex: 1, marginLeft: '0.5rem' }}>{book?.title}</h1>
        <button className="btn btn-icon" onClick={handleDelete}>🗑️</button>
      </header>

      <main>
        {/* Book Info */}
        <div className="card">
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ 
              width: 80, 
              height: 110, 
              background: 'var(--primary)', 
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem'
            }}>
              📖
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{book?.title}</h2>
              <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                {book?.author || 'Unknown Author'}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {chapters.length} chapters • {book?.file_type?.toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Characters */}
        {characters.length > 0 && (
          <div className="card">
            <h3 style={{ marginBottom: '0.75rem' }}>Characters</h3>
            <div className="character-list">
              {characters.map((char) => (
                <div key={char.id} className="character-item">
                  <div className="character-avatar">
                    {char.name[0].toUpperCase()}
                  </div>
                  <div className="character-info">
                    <div className="character-name">
                      {char.name}
                      {char.is_narrator && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', background: 'var(--primary)', padding: '0.1rem 0.4rem', borderRadius: 4 }}>Narrator</span>}
                    </div>
                    <div className="character-gender">{char.gender}</div>
                  </div>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setShowVoices(showVoices === char.name ? null : char.name)}
                  >
                    {char.voice_id || 'af_sky'} ▼
                  </button>
                  
                  {/* Voice selector */}
                  {showVoices === char.name && (
                    <div style={{ 
                      position: 'absolute', 
                      right: '1rem',
                      top: '50%',
                      background: 'var(--bg-light)',
                      border: '1px solid var(--surface)',
                      borderRadius: 8,
                      padding: '0.5rem',
                      zIndex: 10,
                      maxHeight: 200,
                      overflow: 'auto'
                    }}>
                      {getVoices().map((voice) => (
                        <div
                          key={voice.id}
                          className={`voice-option ${char.voice_id === voice.id ? 'selected' : ''}`}
                          onClick={() => handleVoiceChange(char.name, voice.id)}
                          style={{ marginBottom: '0.25rem' }}
                        >
                          <div className="voice-name">{voice.name}</div>
                          <div className="voice-meta">{voice.gender} • {voice.accent}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chapters */}
        <div className="card">
          <h3 style={{ marginBottom: '0.75rem' }}>Chapters</h3>
          <div className="chapter-list">
            {chapters.map((chapter) => (
              <div
                key={chapter.chapter_number}
                className="chapter-item"
                onClick={() => navigate(`/book/${bookId}/chapter/${chapter.chapter_number}`)}
              >
                <span>{chapter.title}</span>
                <span style={{ color: 'var(--text-muted)' }}>▶</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

// Fallback voices
function getVoices() {
  return [
    { id: 'af_sky', name: 'Sky', gender: 'female', accent: 'american', style: 'calm' },
    { id: 'af_heart', name: 'Heart', gender: 'female', accent: 'american', style: 'warm' },
    { id: 'af_bella', name: 'Bella', gender: 'female', accent: 'american', style: 'bright' },
    { id: 'af_nova', name: 'Nova', gender: 'female', accent: 'american', style: 'confident' },
    { id: 'am_adam', name: 'Adam', gender: 'male', accent: 'american', style: 'deep' },
    { id: 'am_echo', name: 'Echo', gender: 'male', accent: 'american', style: 'energetic' },
    { id: 'bm_daniel', name: 'Daniel', gender: 'male', accent: 'british', style: 'warm' },
    { id: 'bm_george', name: 'George', gender: 'male', accent: 'british', style: 'distinguished' },
    { id: 'bf_alice', name: 'Alice', gender: 'female', accent: 'british', style: 'gentle' },
    { id: 'bf_emma', name: 'Emma', gender: 'female', accent: 'british', style: 'authoritative' },
  ]
}

export default BookDetail
