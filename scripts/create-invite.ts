import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { normalizePropertyUnit } from '../lib/propertyUnit';

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

  await prisma.$transaction(async (tx) => {
    const trimmedUnit = unit.trim();
    const normalizedUnit = normalizePropertyUnit(trimmedUnit);
    const property = await tx.property.upsert({
      where: { normalizedUnit },
      update: {},
      create: { unit: trimmedUnit, normalizedUnit },
    });
    await tx.homeowner.create({
      data: {
        email,
        fullName,
        unit: property.unit,
        propertyId: property.id,
        inviteToken,
        invitedAt: new Date(),
      },
    });
  });

  console.log('Homeowner record created.');
  console.log(
    `Invite link: http://localhost:3000/register?token=${inviteToken}`,
  );
}

main().finally(() => prisma.$disconnect());
