# SEMANA 1 - ENTREGABLES BACKEND DEVELOPER

## 🎯 OBJETIVO SEMANA 1 - BACKEND

Completar la base técnica del backend para que esté listo para implementar autenticación (Semana 2) y funcionalidades core del MVP.

---

## 📋 ENTREGABLES BACKEND - 7 DÍAS

### **ENTREGABLE 1: Environment Configuration**

**Archivo:** `.env.example` en la raíz del proyecto

**Contenido requerido:**

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/clubplus_dev"

# Server
NODE_ENV="development"
PORT=3000
CORS_ORIGIN="http://localhost:5173"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_REFRESH_SECRET="your-refresh-token-secret-here"
JWT_EXPIRES_IN="24h"
JWT_REFRESH_EXPIRES_IN="7d"

# Payment Providers (for future implementation)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
MERCADOPAGO_ACCESS_TOKEN="APP_USR-..."

# Email Services (for future implementation)
SENDGRID_API_KEY="SG...."
RESEND_API_KEY="re_..."

# n8n Integration (for future implementation)
N8N_WEBHOOK_URL="https://your-n8n-instance.railway.app/webhook"
N8N_API_KEY="your-n8n-api-key"

# Logging
LOG_LEVEL="debug"
```

---

### **ENTREGABLE 2: Modular Backend Structure**

**Ubicación:** `apps/backend/src/`

**Estructura de carpetas requerida:**

```
apps/backend/src/
├── index.ts                 # Express server entry point✅
├── app.ts                   # Express app configuration✅
├── config/
│   ├── database.ts          # Prisma client setup✅
│   ├── environment.ts       # Environment variables validation✅
│   └── logger.ts            # Winston logger configuration✅
├── middlewares/
│   ├── auth.ts              # JWT middleware (placeholder)✅
│   ├── validation.ts        # Zod validation middleware✅
│   ├── errorHandler.ts      # Global error handling✅
│   ├── logging.ts           # Request logging middleware✅
│   └── rateLimiter.ts       # Rate limiting middleware✅
├── utils/
│   ├── response.ts          # Standardized API responses✅
│   ├── errors.ts            # Custom error classes✅
│   └── constants.ts         # Application constants✅
├── routes/
│   ├── index.ts             # Main router ✅
│   ├── health.ts            # Health check routes✅
│   ├── auth.ts              # Auth routes (placeholder)✅
│   ├── users.ts             # User routes (placeholder)✅
│   ├── combos.ts            # Combo routes (placeholder)✅
│   └── payments.ts          # Payment routes (placeholder)✅
└── types/
    ├── express.d.ts         # Express type extensions✅
    └── api.ts               # API type definitions✅
```

---

### **ENTREGABLE 3: Express Server Setup**

**Archivo:** `apps/backend/src/index.ts`

**Funcionalidad requerida:**

- Express server básico corriendo en puerto configurado
- Middleware stack completo configurado
- CORS habilitado para desarrollo
- Health check endpoint funcional
- Error handling global
- Request logging con winston
- Graceful shutdown handling

**Endpoint mínimo requerido:**

```
GET /health
Response: { "status": "ok", "timestamp": "2025-07-30T...", "uptime": "5.2s", "service": "ClubPlus Backend"}✅
```

Nota: Para verificar esto puedes escribir en la terminal:
"curl http://localhost:3000/health"
o
"curl http://localhost:3000/api/health"
o
"curl http://localhost:3000/api/health/db"

---

### **ENTREGABLE 4: Database Integration**

**Archivo:** `apps/backend/src/config/database.ts`

**Funcionalidad requerida:**

- Prisma client setup y configuración
- Connection testing al startup
- Error handling para conexión DB
- Database health check endpoint

**Endpoint requerido:**

```
GET /health/db
Response: { "status": "connected", "latency": "15ms" }
```

---

### **ENTREGABLE 5: Logging System**

**Archivos:**

- `apps/backend/src/config/logger.ts`
- `apps/backend/src/middlewares/logging.ts`

**Funcionalidad requerida:**

- Winston logger configurado con niveles (error, warn, info, debug)
- File logging para production
- Console logging para development
- Request/response logging middleware
- Error logging automático
- Log format estructurado (JSON en production)

**Ejemplo de logs requeridos:**

```json
{
  "level": "info",
  "message": "Server started",
  "timestamp": "2025-07-30T10:00:00.000Z",
  "port": 3000
}
```

---

### **ENTREGABLE 6: Validation Infrastructure**

**Archivos:**

- `apps/backend/src/middlewares/validation.ts`
- `apps/backend/src/utils/schemas.ts` (placeholder para futuras validaciones)

**Funcionalidad requerida:**

- Zod validation middleware genérico
- Error handling para validation errors
- Standardized validation responses
- Base schemas para User, Combo, etc. (placeholders)

---

### **ENTREGABLE 7: Error Handling System**

**Archivos:**

- `apps/backend/src/middlewares/errorHandler.ts`
- `apps/backend/src/utils/errors.ts`

**Funcionalidad requerida:**

- Global error handler middleware
- Custom error classes (ValidationError, AuthError, etc.)
- Standardized error responses
- Error logging integration
- Development vs Production error details

**Formato de error response:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {...}
  },
  "timestamp": "2025-07-30T10:00:00.000Z"
}
```

