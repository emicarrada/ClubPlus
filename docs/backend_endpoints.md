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
| GET    | /api/me        | Datos del usuario autenticado     | Sí            |
| POST   | /api/combo     | Crea combo personalizado          | Sí            |
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
    "id": "netflix-id",
    "name": "Netflix",
    "pricePerProfile": 15.9
  },
  {
    "id": "spotify-id",
    "name": "Spotify",
    "pricePerProfile": 9.9
  }
]
```

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
Crea un combo personalizado para el usuario autenticado.

**Diagrama de secuencia:**
![Diagrama POST /api/combo](imgs/Secuence/postcombo.png)

**Parámetros requeridos:**

- `platformIds` (array): Array de IDs de plataformas (entre 2 y 5)

**Ejemplo de petición:**

```json
POST /api/combo
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
{
  "platformIds": ["netflix-id", "spotify-id", "disney-id"]
}
```

**Ejemplo de respuesta:**

```json
{
  "id": "combo-id",
  "userId": 1,
  "platforms": [
    {
      "id": "netflix-id",
      "name": "Netflix",
      "pricePerProfile": 15.9
    },
    {
      "id": "spotify-id",
      "name": "Spotify",
      "pricePerProfile": 9.9
    }
  ],
  "priceFinal": 40,
  "status": "ACTIVE",
  "createdAt": "2025-07-21T10:30:00.000Z"
}
```

**Posibles errores:**

- 400: Número inválido de plataformas o plataformas repetidas
- 409: Ya tienes un combo activo
- 401/403: Problemas de autenticación

---

### GET /api/combo

**Descripción:**  
Obtiene el combo activo del usuario autenticado.

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
  "userId": 1,
  "platforms": [
    {
      "id": "netflix-id",
      "name": "Netflix",
      "pricePerProfile": 15.9
    }
  ],
  "priceFinal": 40,
  "status": "ACTIVE",
  "createdAt": "2025-07-21T10:30:00.000Z"
}
```

**Posibles errores:**

- 404: No tienes combo activo
- 401/403: Problemas de autenticación

---

### PUT /api/combo

**Descripción:**  
Modifica el combo activo del usuario autenticado.

**Diagrama de secuencia:**
![Diagrama PUT /api/combo](imgs/Secuence/putcombo.png)

**Parámetros requeridos:**

- `platformIds` (array): Array de IDs de plataformas (entre 2 y 5)

**Ejemplo de petición:**

```json
PUT /api/combo
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
{
  "platformIds": ["netflix-id", "amazon-prime-id"]
}
```

**Ejemplo de respuesta:**

```json
{
  "id": "combo-id",
  "userId": 1,
  "platforms": [
    {
      "id": "netflix-id",
      "name": "Netflix",
      "pricePerProfile": 15.9
    },
    {
      "id": "amazon-prime-id",
      "name": "Amazon Prime",
      "pricePerProfile": 12.9
    }
  ],
  "priceFinal": 45,
  "status": "ACTIVE",
  "createdAt": "2025-07-21T10:30:00.000Z"
}
```

**Posibles errores:**

- 400: Número inválido de plataformas o plataformas repetidas
- 404: No tienes combo activo
- 401/403: Problemas de autenticación

---

## Notas

- **Autenticación**: Los endpoints protegidos requieren el header `Authorization: Bearer <token>`
- **Margen de precio**: Los combos aplican un margen de 1.55x sobre el precio base de las plataformas
- **Límites de combo**: Cada usuario puede tener solo un combo activo a la vez
- **Validaciones**: No se permiten plataformas duplicadas en un combo
- **Actualización**: Mantén este documento sincronizado con cambios en `apps/backend/src/index.ts`

---
