# 🚀 Railway Environment Variables Configuration

## ⚠️ PROBLEMA IDENTIFICADO

El backend está fallando en Railway porque faltan las variables de entorno
requeridas:

- `JWT_SECRET`
- `JWT_REFRESH_SECRET`

## 🔧 SOLUCIÓN: Configurar Variables en Railway

### 1. **Variables de entorno OBLIGATORIAS para Railway:**

```bash
# Database (Ya configurada probablemente)
DATABASE_URL="postgresql://..."

# Server Configuration
NODE_ENV="production"
PORT="3000"
CORS_ORIGIN="https://tu-frontend-domain.vercel.app"

# JWT Authentication (FALTANTES - CRÍTICO)
JWT_SECRET="tu-super-secret-jwt-key-production-aqui-muy-seguro"
JWT_REFRESH_SECRET="tu-refresh-token-secret-production-aqui-muy-seguro"
JWT_EXPIRES_IN="24h"
JWT_REFRESH_EXPIRES_IN="7d"

# Logging
LOG_LEVEL="info"
```

### 2. **Cómo configurar en Railway:**

#### Opción A: Railway Dashboard (Recomendado)

1. Ve a tu proyecto en Railway dashboard
2. Selecciona el servicio backend
3. Ve a la pestaña "Variables"
4. Agrega cada variable:

```
JWT_SECRET = "ClubPlus2025SuperSecretJWTKeyForProduction!@#$%"
JWT_REFRESH_SECRET = "ClubPlusRefreshToken2025SecureKey!@#$%^&*"
```

#### Opción B: Railway CLI

```bash
# Instalar Railway CLI si no lo tienes
npm install -g @railway/cli

# Login y seleccionar proyecto
railway login
railway link

# Configurar variables
railway variables set JWT_SECRET="ClubPlus2025SuperSecretJWTKeyForProduction!@#$%"
railway variables set JWT_REFRESH_SECRET="ClubPlusRefreshToken2025SecureKey!@#$%^&*"
railway variables set NODE_ENV="production"
railway variables set CORS_ORIGIN="https://tu-frontend-domain.vercel.app"
```

### 3. **Secrets sugeridos para producción:**

```bash
# JWT_SECRET (32+ caracteres, altamente seguros)
JWT_SECRET="ClubPlus2025SuperSecretJWTKeyForProductionEnvironment!@#$%^&*()"

# JWT_REFRESH_SECRET (diferente al JWT_SECRET)
JWT_REFRESH_SECRET="ClubPlusRefreshTokenSecureKey2025ProductionEnvironment!@#$%^&*()"
```

### 4. **Verificación después de configurar:**

1. **Redeploy el servicio** en Railway
2. **Verificar logs** para confirmar que las variables se cargan
3. **Test del endpoint de auth**:
   ```bash
   curl -X POST https://tu-backend.railway.app/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@test.com","password":"password123","firstName":"Test","lastName":"User"}'
   ```

### 5. **Variables opcionales (para futuro):**

```bash
# Payment providers (cuando implementes pagos)
STRIPE_SECRET_KEY="sk_live_..."
MERCADOPAGO_ACCESS_TOKEN="APP_USR-..."

# Email services (cuando implementes emails)
SENDGRID_API_KEY="SG...."
```

## 🚨 **ACCIÓN INMEDIATA REQUERIDA:**

1. **Ve a Railway Dashboard** → Tu Proyecto → Backend Service → Variables
2. **Agrega estas 2 variables críticas:**
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
3. **Redeploy** el servicio
4. **Verifica** que el backend inicie correctamente

## 🔒 **Seguridad:**

- ⚠️ **NUNCA** uses los secrets de desarrollo en producción
- ✅ **GENERA** secrets únicos y seguros para Railway
- ✅ **DOCUMENTA** dónde guardas los secrets de producción
- ✅ **ROTA** los secrets periódicamente

## 📞 **Si necesitas ayuda:**

1. **Comparte los logs completos** de Railway
2. **Confirma qué variables** ya tienes configuradas
3. **Verifica el DATABASE_URL** también esté configurado
