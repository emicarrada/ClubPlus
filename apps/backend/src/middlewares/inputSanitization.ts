import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

/**
 * Input Sanitization Middleware
 * Sanitizes input data to prevent XSS and injection attacks
 */

/**
 * Basic string sanitization
 */
const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove script tags content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove on* event handlers
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '')
    // Remove javascript: urls
    .replace(/javascript:/gi, '')
    // Remove data: urls (except base64 images)
    .replace(/data:(?!image\/)/gi, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Email sanitization (more permissive)
 */
const sanitizeEmail = (email: string): string => {
  if (typeof email !== 'string') return email;
  
  return email
    .trim()
    .toLowerCase()
    // Basic email format validation will be handled by Zod
    .replace(/[<>]/g, ''); // Remove angle brackets only
};

/**
 * Password sanitization (minimal - preserve special chars)
 */
const sanitizePassword = (password: string): string => {
  if (typeof password !== 'string') return password;
  
  // Only trim whitespace, passwords should preserve all other characters
  return password.trim();
};

/**
 * Recursively sanitize object properties
 */
const sanitizeObject = (obj: any, depth = 0): any => {
  // Prevent deep recursion attacks
  if (depth > 10) {
    logger.warn('Input sanitization: Maximum recursion depth reached', {
      depth,
      type: typeof obj
    });
    return {};
  }
  
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, depth + 1));
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {};
    
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize key name
      const sanitizedKey = sanitizeString(key);
      
      // Skip dangerous property names
      if (sanitizedKey.includes('__proto__') || 
          sanitizedKey.includes('constructor') || 
          sanitizedKey.includes('prototype')) {
        logger.warn('Input sanitization: Dangerous property name blocked', {
          originalKey: key,
          sanitizedKey
        });
        continue;
      }
      
      // Sanitize value based on key type
      if (sanitizedKey === 'email') {
        sanitized[sanitizedKey] = sanitizeEmail(value as string);
      } else if (sanitizedKey.includes('password') || sanitizedKey.includes('Password')) {
        sanitized[sanitizedKey] = sanitizePassword(value as string);
      } else if (typeof value === 'string') {
        sanitized[sanitizedKey] = sanitizeString(value);
      } else {
        sanitized[sanitizedKey] = sanitizeObject(value, depth + 1);
      }
    }
    
    return sanitized;
  }
  
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  // Return numbers, booleans, etc. as-is
  return obj;
};

/**
 * Input sanitization middleware
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Log original request size for monitoring
    const originalSize = JSON.stringify(req.body || {}).length;
    
    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }
    
    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query);
    }
    
    // Sanitize URL parameters
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params);
    }
    
    // Log sanitization activity for large payloads
    const sanitizedSize = JSON.stringify(req.body || {}).length;
    const sizeDifference = originalSize - sanitizedSize;
    
    if (sizeDifference > 100) {
      logger.info('Input sanitization: Significant data removed', {
        originalSize,
        sanitizedSize,
        difference: sizeDifference,
        path: req.path,
        method: req.method,
        ip: req.ip
      });
    }
    
    next();
  } catch (error) {
    logger.error('Input sanitization error:', {
      error: (error as Error).message,
      path: req.path,
      method: req.method,
      ip: req.ip
    });
    
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_INPUT_FORMAT',
        message: 'Request data format is invalid',
        timestamp: new Date().toISOString()
      }
    });
  }
};

/**
 * Strict sanitization for authentication endpoints
 */
export const strictSanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Extra validation for auth endpoints
    if (req.body) {
      // Check for suspicious patterns
      const bodyString = JSON.stringify(req.body);
      const suspiciousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /eval\s*\(/i,
        /expression\s*\(/i,
        /vbscript:/i,
        /data:text\/html/i
      ];
      
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(bodyString)) {
          logger.warn('Strict sanitization: Suspicious pattern detected', {
            pattern: pattern.toString(),
            path: req.path,
            method: req.method,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            severity: 'HIGH'
          });
          
          res.status(400).json({
            success: false,
            error: {
              code: 'SUSPICIOUS_INPUT_DETECTED',
              message: 'Input contains potentially malicious content',
              timestamp: new Date().toISOString()
            }
          });
          return;
        }
      }
    }
    
    // Apply normal sanitization
    sanitizeInput(req, res, next);
  } catch (error) {
    logger.error('Strict sanitization error:', {
      error: (error as Error).message,
      path: req.path,
      method: req.method,
      ip: req.ip
    });
    
    res.status(400).json({
      success: false,
      error: {
        code: 'INPUT_PROCESSING_ERROR',
        message: 'Unable to process request data',
        timestamp: new Date().toISOString()
      }
    });
  }
};
