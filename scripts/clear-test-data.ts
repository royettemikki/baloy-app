import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const [, , email] = process.argv;

  if (!email) {
    console.log('Usage: npx tsx scripts/clear-test-data.ts <email>');
    process.exit(1);
  }

  const homeowner = await prisma.homeowner.findUnique({ where: { email } });
  if (!homeowner) {
    console.log(`No homeowner found with email: ${email}`);
    process.exit(1);
  }

  // Order matters: Payment rows reference DuesCharge rows, so they must
  // be deleted first, or the database will block the DuesCharge delete.
  const payments = await prisma.payment.deleteMany({
    where: { homeownerId: homeowner.id },
  });
  const charges = await prisma.duesCharge.deleteMany({
    where: { homeownerId: homeowner.id },
  });
  const votes = await prisma.vote.deleteMany({
    where: { homeownerId: homeowner.id },
  });

  console.log(`Cleared for ${email}:`);
  console.log(`  ${payments.count} payment(s)`);
  console.log(`  ${charges.count} dues charge(s)`);
  console.log(`  ${votes.count} vote(s)`);
  console.log(
    'Account itself was left intact — still logged in, still same password.',
  );
}

main().finally(() => prisma.$disconnect());
