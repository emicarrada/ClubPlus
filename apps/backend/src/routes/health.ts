import { Router, Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { testDatabaseConnection } from '../config/database';
import { DatabaseError } from '../utils/errors';

const router = Router();

// Basic health check
router.get('/', (req: Request, res: Response) => {
  const uptime = process.uptime();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: `${uptime.toFixed(1)}s`,
    service: 'ClubPlus Backend'
  });
});

// Database health check (real connection test)
router.get('/db', async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info('Database health check requested');
    const dbStatus = await testDatabaseConnection();
    
    if (dbStatus.status === 'connected') {
      logger.info('Database health check successful', { 
        latency: `${dbStatus.latency}ms` 
      });
      
      res.json({
        status: 'connected',
        latency: `${dbStatus.latency}ms`,
        timestamp: new Date().toISOString(),
        database: 'postgresql'
      });
    } else {
      // Use custom DatabaseError instead of manual error response
      throw new DatabaseError(
        'Database connection failed', 
        { 
          originalError: dbStatus.error,
          database: 'postgresql',
          timestamp: new Date().toISOString()
        }
      );
    }
  } catch (error) {
    // If it's already our custom error, just pass it along
    if (error instanceof DatabaseError) {
      next(error);
    } else {
      // Wrap unknown errors in DatabaseError
      next(new DatabaseError(
        'Database health check failed',
        {
          originalError: error instanceof Error ? error.message : 'Unknown error',
          database: 'postgresql',
          timestamp: new Date().toISOString()
        }
      ));
    }
  }
});

export default router;
