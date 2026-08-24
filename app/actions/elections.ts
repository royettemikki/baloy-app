'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getAdminOrNull } from '@/lib/adminAuth';
import { isVotingOpen } from '@/lib/electionWindows';
import { STANDARD_POSITION_TEMPLATE } from '@/constants/positionTemplates';

export async function castBallotAction(selections: { positionId: number; candidateId: number }[]) {
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
    if (!isVotingOpen(position.election)) {
      return { error: 'Voting is not currently open for this election.' };
    }

    const candidate = await prisma.candidate.findFirst({ where: { id: candidateId, positionId } });
    if (!candidate) return { error: 'One of your selections is invalid.' };

    const existing = await prisma.vote.findUnique({
      where: { positionId_homeownerId: { positionId, homeownerId } },
    });
    if (existing) return { error: 'You have already voted for one of these positions.' };
  }

  await prisma.$transaction(
    selections.map(({ positionId, candidateId }) =>
      prisma.vote.create({ data: { positionId, candidateId, homeownerId } }),
    ),
  );

  return { success: true };
}

export async function linkCandidateAction(candidateId: number, homeownerId: string | null) {
  const admin = await getAdminOrNull();
  if (!admin) return { error: 'You do not have permission to do this.' };

  await prisma.candidate.update({ where: { id: candidateId }, data: { homeownerId } });
  revalidatePath('/admin/elections');
  return { success: true };
}

export async function createElectionAction(
  title: string,
  filingDurationHours: number,
  votingDurationHours: number,
) {
  const admin = await getAdminOrNull();
  if (!admin) return { error: 'You do not have permission to do this.' };
  if (!title.trim()) return { error: 'Title is required.' };
  if (!filingDurationHours || filingDurationHours <= 0)
    return { error: 'Filing period must be greater than 0 hours.' };
  if (!votingDurationHours || votingDurationHours <= 0)
    return { error: 'Voting period must be greater than 0 hours.' };

  const election = await prisma.election.create({
    data: { title, filingDurationHours, votingDurationHours },
  });
  revalidatePath('/admin/elections');
  return { success: true, electionId: election.id };
}

export async function createPositionAction(electionId: number, title: string, seats: number) {
  const admin = await getAdminOrNull();
  if (!admin) return { error: 'You do not have permission to do this.' };
  if (!title.trim()) return { error: 'Position title is required.' };
  if (!seats || seats < 1) return { error: 'Seats must be at least 1.' };

  await prisma.position.create({ data: { electionId, title, seats } });
  revalidatePath('/admin/elections');
  return { success: true };
}

export async function createCandidateFromAccountAction(
  positionId: number,
  homeownerId: string,
  ballotNumber: number,
  isIncumbent: boolean,
) {
  const admin = await getAdminOrNull();
  if (!admin) return { error: 'You do not have permission to do this.' };

  const position = await prisma.position.findUnique({
    where: { id: positionId },
    include: { election: true },
  });
  if (!position) return { error: 'Position not found.' };
  if (position.election.votingOpensAt) {
    return { error: 'Cannot add a candidate once voting has started for this election.' };
  }

  const homeowner = await prisma.homeowner.findUnique({ where: { id: homeownerId } });
  if (!homeowner) return { error: 'Resident not found.' };

  await prisma.candidate.create({
    data: {
      positionId,
      homeownerId,
      name: homeowner.fullName,
      roleDescription: `Unit ${homeowner.unit}`,
      ballotNumber,
      isIncumbent,
    },
  });

  revalidatePath('/admin/elections');
  return { success: true };
}

export async function updatePositionAction(positionId: number, title: string, seats: number) {
  const admin = await getAdminOrNull();
  if (!admin) return { error: 'You do not have permission to do this.' };
  if (!title.trim()) return { error: 'Position title is required.' };
  if (!seats || seats < 1) return { error: 'Seats must be at least 1.' };

  const position = await prisma.position.findUnique({
    where: { id: positionId },
    include: { election: true },
  });
  if (!position) return { error: 'Position not found.' };
  if (position.election.closesAt && position.election.closesAt < new Date()) {
    return { error: 'Cannot edit a position in a closed election.' };
  }

  await prisma.position.update({ where: { id: positionId }, data: { title, seats } });
  revalidatePath('/admin/elections');
  return { success: true };
}

