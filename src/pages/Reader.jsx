import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { api } from '../services/api'
import { Howl } from 'howler'
import { getCoverGradient } from '../utils/coverArt'

function Reader() {
  const { bookId, chapterId } = useParams()
  const chapterNum = Number(chapterId)
  const navigate = useNavigate()
  const {
    setPlaying, playing,
    currentTime, setCurrentTime,
    duration, setDuration,
    setPlaybackSpeed, playbackSpeed,
    setPlayingContext, setAudioUrl,
    setPlayerExpanded,
  } = useStore()

  const [chapter, setChapter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)
  const [audioReady, setAudioReady] = useState(false)

  const howlRef = useRef(null)
  const objectUrlRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)
      setAudioReady(false)

      try {
        const chapterData = await api.getChapter(bookId, chapterNum)
        if (cancelled) return
        setChapter(chapterData)
        setPlayingContext(bookId, chapterNum, chapterData.title)

        let audioBlob = await api.getAudio(bookId, chapterNum)
        if (!audioBlob && !cancelled) {
          setGenerating(true)
          try { audioBlob = await api.generateAudio(bookId, chapterNum) }
          catch (e) { console.warn('Audio gen failed:', e) }
          if (!cancelled) setGenerating(false)
        }

        if (audioBlob && !cancelled) {
          setupPlayer(audioBlob, chapterData.title)
        }
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
      howlRef.current?.unload()
      howlRef.current = null
      if (objectUrlRef.current) { URL.revokeObjectURL(objectUrlRef.current); objectUrlRef.current = null }
      setAudioReady(false)
    }
  }, [bookId, chapterId])

  const setupPlayer = (blob, title) => {
    howlRef.current?.unload()
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    const url = URL.createObjectURL(blob)
    objectUrlRef.current = url
    const h = new Howl({
      src: [url], format: ['wav'], html5: true, rate: playbackSpeed,
      onplay: () => setPlaying(true),
      onpause: () => setPlaying(false),
      onstop: () => setPlaying(false),
      onend: () => setPlaying(false),
      onload: () => { setDuration(h.duration()); setAudioReady(true) },
      onloaderror: () => setError('Failed to load audio.'),
    })
    howlRef.current = h
    h.play()
    setPlayerExpanded(true)
  }

  // Progress ticker
  useEffect(() => {
    if (!playing || !howlRef.current) return
    const iv = setInterval(() => {
      try {
        const t = howlRef.current?.seek()
        if (typeof t === 'number') setCurrentTime(t)
      } catch {}
    }, 200)
    return () => clearInterval(iv)
  }, [playing])

  // Auto-bookmark
  useEffect(() => {
    if (!playing || !howlRef.current) return
    const iv = setInterval(() => {
      try {
        const t = howlRef.current?.seek()
        if (typeof t === 'number') api.saveBookmark(bookId, chapterNum, t).catch(() => {})
      } catch {}
    }, 15000)
    return () => clearInterval(iv)
  }, [playing, bookId, chapterNum])

  if (loading) return <div className="loading" style={{ minHeight: '100vh' }}><div className="spinner" /></div>

  return (
    <div className="page" style={{ paddingBottom: audioReady ? '90px' : '20px' }}>
      <header className="header">
        <button className="back-btn" onClick={() => navigate(`/book/${bookId}`)}>
          ‹ {chapter?.book_title || 'Book'}
        </button>
        <div className="header-actions">
          {chapterNum > 1 && (
            <button className="btn-icon" onClick={() => navigate(`/book/${bookId}/chapter/${chapterNum - 1}`)}>‹</button>
          )}
          <button className="btn-icon" onClick={() => navigate(`/book/${bookId}/chapter/${chapterNum + 1}`)}>›</button>
        </div>
      </header>

      {/* Chapter title */}
      <div style={{ padding: '16px 18px 4px' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
          Chapter {chapterNum}
        </div>
        <div style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
          {chapter?.title || `Chapter ${chapterNum}`}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ margin: '12px 18px', padding: '14px', background: 'rgba(255,55,95,0.1)', borderRadius: 'var(--r-md)', fontSize: '0.88rem', color: 'var(--danger)' }}>
          {error}
        </div>
      )}

      {/* Generating */}
      {generating && (
        <div className="generating-card">
          <div className="spinner" />
          <div className="generating-text">Generating audio with character voices...</div>
        </div>
      )}

      {/* Text */}
      {chapter?.text && (
        <div className="reader-text">
          {chapter.text.split('\n\n').map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      )}

      {/* Chapter Nav */}
      <div className="reader-nav">
        {chapterNum > 1
          ? <button className="btn-secondary" onClick={() => navigate(`/book/${bookId}/chapter/${chapterNum - 1}`)}>‹ Previous</button>
          : <div />
        }
        <button className="btn-secondary" onClick={() => navigate(`/book/${bookId}/chapter/${chapterNum + 1}`)}>
          Next ›
        </button>
      </div>
      <div className="spacer-lg" />
    </div>
  )
}

export default Reader
