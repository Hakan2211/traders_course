// lib/notesService.ts
// Re-exporting functionality from notesCrud.ts for compatibility
// or fetching all notes for a user if that was the original intent.

import { createServerFn } from '@tanstack/react-start'
import type { Note } from './notesCrud'

export const fetchAllUserNotesFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    // Database removed, returning empty list
    return []
  },
)

// Adapting the original fetchNotes signature:
// It took userId, but since we are server-side with sessions, we usually get userId from session.
// However, if the client passes userId, we could verify it matches session or just ignore it and use session.
export async function fetchNotes(_userId?: string): Promise<Note[]> {
  // We ignore userId argument and use session for security
  return fetchAllUserNotesFn()
}
