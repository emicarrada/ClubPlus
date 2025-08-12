# Development Workflow

Esta guía describe el proceso de desarrollo que debe seguir todo el equipo de
Club+ MVP.

## 🌳 Git Flow

### Estructura de ramas

```
main (producción)
├── develop (desarrollo)
├── feature/nombre-feature
├── bugfix/nombre-bug
├── hotfix/nombre-hotfix
└── release/v1.0.0
```

### Tipos de ramas

- **main**: Código en producción, siempre estable
- **develop**: Integración de features, ambiente de staging
- **feature/\***: Nuevas funcionalidades
- **bugfix/\***: Correcciones de bugs
- **hotfix/\***: Correcciones urgentes en producción
- **release/\***: Preparación de releases

---

## 🚀 Proceso de desarrollo

### 1. Crear nueva feature

```bash
# Actualizar main
git checkout main
git pull origin main

# Crear feature branch
git checkout -b feature/payment-integration
```

### 2. Desarrollar feature

```bash
# Hacer commits siguiendo convenciones
git add .
git commit -m "feat: add stripe payment integration"

# Push regular para backup
git push origin feature/payment-integration
```

### 3. Crear Pull Request

1. **Abrir PR** en GitHub hacia `main`
2. **Completar template** del PR con toda la información
3. **Asignar reviewers** (mínimo 1)
4. **Etiquetar apropiadamente**

### 4. Code Review

**Revisor debe verificar:**

- [ ] Código sigue estándares del proyecto
- [ ] Tests pasan correctamente
- [ ] Funcionalidad cumple requisitos
- [ ] No introduce bugs o regresiones
- [ ] Documentación actualizada si es necesario

### 5. Merge y cleanup

```bash
# Después del merge, limpiar
git checkout main
git pull origin main
git branch -d feature/payment-integration
```

---

## 📝 Commit Message Conventions

