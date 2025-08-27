import * as crypto from 'crypto';
import { logger } from '../config/logger';

/**
 * Hash a password using Node.js crypto module
 * This is a simple implementation - in production you might want to use bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  try {
    // Generate a salt
    const salt = crypto.randomBytes(16).toString('hex');
    
    // Hash password with salt using pbkdf2
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    
    // Return salt and hash combined
    return `${salt}:${hash}`;
  } catch (error) {
    logger.error('Error hashing password:', error);
    throw new Error('Failed to hash password');
  }
};

/**
 * Verify a password against a hash
 */
export const verifyPassword = async (password: string, storedHash: string): Promise<boolean> => {
  try {
    // Split salt and hash
    const [salt, originalHash] = storedHash.split(':');
    
    if (!salt || !originalHash) {
      return false;
    }
    
    // Hash the provided password with the same salt
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    
    // Compare hashes
    return hash === originalHash;
  } catch (error) {
    logger.error('Error verifying password:', error);
    return false;
  }
};

/**
 * Generate a random token
 */
export const generateToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};
