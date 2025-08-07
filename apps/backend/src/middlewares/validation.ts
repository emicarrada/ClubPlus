import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError, ZodObject, ZodRawShape } from 'zod';
import { ValidationError } from '../utils/errors';

interface ValidationSchemas {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}

/**
 * Middleware de validación genérico usando Zod
 * Permite validar body, params y query parameters de manera independiente
 */
export const validate = (schemas: ValidationSchemas) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validar body si se proporciona schema
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }

      // Validar params si se proporciona schema
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }

      // Validar query si se proporciona schema
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Transformar errores de Zod a formato consistente
        const validationError = new ValidationError(
          'Invalid input data',
          formatZodErrors(error)
        );
        next(validationError);
      } else {
        next(error);
      }
    }
  };
};

/**
 * Middleware simplificado para validar solo el body
 */
export const validateBody = (schema: ZodSchema) => {
  return validate({ body: schema });
};

/**
 * Middleware simplificado para validar solo los params
 */
export const validateParams = (schema: ZodSchema) => {
  return validate({ params: schema });
};

/**
 * Middleware simplificado para validar solo la query
 */
export const validateQuery = (schema: ZodSchema) => {
  return validate({ query: schema });
};

/**
 * Formatea los errores de Zod en un formato más legible
 */
function formatZodErrors(error: ZodError) {
  return error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code,
    // Solo incluir received si existe y no es undefined
    ...(('received' in err && err.received !== undefined) && { received: err.received })
  }));
}

/**
 * Helper para crear validaciones condicionales con ZodObject
 * Útil para endpoints que pueden recibir actualizaciones parciales
 */
export const validatePartial = <T extends ZodRawShape>(schema: ZodObject<T>) => {
  return validate({ body: schema.partial() });
};