---

### **ENTREGABLE 8: Package.json Scripts**

**Archivo:** `apps/backend/package.json`

**Scripts requeridos:**

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx src/database/seed.ts",
    "db:reset": "prisma migrate reset",
    "db:generate": "prisma generate",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix"
  }
}
```

---

### **ENTREGABLE 9: TypeScript Configuration**

**Archivo:** `apps/backend/tsconfig.json`

**Configuración requerida:**

- Strict TypeScript configuration
- Path mapping para imports
- Output directory configuration
- Source maps para debugging

---

### **ENTREGABLE 10: Basic Testing Setup**

**Archivos:**

- `apps/backend/jest.config.js`
- `apps/backend/src/__tests__/health.test.ts`

**Funcionalidad requerida:**

- Jest configuration para TypeScript
- Test para health endpoints
- Test setup con database mocking
- Basic test utilities

---

## 🚨 CRITERIOS DE ACEPTACIÓN

### **AL FINALIZAR LA SEMANA 1, EL BACKEND DEVELOPER DEBE ENTREGAR:**

1. **Server funcional:**

   ```bash
   cd apps/backend
   npm run dev
   # Server starts on http://localhost:3000
   # GET http://localhost:3000/health returns 200 OK
   # GET http://localhost:3000/health/db returns 200 OK
   ```

2. **Logging operativo:**

   - Logs aparecen en consola durante development
   - Logs incluyen requests, responses, y errores
   - Log level configurable via environment

3. **Error handling:**

   - Errores no capturados no crash el server
   - Error responses tienen formato consistente
   - Errores se loggean automáticamente

4. **Database connection:**

   - Prisma client conecta exitosamente
   - Health check DB funcional
   - Error handling si DB no disponible

5. **Tests básicos:**

   ```bash
   npm run test
   # All tests pass
   # Health endpoints tested
   ```

6. **Estructura preparada:**
   - Todos los folders y archivos placeholder creados
   - Import paths funcionando correctamente
   - TypeScript compiling sin errores

---

## 📋 DEPENDENCIAS EXTERNAS REQUERIDAS

**El backend developer NO necesita:**

- Configurar Railway deployment (eso se hace después)
- Implementar authentication (eso es Semana 2)
- Crear frontend (eso es Semana 3)
- Configurar payment providers (eso es Semana 5)

**El backend developer SÍ necesita:**

- PostgreSQL local running para testing
- Node.js 18+ y npm
- Acceso al repositorio GitHub
- Editor con TypeScript support

---

## 🎯 VALIDACIÓN FINAL

**Para considerar Semana 1 COMPLETA (backend), debe funcionar:**

```bash
# 1. Clone y setup
git clone [repo]
cd Club+/apps/backend
npm install
cp .env.example .env
# (configurar DATABASE_URL local)

# 2. Start server
npm run dev
# ✅ Server starts successfully
# ✅ Logs appear in console
# ✅ No error messages

# 3. Test endpoints
curl http://localhost:3000/health
# ✅ Returns 200 OK with status

curl http://localhost:3000/health/db
# ✅ Returns 200 OK with DB status

# 4. Run tests
npm run test
# ✅ All tests pass

# 5. Build production
npm run build
# ✅ Builds successfully
```

**DEADLINE: 7 días para entrega completa**

---

_📅 Entregables definidos: 30 de julio de 2025_
_🎯 Para completar Semana 1 - Base técnica backend_
