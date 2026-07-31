import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const [, , email] = process.argv;

  if (!email) {
    console.log('Usage: npx tsx scripts/seed-test-charge.ts <email>');
    process.exit(1);
  }

  const homeowner = await prisma.homeowner.findUnique({ where: { email } });
  if (!homeowner) {
    console.log(`No homeowner found with email: ${email}`);
    process.exit(1);
  }

  const charge = await prisma.duesCharge.create({
    data: {
      homeownerId: homeowner.id,
      description: 'Monthly assessment',
      amount: 245,
      dueDate: new Date(),
      status: 'Due'
    }
  });

  console.log(`Created charge #${charge.id} for ${email} — ₱${charge.amount}, status: Due`);
}

main().finally(() => prisma.$disconnect());