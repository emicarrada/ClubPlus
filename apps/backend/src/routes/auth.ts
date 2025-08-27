import { Router } from 'express';
import { validateBody } from '../middlewares/validation';
import { authenticateToken, authorizeRoles } from '../middlewares/auth';
import { strictSanitizeInput } from '../middlewares/inputSanitization';
import { 
  loginRateLimiter, 
  registrationRateLimiter, 
  passwordResetRateLimiter,
  sensitiveOperationRateLimiter 
} from '../middlewares/authRateLimiter';
import { 
  loginSchema, 
  createUserSchema, 
  changePasswordSchema,
  updateProfileSchema 
} from '../utils/schemas';
import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  refreshToken,
  changePassword,
  updateProfile
} from '../controllers/auth';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', 
  registrationRateLimiter,
  strictSanitizeInput,
  validateBody(createUserSchema),
  registerUser
);

/**
 * POST /api/auth/login  
 * Login user
 */
router.post('/login',
  loginRateLimiter,
  strictSanitizeInput,
  validateBody(loginSchema), 
  loginUser
);

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post('/logout', logoutUser);

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post('/refresh', refreshToken);

/**
 * GET /api/auth/me
 * Get current authenticated user profile (Protected route)
 */
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: req.user
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/auth/profile
 * Update current user profile (Protected route)
 */
router.put('/profile', 
  sensitiveOperationRateLimiter,
  strictSanitizeInput,
  authenticateToken, 
  validateBody(updateProfileSchema),
  updateProfile
);

/**
 * POST /api/auth/change-password
 * Change user password (Protected route)
 */
router.post('/change-password',
  sensitiveOperationRateLimiter,
  strictSanitizeInput,
  authenticateToken,
  validateBody(changePasswordSchema),
  changePassword
);

/**
 * GET /api/auth/admin
 * Admin-only route example (Protected route with role authorization)
 */
router.get('/admin', 
  authenticateToken, 
  authorizeRoles('ADMIN', 'SUPERADMIN'), 
  async (req, res, next) => {
    try {
      res.status(200).json({
        success: true,
        message: 'Admin area accessed successfully',
        data: {
          user: req.user,
          adminInfo: {
            message: 'Welcome to the admin panel',
            timestamp: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;