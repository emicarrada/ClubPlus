import { Router, Request, Response, NextFunction } from 'express';
import { validate, validateBody, validateParams, validateQuery } from '../middlewares/validation';
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

const router = Router();

/**
 * GET /users - Listar usuarios con paginación
 * Ejemplo de validación de query parameters
 */
router.get('/', 
  validateQuery(paginationSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit } = req.query;
      
      // TODO: Implementar lógica real de base de datos
      res.json(successResponse({
        users: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0
        }
      }, 'Users retrieved successfully'));
    } catch (error) {
      next(new DatabaseError('Failed to retrieve users', { originalError: error }));
    }
  }
);

/**
 * GET /users/:id - Obtener usuario por ID
 * Ejemplo de validación de parámetros de ruta y manejo de NotFoundError
 */
router.get('/:id',
  validateParams(userParamsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      // Simulación de búsqueda en base de datos
      const userExists = Math.random() > 0.5; // 50% chance para demostrar
      
      if (!userExists) {
        throw new NotFoundError(`User with ID ${id} not found`, { 
          requestedId: id,
          resource: 'user' 
        });
      }
      
      res.json(successResponse({
        id,
        email: 'example@test.com',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date().toISOString()
      }, 'User retrieved successfully'));
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
 * Ejemplo de validación de body y manejo de ConflictError
 */
router.post('/',
  validateBody(createUserSchema),
  async (req: Request<{}, {}, CreateUserInput>, res: Response, next: NextFunction) => {
    try {
      const userData = req.body;
      
      // Simulación de verificación de email existente
      const emailExists = userData.email === 'test@example.com'; // Para demostrar
      
      if (emailExists) {
        throw new ConflictError('Email already registered', {
          email: userData.email,
          field: 'email'
        });
      }
      
      // TODO: Implementar creación real en base de datos
      res.status(201).json(successResponse({
        id: 'generated-uuid',
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        createdAt: new Date().toISOString()
      }, 'User created successfully'));
    } catch (error) {
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
 * Ejemplo de validación combinada (params + body)
 */
router.put('/:id',
  validate({
    params: userParamsSchema,
    body: updateUserSchema
  }),
  async (req: Request<{id: string}, {}, UpdateUserInput>, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Simulación de verificación de existencia
      const userExists = Math.random() > 0.3; // 70% chance para demostrar
      
      if (!userExists) {
        throw new NotFoundError(`User with ID ${id} not found`, { 
          requestedId: id,
          operation: 'update' 
        });
      }
      
      // TODO: Implementar actualización en base de datos
      res.json(successResponse({
        id,
        ...updateData,
        updatedAt: new Date().toISOString()
      }, 'User updated successfully'));
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
 * Ejemplo de validación de parámetros
 */
router.delete('/:id',
  validateParams(userParamsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      // Simulación de verificación de existencia
      const userExists = Math.random() > 0.4; // 60% chance para demostrar
      
      if (!userExists) {
        throw new NotFoundError(`User with ID ${id} not found`, { 
          requestedId: id,
          operation: 'delete' 
        });
      }
      
      // TODO: Implementar eliminación en base de datos
      res.json(successResponse({
        deletedId: id,
        deletedAt: new Date().toISOString()
      }, 'User deleted successfully'));
    } catch (error) {
      if (error instanceof NotFoundError) {
        next(error);
      } else {
        next(new DatabaseError('Failed to delete user', { originalError: error }));
      }
    }
  }
);

export default router;