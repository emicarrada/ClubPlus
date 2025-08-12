# Database Guide

Guía completa para el manejo de la base de datos de Club+ MVP usando Prisma ORM.

## 🗄️ Arquitectura de base de datos

### Stack tecnológico

- **Database**: PostgreSQL 15+
- **ORM**: Prisma
- **Migrations**: Prisma Migrate
- **Seeding**: Prisma Seeds
- **GUI**: Prisma Studio

### Estructura del proyecto

```
packages/prisma/
├── schema.prisma     # Schema principal
├── migrations/       # Historial de migraciones
├── seed.ts          # Datos de prueba
└── package.json     # Dependencias
```

---

## 🔧 Comandos de Prisma

### Comandos básicos

```bash
# Generar cliente Prisma (después de cambios al schema)
npm run db:generate

# Ejecutar migraciones pendientes
npm run db:migrate

# Resetear base de datos (PELIGROSO)
npm run db:reset

# Abrir Prisma Studio
npm run db:studio

# Ejecutar seeds
npm run db:seed
```

### Comandos avanzados

```bash
# Crear migración sin ejecutar
npx prisma migrate dev --create-only

# Ejecutar migración específica
npx prisma migrate deploy

# Ver estado de migraciones
npx prisma migrate status

# Generar SQL desde schema
npx prisma db push --preview-feature
```

---

## 📝 Schema Management

### Estructura del schema.prisma

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}
```

### Buenas prácticas

- **Naming**: usar camelCase para campos, snake_case para tablas
- **IDs**: usar `cuid()` para IDs únicos
- **Timestamps**: incluir `createdAt` y `updatedAt` en todos los modelos
- **Relations**: definir claramente las relaciones
- **Indexes**: agregar índices para campos de consulta frecuente

---

## 🔄 Migration Workflow

### 1. Desarrollo de schema

```bash
# 1. Editar schema.prisma
# 2. Crear y ejecutar migración
npx prisma migrate dev --name add_user_table

# 3. Verificar migración generada
ls packages/prisma/migrations/
```

### 2. Revisión de migración

```sql
-- Ejemplo: 20231201120000_add_user_table/migration.sql
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
```

### 3. Deploy a producción

```bash
# Solo ejecutar migraciones (no generar nuevas)
npx prisma migrate deploy
```

---

## 🌱 Seeding Process

### Archivo seed.ts

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Limpiar datos existentes
  await prisma.user.deleteMany();

  // Crear usuarios de prueba
  const users = await prisma.user.createMany({
    data: [
      {
        email: 'admin@clubplus.com',
        name: 'Admin User',
      },
      {
        email: 'test@clubplus.com',
        name: 'Test User',
      },
    ],
  });

  console.log('Created users:', users);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Ejecutar seeds

```bash
# Ejecutar seeds
npm run db:seed

# Reset completo + seeds
npm run db:reset
```

---

## 🔍 Consultas con Prisma Client

### Operaciones básicas

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// CREATE
const user = await prisma.user.create({
  data: {
    email: 'nuevo@example.com',
    name: 'Nuevo Usuario',
  },
});

// READ
const users = await prisma.user.findMany();
const user = await prisma.user.findUnique({
  where: { email: 'admin@clubplus.com' },
});

// UPDATE
const updatedUser = await prisma.user.update({
  where: { id: 'user-id' },
  data: { name: 'Nombre Actualizado' },
});

// DELETE
await prisma.user.delete({
  where: { id: 'user-id' },
});
```

### Consultas avanzadas

```typescript
// Relaciones
const userWithPosts = await prisma.user.findUnique({
  where: { id: 'user-id' },
  include: {
    posts: true,
    profile: true,
  },
});

// Filtros
const activeUsers = await prisma.user.findMany({
  where: {
    active: true,
    createdAt: {
      gte: new Date('2023-01-01'),
    },
  },
  orderBy: {
    createdAt: 'desc',
  },
  take: 10,
});

// Agregaciones
const userCount = await prisma.user.count();
const avgAge = await prisma.user.aggregate({
  _avg: { age: true },
});
```

---

## 💾 Backup Procedures

### Backup automático (Producción)

Railway automáticamente hace backups diarios de la base de datos.

