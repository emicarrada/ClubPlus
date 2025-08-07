import { logger } from './config/logger';

// Test del sistema de logging
logger.info('Testing logging system', {
  level: 'info',
  message: 'This is a test info message',
  timestamp: new Date().toISOString(),
  testData: { key: 'value', number: 123 }
});

logger.warn('Testing warning log', {
  level: 'warn', 
  message: 'This is a test warning message',
  timestamp: new Date().toISOString()
});

logger.error('Testing error log', {
  level: 'error',
  message: 'This is a test error message', 
  timestamp: new Date().toISOString(),
  error: new Error('Sample error for testing')
});

logger.debug('Testing debug log', {
  level: 'debug',
  message: 'This is a test debug message',
  timestamp: new Date().toISOString()
});

console.log('\n✅ Logging system test completed successfully!');
