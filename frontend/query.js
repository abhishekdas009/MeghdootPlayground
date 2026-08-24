require('dotenv').config({ path: '.env.local' });
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const result = await prisma.$queryRawUnsafe(`SELECT tablename FROM pg_tables WHERE schemaname='public'`);
    console.log('Tables:', result);
    const count = await prisma.warrantyCondition.count();
    console.log('Count:', count);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
