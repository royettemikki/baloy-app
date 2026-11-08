'use server';

import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function claimInviteAction(token: string, password: string) {
  if (typeof token !== 'string' || token.length !== 48) {
    return { error: 'This invite link is invalid.' };
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
    return { error: 'Password must be between 8 and 128 characters.' };
  }

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
  const claimed = await prisma.homeowner.updateMany({
    where: { id: homeowner.id, inviteToken: token, passwordHash: null },
    data: { passwordHash, joinedAt: new Date(), inviteToken: null },
  });
  if (claimed.count !== 1) {
    return { error: 'This invite link has already been used. Try signing in instead.' };
  }

  return { success: true, email: homeowner.email };
}
