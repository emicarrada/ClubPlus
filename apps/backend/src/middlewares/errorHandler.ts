import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { AppError } from '../utils/errors';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the error
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    ...(err instanceof AppError && { code: err.code, statusCode: err.statusCode }),
  });

  // Check if it's our custom AppError
  if (err instanceof AppError) {
    const errorResponse: any = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        timestamp: new Date().toISOString(),
      },
    };

    // Include error details in development or if details are provided
    if (process.env.NODE_ENV === 'development' || err.details) {
      errorResponse.error.details = err.details || err.stack;
    }

    return res.status(err.statusCode).json(errorResponse);
  }

  // Handle other known error types
  let statusCode = 500;
  let message = err.message || 'Internal Server Error';
  let code = 'INTERNAL_ERROR';

  if (err.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_ID';
    message = 'Invalid ID format';
  }

  if (err.name === 'MongoNetworkError' || err.name === 'MongooseServerSelectionError') {
    statusCode = 503;
    code = 'DATABASE_CONNECTION_ERROR';
    message = 'Database connection failed';
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid authentication token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'EXPIRED_TOKEN';
    message = 'Authentication token expired';
  }

  // Build error response for unknown errors
  const errorResponse: any = {
    success: false,
    error: {
      code,
      message,
      timestamp: new Date().toISOString(),
    },
  };

  // Include error details only in development for unknown errors
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.details = err.stack;
  }

  return res.status(statusCode).json(errorResponse);
};