import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

const updateProgressSchema = z.object({
  moduleSlug: z.string(),
  lessonSlug: z.string(),
  status: z.enum(['started', 'completed']),
})

export const updateProgressFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => updateProgressSchema.parse(data))
  .handler(async ({ data }) => {
    // Database removed
    return null
  })

export const getProgressFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    // Database removed
    return {}
  },
)
