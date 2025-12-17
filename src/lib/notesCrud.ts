import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { prisma } from '@/db'
import { getSession } from '@/server/session'

export type Note = {
  id: string
  module_slug: string
  lesson_slug: string
  selected_text: string
  note_text: string
  created_at: string // Serialized date
}

// Transform Prisma Note to client Note format
function transformNote(note: {
  id: string
  moduleSlug: string
  lessonSlug: string
  selectedText: string
  noteText: string
  createdAt: Date
}): Note {
  return {
    id: note.id,
    module_slug: note.moduleSlug,
    lesson_slug: note.lessonSlug,
    selected_text: note.selectedText,
    note_text: note.noteText,
    created_at: note.createdAt.toISOString(),
  }
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
    const session = await getSession()

    if (!session) {
      throw new Error('You must be logged in to create notes')
    }

    const note = await prisma.note.create({
      data: {
        userId: session.user.id,
        moduleSlug: data.moduleSlug,
        lessonSlug: data.lessonSlug,
        selectedText: data.selectedText,
        noteText: data.noteText,
      },
    })

    return transformNote(note)
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
    const session = await getSession()

    if (!session) {
      return []
    }

    const notes = await prisma.note.findMany({
      where: {
        userId: session.user.id,
        moduleSlug: data.moduleSlug,
        lessonSlug: data.lessonSlug,
      },
      orderBy: { createdAt: 'desc' },
    })

    return notes.map(transformNote)
  })

export const getAllNotesFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = await getSession()

    if (!session) {
      return []
    }

    const notes = await prisma.note.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: { createdAt: 'desc' },
    })

    return notes.map(transformNote)
  },
)

export const deleteNoteFn = createServerFn({ method: 'POST' })
  .inputValidator((id: unknown) => z.string().parse(id))
  .handler(async ({ data: id }) => {
    const session = await getSession()

    if (!session) {
      throw new Error('You must be logged in to delete notes')
    }

    // Verify the note belongs to the user
    const note = await prisma.note.findUnique({
      where: { id },
    })

    if (!note || note.userId !== session.user.id) {
      throw new Error('Note not found or unauthorized')
    }

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

export async function getAllNotes(): Promise<Note[]> {
  return getAllNotesFn()
}

export async function deleteNote(noteId: string): Promise<void> {
  await deleteNoteFn({ data: noteId })
}
