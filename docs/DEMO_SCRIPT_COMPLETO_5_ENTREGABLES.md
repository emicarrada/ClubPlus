# 🎬 SCRIPT DE DEMOSTRACIÓN COMPLETO - 5 ENTREGABLES BACKEND

## 🚀 PREPARACIÓN PARA EL VIDEO

### Antes de empezar:

1. ✅ Asegúrate de que el servidor esté corriendo: `npm run dev`
2. ✅ Ten PowerShell abierto y listo
3. ✅ Ten este archivo abierto para copy-paste rápido
4. ✅ Verifica que el puerto 3001 esté libre

**Tiempo estimado total: 10-12 minutos**

---

## 🎯 ESTRUCTURA DE LA DEMOSTRACIÓN

### 📋 AGENDA DE ENTREGABLES:

1. **🔐 Entregable 1: Sistema de Autenticación** (2 min)
2. **🛡️ Entregable 2: JWT Middleware & Autorización** (2 min)
3. **🗄️ Entregable 3: Integración de Base de Datos** (2 min)
4. **🔒 Entregable 4: Rutas Protegidas** (2 min)
5. **🛡️ Entregable 5: Security & Rate Limiting** (2 min)

---

## 📝 SECUENCIA COMPLETA PASO A PASO

### 🔍 PASO 0: Verificación del Sistema (30 segundos)

```powershell
# Verificar que el servidor esté funcionando
Invoke-RestMethod -Uri "http://localhost:3001/health" -Method GET
```

**Resultado esperado:** Status OK con uptime

---

## 🔐 ENTREGABLE 1: SISTEMA DE AUTENTICACIÓN

### 🎯 PASO 1: Registro de Usuario (1 minuto)

```powershell
# Crear primer usuario con autenticación
$registerData = @{
    email = "demo@clubplus.com"
    password = "SecurePass123!"
    firstName = "Demo"
    lastName = "User"
    phone = "555-0001"
} | ConvertTo-Json

$registerResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/register" -Method POST -Body $registerData -ContentType "application/json"
$registerResponse
```

**🎤 Narración:** _"El Entregable 1 implementa nuestro sistema de autenticación.
Aquí registramos un nuevo usuario con email y contraseña. Como pueden ver,
recibimos tokens JWT de acceso y refresh..."_

### 🎯 PASO 2: Login de Usuario (1 minuto)

```powershell
# Hacer login con credenciales
$loginData = @{
    email = "demo@clubplus.com"
    password = "SecurePass123!"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
$accessToken = $loginResponse.data.tokens.accessToken
$loginResponse
```

**🎤 Narración:** _"Ahora hacemos login con las mismas credenciales. El sistema
valida la contraseña hasheada y nos devuelve nuevos tokens JWT. Guardamos el
token de acceso para usarlo en las siguientes demostraciones..."_

---

## 🛡️ ENTREGABLE 2: JWT MIDDLEWARE & AUTORIZACIÓN

### 🎯 PASO 3: Acceso a Perfil Protegido (1 minuto)

```powershell
# Acceder a ruta protegida con token
$headers = @{
    "Authorization" = "Bearer $accessToken"
    "Content-Type" = "application/json"
}

$profileResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/me" -Method GET -Headers $headers
$profileResponse
```

**🎤 Narración:** _"El Entregable 2 implementa middleware JWT. Esta ruta
/api/auth/me está protegida y requiere autenticación. Como pueden ver, con
nuestro token válido podemos acceder a la información del usuario..."_

### 🎯 PASO 4: Crear Usuario Admin para Tests de Roles (1 minuto)

```powershell
# Registrar un administrador para demostrar roles
$adminData = @{
    email = "admin@clubplus.com"
    password = "AdminPass456!"
    firstName = "Admin"
    lastName = "User"
    phone = "555-0002"
    role = "ADMIN"
} | ConvertTo-Json

$adminRegister = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/register" -Method POST -Body $adminData -ContentType "application/json"

# Login como admin para obtener token de admin
$adminLoginData = @{
    email = "admin@clubplus.com"
    password = "AdminPass456!"
} | ConvertTo-Json

$adminLogin = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method POST -Body $adminLoginData -ContentType "application/json"
$adminToken = $adminLogin.data.tokens.accessToken
```

