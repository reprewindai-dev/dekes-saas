import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Database connection pool configuration
const connectionPoolConfig = {
  // Connection pool settings
  connectionLimit: 20, // Maximum number of connections in the pool
  poolTimeout: 30, // Maximum time to wait for a connection (seconds)
  connectTimeout: 10, // Connection timeout (seconds)
  
  // Prisma-specific settings
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  
  // Log configuration
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn', 'info'] 
    : ['error', 'warn'],
  
  // Additional performance settings
  __internal: {
    engine: {
      // Connection pool settings for better performance
      binaryTargets: ['native'],
      // Enable connection pooling
      connectionLimit: 20,
      // Set timeout for queries
      queryTimeout: 30000, // 30 seconds
    }
  }
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient(connectionPoolConfig)

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
  
  // Graceful shutdown in development
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })
  
  process.on('SIGINT', async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
  
  process.on('SIGTERM', async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
}
