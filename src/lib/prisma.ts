import { PrismaClient } from '@prisma/client'
// Variante /web usa @libsql/client/web (HTTP puro, sem binário nativo)
// Necessário no Windows/Node 24 onde @libsql/win32-x64-msvc não carrega
import { PrismaLibSql } from '@prisma/adapter-libsql/web'

// libsql:// → https:// para usar transport HTTP puro
const tursoUrl = (process.env.TURSO_DATABASE_URL ?? '').replace(/^libsql:\/\//, 'https://')

const adapter = new PrismaLibSql({
  url: tursoUrl,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

const prismaClientSingleton = () => {
  return new PrismaClient({ adapter })
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const db = globalThis.prisma ?? prismaClientSingleton()

export default db

if (process.env.NODE_ENV !== 'production') globalThis.prisma = db