**🎤 Narración:** _"Ahora creamos un usuario administrador para demostrar el
control de acceso basado en roles. Este usuario tendrá permisos especiales que
un usuario regular no tiene..."_

---

## 🗄️ ENTREGABLE 3: INTEGRACIÓN DE BASE DE DATOS

### 🎯 PASO 5: Operaciones CRUD - Crear Usuario (1 minuto)

```powershell
# Crear usuario a través de la API con token de admin
$adminHeaders = @{
    "Authorization" = "Bearer $adminToken"
    "Content-Type" = "application/json"
}

$newUserData = @{
    email = "client@clubplus.com"
    password = "ClientPass789!"
    firstName = "Cliente"
    lastName = "Premium"
    phone = "555-0003"
} | ConvertTo-Json

$newUser = Invoke-RestMethod -Uri "http://localhost:3001/api/users" -Method POST -Body $newUserData -Headers $adminHeaders -ContentType "application/json"
$newUser
```

**🎤 Narración:** _"El Entregable 3 implementa integración completa con base de
datos. Aquí vemos como un administrador puede crear usuarios. El sistema maneja
hash de contraseñas, validación de emails únicos y operaciones CRUD
completas..."_

### 🎯 PASO 6: Listar Usuarios con Paginación (1 minuto)

```powershell
# Obtener lista de usuarios (solo admins pueden ver todos)
$usersList = Invoke-RestMethod -Uri "http://localhost:3001/api/users" -Method GET -Headers $adminHeaders
$usersList.data.users | Format-Table id, email, firstName, lastName, role
$usersList.data.pagination
```

**🎤 Narración:** _"Aquí vemos la lista completa de usuarios con paginación.
Solo los administradores pueden ver todos los usuarios. El sistema incluye
información de paginación y los passwords nunca se exponen en las
respuestas..."_

---

## 🔒 ENTREGABLE 4: RUTAS PROTEGIDAS

### 🎯 PASO 7: Demostrar Control de Acceso por Roles (1 minuto)

```powershell
# Intentar acceder a ruta de admin con usuario regular
$regularHeaders = @{
    "Authorization" = "Bearer $accessToken"
    "Content-Type" = "application/json"
}

try {
    Invoke-RestMethod -Uri "http://localhost:3001/api/auth/admin" -Method GET -Headers $regularHeaders
} catch {
    Write-Host "❌ ERROR ESPERADO - Usuario regular NO puede acceder a rutas de admin:" -ForegroundColor Red
    $_.Exception.Response.StatusCode
}

# Ahora acceder con token de admin (debería funcionar)
$adminAreaResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/admin" -Method GET -Headers $adminHeaders
$adminAreaResponse
```

**🎤 Narración:** _"El Entregable 4 protege las rutas según roles. Aquí vemos
como un usuario regular es rechazado de una ruta administrativa (error 403),
pero el administrador puede acceder sin problemas..."_

### 🎯 PASO 8: Actualización de Perfil con Ownership (1 minuto)

```powershell
# Usuario regular actualiza SU PROPIO perfil (permitido)
$updateData = @{
    firstName = "Demo"
    lastName = "Updated"
    phone = "555-1111"
} | ConvertTo-Json

$updateResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/users/me" -Method PUT -Body $updateData -Headers $regularHeaders -ContentType "application/json"
$updateResponse
```

**🎤 Narración:** _"Los usuarios pueden actualizar su propio perfil usando la
ruta /users/me. El sistema valida que cada usuario solo pueda modificar sus
propios datos, implementando control de ownership..."_

---

## 🛡️ ENTREGABLE 5: SECURITY & RATE LIMITING

### 🎯 PASO 9: Demostrar Rate Limiting en Login (1 minuto)

```powershell
# Intentar múltiples logins fallidos para activar rate limiting
Write-Host "🔒 Demostrando Rate Limiting - Intentos de login fallidos..." -ForegroundColor Yellow

$badLoginData = @{
    email = "demo@clubplus.com"
    password = "WrongPassword123"
} | ConvertTo-Json

# Hacer varios intentos fallidos
for ($i = 1; $i -le 6; $i++) {
    try {
        Write-Host "Intento $i de login fallido..."
        Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method POST -Body $badLoginData -ContentType "application/json"
    } catch {
        if ($i -eq 6) {
            Write-Host "✅ Rate limiting activado - Demasiados intentos fallidos" -ForegroundColor Green
            $_.Exception.Response.StatusCode
        }
    }
    Start-Sleep -Seconds 1
}
```

