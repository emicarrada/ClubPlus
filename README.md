# Club+

Club+ es una plataforma web que permite a usuarios en México acceder a combos personalizados de plataformas digitales (Netflix, Disney+, Spotify, etc.) a precios accesibles. Los usuarios seleccionan dos o más plataformas, pagan mensualmente y reciben perfiles individuales dentro de cuentas administradas por Club+. Todo el proceso es 100% automatizado, desde la compra hasta la asignación de perfiles y renovaciones.

## Arquitectura General

- **Monorepo**: apps/backend (Node.js + Express), apps/frontend (React + Tailwind), packages/prisma (Prisma ORM), automation (n8n workflows)
- **Base de datos**: PostgreSQL
- **ORM**: Prisma
- **Backend**: Node.js + Express (TypeScript)
- **Frontend**: React + Tailwind CSS (Vercel)
- [x] Documentar endpoints existentes (`docs/backend_endpoints.md`)
- [x] Revisar y documentar modelos de base de datos (`docs/db_review.md`)
- [x] Registro de usuario (`/api/register`)
- [x] Endpoint protegido de ejemplo (`/api/me`)
- [x] Modelo de combos actualizado en Prisma
- [x] Migración aplicada y cliente Prisma actualizado
- [x] Endpoints para crear, ver y modificar combo personalizado (`/api/combo`)
- [x] Validación de reglas de negocio (mínimo 2, máximo 5 plataformas, sin repetidas)
- [x] Cálculo automático de precio final con margen
- [x] Configurar entorno de desarrollo frontend
- [x] Crear estructura base del proyecto en `apps/frontend/`
- [x] Documentar estructura inicial (`docs/frontend_structure.md`)
### Semana 1: 16–22 julio 2025
**Backend**

- [ ] Implementar endpoints de registro y login de usuario (mejoras)
- [ ] Pruebas unitarias de autenticación
- [ ] Documentar endpoints y pruebas

- [ ] Crear pantallas de registro y login
- [ ] Integrar llamadas a los endpoints de autenticación


**Backend**

- [ ] Implementar CRUD de combos (mejoras)
- [ ] Migraciones y documentación (`docs/migration_log.md`)

- [ ] Crear pantallas para gestión de combos (listar, crear, editar, eliminar)
- [ ] Integrar llamadas a endpoints de combos


**Backend**

- [ ] Implementar CRUD de socios
- [ ] Pruebas unitarias y documentación
- [ ] Integrar llamadas a endpoints de socios
- [ ] Documentar uso de socios en frontend (`docs/socios_frontend.md`)

### Semana 4: 6–12 agosto 2025
**Backend**

- [ ] Integración con Stripe/MercadoPago
- [ ] Webhooks para pagos y renovaciones
- [ ] Mejorar seguridad y validaciones globales

---


- [ ] Integración con n8n para automatización
- [ ] Envío de emails y WhatsApp
- [ ] Flujos automáticos de renovación y suspensión
- [ ] Endpoints para dashboard de usuario
- [ ] Panel interno de administración

- [ ] Refactorizar componentes y estilos
- [ ] Pruebas integrales de flujo completo


### Semana 6: 20–26 agosto 2025
- [ ] Documentar despliegue (`docs/deployment.md`)

**Frontend**

- [ ] Documentar despliegue frontend (`docs/frontend_deployment.md`)

---

**Indicaciones:**
- Cada semana debe finalizar con los entregables listados subidos al repositorio.
- La documentación debe estar en la carpeta `docs/` y ser clara para nuevos voluntarios.
- Los endpoints y pantallas deben estar probados y documentados.
- El MVP debe estar listo para pruebas y despliegue al final de la semana 6.

