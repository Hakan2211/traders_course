import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  username: z.string().min(3).optional(),
})

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

function parseServerData<T extends z.ZodTypeAny>(
  schema: T,
  input: unknown,
): z.infer<T> {
  const value =
    input instanceof FormData ? Object.fromEntries(input.entries()) : input

  if (typeof value !== 'object' || value === null) {
    throw new Error('Invalid input')
  }

  return schema.parse(value)
}

export const registerFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => parseServerData(RegisterSchema, data))
  .handler(async ({ data }) => {
    throw new Error('Database removed')
  })

export const loginFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => parseServerData(LoginSchema, data))
  .handler(async ({ data }) => {
    throw new Error('Database removed')
  })

export const logoutFn = createServerFn({ method: 'POST' }).handler(async () => {
  return { success: true }
})

export const getAuthSessionFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    return null
  },
)