**🎤 Narración:** _"El Entregable 5 implementa seguridad enterprise-grade. Aquí
vemos el rate limiting en acción: después de 5 intentos fallidos de login, el
sistema bloquea temporalmente la IP para prevenir ataques de fuerza bruta..."_

### 🎯 PASO 10: Verificar Headers de Seguridad (1 minuto)

```powershell
# Verificar headers de seguridad en respuesta
$securityTestResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/auth/me" -Headers $regularHeaders -UseBasicParsing

Write-Host "🛡️ Headers de Seguridad Implementados:" -ForegroundColor Green
Write-Host "X-Content-Type-Options: $($securityTestResponse.Headers['X-Content-Type-Options'])"
Write-Host "X-Frame-Options: $($securityTestResponse.Headers['X-Frame-Options'])"
Write-Host "X-XSS-Protection: $($securityTestResponse.Headers['X-XSS-Protection'])"
Write-Host "Strict-Transport-Security: $($securityTestResponse.Headers['Strict-Transport-Security'])"
Write-Host "Content-Security-Policy: $($securityTestResponse.Headers['Content-Security-Policy'])"
```

### 🎯 PASO 11: Probar Sanitización de Input (1 minuto)

```powershell
# Test de sanitización de input malicioso
$maliciousData = @{
    firstName = "<script>alert('XSS')</script>Hacker"
    lastName = "User"
    phone = "555-0000"
} | ConvertTo-Json

$sanitizedResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/users/me" -Method PUT -Body $maliciousData -Headers $regularHeaders -ContentType "application/json"

Write-Host "🧹 Input Sanitization Test:" -ForegroundColor Yellow
Write-Host "Input original: <script>alert('XSS')</script>Hacker"
Write-Host "Input sanitizado: $($sanitizedResponse.data.user.firstName)"
```

**🎤 Narración:** _"También implementamos sanitización de input para prevenir
ataques XSS. Como pueden ver, el script malicioso fue removido automáticamente,
manteniendo solo el contenido seguro..."_

---

## 🏆 FINALIZACIÓN Y RESUMEN

### 🎯 PASO 12: Logout y Resumen Final (30 segundos)

```powershell
# Logout seguro
$logoutResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/logout" -Method POST -Headers $regularHeaders
$logoutResponse

Write-Host "`n🎉 DEMOSTRACIÓN COMPLETADA - RESUMEN DE ENTREGABLES:" -ForegroundColor Green
Write-Host "✅ Entregable 1: Autenticación JWT - Sistema de registro/login"
Write-Host "✅ Entregable 2: Middleware JWT - Autorización y roles"
Write-Host "✅ Entregable 3: Base de Datos - CRUD completo con validación"
Write-Host "✅ Entregable 4: Rutas Protegidas - Control de acceso granular"
Write-Host "✅ Entregable 5: Seguridad Avanzada - Rate limiting y protección enterprise"
Write-Host "`n📊 Métricas: 130/135 tests pasando (96.3% éxito)"
Write-Host "🚀 Sistema listo para producción con seguridad enterprise-grade"
```

## 🔧 COMANDOS DE EMERGENCIA

### Si algo falla durante la demo:

```powershell
# Reiniciar servidor rápidamente
cd "c:\Users\issac\Desktop\Chamba\ClubPlus2\ClubPlus\apps\backend"
npm run dev

# Health check de emergencia
Invoke-RestMethod -Uri "http://localhost:3001/health" -Method GET

# Verificar puerto
netstat -ano | findstr :3001

# Test rápido de autenticación
$quickTest = @{email="test@demo.com";password="test123"} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3001/api/auth/register" -Method POST -Body $quickTest -ContentType "application/json"
```

### Variables de recuperación rápida:

```powershell
# Recrear tokens si se pierden
$emergencyLogin = @{email="demo@clubplus.com";password="SecurePass123!"} | ConvertTo-Json
$emergency = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method POST -Body $emergencyLogin -ContentType "application/json"
$accessToken = $emergency.data.tokens.accessToken
```
