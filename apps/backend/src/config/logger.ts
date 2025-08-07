import winston from 'winston';
import { env } from './environment';
import path from 'path';
import fs from 'fs';

// Ensure logs directory exists for production
const logsDir = path.join(process.cwd(), 'logs');
if (env.NODE_ENV === 'production' && !fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define structured log format for production (JSON)
const productionFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DDTHH:mm:ss.SSSZ'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] })
);

// Console format for development (human-readable)
const developmentFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, metadata, stack }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    
    // Add metadata if present
    if (metadata && Object.keys(metadata).length > 0) {
      log += ` ${JSON.stringify(metadata, null, 2)}`;
    }
    
    // Add stack trace for errors
    if (stack) {
      log += `\n${stack}`;
    }
    
    return log;
  })
);

// Create transports array
const transports: winston.transport[] = [
  // Console transport (always present)
  new winston.transports.Console({
    format: env.NODE_ENV === 'production' ? productionFormat : developmentFormat,
    handleExceptions: true,
    handleRejections: true,
  })
];

// Add file transports for production
if (env.NODE_ENV === 'production') {
  transports.push(
    // Error log file (only errors)
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: productionFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      handleExceptions: true,
    }),
    // Combined log file (all levels)
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: productionFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Separate info log file
    new winston.transports.File({
      filename: path.join(logsDir, 'app.log'),
      level: 'info',
      format: productionFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 3,
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: env.LOG_LEVEL || 'info',
  format: env.NODE_ENV === 'production' ? productionFormat : developmentFormat,
  defaultMeta: { 
    service: 'ClubPlus Backend',
    version: process.env.npm_package_version || '1.0.0',
    environment: env.NODE_ENV 
  },
  transports,
  exitOnError: false,
});

// Handle uncaught exceptions and unhandled rejections
if (env.NODE_ENV === 'production') {
  logger.exceptions.handle(
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      format: productionFormat,
    })
  );

  logger.rejections.handle(
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      format: productionFormat,
    })
  );
}

// Add custom log colors
winston.addColors({
  error: 'red',
  warn: 'yellow',
  info: 'cyan',
  debug: 'green'
});

export { logger };
export default logger;