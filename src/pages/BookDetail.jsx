import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { api } from '../services/api'
import VoiceConfigSheet from '../components/VoiceConfigSheet'

function BookDetail() {
  const { bookId } = useParams()
  const navigate = useNavigate()
  const { setCurrentBook, loadCharacters, voices } = useStore()

  const [book, setBook] = useState(null)
  const [chapters, setChapters] = useState([])
  const [characters, setCharacters] = useState([])
  const [loading, setLoading] = useState(true)
  const [showVoiceSheet, setShowVoiceSheet] = useState(false)
  const [voiceError, setVoiceError] = useState(null)

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

  const handleVoiceChange = async (charName, newVoiceId) => {
    // Save previous voice for rollback on failure
    const prevVoiceId = characters.find(c => c.name === charName)?.voice_id

    // Optimistic update
    setCharacters(prev =>
      prev.map(c => c.name === charName ? { ...c, voice_id: newVoiceId } : c)
    )

    try {
      await api.updateCharacterVoice(bookId, charName, newVoiceId)
    } catch (err) {
      // Revert on failure
      setCharacters(prev =>
        prev.map(c => c.name === charName ? { ...c, voice_id: prevVoiceId } : c)
      )
      setVoiceError(`Failed to update voice: ${err.message}`)
      // Clear the error after 4 seconds
      setTimeout(() => setVoiceError(null), 4000)
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

  // Use voices from store (loaded from server), with fallback
  const voiceList = voices.length > 0 ? voices : [
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
        <button className="back-btn" onClick={() => navigate('/')}>&#8592;</button>
        <h1 style={{ flex: 1, marginLeft: '0.5rem' }}>{book?.title}</h1>
        <button className="btn btn-icon" onClick={handleDelete}>&#128465;</button>
      </header>

      <main>
        {/* Book Info */}
        <div className="card">
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{
              width: 80, height: 110,
              background: 'var(--primary)', borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', flexShrink: 0
            }}>
              &#128214;
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{book?.title}</h2>
              <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                {book?.author || 'Unknown Author'}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {chapters.length} chapters &bull; {book?.file_type?.toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Characters */}
        {characters.length > 0 && (
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <h3>Characters</h3>
              <button onClick={() => setShowVoiceSheet(true)} className="btn btn-secondary">
                Cast Voices
              </button>
            </div>
            {voiceError && (
              <div style={{
                padding: '0.5rem 0.75rem',
                marginBottom: '0.75rem',
                background: 'rgba(231, 76, 60, 0.2)',
                border: '1px solid rgba(231, 76, 60, 0.4)',
                borderRadius: 6,
                fontSize: '0.85rem',
                color: 'var(--text, #eee)'
              }}>
                {voiceError}
              </div>
            )}
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
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {voiceList.find(v => v.id === char.voice_id)?.name || char.voice_id || '—'}
                  </div>
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
                <span style={{ color: 'var(--text-muted)' }}>&#9654;</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {showVoiceSheet && (
        <VoiceConfigSheet
          characters={characters}
          voices={voiceList}
          onVoiceChange={handleVoiceChange}
          onClose={() => setShowVoiceSheet(false)}
        />
      )}
    </div>
  )
}

export default BookDetail
