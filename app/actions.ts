'use server';

import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function claimInviteAction(token: string, password: string) {
  const homeowner = await prisma.homeowner.findUnique({
    where: { inviteToken: token },
  });

  if (!homeowner) {
    return { error: 'This invite link is invalid.' };
  }
  if (homeowner.passwordHash) {
    return {
      error: 'This account has already been set up. Try signing in instead.',
    };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.homeowner.update({
    where: { id: homeowner.id },
    data: { passwordHash, joinedAt: new Date(), inviteToken: null },
  });

  return { success: true, email: homeowner.email };
}

export async function payDueAction(duesChargeId: number) {
  const session = await getServerSession(authOptions);
  const homeownerId = (session?.user as any)?.id;
  if (!homeownerId) {
    return { error: 'You must be signed in.' };
  }

  const charge = await prisma.duesCharge.findFirst({
    where: { id: duesChargeId, homeownerId },
  });
  if (!charge) {
    return { error: 'Charge not found.' };
  }
  if (charge.status === 'Paid') {
    return { error: 'This charge is already paid.' };
  }

  await prisma.$transaction([
    prisma.payment.create({
      data: {
        duesChargeId: charge.id,
        homeownerId,
        amountPaid: charge.amount,
        receiptReference: Math.random().toString(36).slice(2, 10).toUpperCase(),
      },
    }),
    prisma.duesCharge.update({
      where: { id: charge.id },
      data: { status: 'Paid' },
    }),
  ]);

  return { success: true };
}

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

export async function updateProfileAction(data: {
  fullName: string;
  phoneNumber: string;
  emergencyContact: string;
  notifyEmailAnnouncements: boolean;
  notifyTextDuesReminders: boolean;
  notifyElectionAlerts: boolean;
}) {
  const session = await getServerSession(authOptions);
  const homeownerId = (session?.user as any)?.id;
  if (!homeownerId) return { error: 'You must be signed in.' };

  await prisma.homeowner.update({
    where: { id: homeownerId },
    data: {
      fullName: data.fullName,
      phoneNumber: data.phoneNumber || null,
      emergencyContact: data.emergencyContact || null,
      notifyEmailAnnouncements: data.notifyEmailAnnouncements,
      notifyTextDuesReminders: data.notifyTextDuesReminders,
      notifyElectionAlerts: data.notifyElectionAlerts,
    },
  });

  return { success: true };
}
