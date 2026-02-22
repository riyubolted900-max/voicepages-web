/**
 * VoicePages - Global State Store (Zustand)
 */
import { create } from 'zustand'
import { api } from './services/api'

export const useStore = create((set, get) => ({
  // Server
  serverUrl: localStorage.getItem('serverUrl') || 'http://localhost:9000',
  setServerUrl: (url) => {
    api.setServerUrl(url)
    localStorage.setItem('serverUrl', url)
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
      console.warn('Failed to load voices, using fallback')
      set({ voices: [
        { id: 'af_sky', name: 'Sky', gender: 'female', accent: 'american', style: 'calm' },
        { id: 'af_heart', name: 'Heart', gender: 'female', accent: 'american', style: 'warm' },
        { id: 'af_bella', name: 'Bella', gender: 'female', accent: 'american', style: 'bright' },
        { id: 'af_nova', name: 'Nova', gender: 'female', accent: 'american', style: 'confident' },
        { id: 'am_adam', name: 'Adam', gender: 'male', accent: 'american', style: 'deep' },
        { id: 'am_echo', name: 'Echo', gender: 'male', accent: 'american', style: 'energetic' },
        { id: 'bm_daniel', name: 'Daniel', gender: 'male', accent: 'british', style: 'warm' },
        { id: 'bm_george', name: 'George', gender: 'male', accent: 'british', style: 'distinguished' },
        { id: 'bf_alice', name: 'Alice', gender: 'female', accent: 'british', style: 'gentle' },
        { id: 'bf_emma', name: 'Emma', gender: 'female', accent: 'british', style: 'authoritative' },
      ]})
    }
  },

  // Player state — chapter IDs are always numbers
  playing: false,
  currentTime: 0,
  duration: 0,
  playbackSpeed: 1.0,
  volume: 1.0,
  playingBookId: null,
  playingChapterId: null,
  playingChapterTitle: null,
  audioUrl: null,

  setPlaying: (playing) => set({ playing }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
  setPlaybackSpeed: (playbackSpeed) => set({ playbackSpeed }),
  setVolume: (volume) => set({ volume }),
  setPlayingContext: (bookId, chapterId, title) => set({
    playingBookId: bookId,
    playingChapterId: Number(chapterId),
    playingChapterTitle: title
  }),
  setAudioUrl: (url) => {
    const prev = get().audioUrl
    if (prev) URL.revokeObjectURL(prev)
    set({ audioUrl: url })
  },
  clearPlayingContext: () => {
    const prev = get().audioUrl
    if (prev) URL.revokeObjectURL(prev)
    set({
      playing: false,
      playingBookId: null,
      playingChapterId: null,
      playingChapterTitle: null,
      currentTime: 0,
      duration: 0,
      audioUrl: null,
    })
  },

  // Loading
  loading: false,
  setLoading: (loading) => set({ loading }),
}))

export default useStore
