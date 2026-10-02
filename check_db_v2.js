require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function check() {
  const users = await prisma.user.findMany();
  console.log('Total users:', users.length);
  for (const u of users) {
    if (u.email === 'c28302998@gmail.com' || u.email === '1234@1234') {
       console.log('Found:', u.email, u.role, u.status);
       
       // If requested, I can reset password
       // const hashedPassword = await bcrypt.hash('password123', 10);
       // await prisma.user.update({
       //   where: { id: u.id },
       //   data: { password: hashedPassword }
       // });
       // console.log('Reset password for', u.email);
    }
  }
}
check().finally(() => prisma.$disconnect());
