'use server';

import crypto from 'crypto';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getAdminOrNull } from '@/lib/adminAuth';

export async function createInviteAction(fullName: string, unit: string, email: string, lotAreaInput?: number | null) {
  const admin = await getAdminOrNull();
  if (!admin) return { error: 'You do not have permission to do this.' };

  const lotAreaSqm = lotAreaInput ?? null;
  if (lotAreaSqm !== null && (!Number.isFinite(lotAreaSqm) || lotAreaSqm <= 0 || lotAreaSqm > 99999999)) {
    return { error: 'Enter a valid lot area greater than zero.' };
  }
  if (lotAreaSqm === null) {
    const duesSettings = await prisma.duesSettings.findUnique({ where: { id: 1 } });
    if (duesSettings?.monthlyDuesMode === 'PerArea') {
      return { error: 'Lot area is required because the community dues are calculated by area.' };
    }
  }

  const existing = await prisma.homeowner.findUnique({ where: { email } });
  if (existing) return { error: 'An account with that email already exists.' };

  const inviteToken = crypto.randomBytes(24).toString('hex');
  await prisma.homeowner.create({
    data: { email, fullName, unit, lotAreaSqm, inviteToken, invitedAt: new Date() },
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

export async function updateResidentDuesAction(
  homeownerId: string,
  data: { override: boolean; mode: 'Fixed' | 'PerArea'; rate: number; lotAreaSqm: number | null },
) {
  const admin = await getAdminOrNull();
  if (!admin) return { error: 'You do not have permission to do this.' };
  if (typeof data.override !== 'boolean') return { error: 'Choose whether this resident has a custom rate.' };
  if (data.override && data.mode !== 'Fixed' && data.mode !== 'PerArea') return { error: 'Choose a valid dues method.' };
  if (data.override && (!Number.isFinite(data.rate) || data.rate < 0 || data.rate > 99999999)) {
    return { error: 'Enter a valid monthly rate.' };
  }
  if (data.lotAreaSqm !== null && (!Number.isFinite(data.lotAreaSqm) || data.lotAreaSqm <= 0 || data.lotAreaSqm > 99999999)) {
    return { error: 'Enter a valid lot area greater than zero.' };
  }
  if (data.override && data.mode === 'PerArea' && data.lotAreaSqm === null) {
    return { error: 'Lot area is required for area-based dues.' };
  }
  if (!data.override && data.lotAreaSqm === null) {
    const communitySettings = await prisma.duesSettings.findUnique({ where: { id: 1 } });
    if (communitySettings?.monthlyDuesMode === 'PerArea') {
      return { error: 'Lot area is required for the community area-based rate.' };
    }
  }

  const target = await prisma.homeowner.findUnique({ where: { id: homeownerId }, select: { id: true } });
  if (!target) return { error: 'Resident not found.' };

  await prisma.homeowner.update({
    where: { id: homeownerId },
    data: {
      duesRateOverride: data.override,
      lotAreaSqm: data.lotAreaSqm === null ? null : Math.round(data.lotAreaSqm * 100) / 100,
      ...(data.override ? {
        monthlyDuesMode: data.mode,
        monthlyDuesRate: Math.round(data.rate * 100) / 100,
      } : {}),
    },
  });

  revalidatePath('/admin/invites');
  revalidatePath('/dues');
  revalidatePath('/home');
  return { success: true };
}

export async function updateCommunityDuesAction(data: { mode: 'Fixed' | 'PerArea'; rate: number }) {
  const admin = await getAdminOrNull();
  if (!admin) return { error: 'You do not have permission to do this.' };
  if (data.mode !== 'Fixed' && data.mode !== 'PerArea') return { error: 'Choose a valid dues method.' };
  if (!Number.isFinite(data.rate) || data.rate < 0 || data.rate > 99999999) {
    return { error: 'Enter a valid monthly rate.' };
  }

  await prisma.$transaction(async (tx) => {
    await tx.duesSettings.upsert({
      where: { id: 1 },
      create: { id: 1, monthlyDuesMode: data.mode, monthlyDuesRate: Math.round(data.rate * 100) / 100 },
      update: { monthlyDuesMode: data.mode, monthlyDuesRate: Math.round(data.rate * 100) / 100 },
    });
    // Saving the community rate is an explicit apply-to-all operation.
    await tx.homeowner.updateMany({ data: { duesRateOverride: false } });
  });

  revalidatePath('/admin/invites');
  revalidatePath('/dues');
  revalidatePath('/home');
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
