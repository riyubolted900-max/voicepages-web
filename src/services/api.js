/**
 * VoicePages - API Service
 * Handles all communication with the backend server
 */

const DEFAULT_SERVER_URL = 'http://localhost:9000'

class ApiService {
  constructor() {
    this.serverUrl = localStorage.getItem('serverUrl') || DEFAULT_SERVER_URL
  }

  setServerUrl(url) {
    this.serverUrl = url
    localStorage.setItem('serverUrl', url)
  }

  getServerUrl() {
    return this.serverUrl
  }

  async request(endpoint, options = {}) {
    const url = `${this.serverUrl}${endpoint}`
    const config = { headers: {}, ...options }

    // Auto-JSON-stringify body objects (but not FormData)
    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json'
      config.body = JSON.stringify(options.body)
    }

    const response = await fetch(url, config)

    if (!response.ok) {
      const error = await response.text().catch(() => `HTTP ${response.status}`)
      throw new Error(error || `HTTP ${response.status}`)
    }

    const contentType = response.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      return response.json()
    }
    if (contentType?.includes('audio/')) {
      return response.blob()
    }
    return response.text()
  }

  // Health check
  async healthCheck() {
    return this.request('/api/health')
  }

  // List all books
  async getBooks() {
    return this.request('/api/books')
  }

  // Upload a book
  async uploadBook(file) {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${this.serverUrl}/api/books/upload`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`)
    }

    return response.json()
  }

  // Get book details
  async getBook(bookId) {
    return this.request(`/api/books/${bookId}`)
  }

  // Get chapter content
  async getChapter(bookId, chapterId) {
    return this.request(`/api/books/${bookId}/chapters/${chapterId}`)
  }

  // Generate chapter audio (POST triggers generation)
  async generateAudio(bookId, chapterId) {
    const response = await fetch(
      `${this.serverUrl}/api/books/${bookId}/chapters/${chapterId}/audio`,
      { method: 'POST' }
    )

    if (!response.ok) {
      throw new Error(`Audio generation failed: ${response.status}`)
    }

    return response.blob()
  }

  // Get cached chapter audio (GET returns existing)
  async getAudio(bookId, chapterId) {
    try {
      const response = await fetch(
        `${this.serverUrl}/api/books/${bookId}/chapters/${chapterId}/audio`
      )
      if (!response.ok) return null
      return response.blob()
    } catch {
      return null
    }
  }

  // Get characters for a book
  async getCharacters(bookId) {
    return this.request(`/api/books/${bookId}/characters`)
  }

  // Update character voice
  async updateCharacterVoice(bookId, charName, voiceId) {
    return this.request(`/api/books/${bookId}/characters/${encodeURIComponent(charName)}/voice`, {
      method: 'PUT',
      body: { voice_id: voiceId }
    })
  }

  // Save bookmark
  async saveBookmark(bookId, chapterId, position) {
    return this.request(`/api/books/${bookId}/bookmark`, {
      method: 'POST',
      body: { chapter_id: Number(chapterId), position }
    })
  }

  // Get bookmark
  async getBookmark(bookId) {
    return this.request(`/api/books/${bookId}/bookmark`)
  }

  // Get available voices
  async getVoices() {
    return this.request('/api/voices')
  }

  // Test TTS
  async testTTS(text, voiceId) {
    const response = await fetch(
      `${this.serverUrl}/api/tts/generate?text=${encodeURIComponent(text)}&voice_id=${voiceId}`,
      { method: 'POST' }
    )
    if (!response.ok) throw new Error(`TTS failed: ${response.status}`)
    return response.blob()
  }

  // Delete book
  async deleteBook(bookId) {
    return this.request(`/api/books/${bookId}`, { method: 'DELETE' })
  }
}

export const api = new ApiService()
