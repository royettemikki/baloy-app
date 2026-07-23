import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  const [, , email, fullName, unit] = process.argv;

  if (!email || !fullName || !unit) {
    console.log(
      'Usage: npx tsx scripts/create-invite.ts <email> "<full name>" <unit>',
    );
    process.exit(1);
  }

  const inviteToken = crypto.randomBytes(24).toString('hex');

  await prisma.homeowner.create({
    data: { email, fullName, unit, inviteToken, invitedAt: new Date() },
  });

  console.log('Homeowner record created.');
  console.log(
    `Invite link: http://localhost:3000/register?token=${inviteToken}`,
  );
}

main().finally(() => prisma.$disconnect());
