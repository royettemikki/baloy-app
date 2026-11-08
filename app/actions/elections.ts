'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getAdminOrNull } from '@/lib/adminAuth';
import { isVotingOpen } from '@/lib/electionWindows';
import { STANDARD_POSITION_TEMPLATE } from '@/constants/positionTemplates';

async function getBallotStructureLockError(electionId: number) {
  const election = await prisma.election.findUnique({
    where: { id: electionId },
    select: { votingOpensAt: true, closesAt: true },
  });
  if (!election) return 'Election not found.';
  if (election.votingOpensAt) return 'The ballot is locked because voting has started.';
  if (election.closesAt && election.closesAt < new Date()) return 'This election is closed.';
  return null;
}

export async function castBallotAction(selections: { positionId: number; candidateId: number }[]) {
  const session = await getServerSession(authOptions);
  const homeownerId = (session?.user as any)?.id;
  if (!homeownerId) return { error: 'You must be signed in.' };
  if (!Array.isArray(selections) || selections.length === 0) {
    return { error: 'Nothing to submit.' };
  }

  if (
    selections.some(
      ({ positionId, candidateId }) =>
        !Number.isSafeInteger(positionId) || !Number.isSafeInteger(candidateId),
    )
  ) {
    return { error: 'One of your selections is invalid.' };
  }

  const selectedPositionIds = selections.map(({ positionId }) => positionId);
  if (new Set(selectedPositionIds).size !== selectedPositionIds.length) {
    return { error: 'Choose one candidate for each position.' };
  }

  const firstPosition = await prisma.position.findUnique({
    where: { id: selectedPositionIds[0] },
    include: { election: true },
  });
  if (!firstPosition) return { error: 'One of the positions could not be found.' };
  if (!isVotingOpen(firstPosition.election)) {
    return { error: 'Voting is not currently open for this election.' };
  }

  const electionPositions = await prisma.position.findMany({
    where: { electionId: firstPosition.electionId },
    select: { id: true },
  });
  const previousVotes = await prisma.vote.findMany({
    where: { homeownerId, position: { electionId: firstPosition.electionId } },
    select: { positionId: true },
  });
  const expectedPositionIds = electionPositions
    .map(({ id }) => id)
    .filter((id) => !previousVotes.some((vote) => vote.positionId === id))
    .sort((a, b) => a - b);

  if (
    [...selectedPositionIds].sort((a, b) => a - b).join(',') !==
    expectedPositionIds.join(',')
  ) {
    return { error: 'Submit one selection for every position remaining on your ballot.' };
  }

  for (const { positionId, candidateId } of selections) {
    const position = await prisma.position.findUnique({
      where: { id: positionId },
      include: { election: true },
    });
    if (!position || position.electionId !== firstPosition.electionId) {
      return { error: 'One of the positions could not be found.' };
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

  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
    include: { position: { include: { election: true } } },
  });
  if (!candidate) return { error: 'Candidate not found.' };
  const lockError = await getBallotStructureLockError(candidate.position.electionId);
  if (lockError) return { error: lockError };

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
  const lockError = await getBallotStructureLockError(electionId);
  if (lockError) return { error: lockError };

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
  const lockError = await getBallotStructureLockError(position.electionId);
  if (lockError) return { error: lockError };

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
  const lockError = await getBallotStructureLockError(position.electionId);
  if (lockError) return { error: lockError };
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
  const lockError = await getBallotStructureLockError(position.electionId);
  if (lockError) return { error: lockError };
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
  const lockError = await getBallotStructureLockError(electionId);
  if (lockError) return { error: lockError };

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

  const positionsWithoutCandidates = await prisma.position.count({
    where: { electionId, candidates: { none: {} } },
  });
  if (positionsWithoutCandidates > 0) {
    return {
      error: 'Every position needs at least one candidate before voting can start.',
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
