# Troubleshooting Guide

Guía para resolver problemas comunes en Club+ MVP. Consulta esta guía antes de
escalar issues.

## 🚀 Setup Issues

### Node.js y npm

**Problema:** `node: command not found`

```bash
# Verificar instalación
which node
which npm

# Reinstalar Node.js
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# macOS
brew install node

# Windows
# Descargar desde nodejs.org
```

**Problema:** `npm install` falla con permisos

```bash
# Cambiar directorio global de npm
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### Git Issues

**Problema:** `Permission denied (publickey)`

```bash
# Generar nueva SSH key
ssh-keygen -t ed25519 -C "tu-email@ejemplo.com"

# Agregar a ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Agregar SSH key a GitHub
cat ~/.ssh/id_ed25519.pub
# Copiar y pegar en GitHub Settings > SSH Keys
```

**Problema:** Merge conflicts

```bash
# Ver archivos con conflictos
git status

# Editar archivos manualmente o usar merge tool
git mergetool

# Después de resolver
git add .
git commit -m "resolve merge conflicts"
```

---

## 🗄️ Database Connection Problems

### PostgreSQL Local

**Problema:** `connection to server failed`

```bash
# Verificar que PostgreSQL esté corriendo
sudo systemctl status postgresql

# Iniciar PostgreSQL
sudo systemctl start postgresql

# Verificar puerto
sudo netstat -tlnp | grep 5432
```

**Problema:** `authentication failed for user`

```bash
# Resetear password
sudo -u postgres psql
ALTER USER postgres PASSWORD 'nuevo_password';

# O crear nuevo usuario
CREATE USER clubplus_user WITH ENCRYPTED PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE clubplus_dev TO clubplus_user;
```

### Prisma Connection Issues

**Problema:** `P1001: Can't reach database server`

```bash
# Verificar DATABASE_URL
echo $DATABASE_URL

# Probar conexión directa
psql $DATABASE_URL

# Verificar formato de URL
# postgresql://user:password@host:port/database
```

**Problema:** `P3009: migrate found failed migration`

```bash
# Ver estado de migraciones
npx prisma migrate status

# Marcar migración como resuelta
npx prisma migrate resolve --applied "20231201120000_migration_name"

# O rollback y reaplicas
npx prisma migrate resolve --rolled-back "20231201120000_migration_name"
npx prisma migrate dev
```

---

## 🏗️ Build Errors

### TypeScript Compilation

**Problema:** `TS2307: Cannot find module`

```bash
# Limpiar y reinstalar
rm -rf node_modules package-lock.json
npm install

# Verificar tsconfig.json paths
# Asegurarte de que los paths están correctos
```

**Problema:** `TS2345: Argument of type 'X' is not assignable`

```typescript
// Verificar tipos de Prisma están actualizados
npx prisma generate

// Verificar imports
import { PrismaClient } from '@prisma/client';
```

### ESLint Errors

**Problema:** `ESLint couldn't find config`

```bash
# Verificar .eslintrc.json existe
ls -la .eslintrc.json

# Reinstalar dependencias ESLint
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

**Problema:** ESLint rules conflictos

```bash
# Resetear configuración ESLint
rm .eslintrc.json
npx eslint --init

# O usar configuración del proyecto
git checkout .eslintrc.json
```

---

## 🚢 Deployment Issues

### Railway Deployment

**Problema:** `Build failed with exit code 1`

```bash
# Verificar build local
npm run build

# Revisar logs en Railway Dashboard
# Verificar variables de entorno
# Asegurarte de que DATABASE_URL está configurada
```

**Problema:** `App crashed` después del deploy

```bash
# Verificar start script en package.json
{
  "scripts": {
    "start": "node dist/index.js"
  }
}

# Verificar que dist/ existe después del build
npm run build
ls dist/
```

**Problema:** `ECONNREFUSED` al conectar base de datos

```bash
# Verificar DATABASE_URL en Railway
# Debe ser: ${{ Postgres.DATABASE_URL }}

# Verificar que servicio PostgreSQL existe
# En Railway Dashboard > Services
```

---

## 🔒 Authentication & Authorization

### JWT Issues

**Problema:** `JsonWebTokenError: invalid token`

```typescript
// Verificar JWT_SECRET está configurado
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Missing');

// Verificar formato del token
const token = 'Bearer ' + actualToken;
const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);
```

**Problema:** `TokenExpiredError`

```typescript
// Manejar tokens expirados
try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
} catch (error) {
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' });
  }
  throw error;
}
```

---

## 🌐 API & Network Issues

### CORS Problems

**Problema:** `Access-Control-Allow-Origin` error

```typescript
// Verificar configuración CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  }),
);

