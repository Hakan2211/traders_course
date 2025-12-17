import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { prisma } from '@/db'
import { getSession } from '@/server/session'

const updateProgressSchema = z.object({
  moduleSlug: z.string(),
  lessonSlug: z.string(),
  completed: z.boolean(),
})

export const updateProgressFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => updateProgressSchema.parse(data))
  .handler(async ({ data }) => {
    const session = await getSession()

    if (!session) {
      throw new Error('You must be logged in to track progress')
    }

    const { moduleSlug, lessonSlug, completed } = data

    // Upsert the progress record
    const progress = await prisma.progress.upsert({
      where: {
        userId_moduleSlug_lessonSlug: {
          userId: session.user.id,
          moduleSlug,
          lessonSlug,
        },
      },
      update: {
        completed,
      },
      create: {
        userId: session.user.id,
        moduleSlug,
        lessonSlug,
        completed,
      },
    })

    return progress
  })

export const getProgressFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = await getSession()

    if (!session) {
      // Return empty progress for non-authenticated users
      return {}
    }

    const progressRecords = await prisma.progress.findMany({
      where: {
        userId: session.user.id,
      },
    })

    // Transform to the format expected by ProgressContext:
    // { moduleSlug: { lessonSlug: boolean } }
    const progressMap: Record<string, Record<string, boolean>> = {}

    for (const record of progressRecords) {
      if (!progressMap[record.moduleSlug]) {
        progressMap[record.moduleSlug] = {}
      }
      progressMap[record.moduleSlug][record.lessonSlug] = record.completed
    }

    return progressMap
  },
)
