import { logger } from '../config/logger';
import { prisma, executeWithErrorHandling } from '../lib/prisma';
import { ConflictError, NotFoundError } from '../utils/errors';

// Type definitions for better type safety
export interface CreateUserData {
  email: string;
  passwordHash: string;
  name: string;
  phone?: string;
  role?: 'USER' | 'ADMIN' | 'SUPERADMIN';
}

export interface UpdateUserData {
  email?: string;
  passwordHash?: string;
  name?: string;
  phone?: string;
  role?: 'USER' | 'ADMIN' | 'SUPERADMIN';
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  phone?: string | null;
  role: 'USER' | 'ADMIN' | 'SUPERADMIN';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create a new user in the database
 */
export const createUser = async (userData: CreateUserData): Promise<User> => {
  return executeWithErrorHandling(async () => {
    logger.info('Creating user:', { email: userData.email });
    
    try {
      const newUser = await prisma.user.create({
        data: {
          email: userData.email,
          passwordHash: userData.passwordHash,
          name: userData.name,
          phone: userData.phone || undefined,
          role: userData.role || 'USER',
        },
      });
      
      logger.info('User created successfully:', { 
        id: newUser.id, 
        email: newUser.email,
        role: newUser.role 
      });
      
      return newUser;
    } catch (error: any) {
      // Handle unique constraint violation (duplicate email)
      if (error.code === 'P2002') {
        logger.warn('User creation failed - email already exists:', { email: userData.email });
        throw new ConflictError('Email already exists', { 
          field: 'email', 
          value: userData.email 
        });
      }
      
      // Re-throw other errors to be handled by executeWithErrorHandling
      throw error;
    }
  }, 'createUser');
};

/**
 * Find user by email address
 */
export const findUserByEmail = async (email: string): Promise<User | null> => {
  return executeWithErrorHandling(async () => {
    logger.debug('Finding user by email:', { email });
    
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (user) {
      logger.debug('User found:', { id: user.id, email: user.email });
    } else {
      logger.debug('User not found:', { email });
    }
    
    return user;
  }, 'findUserByEmail');
};

/**
 * Find user by ID
 */
export const findUserById = async (id: string): Promise<User | null> => {
  return executeWithErrorHandling(async () => {
    logger.debug('Finding user by ID:', { id });
    
    const user = await prisma.user.findUnique({
      where: { id },
    });
    
    if (user) {
      logger.debug('User found:', { id: user.id, email: user.email });
    } else {
      logger.debug('User not found:', { id });
    }
    
    return user;
  }, 'findUserById');
};

/**
 * Update user data
 */
export const updateUser = async (id: string, updateData: UpdateUserData): Promise<User> => {
  return executeWithErrorHandling(async () => {
    logger.info('Updating user:', { id, updateData: { ...updateData, passwordHash: updateData.passwordHash ? '[HIDDEN]' : undefined } });
    
    try {
      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
      });
      
      logger.info('User updated successfully:', { 
        id: updatedUser.id, 
        email: updatedUser.email 
      });
      
      return updatedUser;
    } catch (error: any) {
      // Handle record not found
      if (error.code === 'P2025') {
        logger.warn('User update failed - user not found:', { id });
        throw new NotFoundError('User not found', { id });
      }
      
      // Handle unique constraint violation (duplicate email)
      if (error.code === 'P2002') {
        logger.warn('User update failed - email already exists:', { id, email: updateData.email });
        throw new ConflictError('Email already exists', { 
          field: 'email', 
          value: updateData.email 
        });
      }
      
      // Re-throw other errors to be handled by executeWithErrorHandling
      throw error;
    }
  }, 'updateUser');
};

/**
 * Delete user by ID
 */
export const deleteUser = async (id: string): Promise<User> => {
  return executeWithErrorHandling(async () => {
    logger.info('Deleting user:', { id });
    
    try {
      const deletedUser = await prisma.user.delete({
        where: { id },
      });
      
      logger.info('User deleted successfully:', { 
        id: deletedUser.id, 
        email: deletedUser.email 
      });
      
      return deletedUser;
    } catch (error: any) {
      // Handle record not found
      if (error.code === 'P2025') {
        logger.warn('User deletion failed - user not found:', { id });
        throw new NotFoundError('User not found', { id });
      }
      
      // Re-throw other errors to be handled by executeWithErrorHandling
      throw error;
    }
  }, 'deleteUser');
};

/**
 * Check if user exists by email
 */
export const userExistsByEmail = async (email: string): Promise<boolean> => {
  return executeWithErrorHandling(async () => {
    logger.debug('Checking if user exists by email:', { email });
    
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true }, // Only select id to minimize data transfer
    });
    
    const exists = !!user;
    logger.debug('User existence check result:', { email, exists });
    
    return exists;
  }, 'userExistsByEmail');
};

/**
 * Get user count (for statistics)
 */
export const getUserCount = async (): Promise<number> => {
  return executeWithErrorHandling(async () => {
    logger.debug('Getting total user count');
    
    const count = await prisma.user.count();
    
    logger.debug('User count retrieved:', { count });
    
    return count;
  }, 'getUserCount');
};

/**
 * Get users by role (for admin functions)
 */
export const getUsersByRole = async (role: 'USER' | 'ADMIN' | 'SUPERADMIN'): Promise<User[]> => {
  return executeWithErrorHandling(async () => {
    logger.debug('Getting users by role:', { role });
    
    const users = await prisma.user.findMany({
      where: { role },
      orderBy: { createdAt: 'desc' },
    });
    
    logger.debug('Users retrieved by role:', { role, count: users.length });
    
    return users;
  }, 'getUsersByRole');
};

/**
 * Get all users
 */
export const getAllUsers = async (): Promise<User[]> => {
  return executeWithErrorHandling(async () => {
    logger.debug('Retrieving all users');
    
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    logger.debug('All users retrieved successfully:', { count: users.length });
    
    return users;
  }, 'getAllUsers');
};
