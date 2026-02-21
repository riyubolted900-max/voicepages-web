import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useStore } from './store'
import { api } from './services/api'
import Library from './pages/Library'
import BookDetail from './pages/BookDetail'
import Reader from './pages/Reader'
import Settings from './pages/Settings'
import PlayerBar from './components/PlayerBar'

function App() {
  const { setServerUrl, loadVoices, loadBooks } = useStore()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Auto-detect server URL from current host
    const protocol = window.location.protocol
    const hostname = window.location.hostname
    const serverUrl = `${protocol}//${hostname}:9000`
    setServerUrl(serverUrl)
    
    // Initial load
    Promise.all([
      loadVoices(),
      loadBooks()
    ]).then(() => setReady(true))
      .catch(() => setReady(true)) // Continue even if server unavailable
  }, [])

  if (!ready) {
    return (
      <div className="loading" style={{ minHeight: '100vh' }}>
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <div className="app-container">
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Library />} />
            <Route path="/book/:bookId" element={<BookDetail />} />
            <Route path="/book/:bookId/chapter/:chapterId" element={<Reader />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
        <PlayerBar />
      </div>
    </BrowserRouter>
  )
}

export default App
