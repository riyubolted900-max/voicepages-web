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
    playbackSpeed, volume,
    playingBookId, playingChapterId, playingChapterTitle,
    clearPlayingContext
  } = useStore()

  const howlRef = useRef(null)
  const progressRef = useRef(null)
  const objectUrlRef = useRef(null)

  // Update progress — ALL hooks must be declared before any early return
  useEffect(() => {
    if (!playing || !howlRef.current) return
    const interval = setInterval(() => {
      const time = howlRef.current?.seek()
      if (typeof time === 'number') setCurrentTime(time)
    }, 200)
    return () => clearInterval(interval)
  }, [playing, setCurrentTime])

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

  // Early return AFTER all hooks — never before
  if (!playingBookId || playingChapterId == null) {
    return null
  }

  const togglePlay = async () => {
    // If audio not loaded yet, load it
    if (!howlRef.current) {
      try {
        const audioBlob = await api.getAudio(playingBookId, playingChapterId)
        if (audioBlob) {
          if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
          const url = URL.createObjectURL(audioBlob)
          objectUrlRef.current = url

          const howl = new Howl({
            src: [url],
            format: ['wav'],
            html5: true,
            rate: playbackSpeed,
            volume: volume,
            onplay: () => setPlaying(true),
            onpause: () => setPlaying(false),
            onstop: () => setPlaying(false),
            onend: () => { setPlaying(false) },
            onload: () => setDuration(howl.duration()),
            onloaderror: (id, err) => {
              console.error('PlayerBar audio load error:', err)
            }
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

  const handleSkip = (seconds) => {
    if (!howlRef.current) return
    const current = howlRef.current.seek()
    if (typeof current !== 'number') return
    const next = Math.max(0, Math.min(howlRef.current.duration(), current + seconds))
    howlRef.current.seek(next)
    setCurrentTime(next)
  }

  const handleProgressChange = (e) => {
    if (!howlRef.current) return
    const pct = parseFloat(e.target.value) / 100
    const time = pct * (howlRef.current.duration() || 0)
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

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="player-bar">
      {/* Left — track info */}
      <div className="player-info">
        <div className="player-title">
          {playingChapterTitle || `Chapter ${playingChapterId}`}
        </div>
        <div className="player-chapter">Now Playing</div>
      </div>

      {/* Center — progress + controls */}
      <div className="player-progress">
        {/* Control buttons */}
        <div className="player-controls" style={{ justifyContent: 'center' }}>
          <button
            className="player-skip-btn"
            onClick={() => handleSkip(-15)}
            title="Skip back 15s"
            aria-label="Skip back 15 seconds"
          >
            &#8630;15
          </button>

          <button
            className="player-play-btn"
            onClick={togglePlay}
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? '\u23F8' : '\u25B6'}
          </button>

          <button
            className="player-skip-btn"
            onClick={() => handleSkip(15)}
            title="Skip forward 15s"
            aria-label="Skip forward 15 seconds"
          >
            15&#8631;
          </button>
        </div>

        {/* Scrubber */}
        <input
          className="range-input"
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={progress}
          onChange={handleProgressChange}
          aria-label="Playback position"
        />

        {/* Time stamps */}
        <div className="player-time">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right — speed + stop */}
      <div className="player-controls">
        <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600, minWidth: 32, textAlign: 'center' }}>
          {playbackSpeed}x
        </span>
        <button
          className="player-stop-btn"
          onClick={handleStop}
          title="Stop and close player"
          aria-label="Stop playback"
        >
          &#9632;
        </button>
      </div>
    </div>
  )
}

export default PlayerBar
