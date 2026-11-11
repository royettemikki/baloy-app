import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { normalizePropertyUnit } from '../lib/propertyUnit';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_RESIDENT_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_RESIDENT_PASSWORD;
  const fullName = process.env.SEED_RESIDENT_NAME?.trim();
  const unit = process.env.SEED_RESIDENT_UNIT?.trim();
  if (!email || !password || password.length < 8 || !fullName || !unit) {
    throw new Error(
      'Set SEED_RESIDENT_EMAIL, SEED_RESIDENT_PASSWORD (at least 8 characters), SEED_RESIDENT_NAME, and SEED_RESIDENT_UNIT before seeding.',
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.$transaction(async (tx) => {
    const trimmedUnit = unit.trim();
    const property = await tx.property.upsert({
      where: { normalizedUnit: normalizePropertyUnit(trimmedUnit) },
      update: {},
      create: {
        unit: trimmedUnit,
        normalizedUnit: normalizePropertyUnit(trimmedUnit),
      },
    });
    await tx.homeowner.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash,
        fullName,
        unit: property.unit,
        propertyId: property.id,
      },
    });
  });
  console.log(`Seeded resident ${email}.`);
}

main().finally(() => prisma.$disconnect());
