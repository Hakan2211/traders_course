import { setCookie, getCookie } from '@tanstack/react-start/server'
import { prisma } from '@/db'
import crypto from 'node:crypto'

const SESSION_COOKIE_NAME = 'session_token'
const SESSION_EXPIRY_DAYS = 7

// Generate a secure random token
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// Create a new session for a user
export async function createSession(userId: string): Promise<string> {
  const token = generateSessionToken()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS)

  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  })

  return token
}

// Set the session cookie
export function setSessionCookie(token: string): void {
  setCookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_EXPIRY_DAYS * 24 * 60 * 60, // days in seconds
    path: '/',
  })
}

// Get the session token from cookies
export function getSessionToken(): string | undefined {
  return getCookie(SESSION_COOKIE_NAME)
}

// Clear the session cookie
export function clearSessionCookie(): void {
  setCookie(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
}

// Get the current session and user from the database
export async function getSession() {
  const token = getSessionToken()

  if (!token) {
    return null
  }

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!session) {
    return null
  }

  // Check if session is expired
  if (session.expiresAt < new Date()) {
    // Delete expired session
    await prisma.session.delete({ where: { id: session.id } })
    clearSessionCookie()
    return null
  }

  // Return user data without password
  const { password: _, ...userWithoutPassword } = session.user

  return {
    sessionId: session.id,
    user: userWithoutPassword,
  }
}

// Delete a session (logout)
export async function deleteSession(token: string): Promise<void> {
  try {
    await prisma.session.delete({ where: { token } })
  } catch {
    // Session might not exist, that's okay
  }
  clearSessionCookie()
}

// Delete all sessions for a user (logout everywhere)
export async function deleteAllUserSessions(userId: string): Promise<void> {
  await prisma.session.deleteMany({ where: { userId } })
}

// Clean up expired sessions (can be run periodically)
export async function cleanupExpiredSessions(): Promise<void> {
  await prisma.session.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  })
}
