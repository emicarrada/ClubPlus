# Deployment Guide

Guía completa para el despliegue de Club+ MVP en Railway y gestión de ambientes
de producción.

## 🚀 Overview de deployment

### Arquitectura de deployment

```
GitHub Repository
├── main branch → Railway Production
├── develop branch → Railway Staging (futuro)
└── feature branches → Railway Preview Deployments
```

### Ambientes

- **Local**: Desarrollo individual
- **Preview**: PRs y feature branches
- **Staging**: Branch develop (futuro)
- **Production**: Branch main

---

## 🛠️ Railway Setup

### 1. Configuración inicial

**Requisitos previos:**

- Cuenta en [Railway.app](https://railway.app)
- Repositorio GitHub conectado
- Base de datos PostgreSQL configurada

**Servicios en Railway:**

```
Club+ Project
├── Backend Service (Node.js)
├── PostgreSQL Database
└── Environment Variables
```

### 2. Variables de entorno

**Variables requeridas en Railway:**

```env
# Database (automático)
DATABASE_URL=${{ Postgres.DATABASE_URL }}

# Application
NODE_ENV=production
PORT=3000

# JWT
JWT_SECRET=production-secret-super-secure
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://clubplus.app,https://www.clubplus.app

# External APIs
STRIPE_SECRET_KEY=sk_live_...
MERCADOPAGO_ACCESS_TOKEN=APP_USR...

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@clubplus.com
SMTP_PASS=app-specific-password
```

---

## 📋 Pre-deployment Checklist

### Antes de cada deploy

- [ ] Tests pasando localmente
- [ ] Build exitoso
- [ ] ESLint sin errores
- [ ] Variables de entorno actualizadas
- [ ] Migraciones de DB preparadas
- [ ] Documentación actualizada
- [ ] Performance testing realizado

### Validaciones automáticas

```bash
# Ejecutar localmente antes del deploy
npm run build        # Build exitoso
npm run test         # Tests pasando
npm run lint         # Linting clean
npm run type-check   # TypeScript sin errores
```

---

## 🔄 Deployment Process

### Deploy automático (Recomendado)

1. **Merge a main**

   ```bash
   # PR review y merge en GitHub
   git checkout main
   git pull origin main
   ```

2. **Railway detecta cambios**
   - Auto-deploy se activa
   - Build process inicia
   - Deploy a producción

3. **Verificación post-deploy**

   ```bash
   # Health check
   curl https://clubplus-api.railway.app/health

   # API endpoints
   curl https://clubplus-api.railway.app/api/v1/users
   ```

### Deploy manual (Emergencias)

```bash
# Desde Railway CLI
railway login
railway link your-project-id
railway deploy
```

---

## 🗄️ Database Deployment

### Migraciones en producción

**Proceso automático:**

```bash
# En Railway, las migraciones se ejecutan automáticamente
# durante el build process via package.json scripts
{
  "scripts": {
    "build": "prisma migrate deploy && tsc",
    "start": "node dist/index.js"
  }
}
```

**Migración manual (emergencias):**

```bash
# Desde Railway CLI
railway run npx prisma migrate deploy

# O desde panel web Railway
# Terminal → npx prisma migrate deploy
```

### Backup antes de migraciones

```bash
# Railway automáticamente hace backup antes de migraciones críticas
# Backup manual:
railway run pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

---

## 📊 Monitoring & Health Checks

### Health check endpoint

```typescript
// src/routes/health.ts
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    // Check external APIs
    const checks = {
      database: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version,
    };

    res.status(200).json(checks);
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
    });
  }
});
```

### Monitoring setup

**Railway Metrics (incluidas):**

- CPU usage
- Memory usage
- Response time
- Error rate
- Deploy frequency

**External monitoring:**

- UptimeRobot para availability
- Sentry para error tracking
- Custom alerts vía webhooks

---

## 🔧 Environment Management

### Staging vs Production

```typescript
// config/environments.ts
const environments = {
  development: {
    api_url: 'http://localhost:3000',
    database_pool: 5,
    log_level: 'debug',
  },
  staging: {
    api_url: 'https://staging-clubplus-api.railway.app',
    database_pool: 10,
    log_level: 'info',
  },
  production: {
    api_url: 'https://clubplus-api.railway.app',
    database_pool: 20,
    log_level: 'error',
  },
};
```

### Feature flags

```typescript
// config/features.ts
export const features = {
  paymentIntegration: process.env.NODE_ENV === 'production',
  betaFeatures: process.env.ENABLE_BETA === 'true',
  maintenance: process.env.MAINTENANCE_MODE === 'true',
};
```

---

## 🚨 Rollback Procedures

### Rollback automático

Railway mantiene historial de deploys:

1. **Railway Dashboard** → Deployments
2. **Seleccionar deploy anterior**
3. **Click "Redeploy"**

### Rollback manual vía Git

```bash
# Identificar commit a revertir
git log --oneline

