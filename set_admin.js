require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setAdmin() {
  const users = await prisma.user.findMany();
  let adminExists = false;
  for (const u of users) {
    if (u.role === 'ADMIN') {
        console.log('Found an ADMIN:', u.email);
        adminExists = true;
    }
  }

  // Update 1234@1234 to ADMIN
  const target = await prisma.user.findUnique({ where: { email: '1234@1234' } });
  if (target) {
    await prisma.user.update({
      where: { email: '1234@1234' },
      data: { role: 'ADMIN' }
    });
    console.log('Successfully updated 1234@1234 to ADMIN role!');
  }
}
setAdmin().finally(() => prisma.$disconnect());
