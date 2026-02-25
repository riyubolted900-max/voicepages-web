import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useStore } from './store'
import { api } from './services/api'
import Library from './pages/Library'
import BookDetail from './pages/BookDetail'
import Reader from './pages/Reader'
import Settings from './pages/Settings'
import PlayerBar from './components/PlayerBar'
import ErrorBoundary from './components/ErrorBoundary'
import {
  TabLibraryOutline, TabLibraryFilled,
  TabPlayingOutline, TabPlayingFilled,
  TabSettingsOutline, TabSettingsFilled,
  TabSunOutline, TabSunFilled,
  TabMoonOutline, TabMoonFilled,
} from './components/Icons'

// ── Theme ──────────────────────────────────────────────────────
function useTheme() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('vp-theme') || 'dark'
  )
  useEffect(() => {
    theme === 'light'
      ? document.documentElement.setAttribute('data-theme', 'light')
      : document.documentElement.removeAttribute('data-theme')
    localStorage.setItem('vp-theme', theme)
  }, [theme])
  return { theme, toggle: () => setTheme(t => t === 'dark' ? 'light' : 'dark') }
}

// ── Tab Bar ────────────────────────────────────────────────────
const ICON_SIZE = 25

function TabBar({ theme, onThemeToggle }) {
  const navigate   = useNavigate()
  const location   = useLocation()
  const { playingBookId, playerExpanded, setPlayerExpanded } = useStore()

  const tabs = [
    {
      id: 'library',
      label: 'Library',
      Outline: TabLibraryOutline,
      Filled:  TabLibraryFilled,
      onPress: () => { setPlayerExpanded(false); navigate('/') },
      isActive: () => location.pathname === '/' && !playerExpanded,
    },
    {
      id: 'playing',
      label: 'Playing',
      Outline: TabPlayingOutline,
      Filled:  TabPlayingFilled,
      onPress: () => { if (playingBookId) setPlayerExpanded(true) },
      isActive: () => playerExpanded,
    },
    {
      id: 'settings',
      label: 'Settings',
      Outline: TabSettingsOutline,
      Filled:  TabSettingsFilled,
      onPress: () => { setPlayerExpanded(false); navigate('/settings') },
      isActive: () => location.pathname === '/settings' && !playerExpanded,
    },
    {
      id: 'theme',
      label: theme === 'dark' ? 'Light' : 'Dark',
      Outline: theme === 'dark' ? TabSunOutline  : TabMoonOutline,
      Filled:  theme === 'dark' ? TabSunFilled   : TabMoonFilled,
      onPress: onThemeToggle,
      isActive: () => false,
    },
  ]

  return (
    <div className="tab-bar">
      {tabs.map(({ id, label, Outline, Filled, onPress, isActive }) => {
        const active = isActive()
        const Icon   = active ? Filled : Outline
        return (
          <button key={id} className={`tab-item ${active ? 'active' : ''}`} onClick={onPress}>
            <span className="tab-icon-wrap">
              <Icon size={ICON_SIZE} />
            </span>
            <span className="tab-label">{label}</span>
          </button>
        )
      })}
    </div>
  )
}

// ── App ────────────────────────────────────────────────────────
function AppInner() {
  const { setServerUrl, loadVoices, loadBooks } = useStore()
  const [ready, setReady] = useState(false)
  const { theme, toggle } = useTheme()

  useEffect(() => {
    const proto = window.location.protocol
    const host  = window.location.hostname
    setServerUrl(`${proto}//${host}:9000`)
    Promise.all([loadVoices(), loadBooks()]).finally(() => setReady(true))
  }, [])

  if (!ready) return (
    <div className="loading" style={{ minHeight: '100vh' }}>
      <div className="spinner" />
    </div>
  )

  return (
    <ErrorBoundary>
      <div className="app-container">
        <div className="main-content">
          <Routes>
            <Route path="/"                                element={<Library />} />
            <Route path="/book/:bookId"                    element={<BookDetail />} />
            <Route path="/book/:bookId/chapter/:chapterId" element={<Reader />} />
            <Route path="/settings"                        element={<Settings />} />
          </Routes>
        </div>
        <PlayerBar />
        <TabBar theme={theme} onThemeToggle={toggle} />
      </div>
    </ErrorBoundary>
  )
}

export default function App() {
  return <BrowserRouter><AppInner /></BrowserRouter>
}
