# Club+

Club+es una plataforma web que permite a usuarios en México acceder a combos personalizados de plataformas digitales (Netflix, Disney+, Spotify, etc.) a precios accesibles. Los usuarios seleccionan dos o más plataformas, pagan mensualmente y reciben perfiles individuales dentro de cuentas administradas por Club+. Todo el proceso es 100% automatizado, desde la compra hasta la asignación de perfiles y renovaciones.

## Arquitectura General

- **Monorepo**: apps/backend (Node.js + Express), apps/frontend (React + Tailwind), packages/prisma (Prisma ORM), automation (n8n workflows)


## Estado Actual del Proyecto

**Estado actual del proyecto (15 de julio de 2025)**

- El backend está iniciado, con estructura en `apps/backend` y archivo principal `src/index.ts`.
- Hay un esquema de base de datos en `packages/prisma/schema.prisma` y migraciones previas.
- El frontend tiene carpeta, pero no se observa estructura ni documentación inicial.
- Existe la carpeta `docs/`, pero solo contiene `frontend_structure.md` (no hay documentos de endpoints, modelos, ni flujos).
- No se visualizan pruebas unitarias ni documentación de despliegue.

---

## Timeline por semanas

### Timeline Fullstack MVP ClubPlus

#### Semana 1: 16–20 julio
**Backend**
- Documentar endpoints existentes (`docs/backend_endpoints.md`).
- Revisar y documentar modelos de base de datos (`docs/db_review.md`).
**Frontend**
- Configurar entorno de desarrollo frontend.
- Crear estructura base del proyecto en frontend.
- Documentar estructura inicial (`docs/frontend_structure.md`).
**Entregables:**
- docs/backend_endpoints.md
- docs/db_review.md
- docs/frontend_structure.md
- Estructura base en frontend

#### Semana 2: 21–27 julio
**Backend**
- Implementar endpoints de registro y login de usuario.
- Pruebas unitarias de autenticación.
- Documentar endpoints y pruebas.
**Frontend**
- Crear pantallas de registro y login.
- Integrar llamadas a los endpoints de autenticación.
- Documentar flujo de autenticación (`docs/auth_flow.md`).
**Entregables:**
- Endpoints y pruebas de autenticación
- Pantallas de registro/login funcionales
- docs/auth_flow.md

#### Semana 3: 28 julio–3 agosto
**Backend**
- Implementar CRUD de combos.
- Migraciones y documentación (`docs/migration_log.md`).
**Frontend**
- Crear pantallas para gestión de combos (listar, crear, editar, eliminar).
- Integrar llamadas a endpoints de combos.
- Documentar uso de combos en frontend (`docs/combos_frontend.md`).
**Entregables:**
- Endpoints y migraciones de combos
- Pantallas de combos funcionales
- docs/combos_frontend.md
- docs/migration_log.md

#### Semana 4: 4–10 agosto
**Backend**
- Implementar CRUD de socios.
- Pruebas unitarias y documentación.
**Frontend**
- Crear pantallas para gestión de socios (listar, crear, editar, eliminar).
- Integrar llamadas a endpoints de socios.
- Documentar uso de socios en frontend (`docs/socios_frontend.md`).
**Entregables:**
- Endpoints y pruebas de socios
- Pantallas de socios funcionales
- docs/socios_frontend.md

#### Semana 5: 11–17 agosto
**Backend**
- Mejorar seguridad y validaciones globales.
- Documentar seguridad (`docs/security.md`).
**Frontend**
- Mejorar validaciones en formularios y manejo de errores.
- Documentar validaciones frontend (`docs/frontend_validations.md`).
**Entregables:**
- Código backend con seguridad mejorada
- docs/security.md
- Formularios frontend con validaciones
- docs/frontend_validations.md

#### Semana 6: 18–24 agosto
**Backend**
- Refactorizar código y ejecutar pruebas integrales.
- Documentar despliegue (`docs/deployment.md`).
**Frontend**
- Refactorizar componentes y estilos.
- Pruebas integrales de flujo completo.
- Documentar despliegue frontend (`docs/frontend_deployment.md`).
**Entregables:**
- Backend refactorizado y probado
- docs/deployment.md
- Frontend refactorizado y probado
- docs/frontend_deployment.md

---

## Indicaciones Claras

- Cada semana debe finalizar con los entregables listados subidos al repositorio.
- La documentación debe estar en la carpeta `docs/` y ser clara para nuevos voluntarios.
- Los endpoints y pantallas deben estar probados y documentados.
- El MVP debe estar listo para pruebas y despliegue al final de la semana 6.
