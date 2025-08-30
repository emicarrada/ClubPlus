# 🔧 BACKEND DEVELOPER - SEMANA 3 ENTREGABLES

## 📅 **SEMANA 3: Backend — APIs de Combos y Plataformas**

**Fecha inicio:** 31 de agosto de 2025 **Fecha límite:** 7 de septiembre de 2025
**Responsable:** Backend Developer **Estado inicial:** 85% preparado
(autenticación completa) **Estado objetivo:** 💯 100% COMPLETADO

### 🎯 **OBJETIVO PRINCIPAL**

Implementar las APIs completas para gestión de combos y plataformas que
permitirán al frontend (semana 3-4) ofrecer la funcionalidad core del MVP:
creación y gestión de combos personalizados.

---

## 🏗️ **CONTEXTO TÉCNICO**

### **Estado actual del backend:**

- ✅ **Sistema de autenticación** enterprise-grade funcionando
- ✅ **Base de datos** Prisma schema completo con todos los modelos
- ✅ **Infraestructura** Express + middlewares + logging funcionando
- ✅ **Testing** Jest framework con 92% tests pasando

### **Necesidades inmediatas:**

- 🎯 **APIs de plataformas** para mostrar opciones disponibles
- 🎯 **APIs de combos** para crear/gestionar combos personalizados
- 🎯 **Lógica de negocio** para validaciones y reglas de combos
- 🎯 **Controllers robustos** con manejo de errores y validaciones

---

## 📋 **ENTREGABLES PRINCIPALES**

### **ENTREGABLE 1: Platform Management APIs**

**Descripción:** Implementar las APIs completas para gestión de plataformas
disponibles **Prioridad:** 🔴 ALTA - Requerido para frontend semana 3

#### **Tareas específicas:**

1. **Crear `/apps/backend/src/controllers/platforms.ts`**

   ```typescript
   // IMPLEMENTAR:
   -getAllPlatforms(req, res, next) - // GET /api/platforms
     getPlatformById(req, res, next) - // GET /api/platforms/:id
     createPlatform(req, res, next) - // POST /api/platforms (admin)
     updatePlatform(req, res, next) - // PUT /api/platforms/:id (admin)
     deletePlatform(req, res, next); // DELETE /api/platforms/:id (admin)
   ```

2. **Crear `/apps/backend/src/routes/platforms.ts`**

   ```typescript
   // RUTAS IMPLEMENTAR:
   router.get('/', getAllPlatforms); // Público
   router.get('/:id', getPlatformById); // Público
   router.post('/', authMiddleware, adminMiddleware, createPlatform);
   router.put('/:id', authMiddleware, adminMiddleware, updatePlatform);
   router.delete('/:id', authMiddleware, adminMiddleware, deletePlatform);
   ```

3. **Crear `/apps/backend/src/services/platformService.ts`**
   ```typescript
   // LÓGICA DE NEGOCIO:
   - findAllActivePlatforms()
   - findPlatformById(id: string)
   - createNewPlatform(data: PlatformCreateInput)
   - updatePlatformById(id: string, data: PlatformUpdateInput)
   - softDeletePlatform(id: string)
   ```

#### **Criterios de aceptación:**

- [ ] GET `/api/platforms` retorna todas las plataformas activas
- [ ] GET `/api/platforms/:id` retorna plataforma específica o 404
- [ ] POST `/api/platforms` crea nueva plataforma (solo admin)
- [ ] PUT `/api/platforms/:id` actualiza plataforma existente (solo admin)
- [ ] DELETE `/api/platforms/:id` desactiva plataforma (soft delete, solo admin)
- [ ] Todos los endpoints con validación zod y manejo de errores
- [ ] Tests unitarios para todos los endpoints (Jest + Supertest)

---

### **ENTREGABLE 2: Combo Template Management APIs**

