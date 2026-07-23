import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const election = await prisma.election.create({
    data: {
      title: '2026 Board Election',
      closesAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      positions: {
        create: [
          {
            title: 'President',
            seats: 1,
            candidates: {
              create: [
                {
                  name: 'Renata Osei',
                  roleDescription: 'Incumbent Treasurer · Unit 6C',
                },
                {
                  name: 'Marcus Ibarra',
                  roleDescription: 'Landscaping Chair · Unit 21A',
                },
              ],
            },
          },
          {
            title: 'Treasurer',
            seats: 1,
            candidates: {
              create: [
                {
                  name: 'Priya Chandran',
                  roleDescription: 'New candidate · Unit 9D',
                },
                {
                  name: 'Owen Fletcher',
                  roleDescription: 'New candidate · Unit 3B',
                },
              ],
            },
          },
        ],
      },
    },
  });
  console.log(`Seeded election #${election.id} with 2 positions`);
}

main().finally(() => prisma.$disconnect());
