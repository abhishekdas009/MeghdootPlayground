import { prisma } from './lib/prisma'; prisma.warrantyCondition.findMany({ where: { models: '' } }).then(c => console.log(c.length)).finally(() => prisma.());  
