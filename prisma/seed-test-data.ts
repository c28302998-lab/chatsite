import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding mock data...');

  const passwordHash = await bcrypt.hash('1234', 10);

  // 1. Create Recruiter 1234@1234
  const recruiter = await prisma.user.upsert({
    where: { email: '1234@1234' },
    update: { password: passwordHash, role: 'PARTNER', status: 'ACTIVE' },
    create: {
      email: '1234@1234',
      name: 'Test Recruiter (1234)',
      password: passwordHash,
      role: 'PARTNER',
      status: 'ACTIVE',
      balance: 1500.50,
    },
  });

  console.log('Recruiter created:', recruiter.id);

  // 2. Create Band for this recruiter
  let band = await prisma.band.findUnique({ where: { ownerId: recruiter.id } });
  if (!band) {
    band = await prisma.band.create({
      data: {
        name: 'The 1234 Team',
        ownerId: recruiter.id,
      },
    });
  }
  console.log('Band created:', band.id);

  // Update recruiter with band
  await prisma.user.update({
    where: { id: recruiter.id },
    data: { bandId: band.id },
  });

  // 3. Create some applications
  // Application 1: In Progress
  await prisma.application.create({
    data: {
      name: 'Кандидат Ожидает',
      telegram: '@waiting_guy',
      phone: '+1234567890',
      status: 'IN_PROGRESS',
      recruiterId: recruiter.id,
    }
  });

  // Application 2: Interview Scheduled
  await prisma.application.create({
    data: {
      name: 'Кандидат Собес',
      telegram: '@sobes_guy',
      status: 'INTERVIEW_SCHEDULED',
      interviewDate: new Date(Date.now() + 86400000), // tomorrow
      interviewText: 'Привет! Ждем тебя завтра в 14:00 на созвон в Telegram.',
      recruiterId: recruiter.id,
    }
  });

  // 4. Create Chatters
  const chatter1 = await prisma.user.create({
    data: {
      name: 'Чатер Активный',
      email: 'chatter1@test.com',
      password: passwordHash,
      role: 'CHATTER',
      status: 'ACTIVE',
      bandId: band.id,
      invitedById: recruiter.id,
    }
  });

  const chatter2 = await prisma.user.create({
    data: {
      name: 'Чатер Новичок',
      email: 'chatter2@test.com',
      password: passwordHash,
      role: 'CHATTER',
      status: 'ACTIVE',
      bandId: band.id,
      invitedById: recruiter.id,
    }
  });

  console.log('Chatters created.');

  // 5. Create Reports
  // Pending review report
  await prisma.report.create({
    data: {
      chatterId: chatter1.id,
      shiftStart: new Date(Date.now() - 40000000),
      shiftEnd: new Date(Date.now() - 10000000),
      profitAmount: 250.00,
      status: 'PENDING_REVIEW',
      screenshot: 'https://example.com/screenshot1.png',
      accountAccess: 'log:pass123',
    }
  });

  // Pending calculation report
  await prisma.report.create({
    data: {
      chatterId: chatter2.id,
      shiftStart: new Date(Date.now() - 80000000),
      shiftEnd: new Date(Date.now() - 50000000),
      profitAmount: 100.00,
      status: 'PENDING_CALCULATION',
      screenshot: 'https://example.com/screenshot2.png',
      accountAccess: 'log2:pass456',
    }
  });

  // Approved report
  await prisma.report.create({
    data: {
      chatterId: chatter1.id,
      shiftStart: new Date(Date.now() - 120000000),
      shiftEnd: new Date(Date.now() - 90000000),
      profitAmount: 500.00,
      status: 'APPROVED',
      screenshot: 'https://example.com/screenshot3.png',
      accountAccess: 'log3:pass789',
      chatterAmount: 250,
      recruiterAmount: 50,
      ownerAmount: 200,
      adminAmount: 0,
    }
  });

  console.log('Reports created.');

  // 6. Create a Sub-Recruiter for Max
  const subRecruiter = await prisma.user.create({
    data: {
      email: 'sub@1234',
      name: 'Младший Рекрутер (sub)',
      password: passwordHash,
      role: 'PARTNER',
      status: 'ACTIVE',
      bandId: band.id,
      invitedById: recruiter.id,
    }
  });

  // 7. Create a Chatter for this Sub-Recruiter
  const subChatter = await prisma.user.create({
    data: {
      name: 'Чатер от Саба',
      email: 'subchatter@test.com',
      password: passwordHash,
      role: 'CHATTER',
      status: 'ACTIVE',
      bandId: band.id,
      invitedById: subRecruiter.id,
    }
  });

  // 8. Create a pending report for this Sub-Chatter
  await prisma.report.create({
    data: {
      chatterId: subChatter.id,
      shiftStart: new Date(Date.now() - 30000000),
      shiftEnd: new Date(Date.now() - 5000000),
      profitAmount: 300.00,
      status: 'PENDING_CALCULATION',
      screenshot: 'https://example.com/screenshot_sub.png',
      accountAccess: 'sub:sub123',
    }
  });

  console.log('Sub-recruiter and chatters created.');
  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
