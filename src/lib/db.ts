import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient({
    // sqlite requires no explicit connection string in the constructor if using default
    // or we can pass it via datasourceUrl if needed, but standard practice is environment variable + auto detection
    // However, with Prisma 7 config separation, let's just stick to default.
  })
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

export const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
