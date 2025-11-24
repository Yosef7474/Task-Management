const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

// Auto-reconnect middleware
prisma.$use(async (params, next) => {
  try {
    return await next(params);
  } catch (error) {
    if (error.code === 'P1001' || error.message.includes('Closed')) {
      console.log('🔄 Database connection lost, reconnecting...');
      await prisma.$disconnect();
      await prisma.$connect();
      return await next(params);
    }
    throw error;
  }
});

// Test connection on startup
prisma.$connect()
  .then(() => console.log('✅ Database connected'))
  .catch(err => console.error('❌ Connection failed:', err.message));

module.exports = prisma;