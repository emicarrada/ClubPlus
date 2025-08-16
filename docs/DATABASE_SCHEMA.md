# 📊 Base de Datos de Club+ MVP

> **Fecha de análisis**: 16 de agosto de 2025 **Estado**: Esquema completo
> definido, sin migraciones aplicadas

## 🗃️ Configuración General

- **Base de datos**: PostgreSQL
- **ORM**: Prisma
- **Ubicación del esquema**: `packages/prisma/schema.prisma`
- **Estado actual**: Esquema completo definido, sin migraciones aplicadas aún

## 📋 Arquitectura de Modelos

### 👤 **Gestión de Usuarios**

#### `User`

Tabla principal de usuarios del sistema.

**Campos:**

- `id`: String (UUID, PK)
- `email`: String (único)
- `passwordHash`: String (contraseña encriptada)
- `name`: String
- `phone`: String (opcional)
- `createdAt`: DateTime

**Relaciones:**

- Uno a muchos con `Combo`
- Uno a muchos con `Assignment`
- Uno a muchos con `Payment`
- Uno a muchos con `Subscription`
- Uno a muchos con `Referral` (como referrer y referred)

---

### 🎯 **Sistema de Combos**

#### `Platform`

Plataformas disponibles (Disney+, HBO Max, Canva Pro).

**Campos:**

- `id`: String (UUID, PK)
- `name`: String (único) - "Disney+", "HBO Max", "Canva Pro"
- `logoUrl`: String (opcional)
- `description`: String (opcional)
- `isActive`: Boolean (default: true)
- `createdAt`: DateTime

**Relaciones:**

- Uno a muchos con `Account`
- Uno a muchos con `ComboPlatform`

#### `ComboTemplate`

Templates de los combos disponibles.

**Campos:**

- `id`: String (UUID, PK)
- `name`: String (único)
- `description`: String (opcional)
- `price`: Float (opcional, pendiente de definir)
- `isActive`: Boolean (default: true)
- `createdAt`: DateTime

**Templates del MVP:**

1. **Combo Entretenimiento**: Disney+ + HBO Max
2. **Combo Creativo**: Disney+ + Canva Pro
3. **Combo Completo**: Disney+ + HBO Max + Canva Pro

**Relaciones:**

- Uno a muchos con `ComboPlatform`
- Uno a muchos con `Combo`

#### `ComboPlatform`

Tabla de relación muchos-a-muchos entre combos y plataformas.

**Campos:**

- `id`: String (UUID, PK)
- `comboTemplateId`: String (FK)
- `platformId`: String (FK)

**Restricciones:**

- Índice único en `(comboTemplateId, platformId)`

#### `Combo`

Instancias activas de combos por usuario.

**Campos:**

- `id`: String (UUID, PK)
- `userId`: String (FK)
- `comboTemplateId`: String (FK)
- `status`: ComboStatus (default: ACTIVE)
- `priceFinal`: Float
- `createdAt`: DateTime
- `updatedAt`: DateTime

**Estados (ComboStatus):**

- `ACTIVE`: Combo activo
- `CANCELLED`: Combo cancelado
- `SUSPENDED`: Combo suspendido

**Restricciones:**

- Índice único en `(userId, status)` - un combo activo por usuario

---

### 🔐 **Gestión de Cuentas y Perfiles**

#### `Account`

Cuentas principales de cada plataforma.

**Campos:**

- `id`: String (UUID, PK)
- `platformId`: String (FK)
- `email`: String
- `password`: String (encriptado)
- `status`: AccountStatus (default: ACTIVE)
- `maxProfiles`: Int (default: 4)
- `createdAt`: DateTime

**Estados (AccountStatus):**

- `ACTIVE`: Cuenta activa
- `SUSPENDED`: Cuenta suspendida
- `CLOSED`: Cuenta cerrada

**Relaciones:**

- Uno a muchos con `Profile`

#### `Profile`

Perfiles individuales dentro de cada cuenta.

**Campos:**

- `id`: String (UUID, PK)
- `accountId`: String (FK)
- `profileName`: String
- `avatarUrl`: String (opcional)
- `status`: ProfileStatus (default: AVAILABLE)
- `createdAt`: DateTime

**Estados (ProfileStatus):**

- `AVAILABLE`: Perfil disponible para asignar
- `ASSIGNED`: Perfil asignado a un usuario
- `BLOCKED`: Perfil bloqueado

**Capacidades por plataforma:**

- **Disney+**: 4 perfiles por cuenta
- **HBO Max**: 5 perfiles por cuenta
- **Canva Pro**: 3 perfiles por cuenta

**Relaciones:**

- Uno a muchos con `Assignment`

#### `Assignment`

Asignaciones de perfiles a usuarios.

**Campos:**

- `id`: String (UUID, PK)
- `userId`: String (FK)
- `profileId`: String (FK)
- `assignedAt`: DateTime (default: now)
- `releasedAt`: DateTime (opcional)

**Restricciones:**

- Índice único en `(userId, profileId)`

---

### 💰 **Sistema de Pagos**

#### `Payment`

Registro de todos los pagos del sistema.

**Campos:**

- `id`: String (UUID, PK)
- `userId`: String (FK)
- `comboId`: String (FK)
- `amount`: Float
- `currency`: String (default: "MXN")
- `status`: PaymentStatus
- `provider`: String - "stripe" | "mercadopago"
- `externalId`: String (opcional) - ID del proveedor
- `reference`: String
- `metadata`: Json (opcional) - datos adicionales
- `paidAt`: DateTime (opcional)
- `createdAt`: DateTime

**Estados (PaymentStatus):**

