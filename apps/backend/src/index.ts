import { initializeApp } from './app';
import { env } from './config/environment';
import { logger } from './config/logger';
import { disconnectDatabase } from './lib/prisma';

// Server instance
let server: any;

// Start server function
const startServer = async () => {
  try {
    // Initialize the application (this will establish database connection)
    logger.info('🚀 Starting ClubPlus Backend Server...');
    const app = await initializeApp();

    // Start Express server
    server = app.listen(env.PORT, () => {
      logger.info('✅ Server started successfully', {
        port: env.PORT,
        environment: env.NODE_ENV,
        nodeVersion: process.version,
        timestamp: new Date().toISOString(),
        service: 'ClubPlus Backend',
        database: 'PostgreSQL'
      });
    });

    // Handle server errors
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${env.PORT} is already in use`);
        process.exit(1);
      } else {
        logger.error('Server error:', error);
        process.exit(1);
      }
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown handling
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  if (server) {
    server.close(async (error: any) => {
      if (error) {
        logger.error('Error during server shutdown:', error);
      } else {
        logger.info('Server closed successfully');
      }
      
      // Disconnect from database
      await disconnectDatabase();
      
      process.exit(error ? 1 : 0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
      logger.error('Force closing server after timeout');
      process.exit(1);
    }, 10000);
  } else {
    await disconnectDatabase();
    process.exit(0);
  }
};

// Handle process signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Start the server
startServer();