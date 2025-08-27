import jwt, { JwtPayload, SignOptions, VerifyOptions } from 'jsonwebtoken';
import { env } from '../config/environment';
import { logger } from '../config/logger';
import { AuthError } from './errors';

/**
 * JWT Token payload interface
 */
export interface TokenPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

/**
 * Token generation result
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Generate access and refresh token pair
 */
export const generateTokens = (userId: string): TokenPair => {
  try {
    const payload = { userId };
    
    const accessToken = jwt.sign(payload, env.JWT_SECRET, { 
      expiresIn: '24h'
    });
    
    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, { 
      expiresIn: '7d'
    });
    
    logger.debug('Generated JWT tokens for user:', { userId });
    
    return { accessToken, refreshToken };
  } catch (error) {
    logger.error('Error generating JWT tokens:', error);
    throw new AuthError('Failed to generate authentication tokens');
  }
};

/**
 * Generate access token only
 */
export const generateAccessToken = (userId: string): string => {
  try {
    const payload = { userId };
    
    const accessToken = jwt.sign(payload, env.JWT_SECRET, { 
      expiresIn: '24h'
    });
    
    logger.debug('Generated access token for user:', { userId });
    
    return accessToken;
  } catch (error) {
    logger.error('Error generating access token:', error);
    throw new AuthError('Failed to generate access token');
  }
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    
    logger.debug('Access token verified successfully for user:', { userId: decoded.userId });
    
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.warn('Access token expired');
      throw new AuthError('Access token expired');
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Invalid access token format');
      throw new AuthError('Invalid access token');
    }
    
    logger.error('Error verifying access token:', error);
    throw new AuthError('Token verification failed');
  }
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): TokenPayload => {
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
    
    logger.debug('Refresh token verified successfully for user:', { userId: decoded.userId });
    
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.warn('Refresh token expired');
      throw new AuthError('Refresh token expired');
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Invalid refresh token format');
      throw new AuthError('Invalid refresh token');
    }
    
    logger.error('Error verifying refresh token:', error);
    throw new AuthError('Refresh token verification failed');
  }
};

/**
 * Extract token from Authorization header
 * Expected format: "Bearer <token>"
 */
export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader) {
    logger.debug('No Authorization header provided');
    return null;
  }
  
  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    logger.warn('Invalid Authorization header format:', { authHeader: authHeader.substring(0, 20) + '...' });
    return null;
  }
  
  const token = parts[1];
  
  if (!token || token.trim() === '') {
    logger.warn('Empty token in Authorization header');
    return null;
  }
  
  logger.debug('Token extracted from Authorization header successfully');
  return token;
};

/**
 * Check if token is expired (for error handling)
 */
export const isTokenExpired = (error: any): boolean => {
  return error instanceof jwt.TokenExpiredError;
};

/**
 * Check if token is malformed (for error handling)
 */
export const isTokenMalformed = (error: any): boolean => {
  return error instanceof jwt.JsonWebTokenError;
};
