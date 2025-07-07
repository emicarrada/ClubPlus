# Club+ Backend

## Scripts útiles

- `npm run dev` — Inicia el backend en modo desarrollo (TypeScript + nodemon)
- `npm run build` — Compila el código TypeScript a JavaScript en `/dist`
- `npm start` — Ejecuta el backend compilado
- `npm run prisma:migrate` — Ejecuta migraciones Prisma
- `npm run prisma:generate` — Genera el cliente Prisma

## Notas
- El campo `main` en package.json apunta a `src/index.js`, pero el build genera archivos en `/dist`. Se recomienda cambiarlo a `dist/index.js` para producción.
- Instala los tipos de Node y Express para evitar errores de compilación:
  - `npm install --save-dev @types/node @types/express @types/cors @types/dotenv`
- El backend usa TypeScript y módulos ESNext.
- El archivo de entorno `.env` debe estar en la raíz de `/apps/backend` y contener la variable `DATABASE_URL`.
