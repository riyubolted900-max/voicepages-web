import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { api } from '../services/api'
import { Howl } from 'howler'

function Reader() {
  const { bookId, chapterId } = useParams()
  const navigate = useNavigate()
  const { 
    setPlaying, 
    playing, 
    setCurrentTime, 
    setDuration,
    setPlaybackSpeed,
    playbackSpeed,
    playingBookId,
    playingChapterId,
    setPlayingContext
  } = useStore()

  const [chapter, setChapter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)
  
  const howlRef = useRef(null)
  const progressRef = useRef(null)

  useEffect(() => {
    loadChapter()
    return () => {
      if (howlRef.current) {
        howlRef.current.unload()
      }
    }
  }, [bookId, chapterId])

  const loadChapter = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Load chapter text
      const chapterData = await api.getChapter(bookId, chapterId)
      setChapter(chapterData)
      
      // Try to get cached audio or generate new
      let audioBlob = await api.getAudio(bookId, chapterId)
      
      if (!audioBlob) {
        // Need to generate audio
        setGenerating(true)
        try {
          audioBlob = await api.generateAudio(bookId, chapterId)
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

    const url = URL.createObjectURL(audioBlob)
    
    const howl = new Howl({
      src: [url],
      html5: true, // Use HTML5 Audio for streaming
      onplay: () => {
        setPlaying(true)
        setPlayingContext(bookId, chapterId, title)
      },
      onpause: () => setPlaying(false),
      onstop: () => setPlaying(false),
      onend: () => {
        setPlaying(false)
        // Auto-advance to next chapter
        const nextChapter = parseInt(chapterId) + 1
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
    } else {
      howlRef.current.play()
    }
  }

  const handleSeek = (e) => {
    if (!howlRef.current || !progressRef.current) return
    
    const rect = progressRef.current.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
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
      const time = howlRef.current.seek()
      setCurrentTime(time || 0)
    }, 100)
    
    return () => clearInterval(interval)
  }, [playing])

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const isCurrentChapter = playingBookId === bookId && playingChapterId === parseInt(chapterId)

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
        <button className="back-btn" onClick={() => navigate(`/book/${bookId}`)}>←</button>
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
          {parseInt(chapterId) > 1 && (
            <button 
              className="btn btn-secondary"
              onClick={() => navigate(`/book/${bookId}/chapter/${parseInt(chapterId) - 1}`)}
            >
              ← Previous
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

      {/* Inline Player (visible when not in bottom bar) */}
      {!isCurrentChapter && (
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
            {playing ? '⏸' : '▶'}
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.9rem' }}>{chapter?.title}</div>
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
