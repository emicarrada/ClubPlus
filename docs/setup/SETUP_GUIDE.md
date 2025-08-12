# Club+ Setup Guide

Esta guía te ayudará a configurar el entorno de desarrollo local para Club+ MVP.

## 🔧 Pre-requisitos

### Software requerido:

- **Node.js** v18+ - [Descargar aquí](https://nodejs.org/)
- **npm** v9+ (incluido con Node.js)
- **Git** - [Descargar aquí](https://git-scm.com/)
- **VS Code** (recomendado) - [Descargar aquí](https://code.visualstudio.com/)

### Verificar instalaciones:

```bash
node --version    # Debe ser v18+
npm --version     # Debe ser v9+
git --version     # Cualquier versión reciente
```

---

## 📥 Clone del repositorio

```bash
# Clonar el repositorio
git clone https://github.com/emicarrada/ClubPlus.git
cd ClubPlus

# Verificar estructura
ls -la
```

Deberías ver:

```
├── apps/backend/     # Backend API
├── docs/            # Documentación
├── packages/prisma/ # Database schema
├── .github/         # GitHub templates
├── package.json     # Root workspace
└── README.md
```

---

## 📦 Instalación de dependencias

### Instalar todas las dependencias:

```bash
# Desde la raíz del proyecto
npm run install:all
```

O manualmente:

```bash
# Root dependencies
npm install

# Backend dependencies
cd apps/backend && npm install && cd ../..

# Prisma dependencies
cd packages/prisma && npm install && cd ../..
```

---

## 🔐 Variables de entorno

### 1. Backend Environment (.env)

Crear archivo `apps/backend/.env`:

```env
# Database
DATABASE_URL="postgresql://usuario:password@localhost:5432/clubplus_dev"

# Server
NODE_ENV="development"
PORT=3000

# JWT
JWT_SECRET="tu-jwt-secret-super-secreto-aqui"
JWT_EXPIRES_IN="7d"

# CORS
CORS_ORIGIN="http://localhost:3000,http://localhost:5173"

# API Keys (desarrollo)
STRIPE_SECRET_KEY="sk_test_..."
MERCADOPAGO_ACCESS_TOKEN="TEST-..."
```

### 2. Prisma Environment (.env)

Crear archivo `packages/prisma/.env`:

```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/clubplus_dev"
```

---

## 🗄️ Base de datos setup

### Opción 1: PostgreSQL Local

#### Instalar PostgreSQL:

**Ubuntu/Debian:**

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**macOS (Homebrew):**

```bash
brew install postgresql
brew services start postgresql
```

**Windows:** Descargar desde
[postgresql.org](https://www.postgresql.org/download/windows/)

#### Crear base de datos:

```bash
# Acceder a PostgreSQL
sudo -u postgres psql

# Crear usuario y base de datos
CREATE USER clubplus_user WITH ENCRYPTED PASSWORD 'tu_password';
CREATE DATABASE clubplus_dev OWNER clubplus_user;
GRANT ALL PRIVILEGES ON DATABASE clubplus_dev TO clubplus_user;
\q
```

### Opción 2: Docker (Recomendado)

```bash
# Ejecutar PostgreSQL en Docker
docker run --name clubplus-postgres \
  -e POSTGRES_USER=clubplus_user \
  -e POSTGRES_PASSWORD=tu_password \
  -e POSTGRES_DB=clubplus_dev \
  -p 5432:5432 \
  -d postgres:15

# Verificar que funciona
docker ps
```

---

## 🚀 Ejecutar migraciones

```bash
# Generar cliente Prisma
npm run db:migrate

# Ejecutar seeds (datos de ejemplo)
npm run db:seed

# Abrir Prisma Studio para ver datos
npm run db:studio
```

---

## 🏃‍♂️ Iniciar desarrollo

### Iniciar backend:

```bash
# Desde la raíz
npm run dev

# O específicamente el backend
npm run dev:backend
```

El servidor iniciará en `http://localhost:3000`

### Verificar funcionamiento:

```bash
# Health check
curl http://localhost:3000/health
# Debe devolver: OK
```

---

## 🛠️ VS Code Setup

### 1. Instalar extensiones recomendadas:

Al abrir el proyecto en VS Code, aparecerá un popup para instalar extensiones
recomendadas. Acepta todas.

### 2. Configuración automática:

El workspace ya incluye:

- ✅ Formateo automático al guardar
- ✅ ESLint en tiempo real
- ✅ Configuración de debug
- ✅ Tasks predefinidas

### 3. Debug setup:

- Presiona `F5` para ejecutar el debugger del backend
- Coloca breakpoints en el código TypeScript
- El debugger funcionará directamente con código TypeScript

---

## 📝 Scripts disponibles

```bash
# Desarrollo
npm run dev              # Inicia backend
npm run build            # Build del proyecto
npm run test             # Ejecuta tests

# Base de datos
npm run db:migrate       # Ejecuta migraciones
npm run db:seed          # Ejecuta seeds
npm run db:reset         # Resetea la base de datos
npm run db:studio        # Abre Prisma Studio

# Código
npm run lint             # Ejecuta linting
npm run lint:fix         # Corrige errores automáticamente

# Utilidades
npm run clean            # Limpia node_modules y builds
npm run install:all      # Reinstala todas las dependencias
```

---

## ✅ Verificación del setup

### Checklist completo:

- [ ] ✅ Node.js v18+ instalado
- [ ] ✅ Repositorio clonado
- [ ] ✅ Dependencias instaladas (`npm run install:all`)
- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ Base de datos funcionando
- [ ] ✅ Migraciones ejecutadas (`npm run db:migrate`)
- [ ] ✅ Seeds ejecutados (`npm run db:seed`)
- [ ] ✅ Backend iniciando correctamente (`npm run dev`)
- [ ] ✅ Health check respondiendo OK
- [ ] ✅ VS Code con extensiones instaladas
- [ ] ✅ Pre-commit hooks funcionando

### Test final:

```bash
# 1. Backend funcionando
curl http://localhost:3000/health

# 2. Lint pasando
npm run lint

# 3. Build exitoso
npm run build

# 4. Tests pasando (cuando existan)
npm run test
```

---

## 🆘 ¿Problemas?

Si encuentras problemas, consulta:

- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Soluciones a problemas comunes
- [DATABASE_GUIDE.md](./DATABASE_GUIDE.md) - Guía específica de base de datos
- Issues en GitHub del proyecto

---

## 🎉 ¡Listo!

Si todos los pasos fueron exitosos, tu entorno de desarrollo está listo. Puedes
comenzar a desarrollar en Club+ MVP.

**Siguiente paso:** Lee el [DEVELOPMENT_WORKFLOW.md](./DEVELOPMENT_WORKFLOW.md)
para conocer el proceso de desarrollo del equipo.
