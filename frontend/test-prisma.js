const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const manuals = await prisma.userManualLibrary.findMany();
  console.log(manuals);
}
main().catch(console.error).finally(() => prisma.$disconnect());
