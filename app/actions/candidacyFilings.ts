'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getAdminOrNull } from '@/lib/adminAuth';
import { isSingleCandidacyRestrictionEnabled } from '@/lib/candidacyRules';
import { isFilingOpen, isVotingOpen } from '@/lib/electionWindows';

export async function fileCandidacyAction(positionId: number, statement: string) {
  const session = await getServerSession(authOptions);
  const homeownerId = (session?.user as any)?.id;
  if (!homeownerId) return { error: 'You must be signed in.' };

  const position = await prisma.position.findUnique({
    where: { id: positionId },
    include: { election: true },
  });
  if (!position) return { error: 'Position not found.' };
  if (!isFilingOpen(position.election))
    return { error: 'Candidate filing is closed for this election.' };

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
    data: { homeownerId, positionId, statement: statement || null },
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

  const filing = await prisma.candidacyFiling.findUnique({
    where: { id: filingId },
    include: { homeowner: true, position: { include: { election: true } } },
  });
  if (!filing) return { error: 'Filing not found.' };
  if (filing.status !== 'Pending') return { error: 'This filing has already been reviewed.' };

  const election = filing.position.election;

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

  await prisma.$transaction(async (tx) => {
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
      data: { status: 'Approved', resultingCandidateId: candidate.id, reviewedAt: new Date() },
    });
  });

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

  await prisma.candidacyFiling.update({
    where: { id: filingId },
    data: { status: 'Rejected', rejectionReason: reason, reviewedAt: new Date() },
  });

  revalidatePath('/admin/elections');
  return { success: true };
}
