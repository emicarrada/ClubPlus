# Vercel Frontend Configuration Guide

## 📋 Deployment Setup

Este documento describe la configuración completa de Vercel para el frontend de
Club+ MVP.

### 🚀 Configuración Inicial

1. **Crear Proyecto Vercel:**

   ```bash
   # Conectar repositorio a Vercel
   # Project Name: clubplus-frontend
   # Framework: Vite
   # Root Directory: apps/frontend
   # Build Command: npm run build
   # Output Directory: dist
   ```

2. **Variables de Entorno Production:**

   ```bash
   VITE_API_URL=https://clubplus-api.railway.app
   VITE_NODE_ENV=production
   VITE_APP_NAME=Club+
   VITE_ENABLE_ANALYTICS=true
   VITE_ENABLE_SENTRY=true
   ```

3. **Build Settings:**
   - **Framework Preset:** Vite
   - **Root Directory:** `apps/frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### 🔧 Custom Configurations

**Domain Setup:**

- Primary: `https://clubplus.app`
- Staging: `https://staging.clubplus.app`

**Headers Configuration:**

```json
[
  {
    "source": "/(.*)",
    "headers": [
      {
        "key": "X-Frame-Options",
        "value": "DENY"
      },
      {
        "key": "X-Content-Type-Options",
        "value": "nosniff"
      }
    ]
  }
]
```

**API Proxy Configuration:**

```json
[
  {
    "source": "/api/(.*)",
    "destination": "https://clubplus-api.railway.app/api/$1"
  }
]
```

### 📦 Build Process

El proyecto está configurado para:

- ✅ TypeScript compilation
- ✅ Vite bundling optimizado
- ✅ Tailwind CSS processing
- ✅ Asset optimization
- ✅ Código splitting automático

### 🔒 Security Headers

Configuradas automáticamente:

- Content Security Policy
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer Policy

### 📊 Analytics Integration

Ready para Week 5:

- Google Analytics 4
- Mixpanel tracking
- Sentry error monitoring

---

## 🎯 Validation Checklist

- ✅ Vercel project configurado
- ✅ Domain conectado
- ✅ Build settings optimizados
- ✅ Environment variables ready
- ✅ API proxy configurado
- ✅ Security headers activos

**Status:** Ready for frontend development (Week 3)
