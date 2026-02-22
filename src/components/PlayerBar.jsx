import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { api } from '../services/api'
import { Howl } from 'howler'

function PlayerBar() {
  const navigate = useNavigate()
  const {
    playing, setPlaying,
    currentTime, setCurrentTime,
    duration, setDuration,
    playbackSpeed,
    playingBookId, playingChapterId, playingChapterTitle,
    clearPlayingContext
  } = useStore()

  const howlRef = useRef(null)
  const progressRef = useRef(null)
  const objectUrlRef = useRef(null)

  // If no chapter is playing, don't render
  if (!playingBookId || playingChapterId == null) {
    return null
  }

  const togglePlay = async () => {
    // If audio not loaded yet, load it
    if (!howlRef.current) {
      try {
        const audioBlob = await api.getAudio(playingBookId, playingChapterId)
        if (audioBlob) {
          // Clean up previous URL
          if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
          const url = URL.createObjectURL(audioBlob)
          objectUrlRef.current = url

          const howl = new Howl({
            src: [url],
            html5: true,
            rate: playbackSpeed,
            onplay: () => setPlaying(true),
            onpause: () => setPlaying(false),
            onstop: () => setPlaying(false),
            onend: () => {
              setPlaying(false)
              const next = playingChapterId + 1
              navigate(`/book/${playingBookId}/chapter/${next}`)
            },
            onload: () => setDuration(howl.duration())
          })
          howlRef.current = howl
          howl.play()
        }
      } catch (e) {
        console.error('Failed to load audio:', e)
      }
      return
    }

    if (playing) {
      howlRef.current.pause()
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

  const handleStop = () => {
    if (howlRef.current) {
      howlRef.current.stop()
      howlRef.current.unload()
      howlRef.current = null
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
    clearPlayingContext()
  }

  // Update progress
  useEffect(() => {
    if (!playing || !howlRef.current) return
    const interval = setInterval(() => {
      const time = howlRef.current?.seek()
      if (typeof time === 'number') setCurrentTime(time)
    }, 200)
    return () => clearInterval(interval)
  }, [playing, setCurrentTime])

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = duration ? (currentTime / duration) * 100 : 0

  return (
    <div className="player-bar">
      {/* Progress bar */}
      <div
        ref={progressRef}
        className="progress-bar"
        onClick={handleSeek}
      >
        <div
          className="progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Controls */}
      <div className="player-info">
        <div className="player-title">
          {playingChapterTitle || `Chapter ${playingChapterId}`}
        </div>

        <div className="player-controls">
          <button className="play-btn" onClick={togglePlay}>
            {playing ? '\u23F8' : '\u25B6'}
          </button>

          <button
            className="btn btn-icon"
            onClick={handleStop}
            style={{ fontSize: '1.25rem' }}
          >
            &#9632;
          </button>

          <div className="time-display">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlayerBar
