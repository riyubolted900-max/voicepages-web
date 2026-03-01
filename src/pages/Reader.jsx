import { useState, useEffect, useRef } from 'react'
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
    currentTime, setCurrentTime,
    duration, setDuration,
    setPlaybackSpeed, playbackSpeed,
    volume
  } = useStore()

  const [chapter, setChapter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)
  const [audioReady, setAudioReady] = useState(false)

  const autoBookmark = localStorage.getItem('autoBookmark') !== 'false'

  const howlRef = useRef(null)
  const progressRef = useRef(null)
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

        // Try to get cached audio or generate new
        let audioBlob = await api.getAudio(bookId, chapterNum)

        if (!audioBlob && !cancelled) {
          setGenerating(true)
          try {
            audioBlob = await api.generateAudio(bookId, chapterNum)
          } catch (e) {
            console.warn('Audio generation failed:', e)
          }
          if (!cancelled) setGenerating(false)
        }

        if (audioBlob && !cancelled) {
          setupAudioPlayer(audioBlob, chapterData.title)
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
      if (howlRef.current) {
        howlRef.current.unload()
        howlRef.current = null
      }
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
        objectUrlRef.current = null
      }
      setAudioReady(false)
    }
  }, [bookId, chapterId])

  // Watch volume changes and apply to active Howl
  useEffect(() => {
    if (howlRef.current) {
      howlRef.current.volume(volume)
    }
  }, [volume])

  // Watch playback speed changes and apply to active Howl
  useEffect(() => {
    if (howlRef.current) {
      howlRef.current.rate(playbackSpeed)
    }
  }, [playbackSpeed])

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

    const howl = new Howl({
      src: [url],
      format: ['wav'],
      html5: true,
      rate: playbackSpeed,
      volume: volume,
      onplay: () => {
        setPlaying(true)
      },
      onpause: () => setPlaying(false),
      onstop: () => setPlaying(false),
      onend: () => {
        setPlaying(false)
      },
      onload: async () => {
        setDuration(howl.duration())
        setAudioReady(true)
        // Restore bookmark position if one exists for this chapter
        try {
          const bookmark = await api.getBookmark(bookId)
          if (bookmark.chapter_id === Number(chapterId) && bookmark.position > 5) {
            howl.seek(bookmark.position)
            setCurrentTime(bookmark.position)
          }
        } catch (e) {
          // ignore — start from beginning
        }
      },
      onloaderror: (id, err) => {
        console.error('Audio load error:', err)
        setError('Failed to load audio. Try refreshing the page.')
      }
    })

    howlRef.current = howl
  }

  const togglePlay = () => {
    if (!howlRef.current) return
    try {
      if (playing) {
        howlRef.current.pause()
        // Save bookmark on pause
        const pos = howlRef.current.seek()
        if (typeof pos === 'number' && autoBookmark) {
          api.saveBookmark(bookId, chapterNum, pos).catch(() => {})
        }
      } else {
        howlRef.current.play()
      }
    } catch (e) {
      console.error('Play/pause error:', e)
    }
  }

  const handleSeek = (e) => {
    if (!howlRef.current || !progressRef.current) return
    const rect = progressRef.current.getBoundingClientRect()
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const time = percent * (howlRef.current.duration() || 1)
    howlRef.current.seek(time)
    setCurrentTime(time)
  }

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed)
    if (howlRef.current) {
      howlRef.current.rate(speed)
    }
  }

  const goNextChapter = () => {
    navigate(`/book/${bookId}/chapter/${chapterNum + 1}`)
  }

  const goPrevChapter = () => {
    if (chapterNum > 1) {
      navigate(`/book/${bookId}/chapter/${chapterNum - 1}`)
    }
  }

  // Update progress bar
  useEffect(() => {
    if (!playing || !howlRef.current) return
    const interval = setInterval(() => {
      try {
        const time = howlRef.current?.seek()
        if (typeof time === 'number') setCurrentTime(time)
      } catch (e) {
        // Howl may be unloaded
      }
    }, 200)
    return () => clearInterval(interval)
  }, [playing, setCurrentTime])

  // Auto-save bookmark every 15s
  useEffect(() => {
    if (!playing || !howlRef.current) return
    const interval = setInterval(() => {
      try {
        const time = howlRef.current?.seek()
        if (typeof time === 'number' && autoBookmark) {
          api.saveBookmark(bookId, chapterNum, time).catch(() => {})
        }
      } catch (e) {
        // Howl may be unloaded
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

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  if (loading) {
    return (
      <div className="loading" style={{ minHeight: '100vh' }}>
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div style={{ paddingBottom: audioReady ? '8rem' : '1rem' }}>
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
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            color: 'var(--text, #fff)',
          }}>
            <div className="spinner" style={{
              width: 48,
              height: 48,
              border: '4px solid var(--surface)',
              borderTopColor: 'var(--primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '1rem'
            }}></div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Generating Audio...
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted, #aaa)' }}>
              This may take a moment
            </div>
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
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
              onClick={goPrevChapter}
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

          <button
            className="btn btn-secondary"
            onClick={goNextChapter}
          >
            Next &#8594;
          </button>
        </div>
      </main>

      {/* Inline Player - uses audioReady state instead of ref check */}
      {audioReady && (
        <div style={{
          position: 'fixed',
          bottom: 60,
          left: 0,
          right: 0,
          background: 'var(--bg-light, #1a1a2e)',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          borderTop: '1px solid var(--surface, #333)',
          zIndex: 100
        }}>
          <button className="play-btn" onClick={togglePlay} style={{
            background: 'var(--primary, #e94560)',
            border: 'none',
            color: '#fff',
            width: 40,
            height: 40,
            borderRadius: '50%',
            fontSize: '1.1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {playing ? '\u23F8' : '\u25B6'}
          </button>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              ref={progressRef}
              onClick={handleSeek}
              style={{
                height: 6,
                background: 'var(--surface, #333)',
                borderRadius: 3,
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              <div style={{
                height: '100%',
                background: 'var(--primary, #e94560)',
                borderRadius: 3,
                width: `${progress}%`,
                transition: 'width 0.1s linear'
              }} />
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.7rem',
              color: 'var(--text-dim, #888)',
              marginTop: 2
            }}>
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <select
            value={playbackSpeed}
            onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
            style={{
              background: 'var(--surface, #333)',
              color: 'var(--text, #eee)',
              border: 'none',
              borderRadius: 4,
              padding: '0.25rem',
              fontSize: '0.8rem',
              flexShrink: 0
            }}
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
