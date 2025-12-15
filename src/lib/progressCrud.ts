import { createServerFn } from '@tanstack/start/server'
import { prisma } from './db'
import { z } from 'zod'

const updateProgressSchema = z.object({
  moduleSlug: z.string(),
  lessonSlug: z.string(),
  status: z.enum(['started', 'completed']),
})

export const updateProgressFn = createServerFn({ method: 'POST' })
  .validator((data: z.infer<typeof updateProgressSchema>) => data)
  .handler(async ({ moduleSlug, lessonSlug, status }) => {
    try {
      // Ensure prisma is only accessed on server
      const progress = await prisma.progress.upsert({
        where: {
          module_slug_lesson_slug: {
            module_slug: moduleSlug,
            lesson_slug: lessonSlug,
          },
        },
        update: {
          status,
        },
        create: {
          module_slug: moduleSlug,
          lesson_slug: lessonSlug,
          status,
        },
      })
      return progress
    } catch (e) {
      console.error(e)
      throw e
    }
  })

export const getProgressFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    try {
      const progress = await prisma.progress.findMany()
      return progress.reduce(
        (acc, curr) => {
          if (!acc[curr.module_slug]) {
            acc[curr.module_slug] = {}
          }
          acc[curr.module_slug][curr.lesson_slug] = curr.status === 'completed'
          return acc
        },
        {} as Record<string, Record<string, boolean>>,
      )
    } catch (e) {
      console.error(e)
      throw e
    }
  },
)
