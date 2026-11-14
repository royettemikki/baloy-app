'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getAdminOrNull } from '@/lib/adminAuth';
import { canFileForPosition, isSingleCandidacyRestrictionEnabled } from '@/lib/candidacyRules';
import { getCurrentOfficeholders } from '@/lib/electionWinners';
import { isFilingOpen, isVotingOpen } from '@/lib/electionWindows';

export async function fileCandidacyAction(
  positionId: number,
  statement: string,
  preferredBallotNumber: number | null,
) {
  const session = await getServerSession(authOptions);
  const homeownerId = (session?.user as any)?.id;
  if (!homeownerId) return { error: 'You must be signed in.' };
  if (
    preferredBallotNumber !== null &&
    (!Number.isSafeInteger(preferredBallotNumber) || preferredBallotNumber < 1)
  ) {
    return { error: 'Preferred ballot number must be a positive whole number.' };
  }

  const position = await prisma.position.findUnique({
    where: { id: positionId },
    include: { election: true },
  });
  if (!position) return { error: 'Position not found.' };
  if (!isFilingOpen(position.election))
    return { error: 'Candidate filing is closed for this election.' };

  const currentRoles = (await getCurrentOfficeholders()).filter(
    (officeholder) => officeholder.homeownerId === homeownerId,
  );
  const currentPositionTitles = currentRoles.map((officeholder) => officeholder.positionTitle);
  if (!canFileForPosition(currentPositionTitles, position.title)) {
    return {
      error: `You currently serve as ${currentPositionTitles.join(', ')}. During your current term, you may only file for the same position.`,
    };
  }

  const existingForThisPosition = await prisma.candidacyFiling.findFirst({
    where: { positionId, homeownerId, status: { in: ['Pending', 'Approved'] } },
  });
  if (existingForThisPosition) return { error: 'You have already filed for this position.' };

  if (isSingleCandidacyRestrictionEnabled()) {
    const otherFilingsInElection = await prisma.candidacyFiling.findFirst({
      where: {
        homeownerId,
        status: { in: ['Pending', 'Approved'] },
        position: { electionId: position.electionId },
      },
    });
    if (otherFilingsInElection) {
      return { error: 'You can only file for one position per election at a time.' };
    }
  }

  await prisma.candidacyFiling.create({
    data: {
      homeownerId,
      positionId,
      statement: statement || null,
      preferredBallotNumber,
    },
  });

  revalidatePath('/file-candidacy');
  return { success: true };
}

export async function approveCandidacyFilingAction(
  filingId: number,
  ballotNumber: number,
  isIncumbent: boolean,
) {
  const admin = await getAdminOrNull();
  if (!admin) return { error: 'You do not have permission to do this.' };
  if (!Number.isSafeInteger(ballotNumber) || ballotNumber < 1) {
    return { error: 'Ballot number must be a positive whole number.' };
  }

  const filing = await prisma.candidacyFiling.findUnique({
    where: { id: filingId },
    include: { homeowner: true, position: { include: { election: true } } },
  });
  if (!filing) return { error: 'Filing not found.' };
  if (filing.status !== 'Pending') return { error: 'This filing has already been reviewed.' };

  const election = filing.position.election;

  const currentRoles = (await getCurrentOfficeholders()).filter(
    (officeholder) => officeholder.homeownerId === filing.homeownerId,
  );
  const currentPositionTitles = currentRoles.map((officeholder) => officeholder.positionTitle);
  if (!canFileForPosition(currentPositionTitles, filing.position.title)) {
    return {
      error: `This resident currently serves as ${currentPositionTitles.join(', ')} and may only file for the same position during their current term.`,
    };
  }

  if (isVotingOpen(election)) {
    return {
      error:
        'Voting has already started for this election — new candidates can no longer be added.',
    };
  }
  if (election.closesAt && election.closesAt < new Date()) {
    return { error: 'This election has already closed.' };
  }

  // Defense-in-depth: confirm the filing was genuinely made during a real filing window,
  // even though fileCandidacyAction already checks this at submission time.
  if (!election.filingOpensAt || filing.createdAt < election.filingOpensAt) {
    return { error: 'This filing was not made during a valid filing period.' };
  }
  if (election.filingClosesAt && filing.createdAt > election.filingClosesAt) {
    return { error: 'This filing was submitted after the filing period had already closed.' };
  }

  const approved = await prisma.$transaction(async (tx) => {
    const existingCandidate = await tx.candidate.findFirst({
      where: { positionId: filing.positionId, ballotNumber },
      select: { id: true },
    });
    if (existingCandidate) return 'duplicate';

    const claim = await tx.candidacyFiling.updateMany({
      where: { id: filingId, status: 'Pending' },
      data: { status: 'Approved', reviewedAt: new Date() },
    });
    if (claim.count !== 1) return 'reviewed';

    const candidate = await tx.candidate.create({
      data: {
        positionId: filing.positionId,
        homeownerId: filing.homeownerId,
        name: filing.homeowner.fullName,
        roleDescription: `Unit ${filing.homeowner.unit}`,
        statement: filing.statement,
        ballotNumber,
        isIncumbent,
      },
    });

    await tx.candidacyFiling.update({
      where: { id: filingId },
      data: { resultingCandidateId: candidate.id },
    });
    return 'approved';
  });
  if (approved === 'duplicate') {
    return { error: 'That ballot number is already assigned to a candidate for this position.' };
  }
  if (approved === 'reviewed') return { error: 'This filing has already been reviewed.' };

  revalidatePath('/admin/elections');
  return { success: true };
}

export async function rejectCandidacyFilingAction(filingId: number, reason: string) {
  const admin = await getAdminOrNull();
  if (!admin) return { error: 'You do not have permission to do this.' };
  if (!reason?.trim()) return { error: 'A reason is required.' };

  const filing = await prisma.candidacyFiling.findUnique({ where: { id: filingId } });
  if (!filing) return { error: 'Filing not found.' };
  if (filing.status !== 'Pending') return { error: 'This filing has already been reviewed.' };

  const rejected = await prisma.candidacyFiling.updateMany({
    where: { id: filingId, status: 'Pending' },
    data: { status: 'Rejected', rejectionReason: reason, reviewedAt: new Date() },
  });
  if (rejected.count !== 1) return { error: 'This filing has already been reviewed.' };

  revalidatePath('/admin/elections');
  return { success: true };
}