# Revert específico
git revert <commit-hash>
git push origin main

# Rollback completo a commit anterior
git reset --hard <previous-commit>
git push --force origin main  # ⚠️ PELIGROSO
```

### Rollback de base de datos

```bash
# Restaurar desde backup
railway run psql $DATABASE_URL < backup-file.sql

# Revert migración específica (si es posible)
railway run npx prisma migrate resolve --rolled-back migration_name
```

---

## 🔍 Logs & Debugging

### Acceder a logs

**Railway Dashboard:**

- Logs en tiempo real en el panel
- Historial de deploys
- Métricas de performance

**Railway CLI:**

```bash
# Ver logs en tiempo real
railway logs

# Logs de servicio específico
railway logs --service backend

# Ejecutar comandos en producción
railway run <command>
```

### Structured logging

```typescript
// utils/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports: [new winston.transports.Console()],
});

// Usage
logger.info('User created', { userId, email });
logger.error('Payment failed', { error: error.message, userId });
```

---

## ⚡ Performance Optimization

### Build optimization

```json
// package.json
{
  "scripts": {
    "build:prod": "NODE_ENV=production npm run build",
    "start:prod": "NODE_ENV=production node dist/index.js"
  }
}
```

### Database optimization

```typescript
// Connection pooling
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + '?connection_limit=10&pool_timeout=20',
    },
  },
});
```

### Caching strategy

```typescript
// Redis cache (futuro)
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Cache API responses
app.use('/api', cacheMiddleware);
```

---

## 🛡️ Security Considerations

### Environment security

- [ ] Secrets no están en código
- [ ] Variables de entorno validadas
- [ ] API keys rotadas regularmente
- [ ] Database tiene acceso restringido

### Runtime security

```typescript
// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }),
);

// Rate limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // requests per windowMs
  }),
);
```

---

## 🧪 Testing in Production

### Smoke tests post-deploy

```bash
#!/bin/bash
# scripts/smoke-tests.sh

API_URL="https://clubplus-api.railway.app"

# Health check
curl -f $API_URL/health || exit 1

# Key endpoints
curl -f $API_URL/api/v1/users || exit 1
curl -f $API_URL/api/v1/combos || exit 1

echo "✅ Smoke tests passed"
```

### Canary deployments (futuro)

```typescript
// Feature flag based rollout
const rolloutPercentage = parseInt(process.env.NEW_FEATURE_ROLLOUT) || 0;

function shouldEnableNewFeature(userId: string): boolean {
  const hash = createHash('md5').update(userId).digest('hex');
  const number = parseInt(hash.substring(0, 8), 16);
  return number % 100 < rolloutPercentage;
}
```

---

## 📋 Deployment Checklist

### Pre-production checklist

- [ ] Code reviewed y aprobado
- [ ] Tests passing (unit + integration)
- [ ] Performance tests completed
- [ ] Security scan passed
- [ ] Documentation updated
- [ ] Database migrations tested
- [ ] Environment variables validated
- [ ] Backup completed

### Post-deployment checklist

- [ ] Health checks passing
- [ ] API endpoints responding
- [ ] Database queries working
- [ ] External integrations functional
- [ ] Monitoring alerts configured
- [ ] Performance metrics normal
- [ ] Error rates acceptable
- [ ] User acceptance testing passed

---

## 🆘 Emergency Procedures

### Production down

1. **Immediate response** (< 5 minutes)
   - Check Railway status
   - Verify recent deployments
   - Check error logs

2. **Quick fixes** (< 15 minutes)
   - Rollback to last known good deployment
   - Scale up resources if needed
   - Disable problematic features

3. **Communication**
   - Update status page
   - Notify stakeholders
   - Post-mortem scheduling

### Database issues

```bash
# Check database connectivity
railway run npx prisma db pull

# Check migration status
railway run npx prisma migrate status

# Emergency read-only mode
railway run psql -c "SET default_transaction_read_only = on;"
```

---

## 📞 Support & Escalation

### Contact information

- **DevOps Lead**: @cristopher
- **Railway Support**: support@railway.app
- **Database Issues**: Check Railway status first
- **Emergency Contact**: Slack #incidents

### Escalation matrix

1. **Developer** (0-30 min): Initial response
2. **Team Lead** (30-60 min): Coordination
3. **Management** (1+ hour): External communication

---

**¿Problemas con deployment?** Revisa [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
o contacta al equipo DevOps.
