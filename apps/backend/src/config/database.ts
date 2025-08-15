import { PrismaClient } from '@prisma/client';
import { logger } from './logger';
import { env } from './environment';

// Create global Prisma instance
declare global {
  var __prisma: PrismaClient | undefined;
}

// Initialize Prisma Client
const prisma = globalThis.__prisma || new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Prevent multiple instances in development
if (env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma;
}

// Connection testing function
export const testDatabaseConnection = async (): Promise<{ status: 'connected' | 'disconnected'; latency?: number; error?: string }> => {
  try {
    const start = Date.now();
    
    // Test connection with $queryRaw
    await prisma.$queryRaw`SELECT 1 as test`;
    
    const latency = Date.now() - start;
    
    logger.info('Database connection successful', {
      latency: `${latency}ms`,
      timestamp: new Date().toISOString()
    });
    
    return { 
      status: 'connected', 
      latency 
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    
    logger.error('Database connection failed', {
      error: errorMessage,
      timestamp: new Date().toISOString()
    });
    
    return { 
      status: 'disconnected', 
      error: errorMessage 
    };
  }
};

// Initialize database connection and setup
export const initializeDatabase = async (): Promise<void> => {
  try {
    logger.info('Initializing database connection...');
    
    // Test the connection
    const connectionStatus = await testDatabaseConnection();
    
    if (connectionStatus.status === 'connected') {
      logger.info('Database initialized successfully', {
        latency: `${connectionStatus.latency}ms`
      });
    } else {
      throw new Error(`Database initialization failed: ${connectionStatus.error}`);
    }
  } catch (error) {
    logger.error('Failed to initialize database:', error);
    throw error;
  }
};

// Graceful shutdown function
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logger.info('Database disconnected successfully');
  } catch (error) {
    logger.error('Error disconnecting from database:', error);
  }
};

// Export the prisma instance
export { prisma };
export default prisma;