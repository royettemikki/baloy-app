'use server';

import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getAdminOrNull } from '@/lib/adminAuth';
import { isVotingOpen } from '@/lib/electionWindows';
import { STANDARD_POSITION_TEMPLATE } from '@/constants/positionTemplates';
import { isFeatureEnabled } from '@/lib/featureVisibility';

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

export async function castBallotAction(
  voterId: number,
  selections: { positionId: number; candidateId: number }[],
) {
  const session = await getServerSession(authOptions);
  const homeownerId = (session?.user as any)?.id;
  if (!homeownerId) return { error: 'You must be signed in.' };
  if (!(await isFeatureEnabled('elections', 'resident'))) {
    return { error: 'Elections are currently unavailable.' };
  }
  if (!Number.isSafeInteger(voterId) || voterId <= 0) {
    return { error: 'The voter selection is invalid.' };
  }
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

  const selectionsByPosition = new Map<number, number[]>();
  const selectedCandidateIds = new Set<number>();
  for (const { positionId, candidateId } of selections) {
    const positionSelections = selectionsByPosition.get(positionId) ?? [];
    if (positionSelections.includes(candidateId) || selectedCandidateIds.has(candidateId)) {
      return { error: 'A candidate can only be selected once on your ballot.' };
    }
    positionSelections.push(candidateId);
    selectionsByPosition.set(positionId, positionSelections);
    selectedCandidateIds.add(candidateId);
  }

  const selectedPositionIds = [...selectionsByPosition.keys()];
  const positions = await prisma.position.findMany({
    where: { id: { in: selectedPositionIds } },
    include: { election: true },
  });
  if (positions.length !== selectedPositionIds.length) {
    return { error: 'One of the positions could not be found.' };
  }
  const firstPosition = positions[0];
  if (positions.some((position) => position.electionId !== firstPosition.electionId)) {
    return { error: 'Your selections must belong to one election.' };
  }
  if (!isVotingOpen(firstPosition.election)) {
    return { error: 'Voting is not currently open for this election.' };
  }

  const electionPositions = await prisma.position.findMany({
    where: { electionId: firstPosition.electionId },
    select: { id: true, seats: true },
  });
  const voter = await prisma.electionVoter.findUnique({
    where: { id: voterId },
    select: {
      electionId: true,
      homeownerId: true,
      proxyId: true,
      castAt: true,
      homeowner: { select: { propertyId: true } },
    },
  });
  if (!voter || voter.electionId !== firstPosition.electionId) {
    return { error: 'You are not eligible to vote in this election.' };
  }
  if (voter.castAt) return { error: 'This voter has already submitted a ballot.' };
  const expectedCasterId = voter.proxyId ?? voter.homeownerId;
  if (homeownerId !== expectedCasterId) {
    return {
      error: voter.proxyId
        ? 'Only the assigned proxy can submit this ballot.'
        : 'You are not authorized to submit this ballot.',
    };
  }

  const expectedPositionIds = electionPositions.map(({ id }) => id).sort((a, b) => a - b);

  if ([...selectedPositionIds].sort((a, b) => a - b).join(',') !== expectedPositionIds.join(',')) {
    return { error: 'Submit at least one selection for every position on your ballot.' };
  }

  const positionById = new Map(electionPositions.map((position) => [position.id, position]));
  for (const [positionId, candidateIds] of selectionsByPosition) {
    const position = positionById.get(positionId);
    if (!position) return { error: 'One of the positions could not be found.' };
    if (candidateIds.length > position.seats) {
      return {
        error: `Select no more than ${position.seats} candidate${position.seats === 1 ? '' : 's'} for this position.`,
      };
    }
  }

  const candidates = await prisma.candidate.findMany({
    where: {
      id: { in: [...selectedCandidateIds] },
      positionId: { in: selectedPositionIds },
    },
    select: { id: true, positionId: true },
  });
  const candidatePositionById = new Map(
    candidates.map((candidate) => [candidate.id, candidate.positionId]),
  );
  if (
    candidates.length !== selectedCandidateIds.size ||
    selections.some(
      ({ positionId, candidateId }) => candidatePositionById.get(candidateId) !== positionId,
    )
  ) {
    return { error: 'One of your selections is invalid.' };
  }

  try {
    const submitted = await prisma.$transaction(async (tx) => {
      const consumed = await tx.electionVoter.updateMany({
        where: {
          id: voterId,
          electionId: firstPosition.electionId,
          homeownerId: voter.homeownerId,
          proxyId: voter.proxyId,
          castAt: null,
        },
        data: { castAt: new Date(), castById: homeownerId },
      });
      if (consumed.count !== 1) return false;

      const ballot = await tx.electionBallot.create({ data: { voterId } });
      await tx.vote.createMany({
        data: selections.map(({ positionId, candidateId }) => ({
          positionId,
          candidateId,
          homeownerId: voter.homeownerId,
          propertyId: voter.homeowner.propertyId,
          electionBallotId: ballot.id,
        })),
      });
      return true;
    });
    if (!submitted) return { error: 'This voter has already submitted a ballot.' };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { error: 'This voter has already submitted a ballot. Refresh to see its status.' };
    }
    throw error;
  }

  return { success: true };
}

