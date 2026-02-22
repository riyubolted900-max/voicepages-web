import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { api } from '../services/api'
import { Howl } from 'howler'

function Reader() {
  const { bookId, chapterId } = useParams()
  const chapterNum = Number(chapterId)
  const navigate = useNavigate()
  const {
    setPlaying, playing,
    setCurrentTime, setDuration,
    setPlaybackSpeed, playbackSpeed,
    playingBookId, playingChapterId,
    setPlayingContext, setAudioUrl
  } = useStore()

  const [chapter, setChapter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)

  const howlRef = useRef(null)
  const progressRef = useRef(null)
  const objectUrlRef = useRef(null)

  useEffect(() => {
    loadChapter()
    return () => {
      if (howlRef.current) {
        howlRef.current.unload()
        howlRef.current = null
      }
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
        objectUrlRef.current = null
      }
    }
  }, [bookId, chapterId])

  const loadChapter = async () => {
    setLoading(true)
    setError(null)

    try {
      const chapterData = await api.getChapter(bookId, chapterNum)
      setChapter(chapterData)

      // Try to get cached audio or generate new
      let audioBlob = await api.getAudio(bookId, chapterNum)

      if (!audioBlob) {
        setGenerating(true)
        try {
          audioBlob = await api.generateAudio(bookId, chapterNum)
        } catch (e) {
          console.warn('Audio generation failed:', e)
        }
        setGenerating(false)
      }

      if (audioBlob) {
        setupAudioPlayer(audioBlob, chapterData.title)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const setupAudioPlayer = (audioBlob, title) => {
    // Cleanup previous
    if (howlRef.current) {
      howlRef.current.unload()
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
    }

    const url = URL.createObjectURL(audioBlob)
    objectUrlRef.current = url
    setAudioUrl(url)

    const howl = new Howl({
      src: [url],
      format: ['wav'],
      html5: true,
      rate: playbackSpeed,
      onplay: () => {
        setPlaying(true)
        setPlayingContext(bookId, chapterNum, title)
      },
      onpause: () => setPlaying(false),
      onstop: () => setPlaying(false),
      onend: () => {
        setPlaying(false)
        const nextChapter = chapterNum + 1
        navigate(`/book/${bookId}/chapter/${nextChapter}`)
      },
      onload: () => {
        setDuration(howl.duration())
      },
      onloaderror: (id, err) => {
        console.error('Audio load error:', err)
        setError('Failed to load audio')
      }
    })

    howlRef.current = howl
  }

  const togglePlay = () => {
    if (!howlRef.current) return
    if (playing) {
      howlRef.current.pause()
      // Save bookmark on pause
      api.saveBookmark(bookId, chapterNum, howlRef.current.seek() || 0).catch(() => {})
    } else {
      howlRef.current.play()
    }
  }

  const handleSeek = (e) => {
    if (!howlRef.current || !progressRef.current) return
    const rect = progressRef.current.getBoundingClientRect()
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const time = percent * howlRef.current.duration()
    howlRef.current.seek(time)
    setCurrentTime(time)
  }

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed)
    if (howlRef.current) {
      howlRef.current.rate(speed)
    }
  }

  // Update progress bar
  useEffect(() => {
    if (!playing || !howlRef.current) return
    const interval = setInterval(() => {
      const time = howlRef.current?.seek()
      if (typeof time === 'number') setCurrentTime(time)
    }, 200)
    return () => clearInterval(interval)
  }, [playing, setCurrentTime])

  // Auto-save bookmark every 15s
  useEffect(() => {
    if (!playing || !howlRef.current) return
    const interval = setInterval(() => {
      const time = howlRef.current?.seek()
      if (typeof time === 'number') {
        api.saveBookmark(bookId, chapterNum, time).catch(() => {})
      }
    }, 15000)
    return () => clearInterval(interval)
  }, [playing, bookId, chapterNum])

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const isCurrentChapter = playingBookId === bookId && playingChapterId === chapterNum

  if (loading) {
    return (
      <div className="loading" style={{ minHeight: '100vh' }}>
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div style={{ paddingBottom: '1rem' }}>
      <header className="header">
        <button className="back-btn" onClick={() => navigate(`/book/${bookId}`)}>&#8592;</button>
        <h1 style={{ flex: 1, marginLeft: '0.5rem', fontSize: '1rem' }}>
          {chapter?.title || `Chapter ${chapterId}`}
        </h1>
      </header>

      <main style={{ padding: '1rem' }}>
        {error && (
          <div style={{
            padding: '1rem',
            background: 'rgba(231, 76, 60, 0.2)',
            borderRadius: 8,
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        {generating && (
          <div style={{
            padding: '1rem',
            background: 'var(--surface)',
            borderRadius: 8,
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            <div className="spinner" style={{ margin: '0 auto 0.5rem' }}></div>
            Generating audio...
          </div>
        )}

        {/* Chapter Text */}
        {chapter?.text && (
          <div className="text-content">
            {chapter.text.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '2rem',
          gap: '1rem'
        }}>
          {chapterNum > 1 && (
            <button
              className="btn btn-secondary"
              onClick={() => navigate(`/book/${bookId}/chapter/${chapterNum - 1}`)}
            >
              &#8592; Previous
            </button>
          )}

          <button
            className="btn btn-primary"
            onClick={() => navigate(`/book/${bookId}`)}
          >
            Back to Book
          </button>
        </div>
      </main>

      {/* Inline Player */}
      {howlRef.current && (
        <div style={{
          position: 'fixed',
          bottom: 80,
          left: 0,
          right: 0,
          background: 'var(--bg-light)',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          borderTop: '1px solid var(--surface)'
        }}>
          <button className="play-btn" onClick={togglePlay}>
            {playing ? '\u23F8' : '\u25B6'}
          </button>
          <div
            ref={progressRef}
            className="progress-bar"
            style={{ flex: 1 }}
            onClick={handleSeek}
          >
            <div
              className="progress-fill"
              style={{ width: `${useStore.getState().duration ? (useStore.getState().currentTime / useStore.getState().duration) * 100 : 0}%` }}
            />
          </div>
          <select
            className="speed-select"
            value={playbackSpeed}
            onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
          >
            <option value="0.75">0.75x</option>
            <option value="1">1x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x</option>
          </select>
        </div>
      )}
    </div>
  )
}

export default Reader
