# Error Handling System - ClubPlus Backend

## 📋 Resumen

El sistema de manejo de errores del backend de ClubPlus está implementado con:

1. **Clases de error personalizadas** (`utils/errors.ts`)
2. **Middleware global de error handling** (`middlewares/errorHandler.ts`)
3. **Integración con logging** automático
4. **Respuestas estandarizadas** de error
5. **Diferenciación entre entorno de desarrollo y producción**

## 🎯 Clases de Error Disponibles

### AppError (Clase Base)

```typescript
export abstract class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number,
    public readonly code: string,
    public readonly details?: any
  );
}
```

### Errores Específicos

| Clase                  | Código HTTP | Código Error             | Uso                                         |
| ---------------------- | ----------- | ------------------------ | ------------------------------------------- |
| `ValidationError`      | 400         | `VALIDATION_ERROR`       | Datos de entrada inválidos                  |
| `AuthError`            | 401         | `AUTH_ERROR`             | Fallos de autenticación                     |
| `AuthorizationError`   | 403         | `AUTHORIZATION_ERROR`    | Falta de permisos                           |
| `NotFoundError`        | 404         | `NOT_FOUND_ERROR`        | Recurso no encontrado                       |
| `ConflictError`        | 409         | `CONFLICT_ERROR`         | Conflicto de recursos (ej: email duplicado) |
| `RateLimitError`       | 429         | `RATE_LIMIT_ERROR`       | Demasiadas solicitudes                      |
| `InternalServerError`  | 500         | `INTERNAL_SERVER_ERROR`  | Error interno del servidor                  |
| `DatabaseError`        | 500         | `DATABASE_ERROR`         | Error de base de datos                      |
| `ExternalServiceError` | 502         | `EXTERNAL_SERVICE_ERROR` | Error de servicio externo                   |

## 🚀 Cómo Usar

### 1. En Rutas/Controladores

```typescript
import { NotFoundError, ConflictError, DatabaseError } from "../utils/errors";

// Ejemplo: Usuario no encontrado
router.get("/:id", async (req, res, next) => {
  try {
    const user = await findUserById(req.params.id);

    if (!user) {
      throw new NotFoundError(`User with ID ${req.params.id} not found`, {
        requestedId: req.params.id,
        resource: "user",
      });
    }

    res.json(successResponse(user, "User retrieved successfully"));
  } catch (error) {
    if (error instanceof NotFoundError) {
      next(error); // Pasa el error tal como está
    } else {
      // Envuelve errores inesperados
      next(
        new DatabaseError("Failed to retrieve user", { originalError: error })
      );
    }
  }
});

// Ejemplo: Email duplicado
router.post("/", async (req, res, next) => {
  try {
    const existingUser = await findUserByEmail(req.body.email);

    if (existingUser) {
      throw new ConflictError("Email already registered", {
        email: req.body.email,
        field: "email",
      });
    }

    const newUser = await createUser(req.body);
    res.status(201).json(successResponse(newUser, "User created successfully"));
  } catch (error) {
    next(error);
  }
});
```

### 2. Con Validación Zod

El middleware de validación automáticamente convierte errores de Zod a `ValidationError`:

```typescript
import { validateBody } from "../middlewares/validation";
import { createUserSchema } from "../utils/schemas";

router.post(
  "/",
  validateBody(createUserSchema), // Automáticamente maneja validation errors
  async (req, res, next) => {
    // Si llegamos aquí, la validación pasó
    // ...
  }
);
```

### 3. Manejo de Errores de Terceros

```typescript
import jwt from "jsonwebtoken";
import { AuthError } from "../utils/errors";

// Los errores de JWT se manejan automáticamente en el middleware global
// Pero también puedes envolverlos manualmente:

try {
  const decoded = jwt.verify(token, secret);
} catch (error) {
  if (error.name === "JsonWebTokenError") {
    throw new AuthError("Invalid authentication token");
  }
  if (error.name === "TokenExpiredError") {
    throw new AuthError("Authentication token expired");
  }
  throw error;
}
```

## 📝 Formato de Respuesta de Error

### En Producción

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "timestamp": "2025-08-07T10:00:00.000Z"
  }
}
```

### En Desarrollo (incluye detalles adicionales)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "received": "invalid-email",
      "expected": "valid email format"
    },
    "timestamp": "2025-08-07T10:00:00.000Z"
  }
}
```

## 🔍 Logging Automático

Todos los errores se loggean automáticamente con la siguiente información:

```json
{
  "level": "error",
  "message": "Unhandled error:",
  "error": "User with ID 123 not found",
  "stack": "Error stack trace...",
  "url": "/api/users/123",
  "method": "GET",
  "ip": "127.0.0.1",
  "code": "NOT_FOUND_ERROR",
  "statusCode": 404,
  "timestamp": "2025-08-07T10:00:00.000Z"
}
```

## ⚙️ Configuración

### Variables de Entorno

```bash
NODE_ENV=development  # o 'production'
LOG_LEVEL=debug      # nivel de logging
```

### Middleware Setup (ya configurado en app.ts)

```typescript
import { errorHandler } from "./middlewares/errorHandler";

// Debe ir al final de todos los middlewares
app.use(errorHandler);
```

## 🧪 Testing

Los errores se pueden testear fácilmente:

```typescript
import { ValidationError, NotFoundError } from "../utils/errors";

describe("User Routes", () => {
  it("should return 404 for non-existent user", async () => {
    const response = await request(app)
      .get("/api/users/non-existent-id")
      .expect(404);

    expect(response.body).toMatchObject({
      success: false,
      error: {
        code: "NOT_FOUND_ERROR",
        message: expect.stringContaining("not found"),
      },
    });
  });
});
```

## 🎯 Mejores Prácticas

### ✅ Hacer

- Usar las clases de error específicas para cada situación
- Incluir detalles útiles en el campo `details`
- Envolver errores inesperados en clases apropiadas
- Usar `next(error)` en lugar de manejo manual
- Loggear errores importantes con contexto

### ❌ No Hacer

- No manejar errores manualmente en cada ruta
- No exponer información sensible en mensajes de error
- No ignorar errores o fallar silenciosamente
- No mezclar códigos de error personalizados con HTTP status codes

## 🔄 Ejemplos de Integración

### Con Base de Datos (Prisma)

```typescript
try {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new NotFoundError("User not found");
  }
} catch (error) {
  if (error instanceof NotFoundError) {
    throw error;
  }
  throw new DatabaseError("Database query failed", { originalError: error });
}
```

### Con Servicios Externos

```typescript
try {
  const response = await fetch("https://api.external-service.com/data");
  if (!response.ok) {
    throw new ExternalServiceError(
      `External service returned ${response.status}`
    );
  }
} catch (error) {
  if (error instanceof ExternalServiceError) {
    throw error;
  }
  throw new ExternalServiceError("Failed to communicate with external service");
}
```

### Con Rate Limiting

```typescript
import { RateLimitError } from "../utils/errors";

if (rateLimitExceeded) {
  throw new RateLimitError("Too many requests", {
    limit: 100,
    window: "1 hour",
    retryAfter: 3600,
  });
}
```

---

**✅ Sistema implementado y listo para usar**
**📅 Entregable 7 completado**
