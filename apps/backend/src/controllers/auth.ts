import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { env } from '../config/environment';
import { logger } from '../config/logger';
import { 
  findUserByEmail, 
  findUserById,
  createUser, 
  updateUser,
  CreateUserData 
} from '../services/userService';
import { ValidationError, ConflictError, AuthError } from '../utils/errors';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';

/**
 * Register a new user
 * POST /api/auth/register
 */
export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;
    
    logger.info('Registration attempt:', { email, firstName, lastName });
    
    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }
    
    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Create user data - combining firstName and lastName into name
    const userData: CreateUserData = {
      email,
      passwordHash,
      name: `${firstName} ${lastName}`,
      phone,
    };
    
    // Create user
    const newUser = await createUser(userData);
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(newUser.id);
    
    logger.info('User registered successfully:', { 
      userId: newUser.id, 
      email: newUser.email 
    });
    
    // Split name back into firstName and lastName for response
    const nameParts = newUser.name.split(' ');
    const userFirstName = nameParts[0] || '';
    const userLastName = nameParts.slice(1).join(' ') || '';
    
    // Return success response
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: userFirstName,
          lastName: userLastName,
          phone: newUser.phone,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  } catch (error) {
    logger.error('Registration error:', { 
      error: (error as Error).message, 
      email: req.body.email 
    });
    next(error);
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    
    logger.info('Login attempt:', { email });
    
    // Find user by email
    const user = await findUserByEmail(email);
    if (!user) {
      throw new AuthError('Invalid credentials');
    }
    
    // Verify password
    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      logger.warn('Invalid password attempt:', { email });
      throw new AuthError('Invalid credentials');
    }
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);
    
    logger.info('User logged in successfully:', { 
      userId: user.id, 
      email: user.email 
    });
    
    // Split name back into firstName and lastName for response
    const nameParts = user.name.split(' ');
    const userFirstName = nameParts[0] || '';
    const userLastName = nameParts.slice(1).join(' ') || '';
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: userFirstName,
          lastName: userLastName,
          phone: user.phone,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  } catch (error) {
    logger.error('Login error:', { 
      error: (error as Error).message, 
      email: req.body.email 
    });
    next(error);
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logoutUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // In a real implementation, we would:
    // 1. Add the token to a blacklist
    // 2. Remove refresh token from database
    // 3. Clear any session data
    
    logger.info('User logged out successfully');
    
    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    logger.error('Logout error:', { error: (error as Error).message });
    next(error);
  }
};

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken: token } = req.body;
    
    if (!token) {
      throw new ValidationError('Refresh token is required');
    }
    
    // Verify refresh token using utility function
    const decoded = verifyRefreshToken(token);
    
    // Generate new tokens
    const tokens = generateTokens(decoded.userId);
    
    logger.info('Token refreshed successfully:', { userId: decoded.userId });
    
    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        tokens,
      },
    });
  } catch (error) {
    logger.error('Token refresh error:', { error: (error as Error).message });
    next(error);
  }
};

/**
 * Change user password
 * POST /api/auth/change-password
 */
export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      throw new AuthError('User not authenticated');
    }
    
    logger.info('Password change attempt:', { userId });
    
    // Get user from database
    const user = await findUserById(userId);
    if (!user) {
      throw new AuthError('User not found');
    }
    
    // Verify current password
    const currentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!currentPasswordValid) {
      logger.warn('Invalid current password for password change:', { userId });
      throw new AuthError('Current password is incorrect');
    }
    
    // Check if new password is different from current
    const samePassword = await bcrypt.compare(newPassword, user.passwordHash);
    if (samePassword) {
      throw new ValidationError('New password must be different from current password');
    }
    
    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
    
    // Update password in database
    await updateUser(userId, { passwordHash: newPasswordHash });
    
    logger.info('Password changed successfully:', { userId });
    
    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    logger.error('Password change error:', { 
      error: (error as Error).message, 
      userId: req.user?.id 
    });
    next(error);
  }
};

/**
 * Update user profile
 * PUT /api/auth/profile
 */
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, phone } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      throw new AuthError('User not authenticated');
    }
    
    logger.info('Profile update attempt:', { userId });
    
    // Get current user from database
    const currentUser = await findUserById(userId);
    if (!currentUser) {
      throw new AuthError('User not found');
    }
    
    // Prepare update data
    const updateData: any = {};
    
    // Build name from firstName and lastName if provided
    if (firstName || lastName) {
      const nameParts = currentUser.name.split(' ');
      const currentFirstName = nameParts[0] || '';
      const currentLastName = nameParts.slice(1).join(' ') || '';
      
      const newFirstName = firstName || currentFirstName;
      const newLastName = lastName || currentLastName;
      updateData.name = `${newFirstName} ${newLastName}`.trim();
    }
    
    // Add phone if provided
    if (phone !== undefined) {
      updateData.phone = phone;
    }
    
    // Update user in database
    const updatedUser = await updateUser(userId, updateData);
    
    // Split name back for response
    const nameParts = updatedUser.name.split(' ');
    const userFirstName = nameParts[0] || '';
    const userLastName = nameParts.slice(1).join(' ') || '';
    
    logger.info('Profile updated successfully:', { userId });
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: userFirstName,
          lastName: userLastName,
          phone: updatedUser.phone,
          role: updatedUser.role,
          updatedAt: updatedUser.updatedAt
        }
      }
    });
  } catch (error) {
    logger.error('Profile update error:', { 
      error: (error as Error).message, 
      userId: req.user?.id 
    });
    next(error);
  }
};
