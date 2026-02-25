import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import { api } from '../services/api'
import { getCoverGradient, getCoverColors } from '../utils/coverArt'
import { IconPlay, IconPause, IconClose, IconSkipBack, IconSkipFwd, IconChevronDown } from '../components/Icons'
import { Howl } from 'howler'

const SPEEDS = [0.75, 1, 1.25, 1.5, 2]
const fmt = (s) => { if (!s||isNaN(s)) return '0:00'; const m=Math.floor(s/60),sec=Math.floor(s%60); return `${m}:${sec.toString().padStart(2,'0')}` }

export default function PlayerBar() {
  const {
    playing, setPlaying, currentTime, setCurrentTime, duration, setDuration,
    playbackSpeed, setPlaybackSpeed,
    playingBookId, playingChapterId, playingChapterTitle, currentBook,
    playerExpanded, setPlayerExpanded, clearPlayingContext,
  } = useStore()

  const howlRef    = useRef(null)
  const urlRef     = useRef(null)
  const scrubRef   = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [dragPct,  setDragPct]  = useState(0)

  // Progress tick
  useEffect(() => {
    if (!playing||!howlRef.current) return
    const iv = setInterval(() => {
      try { const t=howlRef.current?.seek(); if(typeof t==='number') setCurrentTime(t) } catch{}
    }, 200)
    return () => clearInterval(iv)
  }, [playing])

  if (!playingBookId || playingChapterId == null) return null

  const progress   = duration ? currentTime/duration : 0
  const displayPct = dragging ? dragPct : progress
  const bookTitle  = currentBook?.title || 'VoicePages'
  const chapLabel  = playingChapterTitle || `Chapter ${playingChapterId}`
  const coverGrad  = getCoverGradient(playingBookId)
  const initials   = bookTitle.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase() || 'VP'

  const loadAndPlay = async () => {
    try {
      const blob = await api.getAudio(playingBookId, playingChapterId)
      if (!blob) return
      if (urlRef.current) URL.revokeObjectURL(urlRef.current)
      const url = URL.createObjectURL(blob); urlRef.current = url
      const h = new Howl({
        src:[url], format:['wav'], html5:true, rate:playbackSpeed,
        onplay:  () => setPlaying(true),
        onpause: () => setPlaying(false),
        onstop:  () => setPlaying(false),
        onend:   () => setPlaying(false),
        onload:  () => setDuration(h.duration()),
      })
      howlRef.current = h; h.play()
    } catch(e) { console.error(e) }
  }

  const togglePlay = async () => {
    if (!howlRef.current) { await loadAndPlay(); return }
    playing ? howlRef.current.pause() : howlRef.current.play()
  }

  const skip = (sec) => {
    if (!howlRef.current) return
    const t = Math.max(0, Math.min(duration, (howlRef.current.seek()||0)+sec))
    howlRef.current.seek(t); setCurrentTime(t)
  }

  const stop = () => {
    howlRef.current?.stop(); howlRef.current?.unload(); howlRef.current=null
    if (urlRef.current) { URL.revokeObjectURL(urlRef.current); urlRef.current=null }
    clearPlayingContext()
  }

  const getScrubPct = (e) => {
    if (!scrubRef.current) return 0
    const cx = e.touches ? e.touches[0].clientX : e.clientX
    const r  = scrubRef.current.getBoundingClientRect()
    return Math.max(0, Math.min(1, (cx-r.left)/r.width))
  }

  const onScrubStart = (e) => { setDragging(true); setDragPct(getScrubPct(e)) }
  const onScrubMove  = (e) => { if (dragging) setDragPct(getScrubPct(e)) }
  const onScrubEnd   = (e) => {
    const pct = getScrubPct(e)
    setDragPct(pct); setDragging(false)
    if (howlRef.current) { const t=pct*duration; howlRef.current.seek(t); setCurrentTime(t) }
  }
  const onScrubClick = (e) => {
    if (!howlRef.current) return
    const pct = getScrubPct(e)
    const t   = pct*duration; howlRef.current.seek(t); setCurrentTime(t)
  }

  const changeSpeed = (s) => { setPlaybackSpeed(s); howlRef.current?.rate(s) }

  return (
    <>
      {/* ── Mini Player ── */}
      {!playerExpanded && (
        <div className="mini-player">
          <div className="mini-inner" onClick={() => setPlayerExpanded(true)}>
            <div className="mini-cover" style={{ background:coverGrad }}>{initials}</div>
            <div className="mini-info">
              <div className="mini-title">{chapLabel}</div>
              <div className="mini-sub">{bookTitle}</div>
              <div className="mini-prog">
                <div className="mini-prog-fill" style={{ width:`${displayPct*100}%` }} />
              </div>
            </div>
            <div className="mini-ctrls" onClick={e=>e.stopPropagation()}>
              <button className="mini-btn" onClick={togglePlay}>
                {playing ? <IconPause size={22}/> : <IconPlay size={20}/>}
              </button>
              <button className="mini-btn" onClick={stop} style={{ color:'var(--text-3)' }}>
                <IconClose size={16} strokeWidth={2.2}/>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Full Screen Player ── */}
      {playerExpanded && (
        <div className="fp-overlay">
          <div className="fp-bg" style={{ background:coverGrad }} />
          <div className="fp-content">
            {/* Pill + label */}
            <div className="fp-pill-row">
              <div className="fp-pill" />
              <span className="fp-pill-label">Now Playing</span>
            </div>

            {/* Header row */}
            <div className="fp-hd">
              <button className="btn-icon" onClick={() => setPlayerExpanded(false)}>
                <IconChevronDown size={20} strokeWidth={2.2}/>
              </button>
              <div />
              <button className="btn-icon" onClick={stop}>
                <IconClose size={16} strokeWidth={2.2}/>
              </button>
            </div>

            {/* Cover */}
            <div className="fp-cover-wrap">
              <div className={`fp-cover ${playing?'playing':''}`} style={{ background:coverGrad }}>
                {initials}
              </div>
            </div>

            {/* Meta */}
            <div className="fp-meta">
              <div className="fp-title">{chapLabel}</div>
              <div className="fp-sub">{bookTitle}</div>
            </div>

            {/* Scrubber */}
            <div ref={scrubRef} className="scrubber"
              onClick={onScrubClick}
              onMouseDown={onScrubStart} onMouseMove={onScrubMove} onMouseUp={onScrubEnd} onMouseLeave={e=>dragging&&onScrubEnd(e)}
              onTouchStart={onScrubStart} onTouchMove={onScrubMove} onTouchEnd={onScrubEnd}
            >
              <div className="scrubber-fill" style={{ width:`${displayPct*100}%` }}/>
              <div className="scrubber-thumb" style={{ left:`${displayPct*100}%` }}/>
            </div>
            <div className="scrubber-times" style={{ marginBottom:4 }}>
              <span>{fmt(dragging ? displayPct*duration : currentTime)}</span>
              <span>-{fmt(duration - (dragging ? displayPct*duration : currentTime))}</span>
            </div>

            {/* Controls */}
            <div className="fp-ctrls">
              <button className="ctrl-btn" onClick={() => skip(-15)}>
                <IconSkipBack size={32}/>
              </button>
              <button className="ctrl-play" onClick={togglePlay}>
                {playing ? <IconPause size={28}/> : <IconPlay size={26}/>}
              </button>
              <button className="ctrl-btn" onClick={() => skip(15)}>
                <IconSkipFwd size={32}/>
              </button>
            </div>

            {/* Speed */}
            <div className="fp-speeds">
              {SPEEDS.map(s => (
                <button key={s} className={`speed-pill ${playbackSpeed===s?'on':''}`} onClick={() => changeSpeed(s)}>
                  {s}×
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