// Verificar CORS_ORIGIN variable
console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN);
```

**Problema:** Requests fallan con 404

```bash
# Verificar rutas definidas
curl -v http://localhost:3000/api/v1/users

# Revisar logs del servidor
npm run dev

# Verificar middleware order
# CORS debe ir antes que las rutas
```

---

## 🧪 Testing Issues

### Jest Configuration

**Problema:** `Jest encountered an unexpected token`

```json
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testMatch: ['**/__tests__/**/*.ts', '**/*.test.ts'],
};
```

**Problema:** Tests no encuentran módulos

```bash
# Verificar paths en tsconfig.json
# Asegurarte de que Jest puede resolver imports

# Limpiar cache de Jest
npx jest --clearCache
```

---

## 💻 Development Environment

### VS Code Issues

**Problema:** ESLint no funciona en VS Code

```json
// .vscode/settings.json
{
  "eslint.validate": ["typescript", "javascript"],
  "eslint.workingDirectories": ["apps/backend"]
}
```

**Problema:** Prettier no formatea automáticamente

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

### Git Hooks Issues

**Problema:** Pre-commit hook falla

```bash
# Verificar hooks instalados
ls .git/hooks/

# Reinstalar Husky
rm -rf .git/hooks
npx husky install

# Verificar permisos
chmod +x .husky/pre-commit
```

---

## 📦 Package Management

### npm Issues

**Problema:** `ERESOLVE unable to resolve dependency tree`

```bash
# Usar legacy peer deps
npm install --legacy-peer-deps

# O forzar resolución
npm install --force

# Limpiar cache npm
npm cache clean --force
```

**Problema:** Versiones de paquetes incompatibles

```bash
# Verificar outdated packages
npm outdated

# Actualizar específico
npm update package-name

# O reinstalar todo
rm -rf node_modules package-lock.json
npm install
```

---

## 🔍 Debugging Tools

### Herramientas útiles

```bash
# Verificar puertos en uso
netstat -tulnp | grep :3000

# Verificar procesos Node.js
ps aux | grep node

# Monitorear logs en tiempo real
tail -f logs/app.log

# Verificar variables de entorno
printenv | grep DATABASE

# Test de conectividad
telnet localhost 5432
```

### Debug en VS Code

```json
// .vscode/launch.json para debugging
{
  "type": "node",
  "request": "launch",
  "name": "Debug Backend",
  "program": "${workspaceFolder}/apps/backend/src/index.ts",
  "runtimeArgs": ["--loader", "tsx/esm"],
  "env": {
    "NODE_ENV": "development"
  }
}
```

---

## 📊 Performance Issues

### Slow Database Queries

```typescript
// Habilitar query logging
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Identificar queries lentas
// Agregar índices necesarios en schema.prisma
```

**Problema:** High memory usage

```bash
# Monitorear memoria
top -p $(pgrep -f "node.*backend")

# Verificar memory leaks
node --inspect apps/backend/dist/index.js
# Abrir Chrome DevTools → Memory tab
```

---

## 🆘 Emergency Procedures

### App completamente roto

1. **Rollback inmediato**

   ```bash
   # En Railway Dashboard
   # Deployments → Previous Deploy → Redeploy
   ```

2. **Verificar servicios críticos**

   ```bash
   curl https://clubplus-api.railway.app/health
   ```

3. **Notificar equipo**
   - Slack #incidents
   - Update status page

### Base de datos corrupta

1. **Detener escrituras**

   ```bash
   # Activar modo read-only
   railway run psql -c "SET default_transaction_read_only = on;"
   ```

2. **Restaurar desde backup**
   ```bash
   railway run psql $DATABASE_URL < latest-backup.sql
   ```

---

## 🔗 Enlaces útiles

- [Railway Docs](https://docs.railway.app)
- [Prisma Troubleshooting](https://www.prisma.io/docs/reference/api-reference/error-reference)
- [Node.js Debugging Guide](https://nodejs.org/en/docs/guides/debugging-getting-started/)

---

## 📞 Escalation

Si no puedes resolver el problema:

1. **Buscar en GitHub Issues** del proyecto
2. **Preguntar en Slack** #dev-help
3. **Crear issue** con detalles completos
4. **Contactar** @cristopher para problemas críticos

### Template para reportar bugs

```markdown
## Bug Description

Describe qué está pasando

## Steps to Reproduce

1. Paso 1
2. Paso 2
3. Error ocurre

## Expected Behavior

Qué debería pasar

## Environment

- OS:
- Node version:
- npm version:
- Branch:

## Logs

Incluir logs relevantes
```

---

**¿Problema no listado aquí?** Crea un issue en GitHub con detalles completos.