export async function deletePositionAction(positionId: number) {
  const admin = await getAdminOrNull();
  if (!admin) return { error: 'You do not have permission to do this.' };

  const position = await prisma.position.findUnique({
    where: { id: positionId },
    include: { election: true, candidates: true },
  });
  if (!position) return { error: 'Position not found.' };
  if (position.election.closesAt && position.election.closesAt < new Date()) {
    return { error: 'Cannot delete a position in a closed election.' };
  }
  if (position.candidates.length > 0) {
    return { error: 'Remove all candidates from this position before deleting it.' };
  }

  await prisma.position.delete({ where: { id: positionId } });
  revalidatePath('/admin/elections');
  return { success: true };
}

export async function applyPositionTemplateAction(electionId: number) {
  const admin = await getAdminOrNull();
  if (!admin) return { error: 'You do not have permission to do this.' };

  const existingPositions = await prisma.position.findMany({
    where: { electionId },
    select: { title: true },
  });
  const existingTitles = new Set(existingPositions.map((p) => p.title));
  const toCreate = STANDARD_POSITION_TEMPLATE.filter((t) => !existingTitles.has(t.title));

  if (toCreate.length === 0) {
    return { error: 'All standard positions already exist for this election.' };
  }

  await prisma.position.createMany({
    data: toCreate.map((t) => ({ electionId, title: t.title, seats: t.seats })),
  });

  revalidatePath('/admin/elections');
  return { success: true, addedCount: toCreate.length };
}

export async function startFilingAction(electionId: number) {
  const admin = await getAdminOrNull();
  if (!admin) return { error: 'You do not have permission to do this.' };

  const election = await prisma.election.findUnique({ where: { id: electionId } });
  if (!election) return { error: 'Election not found.' };
  if (election.filingOpensAt) return { error: 'Filing has already started for this election.' };

  const positionCount = await prisma.position.count({ where: { electionId } });
  if (positionCount === 0) {
    return { error: 'Add at least one position before opening this election for filing.' };
  }

  const now = new Date();
  const filingClosesAt = new Date(now.getTime() + election.filingDurationHours * 60 * 60 * 1000);

  await prisma.election.update({
    where: { id: electionId },
    data: { filingOpensAt: now, filingClosesAt },
  });
  revalidatePath('/admin/elections');
  return { success: true };
}

export async function startVotingAction(electionId: number) {
  const admin = await getAdminOrNull();
  if (!admin) return { error: 'You do not have permission to do this.' };

  const election = await prisma.election.findUnique({ where: { id: electionId } });
  if (!election) return { error: 'Election not found.' };
  if (!election.filingOpensAt) return { error: 'Filing has not started yet.' };
  if (election.votingOpensAt) return { error: 'Voting has already started.' };

  const pendingFilingsCount = await prisma.candidacyFiling.count({
    where: { position: { electionId }, status: 'Pending' },
  });
  if (pendingFilingsCount > 0) {
    return {
      error: `There ${pendingFilingsCount === 1 ? 'is' : 'are'} still ${pendingFilingsCount} unreviewed candidacy filing${pendingFilingsCount === 1 ? '' : 's'} for this election. Approve or reject every filing before starting voting.`,
    };
  }

  const now = new Date();
  const closesAt = new Date(now.getTime() + election.votingDurationHours * 60 * 60 * 1000);

  await prisma.election.update({
    where: { id: electionId },
    data: {
      votingOpensAt: now,
      closesAt,
      filingClosesAt:
        election.filingClosesAt && election.filingClosesAt < now ? election.filingClosesAt : now,
    },
  });

  revalidatePath('/admin/elections');
  return { success: true };
}