- `PENDING`: Pago pendiente
- `PAID`: Pago completado
- `FAILED`: Pago fallido
- `REFUNDED`: Pago reembolsado
- `CANCELLED`: Pago cancelado

#### `Subscription`

Suscripciones activas de los usuarios.

**Campos:**

- `id`: String (UUID, PK)
- `userId`: String (FK)
- `comboId`: String (FK, único)
- `status`: SubscriptionStatus (default: ACTIVE)
- `currentPeriodStart`: DateTime
- `currentPeriodEnd`: DateTime
- `cancelAtPeriodEnd`: Boolean (default: false)
- `createdAt`: DateTime
- `updatedAt`: DateTime

**Estados (SubscriptionStatus):**

- `ACTIVE`: Suscripción activa
- `CANCELLED`: Suscripción cancelada
- `SUSPENDED`: Suscripción suspendida
- `PAST_DUE`: Suscripción con pago vencido

**Relaciones:**

- Uno a muchos con `Renewal`

#### `Renewal`

Intentos de renovación automática.

**Campos:**

- `id`: String (UUID, PK)
- `subscriptionId`: String (FK)
- `amount`: Float
- `currency`: String (default: "MXN")
- `status`: RenewalStatus
- `attemptedAt`: DateTime (default: now)
- `succeededAt`: DateTime (opcional)
- `failureReason`: String (opcional)
- `nextAttemptAt`: DateTime (opcional)

**Estados (RenewalStatus):**

- `SUCCESS`: Renovación exitosa
- `FAILED`: Renovación fallida
- `PENDING`: Renovación pendiente
- `CANCELLED`: Renovación cancelada

**Índices:**

- `(subscriptionId, status)`

---

### 🎁 **Sistema de Referidos**

#### `Referral`

Programa de referidos para crecimiento del usuario.

**Campos:**

- `id`: String (UUID, PK)
- `referrerId`: String (FK) - Usuario que refiere
- `referredId`: String (FK) - Usuario referido
- `code`: String (único) - Código de referido
- `status`: String (default: "PENDING") - "PENDING", "COMPLETED", "EXPIRED"
- `reward`: Float (opcional) - Recompensa para el referrer
- `createdAt`: DateTime
- `completedAt`: DateTime (opcional)

**Restricciones:**

- Índice único en `(referrerId, referredId)`

---

## 🌱 Datos de Seed

El archivo `packages/prisma/seed.ts` está configurado para crear:

### Plataformas (3)

- **Disney+**: Entretenimiento familiar
- **HBO Max**: Series y películas premium
- **Canva Pro**: Herramientas de diseño

### Templates de Combos (3)

- **Combo Entretenimiento**: Disney+ + HBO Max
- **Combo Creativo**: Disney+ + Canva Pro
- **Combo Completo**: Disney+ + HBO Max + Canva Pro

### Cuentas de Ejemplo (3)

- Una cuenta por plataforma con credenciales de ejemplo

### Perfiles Disponibles (12)

- **Disney+**: 4 perfiles
- **HBO Max**: 5 perfiles
- **Canva Pro**: 3 perfiles

---

## 🎯 Características Clave del Diseño

### ✅ **Fortalezas**

1. **Escalabilidad**: Diseño modular que permite agregar más plataformas
   fácilmente
2. **Flexibilidad**: Templates de combos completamente configurables
3. **Control de acceso**: Sistema robusto de asignación y liberación de perfiles
4. **Pagos duales**: Integración con Stripe y MercadoPago
5. **Seguridad**: Contraseñas hasheadas y restricciones por usuario
6. **Referidos**: Sistema completo de códigos y recompensas
7. **Auditabilidad**: Timestamps en todas las operaciones críticas
8. **Integridad**: Restricciones de FK y índices únicos apropiados

### 🔄 **Flujos Principales**

1. **Registro de usuario** → Selección de combo → Asignación de perfiles
2. **Proceso de pago** → Activación de suscripción → Renovaciones automáticas
3. **Gestión de perfiles** → Asignación → Uso → Liberación
4. **Sistema de referidos** → Generación de códigos → Recompensas

### 📊 **Estados del Sistema**

- **Usuario**: Activo con combo asignado
- **Combo**: Activo, cancelado o suspendido
- **Perfiles**: Disponibles, asignados o bloqueados
- **Pagos**: Ciclo completo desde pendiente hasta completado/fallido
- **Suscripciones**: Gestión de estados y renovaciones automáticas

---

## 🚀 Estado Actual

**✅ Completado:**

- Esquema completo de base de datos
- Archivo de seed con datos de ejemplo
- Todas las relaciones y restricciones definidas

**⏳ Pendiente:**

- Aplicar migraciones a la base de datos
- Definir precios finales de los combos
- Implementar lógica de negocio en el backend

**💡 Siguiente paso:**

Ejecutar las migraciones de Prisma para crear la estructura en la base de datos
PostgreSQL.

```bash
# Generar y aplicar migraciones
npx prisma migrate dev --name init

# Ejecutar seed
npx prisma db seed
```

---

## 📝 Notas Técnicas

- **ORM**: Prisma con generación automática de cliente TypeScript
- **Base de datos**: PostgreSQL para producción
- **Encriptación**: Contraseñas hasheadas (implementación pendiente)
- **Moneda**: MXN (Peso mexicano) por defecto
- **UUIDs**: Utilizados como claves primarias para mejor escalabilidad
- **Soft deletes**: No implementados (deletes en cascada)
- **Índices**: Estratégicamente colocados para consultas frecuentes

Esta base de datos está diseñada para soportar el MVP de Club+ de manera robusta
y escalable.
