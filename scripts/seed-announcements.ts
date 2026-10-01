import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.announcement.createMany({
    data: [
      {
        title: 'Pool closed for resurfacing',
        body: 'The main pool will be closed July 24 to 26 while the deck is resealed. The kiddie pool stays open.',
        tag: 'Maintenance',
        pinned: true,
        postedBy: 'Facilities',
      },
      {
        title: 'Summer block party, Saturday August 9',
        body: 'Grills go up at 4pm in the north lot. Sign up at the clubhouse to bring a dish or lend a table.',
        tag: 'Event',
        pinned: false,
        postedBy: 'Social committee',
      },
      {
        title: 'Gate code changing August 1',
        body: 'The Birchwood entrance code changes at the start of August. New codes go out by email.',
        tag: 'Safety',
        pinned: false,
        postedBy: 'Security committee',
      },
      {
        title: 'July board meeting minutes posted',
        body: 'Minutes from July 10 are up in the documents library, including the reserve fund review.',
        tag: 'Board',
        pinned: false,
        postedBy: 'Board secretary',
      },
    ],
  });
  console.log('Seeded announcements.');
}

main().finally(() => prisma.$disconnect());
