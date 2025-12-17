import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

export type Note = {
  id: string
  module_slug: string
  lesson_slug: string
  selected_text: string
  note_text: string
  created_at: string // Serialized date
}

const noteSchema = z.object({
  moduleSlug: z.string(),
  lessonSlug: z.string(),
  selectedText: z.string(),
  noteText: z.string(),
})

export const createNoteFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => noteSchema.parse(data))
  .handler(async ({ data }) => {
    throw new Error('Database removed')
  })

export const getNotesFn = createServerFn({ method: 'GET' })
  .inputValidator((params: unknown) => {
    const schema = z.object({
      moduleSlug: z.string(),
      lessonSlug: z.string(),
    })
    return schema.parse(params)
  })
  .handler(async ({ data }) => {
    // Database removed
    return []
  })

export const deleteNoteFn = createServerFn({ method: 'POST' })
  .inputValidator((id: unknown) => z.string().parse(id))
  .handler(async ({ data: id }) => {
    throw new Error('Database removed')
  })

// Client-side wrappers to match previous interface
export async function createNote(
  moduleSlug: string,
  lessonSlug: string,
  selectedText: string,
  noteText: string,
): Promise<Note> {
  return createNoteFn({
    data: { moduleSlug, lessonSlug, selectedText, noteText },
  })
}

export async function getNotes(
  moduleSlug: string,
  lessonSlug: string,
): Promise<Note[]> {
  return getNotesFn({ data: { moduleSlug, lessonSlug } })
}

export async function deleteNote(noteId: string): Promise<void> {
  await deleteNoteFn({ data: noteId })
}
