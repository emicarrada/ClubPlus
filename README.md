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

## Timeline Fullstack MVP ClubPlus (Checklist y Seguimiento Semanal)

### Avances Completados

**Backend**

- [x] Requerimientos y visión del producto
- [x] Propuesta de arquitectura y modelo de datos
- [x] Estructura de carpetas del monorepo
- [x] Esquema Prisma y configuración de PostgreSQL
- [x] Instalación de dependencias backend
- [x] Creación de usuario y base de datos PostgreSQL
- [x] Migraciones Prisma ejecutadas correctamente
- [x] Cliente Prisma generado
- [x] Documentar endpoints existentes (`docs/backend_endpoints.md`)
- [x] Revisar y documentar modelos de base de datos (`docs/db_review.md`)
- [x] Registro de usuario (`/api/register`)
- [x] Login de usuario con JWT (`/api/login`)
- [x] Consulta de plataformas (`/api/platforms`)
- [x] Middleware JWT implementado
- [x] Endpoint protegido de ejemplo (`/api/me`)
- [x] Tipado seguro en TypeScript
- [x] Modelo de combos actualizado en Prisma
- [x] Migración aplicada y cliente Prisma actualizado
- [x] Endpoints para crear, ver y modificar combo personalizado (`/api/combo`)
- [x] Validación de reglas de negocio (mínimo 2, máximo 5 plataformas, sin repetidas)
- [x] Cálculo automático de precio final con margen

**Frontend**

- [x] Configurar entorno de desarrollo frontend
- [x] Crear estructura base del proyecto en `apps/frontend/`
- [x] Documentar estructura inicial (`docs/frontend_structure.md`)

---

### Semana 1: 16–22 julio 2025

**Backend**

- [ ] Implementar endpoints de registro y login de usuario (mejoras)
- [ ] Pruebas unitarias de autenticación
- [ ] Documentar endpoints y pruebas

**Frontend**

- [ ] Crear pantallas de registro y login
- [ ] Integrar llamadas a los endpoints de autenticación
- [ ] Documentar flujo de autenticación (`docs/auth_flow.md`)

---

### Semana 2: 23–29 julio 2025

**Backend**

- [ ] Implementar CRUD de combos (mejoras)
- [ ] Migraciones y documentación (`docs/migration_log.md`)

**Frontend**

- [ ] Crear pantallas para gestión de combos (listar, crear, editar, eliminar)
- [ ] Integrar llamadas a endpoints de combos
- [ ] Documentar uso de combos en frontend (`docs/combos_frontend.md`)

---

### Semana 3: 30 julio–5 agosto 2025

**Backend**

- [ ] Implementar CRUD de socios
- [ ] Pruebas unitarias y documentación

**Frontend**

- [ ] Crear pantallas para gestión de socios (listar, crear, editar, eliminar)
- [ ] Integrar llamadas a endpoints de socios
- [ ] Documentar uso de socios en frontend (`docs/socios_frontend.md`)

---

### Semana 4: 6–12 agosto 2025

**Backend**

- [ ] Integración con Stripe/MercadoPago
- [ ] Webhooks para pagos y renovaciones
- [ ] Mejorar seguridad y validaciones globales
- [ ] Documentar seguridad (`docs/security.md`)

**Frontend**

- [ ] Mejorar validaciones en formularios y manejo de errores
- [ ] Documentar validaciones frontend (`docs/frontend_validations.md`)

---

### Semana 5: 13–19 agosto 2025

**Backend**

- [ ] Lógica para asignar perfiles disponibles
- [ ] Integración con n8n para automatización
- [ ] Envío de emails y WhatsApp
- [ ] Flujos automáticos de renovación y suspensión
- [ ] Endpoints para dashboard de usuario
- [ ] Panel interno de administración

**Frontend**

- [ ] Refactorizar componentes y estilos
- [ ] Pruebas integrales de flujo completo
- [ ] Documentar despliegue frontend (`docs/frontend_deployment.md`)

---

### Semana 6: 20–26 agosto 2025

**Backend**

- [ ] Refactorizar código y ejecutar pruebas integrales
- [ ] Documentar despliegue (`docs/deployment.md`)

**Frontend**

- [ ] Documentar despliegue frontend (`docs/frontend_deployment.md`)

---

**Indicaciones:**
- Cada semana debe finalizar con los entregables listados subidos al repositorio.
- La documentación debe estar en la carpeta `docs/` y ser clara para nuevos voluntarios.
- Los endpoints y pantallas deben estar probados y documentados.
- El MVP debe estar listo para pruebas y despliegue al final de la semana 6.

