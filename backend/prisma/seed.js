const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  const hashedPassword = await bcrypt.hash('password123', 12);
  
  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@taskmanager.com' },
    update: {},
    create: {
      email: 'admin@taskmanager.com',
      password: hashedPassword,
      name: 'System Administrator',
      role: 'ADMIN',
    },
  });

  // Create manager user
  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@taskmanager.com' },
    update: {},
    create: {
      email: 'manager@taskmanager.com',
      password: hashedPassword,
      name: 'Project Manager',
      role: 'MANAGER',
    },
  });

  // Create regular user
  const regularUser = await prisma.user.upsert({
    where: { email: 'user@taskmanager.com' },
    update: {},
    create: {
      email: 'user@taskmanager.com',
      password: hashedPassword,
      name: 'Regular User',
      role: 'USER',
    },
  });

  console.log('✅ Users created:');
  console.log(`   Admin: ${adminUser.email} (password: password123)`);
  console.log(`   Manager: ${managerUser.email} (password: password123)`);
  console.log(`   User: ${regularUser.email} (password: password123)`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });