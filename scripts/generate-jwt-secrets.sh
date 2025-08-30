#!/bin/bash

# 🔐 JWT Secret Generator for Railway Production
# Este script genera secrets seguros para JWT en producción

echo "🔐 Generando JWT Secrets seguros para Railway..."
echo ""

# Función para generar string aleatorio seguro
generate_secret() {
    openssl rand -base64 48 | tr -d "=+/" | cut -c1-64
}

# Generar secrets
JWT_SECRET=$(generate_secret)
JWT_REFRESH_SECRET=$(generate_secret)

echo "✅ Secrets generados exitosamente:"
echo ""
echo "📋 COPIA ESTAS VARIABLES A RAILWAY:"
echo "=================================="
echo "JWT_SECRET=$JWT_SECRET"
echo "JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET"
echo ""
echo "🚨 IMPORTANTE:"
echo "- Estas claves son para PRODUCCIÓN solamente"
echo "- Guárdalas en un lugar seguro"
echo "- NO las compartas en commits ni código"
echo "- Configúralas en Railway Dashboard → Variables"
echo ""
echo "🔧 Comandos Railway CLI (alternativa):"
echo "railway variables set JWT_SECRET=\"$JWT_SECRET\""
echo "railway variables set JWT_REFRESH_SECRET=\"$JWT_REFRESH_SECRET\""
echo ""
echo "✅ Después de configurar, redeploy tu servicio en Railway"