**Descripción:** Implementar las APIs para gestión de plantillas de combos
predefinidos **Prioridad:** 🔴 ALTA - Base para funcionalidad de combos

#### **Tareas específicas:**

1. **Crear `/apps/backend/src/controllers/comboTemplates.ts`**

   ```typescript
   // IMPLEMENTAR:
   -getAllComboTemplates(req, res, next) - // GET /api/combo-templates
     getComboTemplateById(req, res, next) - // GET /api/combo-templates/:id
     createComboTemplate(req, res, next) - // POST /api/combo-templates (admin)
     updateComboTemplate(req, res, next) - // PUT /api/combo-templates/:id (admin)
     deleteComboTemplate(req, res, next); // DELETE /api/combo-templates/:id (admin)
   ```

2. **Crear `/apps/backend/src/routes/comboTemplates.ts`**

   ```typescript
   // RUTAS CON MIDDLEWARES:
   router.get('/', getAllComboTemplates); // Público
   router.get('/:id', getComboTemplateById); // Público
   router.post('/', authMiddleware, adminMiddleware, createComboTemplate);
   router.put('/:id', authMiddleware, adminMiddleware, updateComboTemplate);
   router.delete('/:id', authMiddleware, adminMiddleware, deleteComboTemplate);
   ```

3. **Crear `/apps/backend/src/services/comboTemplateService.ts`**
   ```typescript
   // LÓGICA DE NEGOCIO:
   - findAllActiveTemplates() // Con platforms incluidas
   - findTemplateById(id: string)
   - createNewTemplate(data: ComboTemplateCreateInput)
   - updateTemplateById(id: string, data: ComboTemplateUpdateInput)
   - softDeleteTemplate(id: string)
   - validateTemplatePlatforms(platformIds: string[])
   ```

#### **Criterios de aceptación:**

- [ ] GET `/api/combo-templates` retorna todos los templates con plataformas
      incluidas
- [ ] GET `/api/combo-templates/:id` retorna template específico con plataformas
- [ ] POST `/api/combo-templates` crea nuevo template con plataformas asociadas
- [ ] PUT `/api/combo-templates/:id` actualiza template y sus plataformas
- [ ] DELETE `/api/combo-templates/:id` desactiva template (soft delete)
- [ ] Validación de mínimo 2 plataformas por template
- [ ] Tests unitarios completos

---

### **ENTREGABLE 3: User Combos Management APIs**

**Descripción:** Implementar las APIs para que usuarios creen y gestionen sus
combos personalizados **Prioridad:** 🟡 MEDIA - Para semana 4 principalmente

#### **Tareas específicas:**

1. **Crear `/apps/backend/src/controllers/combos.ts`**

   ```typescript
   // IMPLEMENTAR:
   -getUserCombos(req, res, next) - // GET /api/combos
     getComboById(req, res, next) - // GET /api/combos/:id
     createUserCombo(req, res, next) - // POST /api/combos
     updateUserCombo(req, res, next) - // PUT /api/combos/:id
     cancelUserCombo(req, res, next); // DELETE /api/combos/:id
   ```

2. **Crear `/apps/backend/src/routes/combos.ts`**

   ```typescript
   // RUTAS PROTEGIDAS:
   router.get('/', authMiddleware, getUserCombos); // Solo combos del usuario
   router.get('/:id', authMiddleware, getComboById); // Solo si es del usuario
   router.post('/', authMiddleware, createUserCombo); // Crear nuevo combo
   router.put('/:id', authMiddleware, updateUserCombo); // Solo si es del usuario
   router.delete('/:id', authMiddleware, cancelUserCombo); // Cancelar combo
   ```

3. **Crear `/apps/backend/src/services/comboService.ts`**
   ```typescript
   // LÓGICA DE NEGOCIO COMPLEJA:
   - findUserCombos(userId: string)
   - findComboById(id: string, userId: string)
   - createUserCombo(userId: string, templateId: string, customPrice?: number)
   - updateUserCombo(id: string, userId: string, data: ComboUpdateInput)
   - cancelUserCombo(id: string, userId: string)
   - validateUserComboOwnership(comboId: string, userId: string)
   - calculateComboPrice(templateId: string)
   - validateOneActiveComboPerUser(userId: string)
   ```

