import { Router, Request, Response, NextFunction } from 'express';
import { validate, validateBody, validateParams, validateQuery } from '../middlewares/validation';
import { authenticateToken, authorizeRoles } from '../middlewares/auth';
import { 
  createUserSchema, 
  updateUserSchema, 
  userParamsSchema,
  paginationSchema,
  CreateUserInput,
  UpdateUserInput 
} from '../utils/schemas';
import { successResponse } from '../utils/response';
import { NotFoundError, ConflictError, DatabaseError } from '../utils/errors';
import { 
  findUserById, 
  findUserByEmail, 
  createUser, 
  updateUser, 
  deleteUser, 
  getAllUsers,
  getUserCount,
  getUsersByRole,
  User,
  CreateUserData
} from '../services/userService';
import { logger } from '../config/logger';
import bcrypt from 'bcryptjs';

const router = Router();

/**
 * GET /users/me - Obtener perfil del usuario actual
 * Ruta protegida para que cualquier usuario autenticado vea su propio perfil
 */
router.get('/me',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentUser = req.user;
      
      if (!currentUser) {
        throw new NotFoundError('User not found', { 
          resource: 'current_user' 
        });
      }
      
      logger.debug('Getting current user profile:', { userId: currentUser.id });
      
      const user = await findUserById(currentUser.id);
      
      if (!user) {
        throw new NotFoundError('User not found', { 
          requestedId: currentUser.id,
          resource: 'user' 
        });
      }
      
      // Remove password from response
      const { passwordHash, ...userWithoutPassword } = user;
      
      res.json(successResponse(userWithoutPassword, 'Current user profile retrieved successfully'));
    } catch (error) {
      if (error instanceof NotFoundError) {
        next(error);
      } else {
        next(new DatabaseError('Failed to retrieve current user profile', { originalError: error }));
      }
    }
  }
);

/**
 * PUT /users/me - Actualizar perfil del usuario actual
 * Ruta protegida para que cualquier usuario autenticado actualice su propio perfil
 */
router.put('/me',
  authenticateToken,
  validateBody(updateUserSchema),
  async (req: Request<{}, {}, UpdateUserInput>, res: Response, next: NextFunction) => {
    try {
      const currentUser = req.user;
      const updateData = req.body;
      
      if (!currentUser) {
        throw new NotFoundError('User not found', { 
          resource: 'current_user' 
        });
      }
      
      logger.debug('Updating current user profile:', { userId: currentUser.id });
      
      // Verificar que el usuario existe
      const existingUser = await findUserById(currentUser.id);
      if (!existingUser) {
        throw new NotFoundError('User not found', { 
          requestedId: currentUser.id,
          operation: 'update' 
        });
      }
      
      // Prepare update data - combine firstName and lastName into name if provided
      const processedUpdateData: any = { ...updateData };
      
      if (updateData.firstName || updateData.lastName) {
        const nameParts = existingUser.name.split(' ');
        const currentFirstName = nameParts[0] || '';
        const currentLastName = nameParts.slice(1).join(' ') || '';
        
        const newFirstName = updateData.firstName || currentFirstName;
        const newLastName = updateData.lastName || currentLastName;
        processedUpdateData.name = `${newFirstName} ${newLastName}`.trim();
        
        // Remove firstName and lastName from the update data since we're using name field
        delete processedUpdateData.firstName;
        delete processedUpdateData.lastName;
      }
      
      // Actualizar usuario en la base de datos
      const updatedUser = await updateUser(currentUser.id, processedUpdateData);
      
      // Remove password from response
      const { passwordHash, ...userWithoutPassword } = updatedUser;
      
      res.json(successResponse(userWithoutPassword, 'Profile updated successfully'));
    } catch (error) {
      if (error instanceof NotFoundError) {
        next(error);
      } else {
        next(new DatabaseError('Failed to update profile', { originalError: error }));
      }
    }
  }
);

/**
 * GET /users - Listar usuarios con paginación
 * Solo admins y superadmins pueden ver la lista completa de usuarios
 */
router.get('/', 
  authenticateToken,
  authorizeRoles('ADMIN', 'SUPERADMIN'),
  validateQuery(paginationSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      
      logger.debug('Getting all users with pagination:', { page, limit });
      
      // Get all users from database
      const allUsers = await getAllUsers();
      
      // Remove passwords from response
      const usersWithoutPasswords = allUsers.map(user => {
        const { passwordHash, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      // Calculate pagination
      const total = usersWithoutPasswords.length;
      const pageNumber = parseInt(page as string);
      const limitNumber = parseInt(limit as string);
      const startIndex = (pageNumber - 1) * limitNumber;
      const endIndex = startIndex + limitNumber;
      const paginatedUsers = usersWithoutPasswords.slice(startIndex, endIndex);
      const totalPages = Math.ceil(total / limitNumber);
      
      res.json(successResponse({
        users: paginatedUsers,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          total,
          totalPages
        }
      }, 'Users retrieved successfully'));
    } catch (error) {
      logger.error('Error retrieving users:', error);
      next(new DatabaseError('Failed to retrieve users', { originalError: error }));
    }
  }
);

/**
 * GET /users/:id - Obtener usuario por ID
 * Los usuarios pueden ver su propio perfil, admins y superadmins pueden ver cualquier perfil
 */
router.get('/:id',
  authenticateToken,
  validateParams(userParamsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const currentUser = req.user;
      
      logger.debug('Getting user by ID:', { id, requestingUserId: currentUser?.id });
      
      // Verificar si el usuario puede acceder a este perfil
      const canAccess = currentUser?.id === id || 
                       currentUser?.role === 'ADMIN' || 
                       currentUser?.role === 'SUPERADMIN';
      
      if (!canAccess) {
        return next(new NotFoundError(`User with ID ${id} not found`, { 
          requestedId: id,
          resource: 'user',
          reason: 'insufficient_permissions'
        }));
      }
      
      const user = await findUserById(id);
      
      if (!user) {
        throw new NotFoundError(`User with ID ${id} not found`, { 
          requestedId: id,
          resource: 'user' 
        });
      }
      
      // Remove password from response
      const { passwordHash, ...userWithoutPassword } = user;
      
      res.json(successResponse(userWithoutPassword, 'User retrieved successfully'));
    } catch (error) {
      // Si ya es nuestro error personalizado, lo pasamos directamente
      if (error instanceof NotFoundError) {
        next(error);
      } else {
        // Si es otro tipo de error, lo envolvemos en DatabaseError
        next(new DatabaseError('Failed to retrieve user', { originalError: error }));
      }
    }
  }
);

