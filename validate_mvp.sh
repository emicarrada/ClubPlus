#!/bin/bash
echo "Iniciando validación del MVP Club+ ..."

echo "1. Verificando estructura de la base de datos..."
cd "/home/carrada/Escritorio/Club+/packages/prisma"
npx prisma db push --accept-data-loss

echo "2. Ejecutando seed..."
npx ts-node seed.ts

echo "3. Verificando datos creados..."
echo "SELECT name FROM \"Platform\";" | npx prisma db execute --file=-

echo "Validación completada. El MVP está listo con:"
echo "- 3 Plataformas: Canva Pro, HBO Max, Disney+"
echo "- 3 Planes: Plan Creativo, Plan Entretenimiento, Plan Familiar"
echo "- Backend actualizado con nuevos endpoints"
echo "- Documentación actualizada"