### Backup manual

```bash
# Backup completo
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup solo estructura
pg_dump --schema-only $DATABASE_URL > schema_backup.sql

# Backup solo datos
pg_dump --data-only $DATABASE_URL > data_backup.sql
```

### Restore desde backup

```bash
# Restore completo
psql $DATABASE_URL < backup_file.sql

# Restore específico
pg_restore -d $DATABASE_URL backup_file.dump
```

---

## 🔄 Schema Changes Process

### Proceso para cambios de schema

1. **Planificación**
   - Documentar cambios necesarios
   - Revisar impacto en código existente
   - Planificar migración de datos si es necesario

2. **Desarrollo local**

   ```bash
   # Editar schema.prisma
   # Crear migración
   npx prisma migrate dev --name descriptive_change_name
   ```

3. **Testing**

   ```bash
   # Probar migración
   npm run db:reset
   npm run test
   ```

4. **Code review**
   - Revisar cambios en schema.prisma
   - Revisar SQL generado en migración
   - Verificar código que usa los cambios

5. **Deploy**
   ```bash
   # En producción
   npx prisma migrate deploy
   ```

### Cambios que requieren cuidado especial

- **Eliminar columnas**: Puede romper código existente
- **Cambiar tipos**: Puede requerir migración de datos
- **Agregar restricciones**: Puede fallar si datos existentes no cumplen
- **Renombrar**: Requiere migración manual

---

## 🔧 Performance Optimization

### Índices

```prisma
model User {
  id    String @id @default(cuid())
  email String @unique // Automáticamente indexado
  name  String

  // Índice compuesto
  @@index([email, name])
  // Índice único compuesto
  @@unique([email, externalId])
}
```

### Query optimization

```typescript
// ❌ Malo: N+1 queries
const users = await prisma.user.findMany();
for (const user of users) {
  const posts = await prisma.post.findMany({
    where: { userId: user.id },
  });
}

// ✅ Bueno: Una sola query con include
const users = await prisma.user.findMany({
  include: { posts: true },
});

// ✅ Bueno: Pagination
const users = await prisma.user.findMany({
  take: 20,
  skip: page * 20,
});
```

---

## 🚨 Troubleshooting

### Problemas comunes

**Error: "Database does not exist"**

```bash
# Crear base de datos
npx prisma db push
```

**Error: "Migration failed"**

```bash
# Ver estado de migraciones
npx prisma migrate status

# Marcar migración como aplicada
npx prisma migrate resolve --applied "migration_name"
```

**Error: "Schema out of sync"**

```bash
# Regenerar cliente
npx prisma generate
```

**Error de conexión**

```bash
# Verificar DATABASE_URL
echo $DATABASE_URL

# Probar conexión
npx prisma db pull
```

### Logs de debug

```typescript
// Habilitar logs de queries
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

---

## 🧪 Testing con base de datos

### Test database setup

```typescript
// tests/setup.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_TEST_URL,
    },
  },
});

beforeEach(async () => {
  // Limpiar datos antes de cada test
  await prisma.$transaction([
    prisma.user.deleteMany(),
    prisma.post.deleteMany(),
  ]);
});
```

### Test helpers

```typescript
// tests/helpers/database.ts
export async function createTestUser() {
  return await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
    },
  });
}

export async function cleanDatabase() {
  const tables = ['users', 'posts', 'profiles'];

  for (const table of tables) {
    await prisma.$executeRawUnsafe(`DELETE FROM "${table}"`);
  }
}
```

---

## 📊 Monitoring

### Métricas importantes

- **Connection pool**: Conexiones activas/idle
- **Query time**: Tiempo promedio de queries
- **Slow queries**: Queries que toman >1s
- **Database size**: Crecimiento de datos

### Alertas recomendadas

- Connection pool > 80% utilizado
- Query time promedio > 500ms
- Errors rate > 1%
- Database size creciendo >10% diario

---

## 📚 Referencias

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Database Design Best Practices](https://www.prisma.io/dataguide)

---

**¿Problemas con la base de datos?** Consulta el
[TROUBLESHOOTING.md](./TROUBLESHOOTING.md) o crea un issue en GitHub.
