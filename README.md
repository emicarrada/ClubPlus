# Club+

Club+ es una plataforma web que permite a usuarios en México acceder a combos personalizados de plataformas digitales (Netflix, Disney+, Spotify, etc.) a precios accesibles. Los usuarios seleccionan dos o más plataformas, pagan mensualmente y reciben perfiles individuales dentro de cuentas administradas por Club+. Todo el proceso es 100% automatizado, desde la compra hasta la asignación de perfiles y renovaciones.

## Arquitectura General

- **Monorepo**: apps/backend (Node.js + Express), apps/frontend (React + Tailwind), packages/prisma (Prisma ORM), automation (n8n workflows)
- **Base de datos**: PostgreSQL
- **ORM**: Prisma
- **Backend**: Node.js + Express (TypeScript)
- **Frontend**: React + Tailwind CSS (Vercel)
- **Automatización**: n8n (self-hosted o cloud)
- **Pagos**: Stripe o MercadoPago
- **Notificaciones**: Email (SMTP/Resend) y WhatsApp (Twilio/Gupshup)
- **Autenticación**: JWT

## Timeline de Desarrollo y Checklist

### 1. Definición y Arquitectura
- [x] Requerimientos y visión del producto
- [x] Propuesta de arquitectura y modelo de datos

### 2. Setup Inicial
- [x] Estructura de carpetas del monorepo
- [x] Esquema Prisma y configuración de PostgreSQL
- [x] Instalación de dependencias backend

### 3. Base de Datos y Backend
- [x] Creación de usuario y base de datos PostgreSQL
- [x] Migraciones Prisma ejecutadas correctamente
- [x] Cliente Prisma generado

### 4. Endpoints Básicos y Autenticación
- [x] Registro de usuario (`/api/register`)
- [x] Login de usuario con JWT (`/api/login`)
- [x] Consulta de plataformas (`/api/platforms`)

### 5. Seguridad y Protección de Rutas
- [x] Middleware JWT implementado
- [x] Endpoint protegido de ejemplo (`/api/me`)
- [x] Tipado seguro en TypeScript

### 6. Gestión de Combos y Selección de Plataformas
- [ ] Endpoints para crear combos personalizados
- [ ] Validación de reglas de negocio (mínimo 2 plataformas)

### 7. Pagos y Suscripciones
- [ ] Integración con Stripe/MercadoPago
- [ ] Webhooks para pagos y renovaciones

### 8. Asignación Automática de Perfiles
- [ ] Lógica para asignar perfiles disponibles
- [ ] Integración con n8n para automatización

### 9. Notificaciones y Automatización
- [ ] Envío de emails y WhatsApp
- [ ] Flujos automáticos de renovación y suspensión

### 10. Dashboard y Panel de Administración
- [ ] Endpoints para dashboard de usuario
- [ ] Panel interno de administración

---

## ¿Cómo saber qué está completo?
- Todo lo marcado con `[x]` está implementado y probado.
- Los puntos `[ ]` son los siguientes pasos a desarrollar.

---

## ¿Qué sigue?
- Implementar endpoints para combos y selección de plataformas.
- Integrar pagos y automatizaciones.
- Desarrollar dashboard y panel de administración.

---

Club+ está diseñado para ser escalable, seguro y 100% automatizado desde el MVP.
