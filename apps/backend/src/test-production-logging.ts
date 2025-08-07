import { logger } from './config/logger';

// Simulamos production environment temporalmente
process.env.NODE_ENV = 'production';

// Recreamos el logger para mostrar formato JSON
import winston from 'winston';

const productionLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DDTHH:mm:ss.SSSZ'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { 
    service: 'ClubPlus Backend',
    environment: 'production' 
  },
  transports: [
    new winston.transports.Console()
  ]
});

// Test del logging en formato JSON (production)
productionLogger.info('Server started', {
  port: 3000,
  environment: 'production',
  nodeVersion: process.version
});

console.log('\n✅ Production JSON logging format test completed!');
