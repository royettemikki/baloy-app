import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Deletion order matters: Vote references Candidate and Position,
  // Candidate references Position, Position references Election.
  // Deleting in the wrong order would hit the same foreign-key error
  // we ran into with dues charges earlier.
  const votes = await prisma.vote.deleteMany({});
  const candidates = await prisma.candidate.deleteMany({});
  const positions = await prisma.position.deleteMany({});
  const elections = await prisma.election.deleteMany({});

  console.log('Cleared:');
  console.log(`  ${votes.count} vote(s)`);
  console.log(`  ${candidates.count} candidate(s)`);
  console.log(`  ${positions.count} position(s)`);
  console.log(`  ${elections.count} election(s)`);

  const election = await prisma.election.create({
    data: {
      title: '2026 Board Election',
      closesAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
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

  console.log(
    `\nCreated fresh election #${election.id}, closes ${election.closesAt}`,
  );
}

main().finally(() => prisma.$disconnect());
