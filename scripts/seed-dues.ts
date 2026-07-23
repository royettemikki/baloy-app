import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const homeowners = await prisma.homeowner.findMany();

  for (const owner of homeowners) {
    const existing = await prisma.duesCharge.count({
      where: { homeownerId: owner.id },
    });
    if (existing > 0) continue; // don't duplicate if you run this script twice

    await prisma.duesCharge.createMany({
      data: [
        {
          homeownerId: owner.id,
          description: 'Monthly assessment',
          amount: 245,
          dueDate: new Date('2026-05-01'),
          status: 'Paid',
        },
        {
          homeownerId: owner.id,
          description: 'Roof reserve — special',
          amount: 120,
          dueDate: new Date('2026-05-15'),
          status: 'Paid',
        },
        {
          homeownerId: owner.id,
          description: 'Monthly assessment',
          amount: 245,
          dueDate: new Date('2026-06-01'),
          status: 'Paid',
        },
        {
          homeownerId: owner.id,
          description: 'Monthly assessment',
          amount: 245,
          dueDate: new Date('2026-07-01'),
          status: 'Paid',
        },
        {
          homeownerId: owner.id,
          description: 'Monthly assessment',
          amount: 245,
          dueDate: new Date('2026-08-01'),
          status: 'Due',
        },
      ],
    });
    console.log(`Seeded dues for ${owner.email}`);
  }
}

main().finally(() => prisma.$disconnect());