Seguimos [Conventional Commits](https://www.conventionalcommits.org/) para
mantener un historial limpio y automatizar releases.

### Formato

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Tipos de commit

- **feat**: Nueva funcionalidad
- **fix**: Corrección de bug
- **docs**: Cambios en documentación
- **style**: Cambios de formato (espacios, comas, etc.)
- **refactor**: Refactoring de código
- **test**: Agregar o modificar tests
- **chore**: Tareas de mantenimiento

### Ejemplos

```bash
# Feature básica
git commit -m "feat: add user authentication"

# Bug fix con scope
git commit -m "fix(auth): resolve token validation error"

# Breaking change
git commit -m "feat!: change API response format

BREAKING CHANGE: user endpoint now returns nested data structure"
```

### ⚠️ Validación automática

Los commits son validados automáticamente por **Commitlint**. Si el formato es
incorrecto, el commit será rechazado.

---

## 🧪 Testing Requirements

### Test Strategy

- **Unit Tests**: Funciones y componentes individuales
- **Integration Tests**: Interacción entre módulos
- **E2E Tests**: Flujos completos de usuario (futuro)

### Testing antes del commit

```bash
# Ejecutar todos los tests
npm run test

# Tests específicos del backend
npm run test:backend

# Coverage report
npm run test:coverage
```

### Criterios de aceptación

- [ ] **Cobertura mínima**: 80% líneas de código
- [ ] **Tests unitarios**: Para toda lógica de negocio
- [ ] **Tests de integración**: Para endpoints de API
- [ ] **Todos los tests pasan** antes del merge

---

## 🔍 Code Review Process

### Checklist para el desarrollador

Antes de crear PR:

- [ ] Código cumple estándares (ESLint sin errores)
- [ ] Tests escritos y pasando
- [ ] Funcionalidad probada localmente
- [ ] Documentación actualizada
- [ ] No hay console.logs o código debug

### Checklist para el revisor

- [ ] **Funcionalidad**: ¿Cumple los requisitos?
- [ ] **Código**: ¿Es limpio y mantenible?
- [ ] **Performance**: ¿No introduce problemas de rendimiento?
- [ ] **Seguridad**: ¿No introduce vulnerabilidades?
- [ ] **Tests**: ¿Están completos y son efectivos?
- [ ] **Documentación**: ¿Está actualizada?

### Tiempo de respuesta

- **Reviews urgentes**: 2 horas
- **Reviews normales**: 24 horas
- **Reviews grandes (>500 líneas)**: 48 horas

---

## 🚢 Deployment Process

### Ambientes

1. **Development**: Desarrollo local
2. **Staging**: Railway preview deployments
3. **Production**: Railway main deployment

### Proceso de deploy

```bash
# 1. Development (automático en cada commit)
git push origin feature/mi-feature
# → Se despliega preview en Railway

# 2. Staging (automático al merge a develop)
# PR merge → develop branch → Railway staging

# 3. Production (automático al merge a main)
# PR merge → main branch → Railway production
```

### Rollback process

Si hay problemas en producción:

```bash
# Opción 1: Revert del commit problemático
git revert <commit-hash>
git push origin main

# Opción 2: Hotfix branch
git checkout -b hotfix/critical-bug-fix
# ... hacer fix ...
git commit -m "fix: resolve critical production bug"
# PR directo a main
```

---

## 🔄 CI/CD Pipeline

### Pre-commit hooks (local)

Ejecutado automáticamente al hacer commit:

- ESLint fix
- Prettier formatting
- Commit message validation

### GitHub Actions (futuro)

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline
on: [push, pull_request]

jobs:
  test:
    - Install dependencies
    - Run linting
    - Run tests
    - Build project

  deploy:
    - Deploy to Railway (if main branch)
```

---

## 📊 Quality Gates

### Definición de "Done"

Una feature se considera completa cuando:

- [ ] Código desarrollado y funcionando
- [ ] Tests escritos y pasando (>80% coverage)
- [ ] Code review aprobado
- [ ] Documentación actualizada
- [ ] Deploy exitoso en staging
- [ ] QA/Testing manual completado
- [ ] Merge a main realizado

### Métricas de calidad

- **Test Coverage**: >80%
- **ESLint Errors**: 0
- **Build Time**: <2 minutos
- **Bundle Size**: Monitoreado
- **Performance**: Sin regresiones

---

## 🛠️ Development Tools

### Herramientas requeridas

- **ESLint**: Linting automático
- **Prettier**: Formateo de código
- **Husky**: Git hooks
- **Commitlint**: Validación de commits
- **VS Code**: Editor recomendado

### Configuración automática

El proyecto incluye configuración automática para:

- Formateo al guardar
- Linting en tiempo real
- Debug configuration
- Extensions recomendadas

---

## 📋 Checklist de Pull Request

### Antes de crear PR

- [ ] Branch actualizada con main
- [ ] Tests pasando localmente
- [ ] Build exitoso
- [ ] ESLint sin errores
- [ ] Funcionalidad probada manualmente

### Al crear PR

- [ ] Título descriptivo
- [ ] Template completado
- [ ] Reviewers asignados
- [ ] Labels apropiadas
- [ ] Screenshots/videos si aplica

### Durante review

- [ ] Responder comentarios promptamente
- [ ] Hacer cambios solicitados
- [ ] Re-solicitar review después de cambios
- [ ] Resolver conversaciones

---

## 🆘 Troubleshooting

### Problemas comunes

**Pre-commit hooks fallan:**

```bash
# Reinstalar hooks
npm run prepare
```

**Merge conflicts:**

```bash
# Actualizar branch
git checkout main
git pull origin main
git checkout feature/mi-feature
git merge main
# Resolver conflicts manualmente
```

**Tests fallan en CI pero pasan localmente:**

- Verificar variables de entorno
- Revisar dependencias
- Checkear diferencias de ambiente

---

## 📚 Referencias

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)
- [Code Review Best Practices](https://google.github.io/eng-practices/review/)

---

**¿Dudas?** Pregunta en el canal #dev de Slack o crea un issue en GitHub.
