import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

// Extend Request type to include our custom properties
interface LoggingRequest extends Request {
  startTime?: number;
  requestId?: string;
}

// Generate unique request ID
const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Request/Response logging middleware
export const loggingMiddleware = (req: LoggingRequest, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const requestId = generateRequestId();
  
  // Add request metadata
  req.startTime = startTime;
  req.requestId = requestId;

  // Log incoming request
  logger.info('Incoming request', {
    requestId,
    method: req.method,
    url: req.originalUrl || req.url,
    path: req.path,
    query: req.query,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    contentType: req.get('Content-Type'),
    contentLength: req.get('Content-Length'),
    referer: req.get('Referer'),
    timestamp: new Date().toISOString(),
  });

  // Capture response details
  const originalSend = res.send;
  const originalJson = res.json;

  // Override res.send
  res.send = function(body) {
    logResponse(req as LoggingRequest, res, body);
    return originalSend.call(this, body);
  };

  // Override res.json
  res.json = function(obj) {
    logResponse(req as LoggingRequest, res, obj);
    return originalJson.call(this, obj);
  };

  // Listen for response finish event
  res.on('finish', () => {
    if (!res.headersSent) {
      logResponse(req as LoggingRequest, res);
    }
  });

  next();
};

// Function to log response details
function logResponse(req: LoggingRequest, res: Response, body?: any) {
  const duration = req.startTime ? Date.now() - req.startTime : 0;
  const statusCode = res.statusCode;
  
  // Determine log level based on status code
  let logLevel: 'info' | 'warn' | 'error' = 'info';
  if (statusCode >= 400 && statusCode < 500) {
    logLevel = 'warn';
  } else if (statusCode >= 500) {
    logLevel = 'error';
  }

  // Prepare response metadata
  const responseData: any = {
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl || req.url,
    statusCode,
    statusMessage: res.statusMessage,
    duration: `${duration}ms`,
    contentLength: res.get('Content-Length') || (body ? JSON.stringify(body).length : 0),
    contentType: res.get('Content-Type'),
    timestamp: new Date().toISOString(),
  };

  // Add error details for non-2xx responses
  if (statusCode >= 400) {
    responseData.errorDetails = {
      body: typeof body === 'string' ? body : JSON.stringify(body),
      headers: res.getHeaders(),
    };
  }

  logger[logLevel]('Response sent', responseData);
}

// Error logging middleware
export const errorLoggingMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the error with full context
  logger.error('Request error', {
    requestId: (req as LoggingRequest).requestId,
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
      code: err.code,
      statusCode: err.statusCode,
    },
    request: {
      method: req.method,
      url: req.originalUrl || req.url,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query,
      ip: req.ip,
    },
    timestamp: new Date().toISOString(),
  });

  next(err);
};

export default loggingMiddleware;