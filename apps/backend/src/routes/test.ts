/**
 * Test-only routes for validating security middleware
 * These endpoints should only be available in test environment
 */

import { Router, Request, Response } from 'express';
import { sanitizeInput, strictSanitizeInput } from '../middlewares/inputSanitization';
import { securityHeaders, corsSecurityHeaders, apiSecurityHeaders } from '../middlewares/securityHeaders';
import { loginRateLimiter } from '../middlewares/authRateLimiter';
import { env } from '../config/environment';

export const testRouter = Router();

// Only enable test routes in test environment
if (env.NODE_ENV === 'test') {
  
  /**
   * Test endpoint for input sanitization
   */
  testRouter.post('/sanitization', sanitizeInput, (req: Request, res: Response) => {
    res.json({
      success: true,
      received: req.body
    });
  });

  /**
   * Test endpoint for strict input sanitization
   */
  testRouter.post('/strict-sanitization', strictSanitizeInput, (req: Request, res: Response) => {
    res.json({
      success: true,
      received: req.body
    });
  });

  /**
   * Test endpoint for security headers
   */
  testRouter.get('/security-headers', securityHeaders, (req: Request, res: Response) => {
    res.json({
      success: true,
      message: 'Security headers applied'
    });
  });

  /**
   * Test endpoint for CORS security
   */
  testRouter.options('/cors-security', corsSecurityHeaders);
  testRouter.get('/cors-security', corsSecurityHeaders, (req: Request, res: Response) => {
    res.json({
      success: true,
      message: 'CORS security headers applied'
    });
  });

  /**
   * Test endpoint for API security headers
   */
  testRouter.post('/api-security', apiSecurityHeaders, (req: Request, res: Response) => {
    res.json({
      success: true,
      message: 'API security headers applied'
    });
  });

  /**
   * Test endpoint for rate limiting (force enable even in test)
   */
  testRouter.post('/rate-limit-test', (req: Request, res: Response, next) => {
    // Temporarily enable rate limiting for this test
    const rateLimiter = loginRateLimiter;
    // Override the skip function
    (rateLimiter as any).options.skip = () => false;
    rateLimiter(req, res, next);
  }, (req: Request, res: Response) => {
    res.json({
      success: true,
      message: 'Rate limiting applied'
    });
  });

  /**
   * Test endpoint for combined security measures
   */
  testRouter.post('/full-security', 
    securityHeaders,
    apiSecurityHeaders,
    strictSanitizeInput,
    (req: Request, res: Response) => {
      res.json({
        success: true,
        received: req.body,
        message: 'All security measures applied'
      });
    }
  );
}

export default testRouter;