#### **Criterios de aceptación:**

- [ ] GET `/api/combos` retorna solo combos del usuario autenticado
- [ ] GET `/api/combos/:id` retorna combo específico si pertenece al usuario
- [ ] POST `/api/combos` crea nuevo combo basado en template
- [ ] PUT `/api/combos/:id` actualiza combo si pertenece al usuario
- [ ] DELETE `/api/combos/:id` cancela combo (soft delete)
- [ ] Validación: máximo 1 combo activo por usuario
- [ ] Validación: usuario solo puede acceder a sus propios combos
- [ ] Tests unitarios con casos edge

---

### **ENTREGABLE 4: Admin Dashboard APIs**

**Descripción:** APIs específicas para administración del sistema **Prioridad:**
🟢 BAJA - Para futuras semanas

#### **Tareas específicas:**

1. **Crear `/apps/backend/src/controllers/admin.ts`**

   ```typescript
   // IMPLEMENTAR:
   -getDashboardStats(req, res, next) - // GET /api/admin/dashboard
     getAllUsers(req, res, next) - // GET /api/admin/users
     getAllCombos(req, res, next) - // GET /api/admin/combos
     getUserDetails(req, res, next) - // GET /api/admin/users/:id
     updateUserStatus(req, res, next); // PUT /api/admin/users/:id/status
   ```

2. **Crear `/apps/backend/src/routes/admin.ts`**

   ```typescript
   // RUTAS SUPER PROTEGIDAS:
   router.get('/dashboard', authMiddleware, adminMiddleware, getDashboardStats);
   router.get('/users', authMiddleware, adminMiddleware, getAllUsers);
   router.get('/combos', authMiddleware, adminMiddleware, getAllCombos);
   router.get('/users/:id', authMiddleware, adminMiddleware, getUserDetails);
   router.put(
     '/users/:id/status',
     authMiddleware,
     adminMiddleware,
     updateUserStatus,
   );
   ```

3. **Crear `/apps/backend/src/services/adminService.ts`**
   ```typescript
   // ANALYTICS Y GESTIÓN:
   - generateDashboardStats()
   - findAllUsersWithPagination(page: number, limit: number)
   - findAllCombosWithFilters(filters: ComboFilters)
   - findUserWithDetails(userId: string)
   - updateUserStatus(userId: string, status: UserStatus)
   ```

#### **Criterios de aceptación:**

- [ ] GET `/api/admin/dashboard` retorna estadísticas del sistema
- [ ] GET `/api/admin/users` retorna usuarios con paginación
- [ ] GET `/api/admin/combos` retorna todos los combos con filtros
- [ ] PUT `/api/admin/users/:id/status` actualiza estado de usuario
- [ ] Todas las rutas requieren autenticación + rol admin
- [ ] Tests unitarios para funciones críticas

---

### **ENTREGABLE 5: Validation Schemas & Error Handling**

**Descripción:** Schemas de validación completos y manejo de errores robusto
**Prioridad:** 🔴 ALTA - Crítico para calidad

#### **Tareas específicas:**

1. **Crear `/apps/backend/src/schemas/platform.ts`**

   ```typescript
   // SCHEMAS ZOD:
   export const createPlatformSchema = z.object({
     name: z.string().min(2).max(50),
     logoUrl: z.string().url().optional(),
     description: z.string().max(500).optional(),
     isActive: z.boolean().default(true),
   });

   export const updatePlatformSchema = createPlatformSchema.partial();
   ```

