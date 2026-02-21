/**
 * VoicePages - Global State Store
 */

import { create } from 'zustand'
import { api } from './services/api'

export const useStore = create((set, get) => ({
  // Server
  serverUrl: localStorage.getItem('serverUrl') || 'http://localhost:9000',
  setServerUrl: (url) => {
    api.setServerUrl(url)
    set({ serverUrl: url })
  },

  // Books
  books: [],
  currentBook: null,
  loadBooks: async () => {
    try {
      const books = await api.getBooks()
      set({ books })
    } catch (e) {
      console.warn('Failed to load books:', e)
      set({ books: [] })
    }
  },
  setCurrentBook: (book) => set({ currentBook: book }),

  // Chapters
  chapters: [],
  currentChapter: null,
  setChapters: (chapters) => set({ chapters }),
  setCurrentChapter: (chapter) => set({ currentChapter: chapter }),

  // Characters
  characters: [],
  loadCharacters: async (bookId) => {
    try {
      const characters = await api.getCharacters(bookId)
      set({ characters })
    } catch (e) {
      console.warn('Failed to load characters:', e)
      set({ characters: [] })
    }
  },

  // Voices
  voices: [],
  loadVoices: async () => {
    try {
      const voices = await api.getVoices()
      set({ voices })
    } catch (e) {
      console.warn('Failed to load voices:', e)
      // Set fallback voices
      set({ voices: [
        { id: 'af_sky', name: 'Sky', gender: 'female', accent: 'american', style: 'calm' },
        { id: 'am_adam', name: 'Adam', gender: 'male', accent: 'american', style: 'deep' },
        { id: 'af_bella', name: 'Bella', gender: 'female', accent: 'american', style: 'bright' },
        { id: 'bm_daniel', name: 'Daniel', gender: 'male', accent: 'british', style: 'warm' },
      ]})
    }
  },

  // Player State
  playing: false,
  currentTime: 0,
  duration: 0,
  playbackSpeed: 1.0,
  volume: 1.0,
  
  // Current playing context
  playingBookId: null,
  playingChapterId: null,
  playingChapterTitle: null,
  
  setPlaying: (playing) => set({ playing }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
  setVolume: (volume) => set({ volume: volume }),
  
  setPlayingContext: (bookId, chapterId, title) => set({
    playingBookId: bookId,
    playingChapterId: chapterId,
    playingChapterTitle: title
  }),

  // Loading states
  loading: false,
  setLoading: (loading) => set({ loading }),
}))

export default useStore
