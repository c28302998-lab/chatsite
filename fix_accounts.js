require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function updateDB() {
  // Set 1234@1234 back to PARTNER
  await prisma.user.update({
    where: { email: '1234@1234' },
    data: { role: 'PARTNER' }
  });
  console.log('Reverted 1234@1234 back to PARTNER');

  // Check if c28302998@gmail.com exists
  let adminUser = await prisma.user.findUnique({
    where: { email: 'c28302998@gmail.com' }
  });

  const hashedPassword = await bcrypt.hash('Danilchik200822_', 10);

  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        email: 'c28302998@gmail.com',
        name: 'Главный Админ',
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
      }
    });
    console.log('Created c28302998@gmail.com as ADMIN');
  } else {
    await prisma.user.update({
      where: { email: 'c28302998@gmail.com' },
      data: { 
        role: 'ADMIN',
        password: hashedPassword,
        status: 'ACTIVE'
      }
    });
    console.log('Updated c28302998@gmail.com as ADMIN and reset password');
  }
}

updateDB()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
