import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando seed de Club+ MVP...\n');

  // Limpiar datos existentes (en orden correcto para evitar errores de FK)
  console.log('🧹 Limpiando datos existentes...');
  await prisma.renewal.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.combo.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.account.deleteMany();
  await prisma.comboPlatform.deleteMany();
  await prisma.comboTemplate.deleteMany();
  await prisma.platform.deleteMany();
  await prisma.referral.deleteMany();
  await prisma.user.deleteMany();

  // 1. Crear las 3 plataformas del MVP
  console.log('📱 Creando plataformas...');
  
  const disneyPlus = await prisma.platform.create({
    data: {
      name: 'Disney+',
      logoUrl: 'https://prod-ripcut-delivery.disney-plus.net/v1/variant/disney/D7AEE1F05D10FC37C873176AAA26F777FC1B71E7A6563F36C6B1B497116C0454/scale?width=300',
      description: 'Contenido para toda la familia: Disney, Pixar, Marvel, Star Wars',
      isActive: true
    }
  });

  const hboMax = await prisma.platform.create({
    data: {
      name: 'HBO Max',
      logoUrl: 'https://logos-world.net/wp-content/uploads/2022/01/HBO-Max-Logo.png',
      description: 'Series y películas premium de HBO, Warner Bros y más',
      isActive: true
    }
  });

  const canvaPro = await prisma.platform.create({
    data: {
      name: 'Canva Pro',
      logoUrl: 'https://static.canva.com/web/images/8439b51bb7a19f6e65ce1064bc37c197.svg',
      description: 'Herramientas profesionales de diseño gráfico',
      isActive: true
    }
  });

  console.log('✅ Plataformas creadas:');
  console.log(`   • ${disneyPlus.name}`);
  console.log(`   • ${hboMax.name}`);
  console.log(`   • ${canvaPro.name}\n`);

  // 2. Crear los 3 templates de combos del MVP
  console.log('🎯 Creando templates de combos...');
  
  const comboEntretenimiento = await prisma.comboTemplate.create({
    data: {
      name: 'Combo Entretenimiento',
      description: 'Disney+ y HBO Max - Todo el entretenimiento que necesitas',
      price: null, // Por definir
      isActive: true
    }
  });

  const comboCreativo = await prisma.comboTemplate.create({
    data: {
      name: 'Combo Creativo',
      description: 'Disney+ y Canva Pro - Entretenimiento y herramientas creativas',
      price: null, // Por definir
      isActive: true
    }
  });

  const comboCompleto = await prisma.comboTemplate.create({
    data: {
      name: 'Combo Completo',
      description: 'Disney+, HBO Max y Canva Pro - La experiencia completa',
      price: null, // Por definir
      isActive: true
    }
  });

  console.log('✅ Templates de combos creados:');
  console.log(`   • ${comboEntretenimiento.name}`);
  console.log(`   • ${comboCreativo.name}`);
  console.log(`   • ${comboCompleto.name}\n`);

  // 3. Conectar plataformas con combos
  console.log('🔗 Conectando plataformas con combos...');

  // Combo Entretenimiento: Disney+ + HBO Max
  await prisma.comboPlatform.createMany({
    data: [
      { comboTemplateId: comboEntretenimiento.id, platformId: disneyPlus.id },
      { comboTemplateId: comboEntretenimiento.id, platformId: hboMax.id }
    ]
  });

  // Combo Creativo: Disney+ + Canva Pro
  await prisma.comboPlatform.createMany({
    data: [
      { comboTemplateId: comboCreativo.id, platformId: disneyPlus.id },
      { comboTemplateId: comboCreativo.id, platformId: canvaPro.id }
    ]
  });

  // Combo Completo: Disney+ + HBO Max + Canva Pro
  await prisma.comboPlatform.createMany({
    data: [
      { comboTemplateId: comboCompleto.id, platformId: disneyPlus.id },
      { comboTemplateId: comboCompleto.id, platformId: hboMax.id },
      { comboTemplateId: comboCompleto.id, platformId: canvaPro.id }
    ]
  });

  console.log('✅ Conexiones creadas exitosamente\n');

  // 4. Crear cuentas de ejemplo para cada plataforma (opcional para desarrollo)
  console.log('🔐 Creando cuentas de ejemplo...');
  
  const disneyAccount = await prisma.account.create({
    data: {
      platformId: disneyPlus.id,
      email: 'disney.example@clubplus.mx',
      password: 'encrypted_password_here', // En producción: bcrypt
      status: 'ACTIVE',
      maxProfiles: 4
    }
  });

  const hboAccount = await prisma.account.create({
    data: {
      platformId: hboMax.id,
      email: 'hbo.example@clubplus.mx',
      password: 'encrypted_password_here', // En producción: bcrypt
      status: 'ACTIVE',
      maxProfiles: 5
    }
  });

  const canvaAccount = await prisma.account.create({
    data: {
      platformId: canvaPro.id,
      email: 'canva.example@clubplus.mx',
      password: 'encrypted_password_here', // En producción: bcrypt
      status: 'ACTIVE',
      maxProfiles: 3
    }
  });

  // 5. Crear perfiles de ejemplo
  console.log('👤 Creando perfiles de ejemplo...');
  
  // Perfiles Disney+
  await prisma.profile.createMany({
    data: [
      { accountId: disneyAccount.id, profileName: 'Perfil 1', status: 'AVAILABLE' },
      { accountId: disneyAccount.id, profileName: 'Perfil 2', status: 'AVAILABLE' },
      { accountId: disneyAccount.id, profileName: 'Perfil 3', status: 'AVAILABLE' },
      { accountId: disneyAccount.id, profileName: 'Perfil 4', status: 'AVAILABLE' }
    ]
  });

  // Perfiles HBO Max
  await prisma.profile.createMany({
    data: [
      { accountId: hboAccount.id, profileName: 'Perfil 1', status: 'AVAILABLE' },
      { accountId: hboAccount.id, profileName: 'Perfil 2', status: 'AVAILABLE' },
      { accountId: hboAccount.id, profileName: 'Perfil 3', status: 'AVAILABLE' },
      { accountId: hboAccount.id, profileName: 'Perfil 4', status: 'AVAILABLE' },
      { accountId: hboAccount.id, profileName: 'Perfil 5', status: 'AVAILABLE' }
    ]
  });

  // Perfiles Canva Pro
  await prisma.profile.createMany({
    data: [
      { accountId: canvaAccount.id, profileName: 'Usuario 1', status: 'AVAILABLE' },
      { accountId: canvaAccount.id, profileName: 'Usuario 2', status: 'AVAILABLE' },
      { accountId: canvaAccount.id, profileName: 'Usuario 3', status: 'AVAILABLE' }
    ]
  });

  console.log('✅ Seed completado exitosamente!\n');
  
  // Resumen final
  console.log('📊 RESUMEN DEL MVP:');
  console.log('==================');
  console.log('🎬 Plataformas disponibles: 3');
  console.log('   • Disney+ (Entretenimiento familiar)');
  console.log('   • HBO Max (Series y películas premium)');
  console.log('   • Canva Pro (Herramientas de diseño)');
  console.log('');
  console.log('🎯 Combos del MVP: 3');
  console.log('   • Combo Entretenimiento: Disney+ + HBO Max');
  console.log('   • Combo Creativo: Disney+ + Canva Pro');
  console.log('   • Combo Completo: Disney+ + HBO Max + Canva Pro');
  console.log('');
  console.log('🔐 Cuentas creadas: 3 (una por plataforma)');
  console.log('👤 Perfiles disponibles: 12 (4 Disney+, 5 HBO Max, 3 Canva Pro)');
  console.log('');
  console.log('💰 Precios: Pendientes de definir');
  console.log('🚀 ¡El MVP está listo para desarrollo!');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
