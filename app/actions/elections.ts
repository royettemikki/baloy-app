'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function castBallotAction(
  selections: { positionId: number; candidateId: number }[],
) {
  const session = await getServerSession(authOptions);
  const homeownerId = (session?.user as any)?.id;
  if (!homeownerId) return { error: 'You must be signed in.' };
  if (selections.length === 0) return { error: 'Nothing to submit.' };

  for (const { positionId, candidateId } of selections) {
    const position = await prisma.position.findUnique({
      where: { id: positionId },
      include: { election: true },
    });
    if (!position) return { error: 'One of the positions could not be found.' };
    if (new Date() > position.election.closesAt)
      return { error: 'Voting has closed for this election.' };

    const candidate = await prisma.candidate.findFirst({
      where: { id: candidateId, positionId },
    });
    if (!candidate) return { error: 'One of your selections is invalid.' };

    const existing = await prisma.vote.findUnique({
      where: { positionId_homeownerId: { positionId, homeownerId } },
    });
    if (existing)
      return { error: 'You have already voted for one of these positions.' };
  }

  await prisma.$transaction(
    selections.map(({ positionId, candidateId }) =>
      prisma.vote.create({ data: { positionId, candidateId, homeownerId } }),
    ),
  );

  return { success: true };
}
