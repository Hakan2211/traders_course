import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { remember } from '@epic-web/remember'

// Create the SQLite adapter
const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./prisma/dev.db',
})

// Use the remember function to ensure only one PrismaClient instance
// is created during development (avoiding hot reload issues)
export const prisma = remember('prisma', () => new PrismaClient({ adapter }))