/**
 * POST /users - Crear nuevo usuario
 * Solo admins y superadmins pueden crear usuarios directamente
 */
router.post('/',
  authenticateToken,
  authorizeRoles('ADMIN', 'SUPERADMIN'),
  validateBody(createUserSchema),
  async (req: Request<{}, {}, CreateUserInput>, res: Response, next: NextFunction) => {
    try {
      const userData = req.body;
      
      logger.debug('Creating new user:', { email: userData.email });
      
      // Check if email already exists
      const existingUser = await findUserByEmail(userData.email);
      if (existingUser) {
        throw new ConflictError('Email already registered', {
          email: userData.email,
          field: 'email'
        });
      }
      
      // Create the user
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      const newUser = await createUser({
        email: userData.email,
        passwordHash: hashedPassword,
        name: `${userData.firstName} ${userData.lastName}`,
        phone: userData.phone,
        role: 'USER' // Default role
      });
      
      // Remove password from response
      const { passwordHash, ...userWithoutPassword } = newUser;
      
      res.status(201).json(successResponse(userWithoutPassword, 'User created successfully'));
    } catch (error) {
      logger.error('Error creating user:', error);
      if (error instanceof ConflictError) {
        next(error);
      } else {
        next(new DatabaseError('Failed to create user', { originalError: error }));
      }
    }
  }
);

/**
 * PUT /users/:id - Actualizar usuario
 * Los usuarios pueden actualizar su propio perfil, admins y superadmins pueden actualizar cualquier usuario
 */
router.put('/:id',
  authenticateToken,
  validate({
    params: userParamsSchema,
    body: updateUserSchema
  }),
  async (req: Request<{id: string}, {}, UpdateUserInput>, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const currentUser = req.user;
      
      logger.debug('Updating user:', { id, requestingUserId: currentUser?.id });
      
      // Verificar si el usuario puede actualizar este perfil
      const canUpdate = currentUser?.id === id || 
                       currentUser?.role === 'ADMIN' || 
                       currentUser?.role === 'SUPERADMIN';
      
      if (!canUpdate) {
        return next(new NotFoundError(`User with ID ${id} not found`, { 
          requestedId: id,
          operation: 'update',
          reason: 'insufficient_permissions'
        }));
      }
      
      // Verificar que el usuario existe
      const existingUser = await findUserById(id);
      if (!existingUser) {
        throw new NotFoundError(`User with ID ${id} not found`, { 
          requestedId: id,
          operation: 'update' 
        });
      }
      
      // Actualizar usuario en la base de datos
      const updatedUser = await updateUser(id, updateData);
      
      // Remove password from response
      const { passwordHash, ...userWithoutPassword } = updatedUser;
      
      res.json(successResponse(userWithoutPassword, 'User updated successfully'));
    } catch (error) {
      if (error instanceof NotFoundError) {
        next(error);
      } else {
        next(new DatabaseError('Failed to update user', { originalError: error }));
      }
    }
  }
);

/**
 * DELETE /users/:id - Eliminar usuario
 * Solo admins y superadmins pueden eliminar usuarios
 */
router.delete('/:id',
  authenticateToken,
  authorizeRoles('ADMIN', 'SUPERADMIN'),
  validateParams(userParamsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const currentUser = req.user;
      
      logger.debug('Deleting user:', { id, requestingUserId: currentUser?.id });
      
      // Verificar que el usuario existe
      const existingUser = await findUserById(id);
      if (!existingUser) {
        throw new NotFoundError(`User with ID ${id} not found`, { 
          requestedId: id,
          operation: 'delete' 
        });
      }
      
      // Prevenir que un usuario se elimine a sí mismo
      if (currentUser?.id === id) {
        throw new ConflictError('Cannot delete your own account', {
          userId: id,
          operation: 'self_delete'
        });
      }
      
      // Eliminar usuario de la base de datos
      await deleteUser(id);
      
      res.json(successResponse({
        deletedId: id,
        deletedAt: new Date().toISOString()
      }, 'User deleted successfully'));
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError) {
        next(error);
      } else {
        next(new DatabaseError('Failed to delete user', { originalError: error }));
      }
    }
  }
);

export default router;