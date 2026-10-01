'use server';

import crypto from 'crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getAdminOrNull } from '@/lib/adminAuth';

export async function createInviteAction(fullName: string, unit: string, email: string) {
  const admin = await getAdminOrNull();
  if (!admin) return { error: 'You do not have permission to do this.' };

  const existing = await prisma.homeowner.findUnique({ where: { email } });
  if (existing) return { error: 'An account with that email already exists.' };

  const inviteToken = crypto.randomBytes(24).toString('hex');
  await prisma.homeowner.create({
    data: { email, fullName, unit, inviteToken, invitedAt: new Date() },
  });

  return { success: true, token: inviteToken };
}

export async function updateResidentAction(
  homeownerId: string,
  data: { fullName: string; unit: string; email: string },
) {
  const admin = await getAdminOrNull();
  if (!admin) return { error: 'You do not have permission to do this.' };

  const existing = await prisma.homeowner.findFirst({
    where: { email: data.email, NOT: { id: homeownerId } },
  });
  if (existing) return { error: 'Another resident already uses that email.' };

  await prisma.homeowner.update({
    where: { id: homeownerId },
    data: { fullName: data.fullName, unit: data.unit, email: data.email },
  });

  return { success: true };
}

export async function toggleAdminAction(homeownerId: string) {
  const admin = await getAdminOrNull();
  if (!admin) return { error: 'You do not have permission to do this.' };
  if (admin.id === homeownerId) return { error: 'You cannot change your own admin status.' };

  const target = await prisma.homeowner.findUnique({
    where: { id: homeownerId },
  });
  if (!target) return { error: 'Resident not found.' };

  await prisma.homeowner.update({
    where: { id: homeownerId },
    data: { isAdmin: !target.isAdmin },
  });

  return { success: true };
}

export async function resendInviteAction(homeownerId: string) {
  const admin = await getAdminOrNull();
  if (!admin) return { error: 'You do not have permission to do this.' };

  const target = await prisma.homeowner.findUnique({ where: { id: homeownerId } });
  if (!target) return { error: 'Resident not found.' };
  if (target.passwordHash) return { error: 'This resident already has an active account.' };

  const inviteToken = crypto.randomBytes(24).toString('hex');
  await prisma.homeowner.update({
    where: { id: homeownerId },
    data: { inviteToken, invitedAt: new Date() },
  });

  return { success: true, token: inviteToken };
}

export async function revokeInviteAction(homeownerId: string) {
  const admin = await getAdminOrNull();
  if (!admin) return { error: 'You do not have permission to do this.' };

  const target = await prisma.homeowner.findUnique({ where: { id: homeownerId } });
  if (!target) return { error: 'Resident not found.' };
  if (target.passwordHash)
    return { error: 'This resident already has an active account and cannot be revoked this way.' };

  const [duesCount, paymentCount, voteCount] = await Promise.all([
    prisma.duesCharge.count({ where: { homeownerId } }),
    prisma.payment.count({ where: { homeownerId } }),
    prisma.vote.count({ where: { homeownerId } }),
  ]);
  if (duesCount > 0 || paymentCount > 0 || voteCount > 0) {
    return {
      error:
        'This resident already has dues or vote records tied to their account and cannot be revoked this way.',
    };
  }

  await prisma.homeowner.delete({ where: { id: homeownerId } });
  return { success: true };
}
