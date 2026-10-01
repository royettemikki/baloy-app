import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('CorrectHorse9!', 10);
  await prisma.homeowner.upsert({
    where: { email: 'dana@example.com' },
    update: {},
    create: {
      email: 'dana@example.com',
      passwordHash,
      fullName: 'Dana Whitfield',
      unit: '14B',
    },
  });
  console.log('Seeded dana@example.com / CorrectHorse9!');
}

main().finally(() => prisma.$disconnect());
