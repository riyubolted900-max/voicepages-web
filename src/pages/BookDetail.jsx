import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { api } from '../services/api'
import { getCoverGradient } from '../utils/coverArt'
import VoiceConfigSheet from '../components/VoiceConfigSheet'
import { IconChevronRight, IconMic, IconTrash, IconChevronLeft } from '../components/Icons'

function BookDetail() {
  const { bookId } = useParams()
  const navigate = useNavigate()
  const { setCurrentBook, voices } = useStore()

  const [book,   setBook]   = useState(null)
  const [chapters, setChapters] = useState([])
  const [characters, setCharacters] = useState([])
  const [loading, setLoading] = useState(true)
  const [showVoiceSheet, setShowVoiceSheet] = useState(false)

  useEffect(() => { load() }, [bookId])

  const load = async () => {
    try {
      const [bookData, chars] = await Promise.all([api.getBook(bookId), api.getCharacters(bookId)])
      setBook(bookData); setChapters(bookData.chapters || []); setCharacters(chars); setCurrentBook(bookData)
    } catch (err) { alert(`Failed to load: ${err.message}`); navigate('/') }
    finally { setLoading(false) }
  }

  const handleVoiceChange = async (charName, voiceId) => {
    try {
      await api.updateCharacterVoice(bookId, charName, voiceId)
      setCharacters(prev => prev.map(c => c.name === charName ? { ...c, voice_id: voiceId } : c))
    } catch (err) { alert(`Failed: ${err.message}`) }
  }

  const handleDelete = async () => {
    if (!confirm(`Delete "${book?.title}"?`)) return
    try { await api.deleteBook(bookId); navigate('/') }
    catch (err) { alert(`Failed: ${err.message}`) }
  }

  const getInitials = (t = '') => t.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase() || 'VP'

  if (loading) return <div className="loading"><div className="spinner" /></div>

  const coverSize = Math.min(200, window.innerWidth * 0.56)

  return (
    <div className="page">
      {/* Ambient glow */}
      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none',
        background:getCoverGradient(bookId), opacity:0.08, filter:'blur(80px)' }} />

      {/* Header */}
      <header className="header" style={{ background:'transparent', borderBottom:'none', position:'sticky', top:0, zIndex:60 }}>
        <button className="back-btn" onClick={() => navigate('/')}>
          <IconChevronLeft size={18} strokeWidth={2.2} /> Library
        </button>
        <button className="btn-danger" onClick={handleDelete} style={{ display:'flex', alignItems:'center', gap:5 }}>
          <IconTrash size={14} /> Delete
        </button>
      </header>

      {/* Hero */}
      <div className="hero-wrap" style={{ position:'relative', zIndex:1 }}>
        <div className="hero-glow" style={{ background:getCoverGradient(bookId) }} />
        <div className="hero-cover"
          style={{ background:getCoverGradient(bookId), width:coverSize, height:coverSize, fontSize: coverSize * 0.22 }}>
          {getInitials(book?.title)}
        </div>
        <div className="hero-info">
          <div className="hero-title">{book?.title}</div>
          <div className="hero-author">{book?.author || 'Unknown Author'}</div>
          <div className="hero-meta">{chapters.length} chapters · {book?.file_type?.toUpperCase()}</div>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => navigate(`/book/${bookId}/chapter/1`)}>
              Play
            </button>
            {characters.length > 0 && (
              <button className="btn-secondary" onClick={() => setShowVoiceSheet(true)}>
                <IconMic size={16} /> Voices
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Chapters */}
      {chapters.length > 0 && (
        <>
          <div className="sec-label">Chapters</div>
          <div className="grouped" style={{ position:'relative', zIndex:1 }}>
            {chapters.map((ch) => (
              <div key={ch.chapter_number} className="list-row"
                onClick={() => navigate(`/book/${bookId}/chapter/${ch.chapter_number}`)}>
                <div className="row-num">{ch.chapter_number}</div>
                <div className="row-info">
                  <div className="row-title">{ch.title}</div>
                </div>
                <div className="row-chevron"><IconChevronRight size={16} strokeWidth={2} /></div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="sp-lg" />

      {showVoiceSheet && (
        <VoiceConfigSheet
          characters={characters}
          voices={voices}
          onVoiceChange={handleVoiceChange}
          onClose={() => setShowVoiceSheet(false)}
        />
      )}
    </div>
  )
}

export default BookDetail
