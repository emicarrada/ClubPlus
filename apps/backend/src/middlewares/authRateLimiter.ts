import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { env } from '../config/environment';
import { logger } from '../config/logger';

/**
 * Strict rate limiting for authentication endpoints
 * - Prevents brute force attacks
 * - Different limits for login vs registration
 * - IP-based tracking
 */

/**
 * Rate limiter for login attempts
 * More restrictive to prevent brute force attacks
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.NODE_ENV === 'production' ? 5 : 20, // 5 attempts per 15 min in production
  message: {
    success: false,
    error: {
      code: 'LOGIN_RATE_LIMIT_EXCEEDED',
      message: 'Too many login attempts from this IP. Please try again in 15 minutes.',
      timestamp: new Date().toISOString(),
      retryAfter: 15 * 60 // seconds
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  
  // Skip rate limiting for tests
  skip: (req) => {
    return env.NODE_ENV === 'test';
  },
  
  // Custom handler for when limit is reached
  handler: (req: Request, res: Response) => {
    logger.warn('Login rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString(),
      severity: 'HIGH'
    });
    
    res.status(429).json({
      success: false,
      error: {
        code: 'LOGIN_RATE_LIMIT_EXCEEDED',
        message: 'Too many login attempts from this IP. Please try again in 15 minutes.',
        timestamp: new Date().toISOString(),
        retryAfter: 15 * 60
      }
    });
  }
});

/**
 * Rate limiter for registration attempts
 * Slightly less restrictive than login
 */
export const registrationRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: env.NODE_ENV === 'production' ? 3 : 10, // 3 registrations per hour in production
  message: {
    success: false,
    error: {
      code: 'REGISTRATION_RATE_LIMIT_EXCEEDED',
      message: 'Too many registration attempts from this IP. Please try again in 1 hour.',
      timestamp: new Date().toISOString(),
      retryAfter: 60 * 60 // seconds
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  
  skip: (req) => {
    return env.NODE_ENV === 'test';
  },
  
  handler: (req: Request, res: Response) => {
    logger.warn('Registration rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      email: req.body?.email || 'unknown',
      timestamp: new Date().toISOString(),
      severity: 'MEDIUM'
    });
    
    res.status(429).json({
      success: false,
      error: {
        code: 'REGISTRATION_RATE_LIMIT_EXCEEDED',
        message: 'Too many registration attempts from this IP. Please try again in 1 hour.',
        timestamp: new Date().toISOString(),
        retryAfter: 60 * 60
      }
    });
  }
});

/**
 * Rate limiter for password reset attempts
 * Prevents abuse of password reset functionality
 */
export const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: env.NODE_ENV === 'production' ? 3 : 10, // 3 password resets per hour
  message: {
    success: false,
    error: {
      code: 'PASSWORD_RESET_RATE_LIMIT_EXCEEDED',
      message: 'Too many password reset attempts. Please try again in 1 hour.',
      timestamp: new Date().toISOString(),
      retryAfter: 60 * 60
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  
  skip: (req) => {
    return env.NODE_ENV === 'test';
  },
  
  handler: (req: Request, res: Response) => {
    logger.warn('Password reset rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      email: req.body?.email || 'unknown',
      timestamp: new Date().toISOString(),
      severity: 'MEDIUM'
    });
    
    res.status(429).json({
      success: false,
      error: {
        code: 'PASSWORD_RESET_RATE_LIMIT_EXCEEDED',
        message: 'Too many password reset attempts. Please try again in 1 hour.',
        timestamp: new Date().toISOString(),
        retryAfter: 60 * 60
      }
    });
  }
});

/**
 * Strict rate limiter for sensitive operations
 * Used for admin actions, profile updates, etc.
 */
export const sensitiveOperationRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: env.NODE_ENV === 'production' ? 10 : 50, // 10 operations per 5 minutes
  message: {
    success: false,
    error: {
      code: 'SENSITIVE_OPERATION_RATE_LIMIT_EXCEEDED',
      message: 'Too many sensitive operations. Please wait 5 minutes before trying again.',
      timestamp: new Date().toISOString(),
      retryAfter: 5 * 60
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  
  skip: (req) => {
    return env.NODE_ENV === 'test';
  },
  
  handler: (req: Request, res: Response) => {
    logger.warn('Sensitive operation rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id || 'unknown',
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString(),
      severity: 'HIGH'
    });
    
    res.status(429).json({
      success: false,
      error: {
        code: 'SENSITIVE_OPERATION_RATE_LIMIT_EXCEEDED',
        message: 'Too many sensitive operations. Please wait 5 minutes before trying again.',
        timestamp: new Date().toISOString(),
        retryAfter: 5 * 60
      }
    });
  }
});
