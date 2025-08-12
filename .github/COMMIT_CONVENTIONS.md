# Commit Message Conventions

Esta guía define las convenciones para los mensajes de commit en Club+ siguiendo el estándar [Conventional Commits](https://www.conventionalcommits.org/).

## Formato

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## Tipos de commit

### Principales
- **feat**: Nueva funcionalidad
- **fix**: Corrección de bug
- **docs**: Cambios en documentación
- **style**: Cambios que no afectan el significado del código (espacios, formato, etc.)
- **refactor**: Cambio de código que no corrige bug ni agrega funcionalidad
- **test**: Agregar o corregir tests
- **chore**: Cambios en herramientas de build, dependencias, etc.

### Secundarios
- **perf**: Mejora de rendimiento
- **ci**: Cambios en configuración de CI/CD
- **build**: Cambios en sistema de build
- **revert**: Reversión de commit anterior

## Ejemplos

### Básicos
```bash
feat: add user authentication
fix: resolve login form validation
docs: update API documentation
style: fix indentation in user component
refactor: extract validation logic to utils
test: add unit tests for auth service
chore: update dependencies
```

### Con scope
```bash
feat(auth): implement JWT token validation
fix(api): handle null user data in endpoint
docs(readme): add installation instructions
test(auth): add integration tests for login
chore(deps): bump axios to 1.0.0
```

### Con body y footer
```bash
feat(payments): integrate MercadoPago payment gateway

Implement payment processing with MercadoPago SDK
- Add payment form component
- Handle webhook notifications
- Update order status after payment

Closes #123
```

## Reglas

1. **Usar minúsculas** en el type y description
2. **No usar punto final** en la description
3. **Usar imperativo** ("add" no "added" o "adds")
4. **Mantener description bajo 50 caracteres**
5. **Usar body para explicar el "qué" y "por qué"**
6. **Usar footer para referencias (issues, breaking changes)**

## Breaking Changes

Para cambios que rompen compatibilidad:

```bash
feat(api)!: change user endpoint response format

BREAKING CHANGE: The user endpoint now returns user data nested under 'data' property
```

## Scopes sugeridos

- **auth**: Autenticación y autorización
- **api**: Endpoints y lógica de API
- **ui**: Componentes de interfaz
- **db**: Base de datos y migraciones
- **payments**: Sistema de pagos
- **profiles**: Gestión de perfiles
- **admin**: Panel administrativo
- **docs**: Documentación
- **config**: Configuración del proyecto

## Herramientas

Para automatizar la validación de commits, usamos:
- **Husky**: Pre-commit hooks
- **Commitlint**: Validación de formato de commits

```bash
# Instalar herramientas
npm install --save-dev @commitlint/config-conventional @commitlint/cli husky

# Configurar
echo "module.exports = {extends: ['@commitlint/config-conventional']}" > commitlint.config.js
```

## Ejemplos de commits MAL formateados

❌ **Evitar:**
```bash
Fixed bug
Added new feature
Updated docs
FIX: Login Issue
feat: Added user authentication system with JWT tokens
```

✅ **Correcto:**
```bash
fix: resolve login validation error
feat: add user authentication
docs: update setup guide
fix: resolve login issue
feat: add JWT authentication
```
