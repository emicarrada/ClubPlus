# Documentación de Endpoints del Backend

Documento detallado con la descripción de todos los endpoints existentes.

## Descripción

Este documento describe los endpoints implementados hasta ahora con todas sus características (método HTTP, ruta, parámetros requeridos, respuesta esperada, posibles errores y ejemplos de uso)

## Objetivo

El objetivo es que cualquier desarrollador o voluntario pueda entender y consumir la API sin necesidad de leer el código fuente.

## Ubicación

El código fuente de los endpoints se encuentra en `apps/backend/src/index.ts`

## Configuración del Servidor

- **Puerto por defecto**: 3001
- **Variable de entorno**: `PORT`
- **JWT Secret**: Variable `JWT_SECRET` (default: 'clubplusdev')
- **Base de datos**: Prisma con configuración en `.env`

## Headers Requeridos

Para endpoints protegidos:

- `Authorization: Bearer <token>`
- `Content-Type: application/json` (para POST/PUT)

## Tabla de Contenidos

- [GET /health](#get-health)
- [POST /api/register](#post-apiregister)
- [POST /api/login](#post-apilogin)
- [GET /api/platforms](#get-apiplatforms)
- [GET /api/plans](#get-apiplans)
- [GET /api/me](#get-apime)
- [POST /api/combo](#post-apicombo)
- [GET /api/combo](#get-apicombo)
- [PUT /api/combo](#put-apicombo)

## Tabla Resumen de Endpoints

| Método | Ruta           | Descripción                       | Autenticación |
| ------ | -------------- | --------------------------------- | ------------- |
| GET    | /health        | Verifica estado del servidor      | No            |
| POST   | /api/register  | Registra un nuevo usuario         | No            |
| POST   | /api/login     | Inicia sesión de usuario          | No            |
| GET    | /api/platforms | Obtiene lista de plataformas      | No            |
| GET    | /api/plans     | Obtiene lista de planes activos   | No            |
| GET    | /api/me        | Datos del usuario autenticado     | Sí            |
| POST   | /api/combo     | Crea combo fijo (MVP)             | Sí            |
| GET    | /api/combo     | Obtiene combo activo del usuario  | Sí            |
| PUT    | /api/combo     | Modifica combo activo del usuario | Sí            |

---

## Códigos de Estado HTTP

- 200: Operación exitosa
- 201: Recurso creado exitosamente
- 400: Error de validación o datos incorrectos
- 401: No autorizado (token faltante)
- 403: Prohibido (token inválido)
- 404: Recurso no encontrado
- 409: Conflicto (recurso ya existe)
- 500: Error interno del servidor

---

## Ejemplos Detallados de Uso

### GET /health

**Descripción:**  
Verifica que el servidor esté funcionando correctamente.

**Diagrama de secuencia:**
![Diagrama GET /health](imgs/Secuence/gethealth.png)

**Ejemplo de petición:**

```http
GET /health
```

**Ejemplo de respuesta:**

```json
{
  "status": "ok",
  "date": "2025-07-21T10:30:00.000Z"
}
```

---

### POST /api/register

**Descripción:**  
Registra un nuevo usuario en el sistema.

**Diagrama de secuencia:**
![Diagrama POST /api/register](imgs/Secuence/postregister.png)

**Parámetros requeridos:**

- `email` (string): Correo electrónico del usuario
- `password` (string): Contraseña del usuario
- `name` (string): Nombre del usuario
- `phone` (string, opcional): Teléfono del usuario

**Ejemplo de petición:**

```json
POST /api/register
{
  "email": "usuario@ejemplo.com",
  "password": "123456",
  "name": "Juan Pérez",
  "phone": "+51987654321"
}
```

**Ejemplo de respuesta:**

```json
{
  "id": 1,
  "email": "usuario@ejemplo.com",
  "name": "Juan Pérez",
  "phone": "+51987654321"
}
```

**Posibles errores:**

- 400: Faltan campos obligatorios
- 409: El correo ya está registrado
- 500: Error interno del servidor

---

### POST /api/login

**Descripción:**  
Permite al usuario iniciar sesión y obtener un token JWT.

**Diagrama de secuencia:**
![Diagrama POST /api/login](imgs/Secuence/postlogin.png)

**Parámetros requeridos:**

- `email` (string): Correo electrónico
- `password` (string): Contraseña

**Ejemplo de petición:**

```json
POST /api/login
{
  "email": "usuario@ejemplo.com",
  "password": "123456"
}
```

**Ejemplo de respuesta:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "usuario@ejemplo.com",
    "name": "Juan Pérez",
    "phone": "+51987654321"
  }
}
```

**Posibles errores:**

- 400: Faltan campos obligatorios
- 401: Credenciales inválidas
- 500: Error interno del servidor

---

### GET /api/platforms

**Descripción:**  
Obtiene la lista de todas las plataformas disponibles para crear combos.

**Diagrama de secuencia:**
![Diagrama GET /api/platforms](imgs/Secuence/getplatforms.png)

**Ejemplo de petición:**

```http
GET /api/platforms
```

**Ejemplo de respuesta:**

```json
[
  {
    "id": "canva-pro-id",
    "name": "Canva Pro",
    "logoUrl": "https://canva.com/logo.png",
    "pricePerProfile": 12.99
  },
  {
    "id": "hbo-max-id",
    "name": "HBO Max",
    "logoUrl": "https://hbomax.com/logo.png",
    "pricePerProfile": 15.99
  },
  {
    "id": "disney-plus-id",
    "name": "Disney+",
    "logoUrl": "https://disneyplus.com/logo.png",
    "pricePerProfile": 10.99
  }
]
```

---

### GET /api/plans

**Descripción:**  
Obtiene la lista de todos los planes activos disponibles para contratar. Cada plan incluye información de la plataforma asociada.

**Ejemplo de petición:**

```http
GET /api/plans
```

**Ejemplo de respuesta:**

```json
[
  {
    "id": "plan-creativo-id",
    "name": "Plan Creativo",
    "description": "Perfecto para diseñadores y creadores de contenido",
    "price": 9.99,
    "isActive": true,
    "platform": {
      "id": "canva-pro-id",
      "name": "Canva Pro",
      "logoUrl": "https://canva.com/logo.png",
      "pricePerProfile": 12.99
    }
  },
  {
    "id": "plan-entretenimiento-id",
    "name": "Plan Entretenimiento",
    "description": "Lo mejor en series y películas de HBO",
    "price": 12.99,
    "isActive": true,
    "platform": {
      "id": "hbo-max-id",
      "name": "HBO Max",
      "logoUrl": "https://hbomax.com/logo.png",
      "pricePerProfile": 15.99
    }
  },
  {
    "id": "plan-familiar-id",
    "name": "Plan Familiar",
    "description": "Contenido para toda la familia con Disney+",
    "price": 8.99,
    "isActive": true,
    "platform": {
      "id": "disney-plus-id",
      "name": "Disney+",
      "logoUrl": "https://disneyplus.com/logo.png",
      "pricePerProfile": 10.99
    }
  }
]
```

**Posibles errores:**

- 500: Error interno del servidor

---

### GET /api/me

**Descripción:**  
Obtiene los datos del usuario autenticado.

**Diagrama de secuencia:**
![Diagrama GET /api/me](imgs/Secuence/getme.png)

**Ejemplo de petición:**

```http
GET /api/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Ejemplo de respuesta:**

```json
{
  "id": 1,
  "email": "usuario@ejemplo.com",
  "name": "Juan Pérez",
  "phone": "+51987654321"
}
```

**Posibles errores:**

- 401: Token requerido
- 403: Token inválido
- 404: Usuario no encontrado

---


### POST /api/combo

**Descripción:**  
Crea un combo para el usuario autenticado basado en uno de los 3 planes disponibles en el MVP:

- Plan Creativo (Canva Pro): $9.99
- Plan Entretenimiento (HBO Max): $12.99  
- Plan Familiar (Disney+): $8.99

**Diagrama de secuencia:**
![Diagrama POST /api/combo](imgs/Secuence/postcombo.png)

**Parámetros requeridos:**

- `planId` (string): ID del plan que se desea contratar

**Ejemplo de petición:**

```json
POST /api/combo
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
{
  "planId": "plan-creativo-id"
}
```

**Ejemplo de respuesta:**

```json
{
  "id": "combo-id",
  "userId": "user-id",
  "plan": {
    "id": "plan-creativo-id",
    "name": "Plan Creativo",
    "description": "Perfecto para diseñadores y creadores de contenido",
    "price": 9.99,
    "platform": {
      "id": "canva-pro-id",
      "name": "Canva Pro",
      "logoUrl": "https://canva.com/logo.png",
      "pricePerProfile": 12.99
    }
  },
  "priceFinal": 9.99,
  "status": "ACTIVE",
  "createdAt": "2025-07-24T10:30:00.000Z"
}
```

**Posibles errores:**

- 400: planId es requerido
- 404: Plan no encontrado o inactivo
- 409: Ya tienes un combo activo
- 401/403: Problemas de autenticación

---

### GET /api/combo

**Descripción:**  
Obtiene el combo activo del usuario autenticado con información detallada del plan y plataforma contratados.

**Diagrama de secuencia:**
![Diagrama GET /api/combo](imgs/Secuence/getcombo.png)

**Ejemplo de petición:**

```http
GET /api/combo
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Ejemplo de respuesta:**

```json
{
  "id": "combo-id",
  "userId": "user-id",
  "plan": {
    "id": "plan-entretenimiento-id",
    "name": "Plan Entretenimiento",
    "description": "Lo mejor en series y películas de HBO",
    "price": 12.99,
    "platform": {
      "id": "hbo-max-id",
      "name": "HBO Max",
      "logoUrl": "https://hbomax.com/logo.png",
      "pricePerProfile": 15.99
    }
  },
  "priceFinal": 12.99,
  "status": "ACTIVE",
  "createdAt": "2025-07-24T10:30:00.000Z"
}
```

**Posibles errores:**

- 404: No tienes combo activo
- 401/403: Problemas de autenticación

---

### PUT /api/combo

**Descripción:**  
Modifica el combo activo del usuario autenticado, cambiando a un plan diferente de los 3 disponibles en el MVP.

**Diagrama de secuencia:**
![Diagrama PUT /api/combo](imgs/Secuence/putcombo.png)

**Parámetros requeridos:**

- `planId` (string): ID del nuevo plan al que se desea cambiar

**Ejemplo de petición:**

```json
PUT /api/combo
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
{
  "planId": "plan-familiar-id"
}
```

**Ejemplo de respuesta:**

```json
{
  "id": "combo-id",
  "userId": "user-id",
  "plan": {
    "id": "plan-familiar-id",
    "name": "Plan Familiar",
    "description": "Contenido para toda la familia con Disney+",
    "price": 8.99,
    "platform": {
      "id": "disney-plus-id",
      "name": "Disney+",
      "logoUrl": "https://disneyplus.com/logo.png",
      "pricePerProfile": 10.99
    }
  },
  "priceFinal": 8.99,
  "status": "ACTIVE",
  "createdAt": "2025-07-24T10:30:00.000Z"
}
```

**Posibles errores:**

- 400: planId es requerido
- 404: Plan no encontrado, inactivo o no tienes combo activo
- 401/403: Problemas de autenticación

---

## Notas para el MVP

- **Autenticación**: Los endpoints protegidos requieren el header `Authorization: Bearer <token>`
- **Planes disponibles**: Solo 3 planes fijos: Plan Creativo (Canva Pro), Plan Entretenimiento (HBO Max), Plan Familiar (Disney+)
- **Precios fijos**: Cada plan tiene un precio fijo sin márgenes adicionales
- **Límites de combo**: Cada usuario puede tener solo un combo activo a la vez
- **Simplicidad**: El MVP se enfoca en 3 plataformas específicas para validar el modelo de negocio
- **Validaciones**: No se permiten plataformas duplicadas en un combo
- **Actualización**: Mantén este documento sincronizado con cambios en `apps/backend/src/index.ts`

---
