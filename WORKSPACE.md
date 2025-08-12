# Club+ MVP - Workspace Configuration

## Estructura del Monorepo

```
Club+/
├── apps/
│   └── backend/          # Backend API (Express + TypeScript)
├── packages/
│   └── prisma/          # Database schema and migrations
├── docs/                # Documentación del proyecto
├── .github/             # GitHub templates y workflows
└── package.json         # Root workspace configuration
```

## Scripts Disponibles

### Desarrollo
```bash
npm run dev              # Inicia el backend en modo desarrollo
npm run dev:backend      # Inicia solo el backend
```

### Build y Producción
```bash
npm run build            # Build del backend
npm run build:backend    # Build específico del backend
npm run start            # Inicia backend en producción
```

### Testing
```bash
npm run test             # Ejecuta todos los tests
npm run test:backend     # Tests del backend
```

### Linting y Formateo
```bash
npm run lint             # Lint de todo el proyecto
npm run lint:fix         # Fix automático de lint issues
npm run lint:backend     # Lint solo del backend
npm run lint:fix:backend # Fix del backend
```

### Base de Datos
```bash
npm run db:migrate       # Ejecuta migraciones pendientes
npm run db:seed          # Ejecuta seeds de la base de datos
npm run db:reset         # Resetea la base de datos
npm run db:studio        # Abre Prisma Studio
```

### Utilidades
```bash
npm run clean            # Limpia node_modules y builds
npm run clean:backend    # Limpia solo el backend
npm run clean:deps       # Limpia dependencias root
npm run install:all      # Instala todas las dependencias
```

## Workspaces Configuration

Este proyecto usa npm workspaces para manejar el monorepo:

- **apps/\***: Aplicaciones principales (backend, frontend futuro)
- **packages/\***: Paquetes compartidos (prisma, shared libs)

### Agregar un nuevo workspace

```bash
# Crear nueva app
mkdir apps/nueva-app
cd apps/nueva-app
npm init -y

# Crear nuevo package
mkdir packages/nuevo-package
cd packages/nuevo-package
npm init -y
```

### Comandos de workspace

```bash
# Ejecutar comando en workspace específico
npm run dev --workspace=apps/backend

# Instalar dependencia en workspace específico
npm install express --workspace=apps/backend

# Instalar dependencia en todos los workspaces
npm install lodash --workspaces
```

## Dependencias Compartidas

Las siguientes dependencias están instaladas a nivel root y compartidas:

- **TypeScript**: Compilador TypeScript
- **ESLint**: Linting de código
- **Prettier**: Formateo de código
- **Husky**: Git hooks
- **Lint-staged**: Lint en staged files
- **Commitlint**: Validación de commits

## Configuración de Desarrollo

Para setup inicial:

```bash
# 1. Instalar todas las dependencias
npm run install:all

# 2. Configurar base de datos
npm run db:migrate
npm run db:seed

# 3. Iniciar desarrollo
npm run dev
```

## Variables de Entorno

Cada workspace maneja sus propias variables de entorno:

- **Backend**: `apps/backend/.env`
- **Prisma**: `packages/prisma/.env`

## Scripts de Mantenimiento

```bash
# Actualizar todas las dependencias
npm update --workspaces

# Auditar dependencias
npm audit --workspaces

# Limpiar completamente y reinstalar
npm run clean && npm run install:all
```
