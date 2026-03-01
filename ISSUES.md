# VoicePages Web — Issue Tracker

Issues identified from code review. Each item maps to a GitHub issue to be created.

---

## Bugs

### CRITICAL

#### W1 — PlayerBar: hooks called after conditional early return (Rules of Hooks violation)
**File:** `src/components/PlayerBar.jsx`
All `useState`/`useRef`/`useEffect` hooks are defined after a comment saying "MUST always run"
but an early `return null` follows when `!playingBookId`. On the first render this is fine,
but React requires hooks to run in the same order every render; an edge case where the
component unmounts and remounts with different props can trigger the violation.
**Fix:** Move the `if (!playingBookId) return null` guard to **after** all hook declarations.

---

### HIGH

#### W2 — Bookmark not restored in Reader: chapter always starts at 0:00
**File:** `src/pages/Reader.jsx`
The app saves bookmarks (position in seconds) but `Reader.jsx` never calls
`api.getBookmark()` on mount and never seeks the Howl to the saved position.
**Fix:** Fetch bookmark on mount; after audio loads seek with `howl.seek(savedPosition)`.

#### W3 — Volume and playback speed changes don't update the active Howl instance
**Files:** `src/components/PlayerBar.jsx`, `src/pages/Reader.jsx`
`volume` and `playbackSpeed` are stored in Zustand and written to `howl` at creation time,
but changes in Settings or the player controls do not call `howl.volume()` / `howl.rate()`
on the already-running instance.
**Fix:** Add `useEffect` watchers for `volume` and `playbackSpeed` that call the Howl API.

#### W4 — Character voice change silently swallowed on API error
**File:** `src/pages/BookDetail.jsx`
`handleVoiceChange` updates local state optimistically before the `PUT` request resolves.
If the request fails, the error is caught but the UI still shows the new voice.
**Fix:** On error, revert state to previous voice ID and show an error message.

#### W5 — Library upload zone: drag-and-drop not implemented
**File:** `src/pages/Library.jsx`
The upload zone says "drag & drop" but only `onClick` → `<input type="file">` works.
`onDragOver` / `onDrop` handlers are missing.
**Fix:** Add `onDragOver` (call `e.preventDefault()`) and `onDrop` (call `handleFileSelect`
with `e.dataTransfer.files[0]`).

---

### MEDIUM

#### W6 — autoBookmark toggle stored but never read
**File:** `src/pages/Reader.jsx`
`autoBookmark` is saved to `localStorage` in `Settings.jsx` but `Reader.jsx` never reads it;
it always saves the bookmark unconditionally every 15 seconds.
**Fix:** Read `localStorage.getItem('autoBookmark')` in Reader and skip the save when false.

#### W7 — API service has no request timeout
**File:** `src/services/api.js`
`fetch()` calls have no `signal`/`AbortController` timeout. A request to an unreachable
server hangs forever.
**Fix:** Wrap each `fetch()` with an `AbortController` that cancels after 30 s.

---

### LOW

#### W8 — VoiceConfigSheet exists but is unused; BookDetail uses inline dropdown
**File:** `src/components/VoiceConfigSheet.jsx`, `src/pages/BookDetail.jsx`
`VoiceConfigSheet` is a complete, well-designed bottom-sheet voice selector but was never
wired into any page. `BookDetail.jsx` has a fragile inline `<select>` dropdown instead.
**Fix:** Import `VoiceConfigSheet` in `BookDetail.jsx`, replace inline dropdown with it.

---

## Features — Modern UI Redesign

#### W9 — Library: cover-art shelf + 2-col grid + hero upload zone
Redesign Library page with:
- "Recently Added" horizontal scroll shelf (large 2:3 cover cards)
- "All Books" 2-column grid
- Hero drag-and-drop zone with icon + subtitle

#### W10 — Book Detail: full-bleed cover hero + action row + character pill row
Redesign BookDetail:
- Full-bleed gradient cover hero (title + author overlay with frosted glass)
- Action row: "Listen", "Continue" (if bookmark), "Delete" (icon button)
- Characters as horizontal pill scroller → opens VoiceConfigSheet

#### W11 — Player: full-screen modal with scrubber, skip ±10s, waveform, speed pill
Redesign PlayerBar:
- Full-screen player modal (`fp-overlay` CSS already exists)
- Large cover art, scrubber with time left/right
- Control row: ⏮ | ⏪ | ▶/⏸ | ⏩ | ⏭ with skip-10s buttons
- Speed pill cycling, mini bar when collapsed

#### W12 — Floating pill tab bar (frosted glass + spring animations)
Redesign TabBar in `App.jsx`:
- Pill-style floating container with `backdrop-filter: blur`
- Sliding active indicator
- Spring animation on tab switch

#### W13 — Settings: iOS inset-grouped list style + segmented theme control
Redesign Settings:
- Each section: rounded card with hairline dividers between rows
- Segmented 3-way theme control (Light | System | Dark)
- App icon + version at top

#### W14 — Loading skeleton states (replace spinner)
Replace `<div className="loading"><div className="spinner"/></div>` with shimmer
skeleton cards in Library and BookDetail.

#### W15 — Skip forward / skip back 10 s controls in player
Add ⏪10 and 10⏩ buttons that call `howl.seek(howl.seek() ± 10)`.

#### W16 — Keyboard shortcuts (Space, ←, →)
Add `keydown` listener: Space = play/pause, ← = seek −10 s, → = seek +10 s.
