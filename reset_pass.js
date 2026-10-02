const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany();
  console.log('Total users:', users.length);
  const admin = users.find(u => u.email === 'c28302998@gmail.com');
  if (admin) {
    console.log('Admin found:', admin.email, admin.role);
    const hash = await bcrypt.hash('Danilchik200822_', 10);
    await prisma.user.update({
      where: { id: admin.id },
      data: { password: hash, role: 'ADMIN' }
    });
    console.log('Password reset to Danilchik200822_ and role set to ADMIN');
  } else {
    console.log('Admin not found!');
  }
}
check();
