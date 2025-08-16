# 🔧 BACKEND DEVELOPER - SEMANA 2 ENTREGABLES

## 📅 **SEMANA 2: Backend — Autenticación y Usuarios**

**Fecha inicio:** 17 de agosto de 2025 **Fecha límite:** 24 de agosto de 2025
**Responsable:** Backend Developer **Estado inicial:** 20% preparado
(infraestructura lista)

---

## 🎯 **OBJETIVO PRINCIPAL**

Implementar un sistema de autenticación completo y funcional que permita
registro, login y protección de rutas en el backend, con validación robusta y
manejo de errores.

---

## 📋 **ENTREGABLES PRINCIPALES**

### **ENTREGABLE 1: Authentication Controllers** 🔴 **CRÍTICO**

**Descripción:** Implementar los controladores de autenticación principales

#### **Tareas específicas:**

1. **Crear `/apps/backend/src/controllers/auth.ts`**

   ```typescript
   // Implementar:
   -registerUser(req, res, next) -
     loginUser(req, res, next) -
     logoutUser(req, res, next) -
     refreshToken(req, res, next);
   ```

2. **Funcionalidades requeridas:**
   - ✅ Validación de entrada con zod schemas (ya disponible)
   - ❌ Hash de passwords con bcrypt (salt rounds: 12)
   - ❌ Generación de JWT tokens (access + refresh)
   - ❌ Verificación de email único en registro
   - ❌ Validación de credenciales en login
   - ❌ Manejo de errores específicos (401, 409, 400)

#### **Criterios de aceptación:**

- [ ] POST `/api/auth/register` funcional con validación completa
- [ ] POST `/api/auth/login` retorna JWT válido
- [ ] POST `/api/auth/logout` invalida token correctamente
- [ ] Passwords nunca se almacenan en texto plano
- [ ] Respuestas siguen formato estándar del proyecto

#### **Tests requeridos:**

- [ ] Test de registro exitoso
- [ ] Test de email duplicado (409 error)
- [ ] Test de login con credenciales válidas
- [ ] Test de login con credenciales inválidas
- [ ] Test de logout exitoso

---

### **ENTREGABLE 2: JWT Middleware** 🔴 **CRÍTICO**

**Descripción:** Crear middleware para proteger rutas y validar tokens

#### **Tareas específicas:**

1. **Crear `/apps/backend/src/middlewares/auth.ts`**

   ```typescript
   // Implementar:
   -authenticateToken(req, res, next) -
     authorizeRoles(...roles)(req, res, next) -
     extractTokenFromHeader(req);
   ```

2. **Funcionalidades requeridas:**
   - ❌ Extracción de token desde Authorization header
   - ❌ Verificación y decodificación de JWT
   - ❌ Validación de expiración de token
   - ❌ Inyección de user data en req.user
   - ❌ Manejo de tokens inválidos/expirados

#### **Criterios de aceptación:**

- [ ] Middleware valida tokens JWT correctamente
- [ ] Rutas protegidas rechazan requests sin token
- [ ] req.user contiene datos del usuario autenticado
- [ ] Manejo correcto de tokens expirados (401)
- [ ] Logs de intentos de acceso no autorizados

#### **Tests requeridos:**

- [ ] Test de middleware con token válido
- [ ] Test de middleware sin token
- [ ] Test de middleware con token inválido
- [ ] Test de middleware con token expirado

---

### **ENTREGABLE 3: Database Integration** 🟡 **IMPORTANTE**

**Descripción:** Conectar autenticación con base de datos real

#### **Tareas específicas:**

1. **Setup Prisma Client en backend**

   ```typescript
   // Crear /apps/backend/src/lib/prisma.ts
   - Configurar cliente Prisma
   - Setup conexión con PostgreSQL
   - Implementar error handling
   ```

2. **User CRUD Operations**
   ```typescript
   // Crear /apps/backend/src/services/userService.ts
   -createUser(userData) -
     findUserByEmail(email) -
     findUserById(id) -
     updateUser(id, data);
   ```

#### **Criterios de aceptación:**

- [ ] Conexión exitosa con base de datos PostgreSQL
- [ ] Operaciones CRUD funcionan correctamente
- [ ] Manejo de errores de base de datos
- [ ] Validación de constraints únicos
- [ ] Logs de operaciones de base de datos

#### **Tests requeridos:**

- [ ] Test de conexión a base de datos
- [ ] Test de creación de usuario
- [ ] Test de búsqueda por email
- [ ] Test de constraint violation (email único)

---

### **ENTREGABLE 4: Protected Routes Implementation** 🟡 **IMPORTANTE**

**Descripción:** Implementar rutas protegidas y sistema de autorización

#### **Tareas específicas:**

1. **Actualizar rutas existentes**

   ```typescript
   // Modificar /apps/backend/src/routes/users.ts
   - Aplicar middleware de autenticación
   - Implementar endpoints protegidos
   ```

2. **Nuevas rutas protegidas**
   ```typescript
   // Implementar:
   GET /api/auth/me (perfil usuario actual)
   PUT /api/auth/profile (actualizar perfil)
   POST /api/auth/change-password (cambiar contraseña)
   ```

#### **Criterios de aceptación:**

- [ ] Rutas de usuarios requieren autenticación
- [ ] GET `/api/auth/me` retorna datos del usuario actual
- [ ] Usuarios solo pueden acceder/modificar sus propios datos
- [ ] Cambio de contraseña con validación de contraseña actual

#### **Tests requeridos:**

