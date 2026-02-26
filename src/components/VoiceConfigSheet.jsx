import { useEffect } from 'react'
import { getCoverGradient } from '../utils/coverArt'
import { IconCheck } from '../components/Icons'

function VoiceConfigSheet({ characters, voices, onVoiceChange, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const voicesFor = (gender) =>
    gender === 'unknown' ? voices : voices.filter(v => v.gender === gender)

  return (
    <div className="sheet-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="sheet">
        <div className="sheet-handle-row"><div className="sheet-handle" /></div>

        <div className="sheet-hd">
          <div className="sheet-hd-title">Voice Cast</div>
          <button className="sheet-done" onClick={onClose}>Done</button>
        </div>
        <div className="sheet-sub">Assign a voice to each character</div>

        <div className="sheet-scroll">
          {characters.map((char) => {
            const selected = voices.find(v => v.id === char.voice_id)
            const candidates = voicesFor(char.gender)

            return (
              <div key={char.id} className="sh-char-block">
                {/* Character header */}
                <div className="sh-char-row">
                  <div className="sh-avatar" style={{ background: getCoverGradient(char.id || char.name) }}>
                    {char.name[0].toUpperCase()}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div className="sh-name">
                      {char.name}
                      {char.is_narrator && <span className="tag">Narrator</span>}
                    </div>
                    <div className="sh-meta">
                      {char.gender !== 'unknown' ? char.gender : 'Any gender'}
                      {selected ? ` · ${selected.accent} · ${selected.style}` : ''}
                    </div>
                  </div>
                  <div className="sh-current">{selected?.name || '—'}</div>
                </div>

                {/* Voice chips */}
                <div className="sh-chips">
                  {candidates.map((voice) => {
                    const active = char.voice_id === voice.id
                    return (
                      <button key={voice.id} className={`vchip ${active ? 'on' : ''}`}
                        onClick={() => onVoiceChange(char.name, voice.id)}>
                        <div className="vchip-avatar" style={active ? { background: getCoverGradient(voice.id) } : {}}>
                          {voice.name[0]}
                        </div>
                        <div className="vchip-name">{voice.name}</div>
                        <div className="vchip-meta">{voice.accent}</div>
                        {active && (
                          <div className="vchip-tick">
                            <IconCheck size={9} strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>

                <div className="sheet-sep" />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default VoiceConfigSheet
