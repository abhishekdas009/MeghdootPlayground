const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });
dotenv.config({ path: '../.env.local' });
dotenv.config({ path: '../.env' });

console.log('DATABASE_URL starts with:', process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 30) + '...' : 'NONE');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const count = await prisma.warrantyCondition.count();
    console.log('Total WarrantyCondition rows in DB:', count);
    if (count > 0) {
      const sample = await prisma.warrantyCondition.findMany({ take: 5 });
      console.log('Sample rows:', JSON.stringify(sample, null, 2));

      // Test search for IA412FNU
      const found = await prisma.warrantyCondition.findMany({
        where: {
          models: { contains: 'IA412FNU', mode: 'insensitive' }
        }
      });
      console.log('Search for IA412FNU found:', found.length, 'records');
      console.log('Found records:', JSON.stringify(found, null, 2));
    }
  } catch (e) {
    console.error('Error querying Prisma:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
