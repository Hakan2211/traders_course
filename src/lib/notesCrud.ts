import { createServerFn } from '@tanstack/start/server'
import { prisma } from './db'
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
  .validator((data: z.infer<typeof noteSchema>) => data)
  .handler(async ({ moduleSlug, lessonSlug, selectedText, noteText }) => {
    const note = await prisma.note.create({
      data: {
        module_slug: moduleSlug,
        lesson_slug: lessonSlug,
        selected_text: selectedText,
        note_text: noteText,
      },
    })
    return {
      ...note,
      created_at: note.created_at.toISOString(),
    }
  })

export const getNotesFn = createServerFn({ method: 'GET' })
  .validator((params: { moduleSlug: string; lessonSlug: string }) => params)
  .handler(async ({ moduleSlug, lessonSlug }) => {
    const notes = await prisma.note.findMany({
      where: {
        module_slug: moduleSlug,
        lesson_slug: lessonSlug,
      },
      orderBy: {
        created_at: 'desc',
      },
    })
    return notes.map((note) => ({
      ...note,
      created_at: note.created_at.toISOString(),
    }))
  })

export const deleteNoteFn = createServerFn({ method: 'POST' })
  .validator((id: string) => id)
  .handler(async (id) => {
    await prisma.note.delete({
      where: { id },
    })
    return { success: true }
  })

// Client-side wrappers to match previous interface
export async function createNote(
  moduleSlug: string,
  lessonSlug: string,
  selectedText: string,
  noteText: string,
): Promise<Note> {
  return createNoteFn({ moduleSlug, lessonSlug, selectedText, noteText })
}

export async function getNotes(
  moduleSlug: string,
  lessonSlug: string,
): Promise<Note[]> {
  return getNotesFn({ moduleSlug, lessonSlug })
}

export async function deleteNote(noteId: string): Promise<void> {
  await deleteNoteFn({ data: noteId })
}
