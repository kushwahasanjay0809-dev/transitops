const { PrismaClient } = require('@prisma/client');
const env = require('./env');

// Singleton pattern for Prisma Client
let prisma;

if (env.isProduction) {
  prisma = new PrismaClient({
    log: ['error'],
    errorFormat: 'minimal',
  });
} else {
  // In development, reuse the client across hot reloads
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
      errorFormat: 'pretty',
    });
  }
  prisma = global.__prisma;
}

/**
 * Connect to the database and log the result.
 * Called once during server startup.
 */
async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

/**
 * Gracefully disconnect from the database.
 * Called during server shutdown.
 */
async function disconnectDatabase() {
  await prisma.$disconnect();
  console.log('🔌 Database disconnected');
}

module.exports = { prisma, connectDatabase, disconnectDatabase };
