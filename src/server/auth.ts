import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { prisma } from '@/db'
import { hashPassword, verifyPassword } from '@/utils/auth-helpers'
import {
  createSession,
  setSessionCookie,
  getSession,
  getSessionToken,
  deleteSession,
} from './session'

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  username: z.string().min(3),
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
    // Check if user with email already exists
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUserByEmail) {
      throw new Error('A user with this email already exists')
    }

    // Check if user with username already exists
    const existingUserByUsername = await prisma.user.findUnique({
      where: { username: data.username },
    })

    if (existingUserByUsername) {
      throw new Error('A user with this username already exists')
    }

    // Hash the password
    const hashedPassword = await hashPassword(data.password)

    // Create the user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        password: hashedPassword,
        name: data.name,
      },
    })

    // Create a session for the new user
    const token = await createSession(user.id)
    setSessionCookie(token)

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user

    return {
      success: true,
      user: userWithoutPassword,
    }
  })

export const loginFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => parseServerData(LoginSchema, data))
  .handler(async ({ data }) => {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (!user) {
      throw new Error('Invalid email or password')
    }

    // Verify password
    const isPasswordValid = await verifyPassword(data.password, user.password)

    if (!isPasswordValid) {
      throw new Error('Invalid email or password')
    }

    // Create a session
    const token = await createSession(user.id)
    setSessionCookie(token)

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user

    return {
      success: true,
      user: userWithoutPassword,
    }
  })

export const logoutFn = createServerFn({ method: 'POST' }).handler(async () => {
  const token = getSessionToken()

  if (token) {
    await deleteSession(token)
  }

  return { success: true }
})

export const getAuthSessionFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = await getSession()
    return session
  },
)