export async function setElectionProxyAction(electionId: number, proxyId: string | null) {
  const session = await getServerSession(authOptions);
  const homeownerId = (session?.user as any)?.id as string | undefined;
  if (!homeownerId) return { error: 'You must be signed in.' };
  if (!(await isFeatureEnabled('elections', 'resident'))) {
    return { error: 'Elections are currently unavailable.' };
  }
  if (!Number.isSafeInteger(electionId) || electionId <= 0) {
    return { error: 'The election selection is invalid.' };
  }
  if (proxyId !== null && (typeof proxyId !== 'string' || proxyId === homeownerId)) {
    return { error: 'Choose a different active account as your proxy.' };
  }

  const election = await prisma.election.findUnique({ where: { id: electionId } });
  if (!election || !isVotingOpen(election)) {
    return { error: 'Proxy assignments can only be changed while voting is open.' };
  }
  const voter = await prisma.electionVoter.findUnique({
    where: { electionId_homeownerId: { electionId, homeownerId } },
    select: { id: true, castAt: true, homeowner: { select: { propertyId: true } } },
  });
  if (!voter) return { error: 'Only an eligible primary owner can assign a proxy.' };
  if (voter.castAt) return { error: 'A proxy cannot be changed after this ballot is submitted.' };

  if (proxyId) {
    const proxy = await prisma.homeowner.findUnique({
      where: { id: proxyId },
      select: {
        passwordHash: true,
        propertyMemberships: {
          where: { propertyId: voter.homeowner.propertyId },
          select: { propertyId: true },
        },
      },
    });
    if (!proxy?.passwordHash || proxy.propertyMemberships.length === 0) {
      return { error: 'Choose an active account who is a member of your property as your proxy.' };
    }
  }

  const updated = await prisma.electionVoter.updateMany({
    where: { id: voter.id, castAt: null },
    data: { proxyId },
  });
  if (updated.count !== 1) {
    return { error: 'This ballot has already been submitted; its proxy can no longer be changed.' };
  }

  revalidatePath('/vote');
  revalidatePath('/home');
  return { success: true };
}

export async function linkCandidateAction(candidateId: number, homeownerId: string | null) {
  const admin = await getAdminOrNull();
  if (!admin) return { error: 'You do not have permission to do this.' };
  if (!(await isFeatureEnabled('elections', 'admin'))) {
    return { error: 'Election management is currently unavailable.' };
  }

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
  termDurationYears: number,
) {
  const admin = await getAdminOrNull();
  if (!admin) return { error: 'You do not have permission to do this.' };
  if (!(await isFeatureEnabled('elections', 'admin'))) {
    return { error: 'Election management is currently unavailable.' };
  }
  if (!title.trim()) return { error: 'Title is required.' };
  if (!filingDurationHours || filingDurationHours <= 0)
    return { error: 'Filing period must be greater than 0 hours.' };
  if (!votingDurationHours || votingDurationHours <= 0)
    return { error: 'Voting period must be greater than 0 hours.' };
  if (!Number.isSafeInteger(termDurationYears) || termDurationYears < 1 || termDurationYears > 20)
    return { error: 'Board term must be a whole number of years between 1 and 20.' };

  const election = await prisma.election.create({
    data: { title: title.trim(), filingDurationHours, votingDurationHours, termDurationYears },
  });
  revalidatePath('/admin/elections');
  return { success: true, electionId: election.id };
}

