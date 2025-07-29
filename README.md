# Club+ MVP

Club+ es una plataforma web que permite a usuarios en México acceder a combos prediseñados de plataformas digitales compartidas a precios accesibles.

## 🎯 MVP - Combos Disponibles

- **Combo Entretenimiento**: Disney+ + HBO Max
- **Combo Creativo**: Disney+ + Canva Pro  
- **Combo Completo**: Disney+ + HBO Max + Canva Pro (3 plataformas)

## 🛠️ Stack Tecnológico

- **Frontend**: React + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Base de datos**: PostgreSQL + Prisma ORM
- **Autenticación**: JWT
- **Pagos**: Stripe/MercadoPago
- **Automatización**: n8n
- **Despliegue**: Railway

## 📁 Estructura del Proyecto

```
Club+/
├── apps/
│   ├── backend/          # API REST con Node.js + Express
│   └── frontend/         # React + Tailwind CSS
├── packages/
│   └── prisma/          # Esquema de base de datos y migraciones
├── automation/          # Workflows de n8n
└── docs/               # Documentación técnica
```

## 🚀 Inicio Rápido

### Requisitos
- Node.js 18+
- PostgreSQL
- npm o yarn

### Instalación
```bash
# Clonar repositorio
git clone <repo-url>
cd Club+

# Instalar dependencias
npm install

# Configurar base de datos
cd packages/prisma
cp .env.example .env
# Editar .env con tu DATABASE_URL

# Ejecutar migraciones
npx prisma migrate dev

# Seed inicial
npx prisma db seed

# Iniciar backend
cd ../../apps/backend
npm run dev

# Iniciar frontend (nueva terminal)
cd ../frontend
npm run dev
```

## 📊 Estado del Proyecto

**Versión**: MVP 1.0  
**Fecha**: Julio 2025  
**Estado**: En desarrollo

### ✅ Completado
- [ ] Estructura base del proyecto
- [ ] Esquema de base de datos
- [ ] Autenticación JWT
- [ ] CRUD de combos
- [ ] Frontend básico

### 🚧 En progreso
- [ ] Integración de pagos
- [ ] Automatizaciones n8n
- [ ] Dashboard de usuario
- [ ] Panel administrativo

### 📋 Por hacer
- [ ] Sistema de referidos
- [ ] Notificaciones
- [ ] Testing
- [ ] Despliegue

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE)