- [ ] Test de acceso a ruta protegida sin token
- [ ] Test de GET `/api/auth/me` con token válido
- [ ] Test de cambio de contraseña exitoso

---

### **ENTREGABLE 5: Security & Rate Limiting** 🟡 **IMPORTANTE**

**Descripción:** Implementar medidas de seguridad para endpoints de auth

#### **Tareas específicas:**

1. **Rate Limiting específico para auth**

   ```typescript
   // Modificar /apps/backend/src/middlewares/rateLimiter.ts
   - Rate limiting más estricto para /auth endpoints
   - Implementar rate limiting por IP
   ```

2. **Security Headers y Validation**
   ```typescript
   // Implementar:
   - Validación robusta de inputs
   - Sanitización de datos
   - Headers de seguridad específicos
   ```

#### **Criterios de aceptación:**

- [ ] Rate limiting específico para auth endpoints (5 intentos/minuto)
- [ ] Validación estricta de formato de email y password
- [ ] Headers de seguridad apropiados
- [ ] Logs de intentos de acceso maliciosos

---

## 🧪 **TESTING REQUIREMENTS**

### **Coverage mínimo requerido:** 90%

### **Tests específicos a implementar:**

1. **Integration Tests**
   - [ ] Flujo completo: registro → login → acceso a ruta protegida
   - [ ] Error handling en cada endpoint
   - [ ] Database integration tests

2. **Unit Tests**
   - [ ] JWT generation y verification
   - [ ] Password hashing y comparison
   - [ ] Validation middleware
   - [ ] User service functions

3. **Security Tests**
   - [ ] SQL injection attempts
   - [ ] Rate limiting effectiveness
   - [ ] Token tampering detection

---

## 📁 **ESTRUCTURA DE ARCHIVOS ESPERADA**

```
apps/backend/src/
├── controllers/
│   └── auth.ts (NUEVO)
├── middlewares/
│   ├── auth.ts (NUEVO)
│   └── rateLimiter.ts (MODIFICAR)
├── services/
│   └── userService.ts (NUEVO)
├── lib/
│   └── prisma.ts (NUEVO)
├── routes/
│   ├── auth.ts (MODIFICAR - quitar placeholders)
│   └── users.ts (MODIFICAR - agregar protección)
└── __tests__/
    ├── auth.test.ts (NUEVO)
    ├── authMiddleware.test.ts (NUEVO)
    └── userService.test.ts (NUEVO)
```

---

## 🔧 **CONFIGURACIÓN TÉCNICA**

### **Environment Variables requeridas:**

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/clubplus_dev

# Security
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_AUTH_WINDOW_MS=60000
RATE_LIMIT_AUTH_MAX_REQUESTS=5
```

### **Dependencies adicionales (si necesarias):**

```json
{
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2",
  "express-rate-limit": "^6.10.0"
}
```

---

## 🚨 **CRITERIOS DE DEFINICIÓN DE COMPLETADO**

### **Funcional:**

- [ ] Todos los endpoints de auth responden correctamente
- [ ] JWT tokens se generan y validan correctamente
- [ ] Base de datos se conecta y opera sin errores
- [ ] Rate limiting previene ataques de fuerza bruta
- [ ] Rutas protegidas funcionan correctamente

### **Calidad:**

- [ ] 90%+ test coverage
- [ ] Todos los tests pasan
- [ ] TypeScript compila sin errores
- [ ] ESLint pasa sin warnings
- [ ] Código documentado con JSDoc

### **Seguridad:**

- [ ] Passwords hasheados correctamente
- [ ] JWT firmados con secret seguro
- [ ] Validación de inputs robusta
- [ ] Headers de seguridad apropiados
- [ ] Logs de actividad implementados

### **Performance:**

- [ ] Endpoints responden en <200ms (promedio)
- [ ] Database queries optimizadas
- [ ] Memory leaks inexistentes
- [ ] Rate limiting efectivo

---

## 📞 **COMUNICACIÓN Y ENTREGA**

### **Check-ins diarios:**

- **Hora:** 9:00 AM
- **Formato:** Status update en Slack
- **Contenido:** Progreso, blockers, ETA

### **Entrega intermedia (Miércoles 21/08):**

- [ ] Controllers básicos funcionando
- [ ] JWT middleware implementado
- [ ] Tests unitarios básicos

### **Entrega final (Sábado 24/08):**

- [ ] Todos los entregables completados
- [ ] Tests pasando al 90%+
- [ ] Documentación actualizada
- [ ] Demo funcional preparado

### **Formato de entrega:**

1. **Pull Request** con código implementado
2. **Video demo** (5 minutos) mostrando funcionalidad
3. **Test report** con coverage metrics
4. **Documentation** de APIs implementadas

---

## 🆘 **ESCALACIÓN Y SOPORTE**

### **Si encuentras blockers:**

1. **Documenta el problema** específicamente
2. **Intenta 2-3 soluciones** diferentes
3. **Escala inmediatamente** si no hay progreso en 2 horas

### **Contactos de escalación:**

- **Technical Lead:** Cristopher (Slack: @cristopher)
- **Product Owner:** [Nombre] (para decisiones de producto)
- **DevOps Support:** [Nombre] (para issues de infraestructura)

---

**🎯 ÉXITO = Sistema de autenticación enterprise-grade funcionando al 100% el 24
de agosto**

---

_📅 Documento creado: 16 de agosto de 2025_ _👤 Responsable: Backend Developer_
_📊 Prioridad: CRÍTICA para MVP_ _⏰ Deadline: 24 de agosto de 2025_
