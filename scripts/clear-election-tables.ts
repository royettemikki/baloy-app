import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.position.deleteMany({});
  await prisma.slate.deleteMany({});
  await prisma.election.deleteMany({});
  console.log('Cleared Position, Slate, and Election.');
}

main().finally(() => prisma.$disconnect());
