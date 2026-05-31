import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const rawUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db'
  // Strip "file:" prefix
  const relativePath = rawUrl.replace(/^file:/, '')

  const resolvedPath = path.isAbsolute(relativePath)
    ? relativePath
    : path.join(process.cwd(), relativePath)

  const adapter = new PrismaBetterSqlite3({ url: resolvedPath })

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
