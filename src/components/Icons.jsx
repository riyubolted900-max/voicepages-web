// SF Symbol-style icons — outline (inactive) + filled (active)

const SVG = ({ size = 24, children, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', flexShrink: 0 }} {...rest}>
    {children}
  </svg>
)

// ── TAB BAR: Library ──────────────────────────────────────────
export function TabLibraryOutline({ size = 26 }) {
  return (
    <SVG size={size}>
      {/* 3 book spines on a shelf */}
      <rect x="4" y="4" width="4" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="10" y="7" width="4" height="11" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="16" y="5" width="4" height="13" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <line x1="3" y1="19" x2="21" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </SVG>
  )
}
export function TabLibraryFilled({ size = 26 }) {
  return (
    <SVG size={size}>
      <rect x="4" y="4" width="4" height="14" rx="1" fill="currentColor" />
      <rect x="10" y="7" width="4" height="11" rx="1" fill="currentColor" />
      <rect x="16" y="5" width="4" height="13" rx="1" fill="currentColor" />
      <line x1="3" y1="19" x2="21" y2="19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </SVG>
  )
}

// ── TAB BAR: Now Playing / Waveform ───────────────────────────
export function TabPlayingOutline({ size = 26 }) {
  return (
    <SVG size={size}>
      <line x1="4"  y1="12" x2="4"  y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="8"  y1="8"  x2="8"  y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="12" y1="5"  x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="16" y1="8"  x2="16" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="20" y1="11" x2="20" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </SVG>
  )
}
export function TabPlayingFilled({ size = 26 }) {
  // Animated equalizer bars
  return (
    <SVG size={size}>
      <rect x="3"  y="11" width="2.5" height="2"  rx="1.25" fill="currentColor"/>
      <rect x="7"  y="7"  width="2.5" height="10" rx="1.25" fill="currentColor"/>
      <rect x="11" y="4"  width="2.5" height="16" rx="1.25" fill="currentColor"/>
      <rect x="15" y="7"  width="2.5" height="10" rx="1.25" fill="currentColor"/>
      <rect x="19" y="10" width="2.5" height="4"  rx="1.25" fill="currentColor"/>
    </SVG>
  )
}

// ── TAB BAR: Settings / Sliders ───────────────────────────────
export function TabSettingsOutline({ size = 26 }) {
  return (
    <SVG size={size}>
      {/* 3 slider lines with knobs */}
      <line x1="4" y1="7"  x2="20" y2="7"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="8" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" style={{background:'none'}}/>
      <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="14" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <line x1="4" y1="17" x2="20" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="10" cy="17" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    </SVG>
  )
}
export function TabSettingsFilled({ size = 26 }) {
  return (
    <SVG size={size}>
      <line x1="4" y1="7"  x2="20" y2="7"  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="8" cy="7" r="3" fill="currentColor"/>
      <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="14" cy="12" r="3" fill="currentColor"/>
      <line x1="4" y1="17" x2="20" y2="17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="10" cy="17" r="3" fill="currentColor"/>
    </SVG>
  )
}

// ── TAB BAR: Appearance ───────────────────────────────────────
export function TabSunOutline({ size = 26 }) {
  return (
    <SVG size={size}>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="12" y1="2"  x2="12" y2="4.5"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="12" y1="19.5" x2="12" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="2"  y1="12" x2="4.5"  y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="19.5" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="4.9" y1="4.9"  x2="6.7" y2="6.7"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="17.3" y1="17.3" x2="19.1" y2="19.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="4.9" y1="19.1" x2="6.7" y2="17.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="17.3" y1="6.7" x2="19.1" y2="4.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </SVG>
  )
}
export function TabSunFilled({ size = 26 }) {
  return (
    <SVG size={size}>
      <circle cx="12" cy="12" r="4.5" fill="currentColor"/>
      <line x1="12" y1="2"    x2="12" y2="4.5"    stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="12" y1="19.5" x2="12" y2="22"   stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="2"    y1="12" x2="4.5"  y2="12"   stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="19.5" y1="12" x2="22"   y2="12"   stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="4.9" y1="4.9"   x2="6.7" y2="6.7"   stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="17.3" y1="17.3" x2="19.1" y2="19.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="4.9" y1="19.1" x2="6.7" y2="17.3"   stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="17.3" y1="6.7" x2="19.1" y2="4.9"   stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </SVG>
  )
}
export function TabMoonOutline({ size = 26 }) {
  return (
    <SVG size={size}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </SVG>
  )
}
export function TabMoonFilled({ size = 26 }) {
  return (
    <SVG size={size}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor"/>
    </SVG>
  )
}

// ── General purpose icons ─────────────────────────────────────
const Stroke = ({ d, size=24, sw=1.8, ...p }) => (
  <SVG size={size} {...p}>
    {[].concat(d).map((path,i) =>
      <path key={i} d={path} stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
    )}
  </SVG>
)
const Fill = ({ d, size=24, ...p }) => (
  <SVG size={size} {...p}>
    {[].concat(d).map((path,i) => <path key={i} d={path} fill="currentColor"/>)}
  </SVG>
)

export const IconPlay         = (p) => <Fill size={p.size||24} d="M5 3l14 9-14 9V3z" {...p}/>
export const IconPause        = (p) => <Fill size={p.size||24} d={["M6 4h4v16H6z","M14 4h4v16h-4z"]} {...p}/>
export const IconStop         = (p) => <Fill size={p.size||24} d="M6 6h12v12H6z" {...p}/>
export const IconClose        = (p) => <Stroke size={p.size||24} d="M18 6L6 18M6 6l12 12" sw={2} {...p}/>
export const IconChevronRight = (p) => <Stroke size={p.size||24} d="M9 18l6-6-6-6" sw={2} {...p}/>
export const IconChevronLeft  = (p) => <Stroke size={p.size||24} d="M15 18l-6-6 6-6" sw={2} {...p}/>
export const IconChevronDown  = (p) => <Stroke size={p.size||24} d="M6 9l6 6 6-6" sw={2} {...p}/>
export const IconCheck        = (p) => <Stroke size={p.size||24} d="M20 6L9 17l-5-5" sw={2.5} {...p}/>
export const IconTrash        = (p) => <Stroke size={p.size||24} d={["M3 6h18","M19 6l-1 14H6L5 6","M8 6V4h8v2"]} {...p}/>
export const IconMic          = (p) => <Stroke size={p.size||24} d={["M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z","M19 10v2a7 7 0 0 1-14 0v-2","M12 19v4","M8 23h8"]} {...p}/>
export const IconUpload       = (p) => <Stroke size={p.size||24} d={["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4","M17 8l-5-5-5 5","M12 3v12"]} {...p}/>
export const IconSkipBack     = (p) => <Stroke size={p.size||24} d={["M19 20 9 12l10-8v16z","M5 19V5"]} {...p}/>
export const IconSkipFwd      = (p) => <Stroke size={p.size||24} d={["M5 4l10 8-10 8V4z","M19 5v14"]} {...p}/>
