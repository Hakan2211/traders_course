// lib/notesService.ts
import { createClient } from '@supabase/supabase-js';
import { Note } from './notesCrud';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function fetchNotes(userId: string): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notes:', error);
    throw new Error('Failed to fetch notes');
  }

  return data as Note[];
}

// Similarly, create functions for creating, updating, and deleting notes