export async function createPositionAction(electionId: number, title: string, seats: number) {
  const admin = await getAdminOrNull();
  if (!admin) return { error: 'You do not have permission to do this.' };
  if (!(await isFeatureEnabled('elections', 'admin'))) {
    return { error: 'Election management is currently unavailable.' };
  }
  if (!title.trim()) return { error: 'Position title is required.' };
  if (!Number.isSafeInteger(seats) || seats < 1 || seats > 100) {
    return { error: 'Enter a whole number of seats between 1 and 100.' };
  }
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
  if (!(await isFeatureEnabled('elections', 'admin'))) {
    return { error: 'Election management is currently unavailable.' };
  }
  if (!Number.isSafeInteger(ballotNumber) || ballotNumber < 1) {
    return { error: 'Ballot number must be a positive whole number.' };
  }

  const position = await prisma.position.findUnique({
    where: { id: positionId },
    include: { election: true },
  });
  if (!position) return { error: 'Position not found.' };
  const lockError = await getBallotStructureLockError(position.electionId);
  if (lockError) return { error: lockError };

  const homeowner = await prisma.homeowner.findUnique({ where: { id: homeownerId } });
  if (!homeowner) return { error: 'Resident not found.' };

  const existingCandidate = await prisma.candidate.findFirst({
    where: { positionId, ballotNumber },
    select: { id: true },
  });
  if (existingCandidate) {
    return { error: 'That ballot number is already assigned to a candidate for this position.' };
  }

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
  if (!(await isFeatureEnabled('elections', 'admin'))) {
    return { error: 'Election management is currently unavailable.' };
  }
  if (!title.trim()) return { error: 'Position title is required.' };
  if (!Number.isSafeInteger(seats) || seats < 1 || seats > 100) {
    return { error: 'Enter a whole number of seats between 1 and 100.' };
  }

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
  if (!(await isFeatureEnabled('elections', 'admin'))) {
    return { error: 'Election management is currently unavailable.' };
  }

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
  if (!(await isFeatureEnabled('elections', 'admin'))) {
    return { error: 'Election management is currently unavailable.' };
  }
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
  if (!(await isFeatureEnabled('elections', 'admin'))) {
    return { error: 'Election management is currently unavailable.' };
  }

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
  if (!(await isFeatureEnabled('elections', 'admin'))) {
    return { error: 'Election management is currently unavailable.' };
  }

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

  const primaryOwners = await prisma.property.findMany({
    where: {
      primaryVoterId: { not: null },
      primaryVoter: { passwordHash: { not: null } },
    },
    select: { primaryVoterId: true },
  });
  const eligibleHomeownerIds = [
    ...new Set(
      primaryOwners.flatMap(({ primaryVoterId }) => (primaryVoterId ? [primaryVoterId] : [])),
    ),
  ];
  if (eligibleHomeownerIds.length === 0) {
    return { error: 'Assign at least one active primary owner before opening voting.' };
  }

  const started = await prisma.$transaction(async (tx) => {
    const updated = await tx.election.updateMany({
      where: { id: electionId, votingOpensAt: null },
      data: {
        votingOpensAt: now,
        closesAt,
        filingClosesAt:
          election.filingClosesAt && election.filingClosesAt < now ? election.filingClosesAt : now,
      },
    });
    if (updated.count !== 1) return false;
    await tx.electionVoter.createMany({
      data: eligibleHomeownerIds.map((homeownerId) => ({ electionId, homeownerId })),
      skipDuplicates: true,
    });
    return true;
  });
  if (!started) return { error: 'Voting has already started.' };

  revalidatePath('/admin/elections');
  revalidatePath('/vote');
  revalidatePath('/home');
  revalidatePath('/results');
  return { success: true };
}

export async function endVotingAction(electionId: number) {
  const admin = await getAdminOrNull();
  if (!admin) return { error: 'You do not have permission to do this.' };
  if (!(await isFeatureEnabled('elections', 'admin'))) {
    return { error: 'Election management is currently unavailable.' };
  }

  const election = await prisma.election.findUnique({ where: { id: electionId } });
  if (!election) return { error: 'Election not found.' };

  const now = new Date();
  if (!isVotingOpen(election, now)) {
    return { error: 'Voting is not currently open for this election.' };
  }

  const closed = await prisma.election.updateMany({
    where: {
      id: electionId,
      votingOpensAt: { not: null },
      closesAt: { gt: now },
    },
    data: { closesAt: now },
  });
  if (closed.count !== 1) {
    return { error: 'Voting is no longer open for this election.' };
  }

  revalidatePath('/admin/elections');
  revalidatePath('/results');
  revalidatePath('/vote');
  return { success: true };
}
