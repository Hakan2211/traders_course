import path from 'node:path'
import { defineConfig } from 'prisma/config'

// Load environment variables from .env file
import 'dotenv/config'

export default defineConfig({
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),
  datasource: {
    url: process.env.DATABASE_URL || 'file:./prisma/dev.db',
  },
})
