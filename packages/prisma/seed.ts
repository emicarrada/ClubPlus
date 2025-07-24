import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed de la base de datos...');

  // Crear las 3 plataformas para el MVP
  const canvaPro = await prisma.platform.upsert({
    where: { name: 'Canva Pro' },
    update: {},
    create: {
      name: 'Canva Pro',
      logoUrl: 'https://canva.com/logo.png',
      pricePerProfile: 12.99
    }
  });

  const hboMax = await prisma.platform.upsert({
    where: { name: 'HBO Max' },
    update: {},
    create: {
      name: 'HBO Max',
      logoUrl: 'https://hbomax.com/logo.png',
      pricePerProfile: 15.99
    }
  });

  const disneyPlus = await prisma.platform.upsert({
    where: { name: 'Disney+' },
    update: {},
    create: {
      name: 'Disney+',
      logoUrl: 'https://disneyplus.com/logo.png',
      pricePerProfile: 10.99
    }
  });

  // Crear los 3 planes del MVP
  const planCanva = await prisma.plan.upsert({
    where: { name: 'Plan Creativo' },
    update: {},
    create: {
      name: 'Plan Creativo',
      description: 'Perfecto para diseñadores y creadores de contenido',
      price: 9.99,
      platformId: canvaPro.id,
      isActive: true
    }
  });

  const planStreaming = await prisma.plan.upsert({
    where: { name: 'Plan Entretenimiento' },
    update: {},
    create: {
      name: 'Plan Entretenimiento',
      description: 'Lo mejor en series y películas de HBO',
      price: 12.99,
      platformId: hboMax.id,
      isActive: true
    }
  });

  const planFamiliar = await prisma.plan.upsert({
    where: { name: 'Plan Familiar' },
    update: {},
    create: {
      name: 'Plan Familiar',
      description: 'Contenido para toda la familia con Disney+',
      price: 8.99,
      platformId: disneyPlus.id,
      isActive: true
    }
  });

  console.log('Seed completado exitosamente!');
  console.log('Plataformas creadas:');
  console.log('- Canva Pro');
  console.log('- HBO Max');
  console.log('- Disney+');
  console.log('Planes creados:');
  console.log('- Plan Creativo (Canva Pro)');
  console.log('- Plan Entretenimiento (HBO Max)');
  console.log('- Plan Familiar (Disney+)');
}

main()
  .catch((e) => {
    console.error('Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
