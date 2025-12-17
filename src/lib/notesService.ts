// lib/notesService.ts
// Re-exporting functionality from notesCrud.ts for compatibility

import { getAllNotesFn, type Note } from './notesCrud'

// Fetch all notes for the current user (uses session for auth)
export async function fetchNotes(): Promise<Note[]> {
  return getAllNotesFn()
}

// Re-export for convenience
export { getAllNotesFn }
export type { Note }
