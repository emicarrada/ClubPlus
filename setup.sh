#!/bin/bash

echo "🚀 Configurando Club+ MVP desde cero..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto."
    exit 1
fi

echo "📦 Instalando dependencias del workspace raíz..."
npm install

echo "🗄️ Configurando Prisma..."
cd packages/prisma

# Copiar archivo de configuración de ejemplo
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "⚠️  Se creó .env desde .env.example"
    echo "⚠️  IMPORTANTE: Edita packages/prisma/.env con tu DATABASE_URL real"
fi

# Instalar dependencias de Prisma
npm install

# Generar cliente Prisma
npx prisma generate

echo "📱 Configurando Backend..."
cd ../../apps/backend
npm install

echo "🎨 El frontend se configurará cuando esté listo..."

echo ""
echo "✅ Configuración inicial completada!"
echo ""
echo "📋 PRÓXIMOS PASOS:"
echo "1. Edita packages/prisma/.env con tu DATABASE_URL de PostgreSQL"
echo "2. Ejecuta las migraciones: cd packages/prisma && npx prisma migrate dev"
echo "3. Ejecuta el seed: cd packages/prisma && npm run db:seed"
echo "4. Inicia el backend: cd apps/backend && npm run dev"
echo ""
echo "🔗 URLs importantes:"
echo "   Backend: http://localhost:3001"
echo "   Health check: http://localhost:3001/health"
echo "   Prisma Studio: npx prisma studio (desde packages/prisma)"
echo ""