2. **Crear `/apps/backend/src/schemas/combo.ts`**

   ```typescript
   // SCHEMAS PARA COMBOS:
   export const createComboTemplateSchema = z.object({
     name: z.string().min(2).max(100),
     description: z.string().max(500).optional(),
     price: z.number().positive().optional(),
     platformIds: z.array(z.string().cuid()).min(2, 'Mínimo 2 plataformas'),
     isActive: z.boolean().default(true),
   });

   export const createUserComboSchema = z.object({
     comboTemplateId: z.string().cuid(),
     customPrice: z.number().positive().optional(),
   });
   ```

3. **Crear `/apps/backend/src/middlewares/adminMiddleware.ts`**
   ```typescript
   // MIDDLEWARE PARA ADMIN:
   export const adminMiddleware = (
     req: Request,
     res: Response,
     next: NextFunction,
   ) => {
     const user = req.user as User;
     if (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
       return res.status(403).json({
         error: 'Forbidden',
         message: 'Acceso denegado. Requiere permisos de administrador.',
       });
     }
     next();
   };
   ```

#### **Criterios de aceptación:**

- [ ] Todos los endpoints tienen validación zod
- [ ] Mensajes de error claros y consistentes
- [ ] Middleware de admin funcional
- [ ] Validaciones específicas de negocio implementadas
- [ ] Tests para casos de error y validación

---

### **ENTREGABLE 6: Database Seed & Initial Data**

**Descripción:** Poblar la base de datos con datos iniciales para desarrollo y
testing **Prioridad:** 🟡 MEDIA - Para facilitar desarrollo

#### **Tareas específicas:**

1. **Actualizar `/packages/prisma/seed.ts`**

   ```typescript
   // DATOS INICIALES:
   - Crear 3 plataformas base: Disney+, HBO Max, Canva Pro
   - Crear 3 combo templates predefinidos
   - Crear usuario admin para testing
   - Crear relaciones ComboPlatform
   ```

2. **Crear `/apps/backend/src/lib/seedData.ts`**

   ```typescript
   // DATOS ESTRUCTURADOS:
   export const initialPlatforms = [
     { name: 'Disney+', logoUrl: '...', description: '...' },
     { name: 'HBO Max', logoUrl: '...', description: '...' },
     { name: 'Canva Pro', logoUrl: '...', description: '...' },
   ];

   export const initialComboTemplates = [
     { name: 'Combo Entretenimiento', platforms: ['Disney+', 'HBO Max'] },
     { name: 'Combo Creativo', platforms: ['Disney+', 'Canva Pro'] },
     { name: 'Combo Completo', platforms: ['Disney+', 'HBO Max', 'Canva Pro'] },
   ];
   ```

#### **Criterios de aceptación:**

- [ ] Seed script crea datos iniciales consistentes
- [ ] Plataformas base disponibles al iniciar
- [ ] Combo templates predefinidos funcionando
- [ ] Usuario admin para testing creado
- [ ] Script `npm run db:seed` funciona sin errores

---

## 🧪 **TESTING REQUIREMENTS**

### **Coverage mínimo requerido: 85%**

#### **Tests unitarios obligatorios:**

- [ ] **Platform Controller Tests:** 10+ test cases
- [ ] **Combo Template Controller Tests:** 12+ test cases
- [ ] **User Combo Controller Tests:** 15+ test cases
- [ ] **Admin Controller Tests:** 8+ test cases
- [ ] **Service Layer Tests:** 20+ test cases
- [ ] **Validation Schema Tests:** 10+ test cases

#### **Tests de integración:**

- [ ] **API Integration Tests:** End-to-end para flujos principales
- [ ] **Database Tests:** Verificar relaciones y constraints
- [ ] **Authentication Tests:** Verificar protección de rutas

#### **Estructura de tests:**

