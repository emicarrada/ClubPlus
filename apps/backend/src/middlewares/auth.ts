import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { AuthError, AuthorizationError } from '../utils/errors';
import { 
  extractTokenFromHeader, 
  verifyAccessToken, 
  TokenPayload 
} from '../utils/jwt';
import { findUserById } from '../services/userService';

/**
 * Authentication middleware - validates JWT token and populates req.user
 * 
 * @param req Express request object
 * @param res Express response object  
 * @param next Express next function
 */
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract token from Authorization header
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      logger.warn('Authentication failed: No token provided', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method
      });
      
      throw new AuthError('Access token required');
    }
    
    // Verify token
    const decoded: TokenPayload = verifyAccessToken(token);
    
    // Get user data from database
    const user = await findUserById(decoded.userId);
    
    if (!user) {
      logger.warn('Authentication failed: User not found', {
        userId: decoded.userId,
        ip: req.ip,
        path: req.path
      });
      
      throw new AuthError('User not found');
    }
    
    // Populate req.user with user data
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role || 'user' // Default role if not specified
    };
    
    logger.debug('Authentication successful', {
      userId: user.id,
      email: user.email,
      path: req.path,
      method: req.method
    });
    
    next();
  } catch (error) {
    logger.warn('Authentication middleware error:', {
      error: (error as Error).message,
      ip: req.ip,
      path: req.path,
      method: req.method
    });
    
    next(error);
  }
};

/**
 * Authorization middleware factory - creates middleware to check user roles
 * 
 * @param allowedRoles Array of roles that are allowed to access the route
 * @returns Express middleware function
 */
export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        logger.warn('Authorization failed: User not authenticated', {
          ip: req.ip,
          path: req.path,
          method: req.method
        });
        
        throw new AuthError('Authentication required');
      }
      
      // Check if user has required role
      if (!allowedRoles.includes(req.user.role)) {
        logger.warn('Authorization failed: Insufficient permissions', {
          userId: req.user.id,
          userRole: req.user.role,
          requiredRoles: allowedRoles,
          ip: req.ip,
          path: req.path,
          method: req.method
        });
        
        throw new AuthorizationError('Insufficient permissions');
      }
      
      logger.debug('Authorization successful', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
        path: req.path,
        method: req.method
      });
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Optional authentication middleware - populates req.user if token is present
 * but doesn't fail if token is missing (for public routes that can benefit from user context)
 * 
 * @param req Express request object
 * @param res Express response object
 * @param next Express next function
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      // No token provided, continue without authentication
      logger.debug('Optional auth: No token provided, continuing without authentication', {
        path: req.path,
        method: req.method
      });
      return next();
    }
    
    try {
      // Verify token if present
      const decoded: TokenPayload = verifyAccessToken(token);
      
      // Get user data from database
      const user = await findUserById(decoded.userId);
      
      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role || 'user'
        };
        
        logger.debug('Optional auth: Authentication successful', {
          userId: user.id,
          email: user.email,
          path: req.path,
          method: req.method
        });
      }
    } catch (tokenError) {
      // Invalid token, but continue without authentication for optional auth
      logger.debug('Optional auth: Invalid token, continuing without authentication', {
        error: (tokenError as Error).message,
        path: req.path,
        method: req.method
      });
    }
    
    next();
  } catch (error) {
    // On any other error, log but continue
    logger.warn('Optional auth middleware error:', {
      error: (error as Error).message,
      ip: req.ip,
      path: req.path,
      method: req.method
    });
    
    next();
  }
};