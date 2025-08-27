import { Request, Response, NextFunction } from 'express';
import { env } from '../config/environment';

/**
 * Security Headers Middleware
 * Implements OWASP recommended security headers
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Control referrer information
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions policy (formerly Feature Policy)
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Content Security Policy
  const cspPolicy = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');
  
  res.setHeader('Content-Security-Policy', cspPolicy);
  
  // HSTS (only in production with HTTPS)
  if (env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  // Hide server information
  res.removeHeader('X-Powered-By');
  
  // Prevent caching of sensitive data
  if (req.path.includes('/auth/') || req.path.includes('/users/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  next();
};

/**
 * CORS Security Configuration
 * More restrictive CORS for authentication endpoints
 */
export const corsSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
  const allowedOrigins = env.NODE_ENV === 'production' 
    ? ['https://clubplus.app', 'https://www.clubplus.app']
    : ['http://localhost:3000', 'http://localhost:5173'];
  
  const origin = req.headers.origin;
  
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
};

/**
 * Input Sanitization Headers
 * Additional security for API endpoints
 */
export const apiSecurityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  // Ensure JSON content type for API endpoints
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CONTENT_TYPE',
          message: 'Content-Type must be application/json',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }
  }
  
  // Set JSON response type
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  next();
};