```
/apps/backend/src/__tests__/
├── controllers/
│   ├── platforms.test.ts
│   ├── comboTemplates.test.ts
│   ├── combos.test.ts
│   └── admin.test.ts
├── services/
│   ├── platformService.test.ts
│   ├── comboTemplateService.test.ts
│   ├── comboService.test.ts
│   └── adminService.test.ts
├── integration/
│   ├── platforms.integration.test.ts
│   ├── combos.integration.test.ts
│   └── auth.integration.test.ts
└── schemas/
    ├── platform.schema.test.ts
    └── combo.schema.test.ts
```

---

## 🔧 **TECHNICAL SPECIFICATIONS**

### **API Response Format Estándar:**

```typescript
// Success Response
{
  success: true,
  data: T,
  message?: string,
  pagination?: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}

// Error Response
{
  success: false,
  error: string,
  message: string,
  details?: any
}
```

### **Database Considerations:**

- Usar transacciones para operaciones complejas
- Implementar soft deletes (isActive: false)
- Índices en campos de búsqueda frecuente
- Validaciones a nivel de base de datos y aplicación

### **Performance Requirements:**

- Endpoints deben responder en < 200ms
- Queries optimizadas con includes específicos
- Paginación en listas grandes (limit: 20 por defecto)
- Cache headers apropiados

### **Security Requirements:**

- Validación de input en todos los endpoints
- Rate limiting configurado
- Logs de seguridad para acciones admin
- Sanitización de datos de salida

---

## 🎯 **DEFINITION OF DONE**

### **Para considerar un entregable COMPLETADO:**

- [x] ✅ **Código implementado** y funcionando en desarrollo
- [x] ✅ **Tests unitarios** pasando con coverage > 85%
- [x] ✅ **Tests de integración** verificando flujos completos
- [x] ✅ **Validación zod** en todos los endpoints
- [x] ✅ **Manejo de errores** robusto y consistente
- [x] ✅ **Documentación** de APIs actualizada
- [x] ✅ **Seed data** funcionando para desarrollo
- [x] ✅ **Code review** interno completado
- [x] ✅ **Integration testing** con frontend (si aplicable)

### **Comandos de verificación:**

```bash
# Verificar que todo funciona
npm run test:backend          # Todos los tests pasando
npm run build:backend         # Build sin errores
npm run dev:backend           # Servidor iniciando sin errores
npm run db:seed               # Seed data cargando correctamente

# Verificar endpoints (con servidor corriendo)
curl http://localhost:3001/api/platforms
curl http://localhost:3001/api/combo-templates
curl -H "Authorization: Bearer <token>" http://localhost:3001/api/combos
```

---

## 🚀 **NEXT STEPS (Semana 4)**

### **Preparación para semana 4:**

1. **Payment Integration APIs** - Stripe/MercadoPago
2. **Subscription Management** - Lógica de facturación
3. **Account Assignment APIs** - Asignar cuentas de plataformas
4. **Notification System** - Emails y webhooks
5. **Advanced Analytics** - Métricas de negocio

### **Frontend Integration Support:**

- **API Documentation** actualizada para frontend team
- **Mock Data** disponible para development
- **CORS Configuration** para desarrollo local
- **Error Codes** documentados para UX

---

## 📞 **SUPPORT & ESCALATION**

### **Puntos de contacto:**

- **Technical Issues:** Backend Developer + Technical Lead
- **Business Logic Questions:** Product Owner
- **Database Issues:** DevOps + Database Lead
- **Integration Issues:** Frontend Team Lead

### **Escalation criteria:**

- **Blocker detectado:** Escalar inmediatamente
- **Delay > 1 día:** Escalar a Technical Lead
- **Breaking changes:** Coordinar con Frontend Team
- **Performance issues:** Escalar a DevOps Team

---

**✅ SEMANA 3 COMPLETADA = BACKEND APIS COMPLETAS PARA GESTIÓN DE COMBOS Y
PLATAFORMAS**

_Documento creado: 29 de agosto de 2025_ _Versión: 1.0_ _Próxima revisión: 7 de
septiembre de 2025_
