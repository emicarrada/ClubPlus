import { z } from 'zod';

// ============================================================================
// SCHEMAS COMUNES Y UTILS
// ============================================================================

/**
 * Schema para validar IDs de UUID
 */
export const uuidSchema = z.string().uuid('Invalid UUID format');

/**
 * Schema para validar emails
 */
export const emailSchema = z.string().email('Invalid email format');

/**
 * Schema para validar passwords (mínimo 8 caracteres)
 */
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters long');

/**
 * Schema para paginación
 */
export const paginationSchema = z.object({
  page: z.string().optional().transform((val) => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform((val) => val ? parseInt(val, 10) : 10),
});

/**
 * Schema para validar paginación con reglas de negocio
 */
export const validatedPaginationSchema = paginationSchema.refine((data) => data.page >= 1, {
  message: 'Page must be greater than 0',
  path: ['page'],
}).refine((data) => data.limit >= 1 && data.limit <= 100, {
  message: 'Limit must be between 1 and 100',
  path: ['limit'],
});

// ============================================================================
// USER SCHEMAS (PLACEHOLDERS)
// ============================================================================

/**
 * Schema base para validar datos de usuario
 */
export const userBaseSchema = z.object({
  email: emailSchema,
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  phone: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(),
});

/**
 * Schema para creación de usuario
 */
export const createUserSchema = userBaseSchema.extend({
  password: passwordSchema,
});

/**
 * Schema para actualización de usuario (campos opcionales)
 */
export const updateUserSchema = userBaseSchema.partial();

/**
 * Schema para validar parámetros de ID de usuario
 */
export const userParamsSchema = z.object({
  id: uuidSchema,
});

/**
 * Schema para login
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// ============================================================================
// COMBO SCHEMAS (PLACEHOLDERS)
// ============================================================================

/**
 * Schema base para combos
 */
export const comboBaseSchema = z.object({
  name: z.string().min(1, 'Combo name is required').max(100, 'Combo name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  price: z.number().positive('Price must be positive'),
  isActive: z.boolean().default(true),
  maxParticipants: z.number().int().positive('Max participants must be positive').optional(),
  category: z.string().min(1, 'Category is required'),
});

/**
 * Schema para creación de combo
 */
export const createComboSchema = comboBaseSchema;

/**
 * Schema para actualización de combo
 */
export const updateComboSchema = comboBaseSchema.partial();

/**
 * Schema para parámetros de combo
 */
export const comboParamsSchema = z.object({
  id: uuidSchema,
});

/**
 * Schema para filtros de búsqueda de combos
 */
export const comboQuerySchema = z.object({
  category: z.string().optional(),
  minPrice: z.string().optional().transform((val) => val ? parseFloat(val) : undefined),
  maxPrice: z.string().optional().transform((val) => val ? parseFloat(val) : undefined),
  isActive: z.string().optional().transform((val) => val === 'true'),
  search: z.string().optional(),
  page: z.string().optional().transform((val) => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform((val) => val ? parseInt(val, 10) : 10),
});

// ============================================================================
// PAYMENT SCHEMAS (PLACEHOLDERS)
// ============================================================================

/**
 * Schema para iniciar un pago
 */
export const createPaymentSchema = z.object({
  comboId: uuidSchema,
  paymentMethod: z.enum(['STRIPE', 'MERCADOPAGO'], {
    errorMap: () => ({ message: 'Payment method must be STRIPE or MERCADOPAGO' }),
  }),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3, 'Currency must be 3 characters').default('USD'),
});

/**
 * Schema para webhook de pago
 */
export const paymentWebhookSchema = z.object({
  paymentId: z.string(),
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED']),
  metadata: z.record(z.any()).optional(),
});

// ============================================================================
// AUTH SCHEMAS
// ============================================================================

/**
 * Schema para refresh token
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

/**
 * Schema para reset password request
 */
export const resetPasswordRequestSchema = z.object({
  email: emailSchema,
});

/**
 * Schema para reset password
 */
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: passwordSchema,
});

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Helper para validar arrays de IDs
 */
export const createArraySchema = <T extends z.ZodTypeAny>(itemSchema: T) => {
  return z.array(itemSchema).min(1, 'Array cannot be empty');
};

/**
 * Schema para IDs múltiples
 */
export const multipleIdsSchema = createArraySchema(uuidSchema);

/**
 * Schema para validar fechas
 */
export const dateRangeSchema = z.object({
  startDate: z.string().datetime('Invalid start date format'),
  endDate: z.string().datetime('Invalid end date format'),
}).refine((data) => new Date(data.startDate) < new Date(data.endDate), {
  message: 'Start date must be before end date',
  path: ['endDate'],
});

// ============================================================================
// EXPORT TYPES (PARA TYPESCRIPT)
// ============================================================================

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateComboInput = z.infer<typeof createComboSchema>;
export type UpdateComboInput = z.infer<typeof updateComboSchema>;
export type ComboQueryInput = z.infer<typeof comboQuerySchema>;
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
